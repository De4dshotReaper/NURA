import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, FileText, HelpCircle, Pill } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface SymptomEpisode { symptoms: string; severity: number | null; duration: string | null; created_at: string; }
interface PrescriptionOption { id: string; file_name: string; medicines: unknown; uploaded_at: string; }
interface LabReportOption { id: string; file_name: string; report_type: string | null; uploaded_at: string; }
interface PreparedQuestion { id: string; question: string; }
interface PreviousConsultation { id: string; consultation_at: string | null; }

interface AppointmentDetailsPageProps {
  symptomEntryId: string;
  userId: string;
  onBackToDashboard?: () => void;
  onSaved?: () => void;
}

const getLocalDateTimeValue = (): string => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

export const AppointmentDetailsPage: React.FC<AppointmentDetailsPageProps> = ({
  symptomEntryId, userId, onBackToDashboard, onSaved,
}) => {
  const { t } = useTranslation();
  const [episode, setEpisode] = useState<SymptomEpisode | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionOption[]>([]);
  const [labReports, setLabReports] = useState<LabReportOption[]>([]);
  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>([]);
  const [isLoadingEpisode, setIsLoadingEpisode] = useState(true);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true);
  const [isLoadingLabReports, setIsLoadingLabReports] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [notes, setNotes] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [consultationAt, setConsultationAt] = useState(getLocalDateTimeValue);
  const [followUpRecommended, setFollowUpRecommended] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [selectedPrescriptionIds, setSelectedPrescriptionIds] = useState<Set<string>>(new Set());
  const [selectedLabReportIds, setSelectedLabReportIds] = useState<Set<string>>(new Set());

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedConsultationId, setSavedConsultationId] = useState<string | null>(null);
  const [linkedPrescriptionIds, setLinkedPrescriptionIds] = useState<Set<string>>(new Set());
  const [linkedLabReportIds, setLinkedLabReportIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    const fail = (message: string, error: unknown) => {
      console.error(message, error);
      if (mounted) setLoadError(t('appointment.loadError'));
    };
    const loadEpisode = async () => {
      try {
        const { data, error } = await supabase.from('symptom_entries').select('symptoms, severity, duration, created_at').eq('id', symptomEntryId).maybeSingle<SymptomEpisode>();
        if (!mounted) return;
        if (error) fail('Failed to load consultation symptom episode:', error); else setEpisode(data);
      } catch (error) { fail('Unexpected error loading consultation symptom episode:', error); }
      finally { if (mounted) setIsLoadingEpisode(false); }
    };
    const loadPrescriptions = async () => {
      try {
        const { data, error } = await supabase.from('prescriptions').select('id, file_name, medicines, uploaded_at').order('uploaded_at', { ascending: false });
        if (!mounted) return;
        if (error) fail('Failed to load prescriptions for appointment record:', error); else setPrescriptions((data ?? []) as PrescriptionOption[]);
      } catch (error) { fail('Unexpected error loading prescriptions for appointment record:', error); }
      finally { if (mounted) setIsLoadingPrescriptions(false); }
    };
    const loadLabReports = async () => {
      try {
        const { data, error } = await supabase.from('lab_reports').select('id, file_name, report_type, uploaded_at').order('uploaded_at', { ascending: false });
        if (!mounted) return;
        if (error) fail('Failed to load lab reports for appointment record:', error); else setLabReports((data ?? []) as LabReportOption[]);
      } catch (error) { fail('Unexpected error loading lab reports for appointment record:', error); }
      finally { if (mounted) setIsLoadingLabReports(false); }
    };
    const loadQuestions = async () => {
      try {
        const { data: latestConsultation, error: consultationError } = await supabase
          .from('consultations')
          .select('id, consultation_at')
          .eq('symptom_entry_id', symptomEntryId)
          .eq('user_id', userId)
          .order('consultation_at', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle<PreviousConsultation>();

        if (!mounted) return;
        if (consultationError) {
          fail('Failed to determine the latest consultation for prepared questions:', consultationError);
          return;
        }

        let questionQuery = supabase
          .from('consultation_questions')
          .select('id, question')
          .eq('symptom_entry_id', symptomEntryId);

        questionQuery = latestConsultation
          ? questionQuery.eq('previous_consultation_id', latestConsultation.id)
          : questionQuery.is('previous_consultation_id', null);

        const { data, error } = await questionQuery.order('created_at', { ascending: true });
        if (!mounted) return;
        if (error) fail('Failed to load prepared questions for appointment record:', error); else setPreparedQuestions((data ?? []) as PreparedQuestion[]);
      } catch (error) { fail('Unexpected error loading prepared questions for appointment record:', error); }
      finally { if (mounted) setIsLoadingQuestions(false); }
    };
    void loadEpisode(); void loadPrescriptions(); void loadLabReports(); void loadQuestions();
    return () => { mounted = false; };
  }, [symptomEntryId]);

  const toggleId = (id: string, ids: Set<string>, update: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    if (savedConsultationId) return;
    const next = new Set(ids);
    if (next.has(id)) next.delete(id); else next.add(id);
    update(next);
  };

  const resetForm = () => {
    setNotes(''); setDoctorName(''); setClinicName(''); setConsultationAt(getLocalDateTimeValue());
    setFollowUpRecommended(false); setFollowUpNotes(''); setSelectedPrescriptionIds(new Set());
    setSelectedLabReportIds(new Set()); setSavedConsultationId(null); setLinkedPrescriptionIds(new Set());
    setLinkedLabReportIds(new Set()); setSaveError(null);
  };

  const handleSave = async () => {
    if (isSaving) return;
    const trimmedNotes = notes.trim();
    const appointmentDate = new Date(consultationAt);
    if (!userId) { setSaveError(t('appointment.authError')); return; }
    if (!symptomEntryId) { setSaveError(t('appointment.selectError')); return; }
    if (!trimmedNotes) { setSaveError(t('appointment.notesError')); return; }
    if (!consultationAt || Number.isNaN(appointmentDate.getTime())) { setSaveError(t('appointment.dateError')); return; }
    setIsSaving(true); setSaveError(null);
    let consultationId = savedConsultationId;
    try {
      if (!consultationId) {
        const { data, error } = await supabase.from('consultations').insert({
          user_id: userId, symptom_entry_id: symptomEntryId, notes: trimmedNotes,
          doctor_name: doctorName.trim() || null, clinic_name: clinicName.trim() || null,
          follow_up_recommended: followUpRecommended,
          follow_up_notes: followUpRecommended ? followUpNotes.trim() || null : null,
          consultation_at: appointmentDate.toISOString(),
        }).select('id').single<{ id: string }>();
        if (error) { console.error('Failed to insert consultation:', error); setSaveError(t('appointment.saveError')); return; }
        consultationId = data.id; setSavedConsultationId(consultationId);
      }

      let linkFailure = false;
      const prescriptionIds = Array.from(selectedPrescriptionIds).filter((id) => !linkedPrescriptionIds.has(id));
      const reportIds = Array.from(selectedLabReportIds).filter((id) => !linkedLabReportIds.has(id));
      if (prescriptionIds.length) {
        const { error } = await supabase.from('consultation_prescriptions').insert(prescriptionIds.map((id) => ({ consultation_id: consultationId, prescription_id: id })));
        if (error) { console.error('Failed to link prescriptions to consultation:', error); linkFailure = true; }
        else setLinkedPrescriptionIds((ids) => new Set([...ids, ...prescriptionIds]));
      }
      if (reportIds.length) {
        const { error } = await supabase.from('consultation_lab_reports').insert(reportIds.map((id) => ({ consultation_id: consultationId, lab_report_id: id })));
        if (error) { console.error('Failed to link lab reports to consultation:', error); linkFailure = true; }
        else setLinkedLabReportIds((ids) => new Set([...ids, ...reportIds]));
      }
      if (linkFailure) { setSaveError(t('appointment.linkError')); return; }
      resetForm(); onSaved?.();
    } catch (error) {
      console.error('Unexpected error saving appointment record:', error);
      setSaveError(consultationId ? t('appointment.linkError') : t('appointment.saveError'));
    } finally { setIsSaving(false); }
  };

  const locked = Boolean(savedConsultationId);
  const card = 'bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]';

  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mr-auto space-y-10 pb-16">
    {onBackToDashboard && <button type="button" onClick={onBackToDashboard} disabled={locked} className="inline-flex items-center gap-2 text-xs font-semibold text-nuraTextSecondary hover:text-nuraText disabled:opacity-40 group"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{locked ? t('appointment.finish') : t('common.backDashboard')}</button>}
    <header className="space-y-3"><div className="inline-flex px-3 py-1 rounded-full bg-blue-50/80 text-primary text-xs font-semibold tracking-wider">{t('appointment.eyebrow')}</div><h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText">{t('appointment.title')}</h1><p className="text-base sm:text-lg text-nuraTextSecondary max-w-2xl">{t('appointment.subtitle')}</p></header>
    {loadError && <p className="text-sm font-medium text-amber-700" role="alert">{loadError}</p>}

    <section className={`${card} space-y-5`}><h2 className="font-heading font-bold text-lg text-nuraText">{t('appointment.episode')}</h2>{isLoadingEpisode ? <p className="text-sm text-nuraTextSecondary" aria-busy="true">{t('appointment.loadingEpisode')}</p> : episode ? <div className="space-y-4"><div className="flex flex-col sm:flex-row sm:justify-between gap-3"><p className="text-base text-nuraText whitespace-pre-line">{episode.symptoms}</p><time className="text-xs font-semibold text-nuraTextSecondary shrink-0">{new Date(episode.created_at).toLocaleString()}</time></div><div className="flex flex-wrap gap-3 text-sm text-nuraTextSecondary"><span className="rounded-lg bg-gray-50 px-3 py-2">{t('dashboard.severity')}: <strong className="text-nuraText">{episode.severity ?? t('common.notRecorded')}</strong></span><span className="rounded-lg bg-gray-50 px-3 py-2">{t('dashboard.duration')}: <strong className="text-nuraText">{episode.duration || t('common.notRecorded')}</strong></span></div></div> : <p className="text-sm text-nuraTextSecondary">{t('appointment.episodeUnavailable')}</p>}</section>

    <section className={`${card} space-y-7`}><label className="space-y-3 block"><span className="font-heading font-bold text-base text-nuraText">{t('appointment.whatHappened')}</span><textarea rows={7} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={locked} placeholder={t('appointment.notesPlaceholder')} className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none disabled:opacity-60" /></label><div className="grid sm:grid-cols-2 gap-5"><label className="space-y-2 text-sm font-semibold"><span>{t('appointment.doctor')} <span className="font-normal text-nuraTextSecondary">({t('common.optional')})</span></span><input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} disabled={locked} className="w-full px-4 py-3 rounded-xl border border-gray-200 font-normal focus:outline-none focus:border-primary disabled:opacity-60" /></label><label className="space-y-2 text-sm font-semibold"><span>{t('appointment.clinic')} <span className="font-normal text-nuraTextSecondary">({t('common.optional')})</span></span><input value={clinicName} onChange={(e) => setClinicName(e.target.value)} disabled={locked} className="w-full px-4 py-3 rounded-xl border border-gray-200 font-normal focus:outline-none focus:border-primary disabled:opacity-60" /></label></div><label className="space-y-2 text-sm font-semibold block"><span>{t('appointment.dateTime')}</span><input type="datetime-local" value={consultationAt} onChange={(e) => setConsultationAt(e.target.value)} disabled={locked} className="block w-full sm:max-w-sm px-4 py-3 rounded-xl border border-gray-200 font-normal focus:outline-none focus:border-primary disabled:opacity-60" /></label><div className="space-y-3 pt-4 border-t border-gray-100"><p className="text-sm font-semibold">{t('appointment.followUp')}</p><div className="flex gap-3">{[true, false].map((value) => <button key={String(value)} type="button" disabled={locked} onClick={() => setFollowUpRecommended(value)} className={`px-5 py-2.5 rounded-xl border text-sm font-semibold ${followUpRecommended === value ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-nuraTextSecondary border-gray-200'} disabled:opacity-60`}>{value ? t('common.yes') : t('common.no')}</button>)}</div>{followUpRecommended && <textarea rows={3} value={followUpNotes} onChange={(e) => setFollowUpNotes(e.target.value)} disabled={locked} placeholder={t('appointment.followUpPlaceholder')} className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none disabled:opacity-60" />}</div></section>

    <section className="space-y-4"><h2 className="font-heading font-extrabold text-xl flex items-center gap-2"><Pill className="w-5 h-5 text-primary" />{t('appointment.attachPrescriptions')}</h2>{isLoadingPrescriptions ? <p className="text-sm text-nuraTextSecondary" aria-busy="true">{t('appointment.loadingPrescriptions')}</p> : prescriptions.length === 0 ? <div className="bg-white rounded-xl p-6 border border-gray-100 text-sm text-nuraTextSecondary">{t('appointment.noPrescriptions')}</div> : <div className="grid gap-3">{prescriptions.map((item) => { const selected = selectedPrescriptionIds.has(item.id); const count = Array.isArray(item.medicines) ? item.medicines.length : 0; return <button key={item.id} type="button" disabled={locked} onClick={() => toggleId(item.id, selectedPrescriptionIds, setSelectedPrescriptionIds)} className={`p-5 rounded-xl border text-left flex gap-3 ${selected ? 'border-primary bg-blue-50/40' : 'border-gray-100 bg-white'} disabled:opacity-60`}><CheckCircle2 className={`w-5 h-5 ${selected ? 'text-primary' : 'text-gray-300'}`} /><span><strong className="block text-sm">{item.file_name}</strong><span className="block text-xs text-nuraTextSecondary mt-1">{new Date(item.uploaded_at).toLocaleString()}{count ? ` • ${t(count === 1 ? 'appointment.medication' : 'appointment.medications', { count })}` : ''}</span></span></button>; })}</div>}</section>

    <section className="space-y-4"><h2 className="font-heading font-extrabold text-xl flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />{t('appointment.attachLabs')}</h2>{isLoadingLabReports ? <p className="text-sm text-nuraTextSecondary" aria-busy="true">{t('appointment.loadingLabs')}</p> : labReports.length === 0 ? <div className="bg-white rounded-xl p-6 border border-gray-100 text-sm text-nuraTextSecondary">{t('appointment.noLabs')}</div> : <div className="grid gap-3">{labReports.map((item) => { const selected = selectedLabReportIds.has(item.id); return <button key={item.id} type="button" disabled={locked} onClick={() => toggleId(item.id, selectedLabReportIds, setSelectedLabReportIds)} className={`p-5 rounded-xl border text-left flex gap-3 ${selected ? 'border-primary bg-blue-50/40' : 'border-gray-100 bg-white'} disabled:opacity-60`}><CheckCircle2 className={`w-5 h-5 ${selected ? 'text-primary' : 'text-gray-300'}`} /><span><strong className="block text-sm">{item.report_type || item.file_name}</strong>{item.report_type && <span className="block text-xs text-nuraTextSecondary mt-1">{item.file_name}</span>}<span className="block text-xs text-nuraTextSecondary mt-1">{new Date(item.uploaded_at).toLocaleString()}</span></span></button>; })}</div>}</section>

    <section className="space-y-4"><h2 className="font-heading font-extrabold text-xl flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary" />{t('appointment.preparedQuestions')}</h2>{isLoadingQuestions ? <p className="text-sm text-nuraTextSecondary" aria-busy="true">{t('appointment.loadingQuestions')}</p> : preparedQuestions.length === 0 ? <div className="bg-white rounded-xl p-6 border border-gray-100 text-sm text-nuraTextSecondary">{t('appointment.noQuestions')}</div> : <div className="space-y-3">{preparedQuestions.map((item) => <div key={item.id} className="bg-white rounded-xl p-5 border border-gray-100 flex gap-3"><HelpCircle className="w-4 h-4 text-primary shrink-0" /><p className="text-sm">{item.question}</p></div>)}</div>}</section>

    <div className="space-y-3 pb-8">{saveError && <p className={`text-sm font-medium ${savedConsultationId ? 'text-amber-700' : 'text-red-600'}`} role="alert">{saveError}</p>}<button type="button" onClick={() => void handleSave()} disabled={isSaving || isLoadingEpisode || !episode} className="w-full sm:w-auto min-w-[220px] px-6 py-4 rounded-2xl bg-primary text-white font-semibold hover:bg-blue-600 disabled:opacity-50">{isSaving ? t('common.saving') : savedConsultationId ? t('common.tryAgain') : t('appointment.save')}</button></div>
  </motion.div>;
};

export default AppointmentDetailsPage;
