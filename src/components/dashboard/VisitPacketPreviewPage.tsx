import React from 'react';
import { ArrowLeft, Download, FileText, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { VisitPacket } from '../../lib/visitPacket';
import { isSupportedLanguage, languageLocale, normalizeLanguage } from '../../i18n';

interface VisitPacketPreviewPageProps {
  packet: VisitPacket;
  onBack: () => void;
}

const PresentField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-0.5">
    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className="text-sm text-slate-900">{value}</dd>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-3 border-t border-slate-200 pt-5">
    <h2 className="font-heading text-lg font-extrabold tracking-tight text-slate-950">{title}</h2>
    {children}
  </section>
);

export const VisitPacketPreviewPage: React.FC<VisitPacketPreviewPageProps> = ({ packet, onBack }) => {
  const { t, i18n } = useTranslation();
  const [isPreparingPdf, setIsPreparingPdf] = React.useState(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const locale = languageLocale[isSupportedLanguage(i18n.language) ? i18n.language : 'en'];
  const formatDateTime = (value: string) => new Date(value).toLocaleString(locale, {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  const questionCycles = new Map<string, typeof packet.questions>();
  packet.questions.forEach((question) => {
    const key = question.previousConsultationId ?? 'initial';
    questionCycles.set(key, [...(questionCycles.get(key) ?? []), question]);
  });

  const handleDownloadPdf = async () => {
    if (!import.meta.env.DEV || isPreparingPdf) return;
    setIsPreparingPdf(true);
    setPdfError(null);
    try {
      const { downloadVisitPacketPdf } = await import('./VisitPacketPdfDocument');
      await downloadVisitPacketPdf(packet, normalizeLanguage(i18n.resolvedLanguage ?? i18n.language));
    } catch (error) {
      console.error('Visit Packet PDF generation failed:', error);
      setPdfError(t('visitPacket.pdfError'));
    } finally {
      setIsPreparingPdf(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-5 pb-20 select-text">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-nuraTextSecondary hover:text-primary transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {t('visitPacket.back')}
        </button>
        {import.meta.env.DEV && <button type="button" onClick={() => void handleDownloadPdf()} disabled={isPreparingPdf} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
          <Download className="h-4 w-4" />
          {isPreparingPdf ? t('visitPacket.preparingPdf') : t('visitPacket.downloadPdf')}
        </button>}
      </div>
      {pdfError && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{pdfError}</p>}

      <article className="rounded-sm border border-slate-200 bg-white px-5 py-6 shadow-[0_8px_35px_rgba(15,23,42,0.06)] sm:px-10 sm:py-8 md:px-14">
        <header className="space-y-4 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Nura</p>
              <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold text-slate-950">{t('visitPacket.title')}</h1>
            </div>
            <FileText className="h-7 w-7 text-slate-400" />
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            {packet.patient.displayName && <PresentField label={t('visitPacket.patient')} value={packet.patient.displayName} />}
            <PresentField label={t('visitPacket.episode')} value={packet.episode.title || t('visitPacket.healthEpisode')} />
            <PresentField label={t('visitPacket.started')} value={formatDateTime(packet.episode.startedAt)} />
            <PresentField label={t('visitPacket.status')} value={t(`common.${packet.episode.status}`)} />
            {packet.episode.completedAt && <PresentField label={t('visitPacket.completed')} value={formatDateTime(packet.episode.completedAt)} />}
            <PresentField label={t('visitPacket.generated')} value={formatDateTime(packet.generatedAt)} />
          </dl>
        </header>

        <div className="space-y-6">
          <Section title={t('visitPacket.initialSymptoms')}>
            {packet.initialSymptoms ? <div className="space-y-3">
              <p className="whitespace-pre-line text-sm leading-6 text-slate-900">{packet.initialSymptoms.symptoms}</p>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {packet.initialSymptoms.severity !== null && <PresentField label={t('visitPacket.severity')} value={`${packet.initialSymptoms.severity}/10`} />}
                {packet.initialSymptoms.duration && <PresentField label={t('visitPacket.duration')} value={packet.initialSymptoms.duration} />}
                <PresentField label={t('visitPacket.recorded')} value={formatDateTime(packet.initialSymptoms.createdAt)} />
              </dl>
            </div> : <p className="text-sm text-slate-500">{t('visitPacket.initialSymptomsUnavailable')}</p>}
          </Section>

          {packet.followUps.length > 0 && <Section title={t('visitPacket.progressFollowUps')}>
            <div className="space-y-4">{packet.followUps.map((followUp) => <article key={followUp.id} className="border-l-2 border-teal-200 pl-4">
              <p className="text-xs font-semibold text-slate-500">{formatDateTime(followUp.createdAt)}</p>
              <dl className="mt-2 grid gap-3 sm:grid-cols-2">
                {followUp.progress && <PresentField label={t('visitPacket.progress')} value={followUp.progress} />}
                {followUp.currentSymptoms && <PresentField label={t('visitPacket.currentSymptoms')} value={followUp.currentSymptoms} />}
                {followUp.medicineCompliance && <PresentField label={t('visitPacket.medicineCompliance')} value={followUp.medicineCompliance} />}
                {followUp.medicineReason && <PresentField label={t('visitPacket.medicineReason')} value={followUp.medicineReason} />}
                <PresentField label={t('visitPacket.sideEffects')} value={followUp.hasSideEffects ? followUp.sideEffectsText || t('common.yes') : t('common.no')} />
              </dl>
            </article>)}</div>
          </Section>}

          {packet.consultations.length > 0 && <Section title={t('visitPacket.consultationHistory')}>
            <div className="space-y-4">{packet.consultations.map((consultation) => <article key={consultation.id} className="space-y-2.5 rounded border border-slate-200 p-3.5">
              <p className="text-xs font-semibold text-slate-500">{formatDateTime(consultation.consultationAt ?? consultation.createdAt)}</p>
              {(consultation.doctorName || consultation.clinicName) && <p className="text-sm font-bold text-slate-900">{[consultation.doctorName, consultation.clinicName].filter(Boolean).join(' · ')}</p>}
              <p className="whitespace-pre-line text-sm leading-6 text-slate-800">{consultation.notes}</p>
              <dl className="grid gap-3 sm:grid-cols-2">
                <PresentField label={t('visitPacket.followUpRecommended')} value={consultation.followUpRecommended ? t('common.yes') : t('common.no')} />
                {consultation.followUpNotes && <PresentField label={t('visitPacket.followUpNotes')} value={consultation.followUpNotes} />}
              </dl>
            </article>)}</div>
          </Section>}

          {packet.prescriptions.length > 0 && <Section title={t('visitPacket.prescriptionsMedicines')}>
            <div className="space-y-4">{packet.prescriptions.map((prescription, prescriptionIndex) => <article key={prescription.id} className="space-y-3">
              <div><h3 className="text-sm font-bold text-slate-950">{packet.prescriptions.length === 1 ? t('visitPacket.prescription') : t('visitPacket.prescriptionNumber', { number: prescriptionIndex + 1 })}</h3><p className="mt-0.5 break-words text-xs text-slate-500">{prescription.fileName}</p></div>
              {prescription.medicines.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-sm"><thead><tr className="border-y border-slate-200 text-xs text-slate-500"><th className="py-2 pr-3">{t('visitPacket.medicine')}</th><th className="py-2 px-3">{t('visitPacket.dosage')}</th><th className="py-2 px-3">{t('visitPacket.frequency')}</th><th className="py-2 pl-3">{t('visitPacket.instructions')}</th></tr></thead><tbody>{prescription.medicines.map((medicine, index) => <tr key={`${medicine.name}-${index}`} className="border-b border-slate-100 align-top"><td className="py-2.5 pr-3 font-semibold">{medicine.name || '—'}</td><td className="py-2.5 px-3">{medicine.dosage || '—'}</td><td className="py-2.5 px-3">{medicine.frequency || '—'}</td><td className="py-2.5 pl-3">{medicine.instructions || '—'}</td></tr>)}</tbody></table></div>}
            </article>)}</div>
          </Section>}

          {packet.labReports.length > 0 && <Section title={t('visitPacket.reportsInvestigations')}>
            <div className="space-y-5">{packet.labReports.map((report) => <article key={report.id} className="space-y-3 rounded border border-slate-200 p-3.5">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">{report.analysisType === 'structured' ? t('visitPacket.structuredReport') : t('visitPacket.narrativeReport')}</p><h3 className="mt-1 text-sm font-bold text-slate-950">{report.reportType || report.fileName}</h3></div>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {report.reportDate && <PresentField label={t('visitPacket.reportDate')} value={report.reportDate} />}
                {report.laboratory && <PresentField label={t('visitPacket.laboratory')} value={report.laboratory} />}
                {report.analysisType === 'narrative' && report.narrativeAnalysis.body_part_or_test && <PresentField label={t('visitPacket.bodyPartTest')} value={report.narrativeAnalysis.body_part_or_test} />}
              </dl>
              {report.analysisType === 'structured' ? report.parameters.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[620px] border-collapse text-left text-sm"><thead><tr className="border-y border-slate-200 text-xs text-slate-500"><th className="py-2 pr-3">{t('visitPacket.parameter')}</th><th className="py-2 px-3">{t('visitPacket.result')}</th><th className="py-2 px-3">{t('visitPacket.referenceRange')}</th><th className="py-2 pl-3">{t('visitPacket.status')}</th></tr></thead><tbody>{report.parameters.map((parameter) => <tr key={parameter.id} className="border-b border-slate-100"><td className="py-2.5 pr-3 font-semibold">{parameter.name}</td><td className="py-2.5 px-3">{[parameter.value, parameter.unit].filter(Boolean).join(' ') || '—'}</td><td className="py-2.5 px-3">{parameter.referenceRange || '—'}</td><td className="py-2.5 pl-3">{parameter.status}</td></tr>)}</tbody></table></div> : <div className="space-y-4"><PresentField label={t('visitPacket.summary')} value={<p className="whitespace-pre-line leading-6">{report.narrativeAnalysis.summary}</p>} />{report.narrativeAnalysis.key_findings.length > 0 && <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('visitPacket.keyFindings')}</p><ul className="mt-2 space-y-2">{report.narrativeAnalysis.key_findings.map((finding, index) => <li key={`${finding.finding}-${index}`} className="text-sm"><span className="font-semibold">{finding.finding}:</span> {finding.explanation}</li>)}</ul></div>}{report.narrativeAnalysis.impression?.trim() && <PresentField label={t('visitPacket.reportImpression')} value={report.narrativeAnalysis.impression} />}</div>}
            </article>)}</div>
          </Section>}

          {packet.questions.length > 0 && <Section title={t('visitPacket.appointmentQuestions')}>
            <div className="space-y-4">{Array.from(questionCycles.entries()).map(([cycle, questions]) => <div key={cycle}><h3 className="text-sm font-bold text-slate-900">{cycle === 'initial' ? t('visitPacket.beforeFirstConsultation') : t('visitPacket.nextAppointmentQuestions')}</h3><ul className="mt-2 space-y-1.5 text-sm text-slate-800">{questions.map((question) => <li key={question.id} className="flex items-start gap-2"><span aria-hidden="true" className="mt-0.5 inline-flex h-4 w-4 shrink-0 rounded-[2px] border border-slate-500 bg-white" /><span>{question.question}</span></li>)}</ul></div>)}</div>
          </Section>}

          <Section title={t('visitPacket.episodeTimeline')}>
            <ol className="space-y-1.5">{packet.timeline.map((event, index) => <li key={`${event.type}-${event.sourceId}`} className="grid grid-cols-[8rem_1fr] gap-3 text-sm sm:grid-cols-[11rem_1fr]"><time className="text-xs text-slate-500">{formatDateTime(event.timestamp)}</time><span className="font-medium text-slate-900">{t(`visitPacket.timeline.${event.type}`)}{event.type === 'questions_prepared' && event.questionCount ? ` · ${t('visitPacket.questionCount', { count: event.questionCount })}` : ''}</span>{index < packet.timeline.length - 1 && <span className="col-start-2 h-1.5 border-l border-slate-200" />}</li>)}</ol>
          </Section>

          <footer className="flex items-start gap-3 border-t border-slate-200 pt-6 text-slate-500">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" />
            <div><p className="text-xs font-bold uppercase tracking-wider">{t('visitPacket.preparedWith')}</p><p className="mt-1 text-xs leading-5">{t('visitPacket.notice')}</p></div>
          </footer>
        </div>
      </article>
    </div>
  );
};
