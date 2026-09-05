import React, { useEffect, useRef, useState } from 'react';
import { Activity, ArrowLeft, Calendar, CheckCircle2, Download, Eye, FileText, HelpCircle, Pill, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ExtractedMedicine, PersistedLabReportRow } from '../../types';
import { analysisFromLabReportRow } from '../../lib/labReports';
import { TimelineEventCard, type TimelineEventCardData } from './TimelineEventCard';
import { PrescriptionSummaryPage } from './PrescriptionSummaryPage';
import { LabReportSummaryPage } from './LabReportSummaryPage';
import { NarrativeReportSummaryPage } from './NarrativeReportSummaryPage';
import { useTranslation } from 'react-i18next';
import { isSupportedLanguage, languageLocale, normalizeLanguage } from '../../i18n';
import { buildVisitPacket, type VisitPacket } from '../../lib/visitPacket';
import { resolveEpisodeLinkedEventTimestamp } from '../../lib/visitPacketScope';
import { featureFlags } from '../../lib/featureFlags';
import { VisitPacketPreviewPage } from './VisitPacketPreviewPage';

interface Episode { id: string; initial_symptom_entry_id: string; status: 'active' | 'completed'; started_at: string; completed_at: string | null; }
interface Symptom { id: string; symptoms: string; severity: number | null; duration: string | null; created_at: string; }
interface FollowUp { id: string; progress: string | null; current_symptoms: string | null; medicine_compliance: string | null; medicine_reason: string | null; has_side_effects: boolean; side_effects_text: string | null; questions: string | null; created_at: string; }
interface Consultation { id: string; notes: string; doctor_name: string | null; clinic_name: string | null; follow_up_recommended: boolean; follow_up_notes: string | null; consultation_at: string | null; created_at: string; }
interface Question { id: string; question: string; previous_consultation_id: string | null; created_at: string; }
interface Prescription { id: string; file_name: string; file_type: string; medicines: unknown; uploaded_at: string; storage_path: string | null; }
type LabReport = PersistedLabReportRow;
interface EventGroup { dateKey: string; dateLabel: string; events: TimelineEventCardData[]; }

interface EpisodeStoryPageProps { episodeId: string; userId: string; onBack: () => void; showBackButton?: boolean; }

const formatDate = (value: string, locale: string) => new Date(value).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
const localDateKey = (value: string) => { const date = new Date(value); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };

export const EpisodeStoryPage: React.FC<EpisodeStoryPageProps> = ({ episodeId, userId, onBack, showBackButton = true }) => {
  const { t, i18n } = useTranslation();
  const locale = languageLocale[isSupportedLanguage(i18n.language) ? i18n.language : 'en'];
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [events, setEvents] = useState<TimelineEventCardData[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prescriptionDetail, setPrescriptionDetail] = useState<Prescription | null>(null);
  const [labDetail, setLabDetail] = useState<LabReport | null>(null);
  const [visitPacketPreview, setVisitPacketPreview] = useState<VisitPacket | null>(null);
  const [visitPacketError, setVisitPacketError] = useState<string | null>(null);
  const [isBuildingVisitPacket, setIsBuildingVisitPacket] = useState(false);
  const [isVisitPacketPreviewOpen, setIsVisitPacketPreviewOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [visitPacketActionError, setVisitPacketActionError] = useState<string | null>(null);
  const [isNativeShareUnavailable, setIsNativeShareUnavailable] = useState(() => typeof navigator === 'undefined' || typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function');
  const episodeVersionRef = useRef(0);
  const pdfOperationRef = useRef<symbol | null>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let mounted = true;
    episodeVersionRef.current += 1;
    setVisitPacketPreview(null);
    setVisitPacketError(null);
    setVisitPacketActionError(null);
    setIsVisitPacketPreviewOpen(false);
    setIsBuildingVisitPacket(false);
    setIsGeneratingPdf(false);
    setIsSharingPdf(false);
    pdfOperationRef.current = null;
    setIsNativeShareUnavailable(typeof navigator === 'undefined' || typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function');
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const { data: episodeRow, error: episodeError } = await supabase.from('health_episodes').select('id, initial_symptom_entry_id, status, started_at, completed_at').eq('id', episodeId).eq('user_id', userId).maybeSingle<Episode>();
        if (!mounted) return;
        if (episodeError) { console.error('Failed to load selected health episode:', episodeError); setError(t('audit.episodeLoad')); return; }
        if (!episodeRow) { setEpisode(null); return; }
        setEpisode(episodeRow);

        const { data: symptomRow, error: symptomError } = await supabase.from('symptom_entries').select('id, symptoms, severity, duration, created_at').eq('id', episodeRow.initial_symptom_entry_id).eq('user_id', userId).maybeSingle<Symptom>();
        if (!mounted) return;
        if (symptomError || !symptomRow) { console.error('Failed to load episode initial symptom:', symptomError); setError(t('audit.episodeSymptomsLoad')); return; }
        setSymptom(symptomRow);

        const safe = async <T,>(label: string, promise: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> => {
          try { const result = await promise; if (result.error) { console.error(label, result.error); return []; } return result.data ?? []; }
          catch (queryError) { console.error(label, queryError); return []; }
        };
        const anchor = episodeRow.initial_symptom_entry_id;
        const [followUps, consultations, questions] = await Promise.all([
          safe<FollowUp>('Failed to load episode follow-ups:', supabase.from('follow_up_entries').select('id, progress, current_symptoms, medicine_compliance, medicine_reason, has_side_effects, side_effects_text, questions, created_at').eq('symptom_entry_id', anchor).eq('user_id', userId)),
          safe<Consultation>('Failed to load episode consultations:', supabase.from('consultations').select('id, notes, doctor_name, clinic_name, follow_up_recommended, follow_up_notes, consultation_at, created_at').eq('symptom_entry_id', anchor).eq('user_id', userId)),
          safe<Question>('Failed to load episode questions:', supabase.from('consultation_questions').select('id, question, previous_consultation_id, created_at').eq('symptom_entry_id', anchor).eq('user_id', userId)),
        ]);

        const consultationIds = consultations.map((item) => item.id);
        const prescriptionLinks = consultationIds.length ? await safe<{ consultation_id: string; prescription_id: string; created_at: string | null }>('Failed to load episode prescription links:', supabase.from('consultation_prescriptions').select('consultation_id, prescription_id, created_at').in('consultation_id', consultationIds)) : [];
        const labLinks = consultationIds.length ? await safe<{ consultation_id: string; lab_report_id: string; created_at: string | null }>('Failed to load episode lab links:', supabase.from('consultation_lab_reports').select('consultation_id, lab_report_id, created_at').in('consultation_id', consultationIds)) : [];
        const prescriptionIds = [...new Set(prescriptionLinks.map((link) => link.prescription_id))];
        const labIds = [...new Set(labLinks.map((link) => link.lab_report_id))];
        const prescriptions = prescriptionIds.length ? await safe<Prescription>('Failed to load episode prescriptions:', supabase.from('prescriptions').select('id, file_name, file_type, medicines, uploaded_at, storage_path').in('id', prescriptionIds)) : [];
        const labs = labIds.length ? await safe<LabReport>('Failed to load episode lab reports:', supabase.from('lab_reports').select('id, file_name, file_type, report_type, laboratory, report_date, raw_text, parameters, uploaded_at, storage_path, analysis_type, narrative_analysis').in('id', labIds)) : [];
        if (!mounted) return;

        const normalized: TimelineEventCardData[] = [{ id: `symptom-${symptomRow.id}`, title: 'Symptoms Recorded', description: symptomRow.symptoms, timestamp: symptomRow.created_at, icon: Activity, badge: symptomRow.severity === null ? undefined : `${t('dashboard.severity')} ${symptomRow.severity}/10`, badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/60', relationshipLabel: 'Episode start', details: [`${t('dashboard.duration')}: ${symptomRow.duration || t('common.notRecorded')}`] }];
        followUps.forEach((item) => normalized.push({ id: `followup-${item.id}`, title: 'Follow-up Recorded', description: item.current_symptoms?.trim() || item.progress?.trim() || t('audit.followUpRecordedFallback'), timestamp: item.created_at, icon: CheckCircle2, badge: item.progress || undefined, badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/60', relationshipLabel: t('episodes.followUp'), details: [`${t('audit.medicineCompliance')}: ${item.medicine_compliance || t('common.notRecorded')}`, item.medicine_reason ? `${t('audit.medicineNote')}: ${item.medicine_reason}` : '', `${t('audit.sideEffects')}: ${item.has_side_effects ? item.side_effects_text || t('audit.reported') : t('common.no')}`, item.questions ? `${t('audit.questionsLabel')}: ${item.questions}` : ''].filter(Boolean) }));
        consultations.forEach((item) => { const timestamp = item.consultation_at && !Number.isNaN(new Date(item.consultation_at).getTime()) ? item.consultation_at : item.created_at; normalized.push({ id: `consultation-${item.id}`, title: 'Appointment Recorded', description: [item.doctor_name, item.clinic_name].filter(Boolean).join(' • ') || t('audit.consultationDetailsRecorded'), timestamp, icon: Calendar, badge: t('audit.consultation'), badgeColor: 'bg-violet-50 text-violet-700 border-violet-200/60', relationshipLabel: 'For episode', details: [item.notes, `${t('audit.followUpRecommended')}: ${item.follow_up_recommended ? t('common.yes') : t('common.no')}`, item.follow_up_notes || ''].filter(Boolean) }); });
        const questionCycles = new Map<string, Question[]>(); questions.forEach((item) => { const key = item.previous_consultation_id ?? 'first'; questionCycles.set(key, [...(questionCycles.get(key) ?? []), item]); });
        questionCycles.forEach((cycle, key) => { cycle.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); normalized.push({ id: `questions-${key}`, title: 'Questions Prepared', description: key === 'first' ? t('episodes.firstQuestions') : t('episodes.nextQuestions'), timestamp: cycle[0].created_at, icon: HelpCircle, badge: `${cycle.length}`, badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60', relationshipLabel: key === 'first' ? t('episodes.firstConsultation') : t('episodes.nextConsultation'), details: cycle.map((item) => item.question) }); });
        const prescriptionAssociations = prescriptionLinks.map((link) => ({ resourceId: link.prescription_id, createdAt: link.created_at }));
        const labAssociations = labLinks.map((link) => ({ resourceId: link.lab_report_id, createdAt: link.created_at }));
        prescriptions.forEach((item) => {
          const timestamp = resolveEpisodeLinkedEventTimestamp({ resourceId: item.id, uploadedAt: item.uploaded_at, episodeStartedAt: episodeRow.started_at, associations: prescriptionAssociations });
          if (timestamp) normalized.push({ id: `prescription-${item.id}`, title: 'Prescription Added', description: item.file_name, timestamp, icon: Pill, badge: t('events.prescription'), badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', relationshipLabel: 'Linked consultation', details: [t('episodes.explicitLink')], actionLabel: 'View Prescription', onAction: () => setPrescriptionDetail(item) });
        });
        labs.forEach((item) => {
          const timestamp = resolveEpisodeLinkedEventTimestamp({ resourceId: item.id, uploadedAt: item.uploaded_at, episodeStartedAt: episodeRow.started_at, associations: labAssociations });
          if (timestamp) normalized.push({ id: `lab-${item.id}`, title: 'Lab Report Uploaded', description: item.report_type || item.file_name, timestamp, icon: FileText, badge: t('events.lab'), badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/60', relationshipLabel: 'Linked consultation', details: [t('episodes.explicitLink')], actionLabel: 'View Lab Report', onAction: () => setLabDetail(item) });
        });
        setEvents(normalized);
      } catch (loadError) { if (mounted) { console.error('Unexpected error loading episode story:', loadError); setError(t('episodes.storyError')); } }
      finally { if (mounted) setIsLoading(false); }
    };
    void load(); return () => { mounted = false; };
  }, [episodeId, userId, t]);

  const inspectVisitPacket = async (openPreview = false) => {
    if (!featureFlags.visitPacket || isBuildingVisitPacket) return;
    const episodeVersion = episodeVersionRef.current;
    setIsBuildingVisitPacket(true);
    setVisitPacketError(null);
    setVisitPacketPreview(null);
    setIsVisitPacketPreviewOpen(false);
    try {
      const packet = await buildVisitPacket(episodeId);
      if (episodeVersion !== episodeVersionRef.current || packet.episode.id !== episodeId) return;
      console.log('VISIT PACKET:', packet);
      setVisitPacketPreview(packet);
      setIsVisitPacketPreviewOpen(openPreview);
    } catch (packetError) {
      if (episodeVersion !== episodeVersionRef.current) return;
      console.error('VISIT PACKET ERROR:', packetError);
      setVisitPacketError(packetError instanceof Error ? packetError.message : 'Visit Packet could not be built.');
    } finally {
      if (episodeVersion === episodeVersionRef.current) setIsBuildingVisitPacket(false);
    }
  };

  const handleVisitPacketDownload = async () => {
    if (!featureFlags.visitPacket || !visitPacketPreview || visitPacketPreview.episode.id !== episodeId || pdfOperationRef.current !== null) return;
    const episodeVersion = episodeVersionRef.current;
    const operationId = Symbol('visit-packet-download');
    pdfOperationRef.current = operationId;
    setIsGeneratingPdf(true);
    setVisitPacketActionError(null);
    try {
      const { downloadVisitPacketPdfBlob, generateVisitPacketPdf } = await import('./VisitPacketPdfDocument');
      const blob = await generateVisitPacketPdf(visitPacketPreview, normalizeLanguage(i18n.resolvedLanguage ?? i18n.language));
      if (episodeVersion !== episodeVersionRef.current) return;
      downloadVisitPacketPdfBlob(blob);
    } catch (pdfError) {
      if (episodeVersion === episodeVersionRef.current) {
        console.error('Visit Packet PDF generation failed:', pdfError);
        setVisitPacketActionError(t('visitPacket.pdfError'));
      }
    } finally {
      if (pdfOperationRef.current === operationId) pdfOperationRef.current = null;
      if (episodeVersion === episodeVersionRef.current) setIsGeneratingPdf(false);
    }
  };

  const handleVisitPacketShare = async () => {
    if (!featureFlags.visitPacket || !visitPacketPreview || visitPacketPreview.episode.id !== episodeId || pdfOperationRef.current !== null || isNativeShareUnavailable) return;
    const episodeVersion = episodeVersionRef.current;
    const operationId = Symbol('visit-packet-share');
    pdfOperationRef.current = operationId;
    setIsSharingPdf(true);
    setVisitPacketActionError(null);
    try {
      const { generateVisitPacketPdf, getVisitPacketPdfFileName } = await import('./VisitPacketPdfDocument');
      const blob = await generateVisitPacketPdf(visitPacketPreview, normalizeLanguage(i18n.resolvedLanguage ?? i18n.language));
      if (episodeVersion !== episodeVersionRef.current) return;
      const pdfFile = new File([blob], getVisitPacketPdfFileName(), { type: 'application/pdf' });
      let canSharePdf = false;
      try {
        canSharePdf = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [pdfFile] });
      } catch {
        canSharePdf = false;
      }
      if (!canSharePdf) {
        setIsNativeShareUnavailable(true);
        return;
      }
      await navigator.share({ files: [pdfFile], title: t('visitPacket.title'), text: t('visitPacket.shareText') });
    } catch (shareError) {
      if (shareError instanceof Error && shareError.name === 'AbortError') return;
      if (episodeVersion === episodeVersionRef.current) {
        console.error('Visit Packet share failed:', shareError);
        setVisitPacketActionError(t('visitPacket.shareError'));
      }
    } finally {
      if (pdfOperationRef.current === operationId) pdfOperationRef.current = null;
      if (episodeVersion === episodeVersionRef.current) setIsSharingPdf(false);
    }
  };

  if (featureFlags.visitPacket && isVisitPacketPreviewOpen && visitPacketPreview) {
    return <VisitPacketPreviewPage packet={visitPacketPreview} onBack={() => { setIsVisitPacketPreviewOpen(false); window.requestAnimationFrame(() => previewButtonRef.current?.focus()); }} />;
  }

  if (prescriptionDetail) return <PrescriptionSummaryPage onBack={() => setPrescriptionDetail(null)} prescriptionTitle={prescriptionDetail.file_name} uploadDate={formatDate(prescriptionDetail.uploaded_at, locale)} fileType={prescriptionDetail.file_type} medicines={Array.isArray(prescriptionDetail.medicines) ? prescriptionDetail.medicines as ExtractedMedicine[] : []} storagePath={prescriptionDetail.storage_path} />;
  if (labDetail) {
    const analysis = analysisFromLabReportRow(labDetail);
    if (!analysis) return <div className="max-w-4xl mr-auto space-y-6 pb-16"><button onClick={() => setLabDetail(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-nuraTextSecondary hover:text-primary"><ArrowLeft className="h-4 w-4" />{t('episodes.back')}</button><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-800" role="alert">{t('narrativeUi.loadError')}</div></div>;
    if (analysis.analysis_type === 'narrative') return <NarrativeReportSummaryPage onBack={() => setLabDetail(null)} reportTitle={labDetail.file_name} uploadDate={formatDate(labDetail.uploaded_at, locale)} fileType={labDetail.file_type} analysisData={analysis} storagePath={labDetail.storage_path} />;
    if (analysis.analysis_type === 'structured') return <LabReportSummaryPage onBack={() => setLabDetail(null)} reportTitle={labDetail.file_name} uploadDate={formatDate(labDetail.uploaded_at, locale)} fileType={labDetail.file_type} analysisData={analysis} storagePath={labDetail.storage_path} />;
  }

  const groups: EventGroup[] = Array.from(events.reduce<Map<string, TimelineEventCardData[]>>((map, event) => { const key = localDateKey(event.timestamp); map.set(key, [...(map.get(key) ?? []), event]); return map; }, new Map()).entries()).map(([dateKey, groupEvents]) => ({ dateKey, dateLabel: formatDate(groupEvents[0].timestamp, locale), events: groupEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) })).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const visitPacketReadiness = visitPacketPreview ? [
    visitPacketPreview.initialSymptoms ? t('visitPacket.initialSymptomsIncluded') : null,
    visitPacketPreview.consultations.length ? t('visitPacket.consultationCount', { count: visitPacketPreview.consultations.length }) : null,
    visitPacketPreview.prescriptions.length ? t('visitPacket.prescriptionCount', { count: visitPacketPreview.prescriptions.length }) : null,
    visitPacketPreview.labReports.length ? t('visitPacket.reportCount', { count: visitPacketPreview.labReports.length }) : null,
    visitPacketPreview.questions.length ? t('visitPacket.readinessQuestionCount', { count: visitPacketPreview.questions.length }) : null,
    visitPacketPreview.followUps.length ? t('visitPacket.followUpCount', { count: visitPacketPreview.followUps.length }) : null,
  ].filter((item): item is string => Boolean(item)) : [];
  const isPdfBusy = isGeneratingPdf || isSharingPdf;

  return <div className="max-w-4xl mr-auto space-y-9 pb-16">
    {showBackButton && <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-nuraTextSecondary hover:text-primary transition-colors group"><ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{t('episodes.back')}</button>}
    {isLoading ? <div className="rounded-[1.75rem] border border-gray-100 bg-white p-10 text-center" aria-busy="true"><p className="text-sm text-nuraTextSecondary">{t('episodes.loadingStory')}</p></div> : error ? <div className="rounded-[1.75rem] border border-red-100 bg-white p-8 text-center" role="alert"><p className="text-sm text-red-700">{error}</p></div> : !episode || !symptom ? <div className="rounded-[1.75rem] border border-gray-100 bg-white p-10 text-center"><p className="text-sm text-nuraTextSecondary">{t('episodes.notFound')}</p></div> : <>
      <header className="space-y-4"><div className="inline-flex rounded-full bg-blue-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-primary">{t('episodes.healthEpisode')}</div><div className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-nuraText">{t('episodes.healthEpisode')}</h1><p className="max-w-2xl whitespace-pre-line text-lg font-semibold text-nuraText">{symptom.symptoms}</p></div><span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${episode.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{t(`common.${episode.status}`)}</span></div><p className="text-sm text-nuraTextSecondary">{t('episodes.started', { date: formatDate(episode.started_at, locale) })}{episode.status === 'completed' && episode.completed_at ? ` • ${t('episodes.completedOn', { date: formatDate(episode.completed_at, locale) })}` : ''}</p></header>
      {featureFlags.visitPacket && <section className="space-y-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-4" aria-labelledby="prepare-for-visit-title">
        <div><p className="text-xs font-bold uppercase tracking-wider text-amber-800">{t('visitPacket.localDevelopmentOnly')}</p><h2 id="prepare-for-visit-title" className="mt-1 font-heading text-xl font-extrabold text-amber-950">{t('visitPacket.prepareForVisit')}</h2><p className="mt-1 text-sm text-amber-900">{t('visitPacket.prepareDescription')}</p></div>
        {!visitPacketPreview ? <button type="button" onClick={() => void inspectVisitPacket(false)} disabled={isBuildingVisitPacket} aria-busy={isBuildingVisitPacket} className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50">{isBuildingVisitPacket ? t('visitPacket.buildingPacket') : t('visitPacket.preparePacket')}</button> : <>
          <div className="rounded-xl border border-amber-200 bg-white/80 p-3"><p className="font-semibold text-amber-950">{t('visitPacket.packetReady')}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-amber-800">{t('visitPacket.includes')}</p>{visitPacketReadiness.length > 0 && <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-amber-950">{visitPacketReadiness.map((item) => <li key={item} className="before:mr-1.5 before:content-['•']">{item}</li>)}</ul>}</div>
          <div className="flex flex-wrap gap-2">
            <button ref={previewButtonRef} type="button" onClick={() => setIsVisitPacketPreviewOpen(true)} disabled={isPdfBusy} className="inline-flex items-center gap-2 rounded-xl border border-amber-700 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"><Eye className="h-4 w-4" />{t('visitPacket.previewPacket')}</button>
            <button type="button" onClick={() => void handleVisitPacketDownload()} disabled={isPdfBusy} aria-busy={isGeneratingPdf} className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" />{isGeneratingPdf ? t('visitPacket.preparingPdf') : t('visitPacket.downloadPdf')}</button>
            <button type="button" onClick={() => void handleVisitPacketShare()} disabled={isPdfBusy || isNativeShareUnavailable} aria-busy={isSharingPdf} className="inline-flex items-center gap-2 rounded-xl border border-amber-700 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"><Share2 className="h-4 w-4" />{isSharingPdf ? t('visitPacket.preparingPdf') : t('visitPacket.sharePacket')}</button>
          </div>
          {isNativeShareUnavailable && <p className="text-sm text-amber-950" role="status">{t('visitPacket.shareUnavailable')}</p>}
        </>}
        {visitPacketError && <p className="text-sm font-medium text-red-700" role="alert">{visitPacketError}</p>}
        {visitPacketActionError && <p className="text-sm font-medium text-red-700" role="alert">{visitPacketActionError}</p>}
      </section>}
      <div className="space-y-10">{groups.map((group) => <section key={group.dateKey} className="space-y-4"><div className="flex items-center gap-3"><div className="rounded-xl border border-blue-200/50 bg-blue-100/80 px-3.5 py-1.5 font-heading text-sm font-extrabold text-primary">{group.dateLabel}</div><div className="h-px flex-1 bg-gray-100" /></div><div className="space-y-3">{group.events.map((event, index) => <TimelineEventCard key={event.id} event={event} expanded={expandedId === event.id} isLastInGroup={index === group.events.length - 1} onToggle={() => setExpandedId((current) => current === event.id ? null : event.id)} />)}</div></section>)}</div>
    </>}
  </div>;
};
