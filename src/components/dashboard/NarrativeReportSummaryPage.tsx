import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Calendar, Download, ExternalLink, FileText, Microscope, Shield, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NarrativeLabReportAnalysis } from '../../types';
import { createPrivateMedicalFileUrl, downloadPrivateMedicalFile } from '../../lib/privateMedicalFiles';

interface NarrativeReportSummaryPageProps {
  onBack: () => void;
  reportTitle: string;
  uploadDate: string;
  fileType: string;
  analysisData: NarrativeLabReportAnalysis;
  storagePath: string | null;
}

export const NarrativeReportSummaryPage: React.FC<NarrativeReportSummaryPageProps> = ({
  onBack,
  reportTitle,
  uploadDate,
  fileType,
  analysisData,
  storagePath,
}) => {
  const { t } = useTranslation();
  const [fileActionError, setFileActionError] = useState<string | null>(null);
  const [downloadSucceeded, setDownloadSucceeded] = useState(false);
  const [isViewingFile, setIsViewingFile] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const metadata = [
    { label: t('narrativeUi.reportType'), value: analysisData.report_type, icon: FileText },
    { label: t('narrativeUi.bodyPartOrTest'), value: analysisData.body_part_or_test, icon: Stethoscope },
    { label: t('narrativeUi.reportDate'), value: analysisData.report_date, icon: Calendar },
    { label: t('narrativeUi.laboratory'), value: analysisData.laboratory, icon: Microscope },
  ].filter((item): item is typeof item & { value: string } => Boolean(item.value?.trim()));
  const impression = analysisData.impression?.trim();

  const handleViewOriginal = async () => {
    if (!storagePath || isViewingFile) return;
    const previewWindow = window.open('about:blank', '_blank');
    setIsViewingFile(true);
    setFileActionError(null);
    try {
      const signedUrl = await createPrivateMedicalFileUrl('lab-reports', storagePath);
      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.href = signedUrl;
      } else {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      previewWindow?.close();
      console.error('Failed to open original narrative report:', error);
      setFileActionError(t('fileActions.viewError'));
    } finally {
      setIsViewingFile(false);
    }
  };

  const handleDownloadOriginal = async () => {
    if (!storagePath || isDownloadingFile) return;
    setIsDownloadingFile(true);
    setFileActionError(null);
    setDownloadSucceeded(false);
    try {
      await downloadPrivateMedicalFile('lab-reports', storagePath, reportTitle);
      setDownloadSucceeded(true);
    } catch (error) {
      console.error('Failed to download original narrative report:', error);
      setFileActionError(t('fileActions.downloadError'));
    } finally {
      setIsDownloadingFile(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mr-auto space-y-8 sm:space-y-10 pb-20"
    >
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-nuraTextSecondary hover:text-primary transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t('documents.backLabs')}
      </button>

      <header className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {fileType} · {uploadDate}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-nuraText">
              {t('narrativeUi.title')}
            </h1>
            <p className="text-sm text-nuraTextSecondary break-words">{reportTitle}</p>
          </div>
          {storagePath && (
            <div className="flex flex-wrap gap-2 shrink-0">
              <button type="button" onClick={() => void handleViewOriginal()} disabled={isViewingFile} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-nuraText font-semibold text-sm transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {isViewingFile ? t('fileActions.opening') : t('documents.originalReport')}
              </button>
              <button type="button" onClick={() => void handleDownloadOriginal()} disabled={isDownloadingFile} className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isDownloadingFile ? t('fileActions.downloading') : t('fileActions.downloadOriginal')}
              </button>
            </div>
          )}
        </div>

        {!storagePath && <p className="text-sm text-nuraTextSecondary">{t('fileActions.olderUnavailable')}</p>}
        {fileActionError && <p className="text-sm font-medium text-red-700" role="alert">{fileActionError}</p>}
        {downloadSucceeded && <p className="text-sm font-medium text-emerald-700" role="status">{t('fileActions.downloadSuccess')}</p>}

        {metadata.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metadata.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_3px_16px_rgba(0,0,0,0.025)]">
                <div className="rounded-xl bg-blue-50 p-2 text-primary"><Icon className="h-4 w-4" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-nuraText">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      <section className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-6 sm:p-8 shadow-[0_6px_28px_rgba(37,99,235,0.05)]">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{t('narrativeUi.reportNotes')}</p>
        <h2 className="mt-2 font-heading text-xl sm:text-2xl font-extrabold text-nuraText">{t('narrativeUi.summary')}</h2>
        <p className="mt-4 whitespace-pre-line text-sm sm:text-base leading-7 text-nuraTextSecondary">{analysisData.summary}</p>
      </section>

      {analysisData.key_findings.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-nuraText">{t('narrativeUi.keyFindings')}</h2>
          <div className="grid grid-cols-1 gap-4">
            {analysisData.key_findings.map((item, index) => (
              <article key={`${item.finding}-${index}`} className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <h3 className="font-heading text-base sm:text-lg font-bold text-nuraText">{item.finding}</h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-primary">{t('narrativeUi.whatThisMeans')}</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-nuraTextSecondary">{item.explanation}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {impression && (
        <section className="rounded-[1.5rem] border border-violet-100 bg-violet-50/60 p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-violet-600" />
            <div>
              <h2 className="font-heading text-xl font-extrabold text-nuraText">{t('narrativeUi.reportImpression')}</h2>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-line text-sm sm:text-base leading-7 text-nuraTextSecondary">{impression}</p>
        </section>
      )}

      {analysisData.terms_explained.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-nuraText">{t('narrativeUi.medicalTerms')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysisData.terms_explained.map((item, index) => (
              <article key={`${item.term}-${index}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <h3 className="font-heading font-bold text-nuraText">{item.term}</h3>
                <p className="mt-2 text-sm leading-6 text-nuraTextSecondary">{item.explanation}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <aside className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        <div>
          <h2 className="font-heading font-bold text-emerald-900">{t('narrativeUi.safetyTitle')}</h2>
          <p className="mt-1.5 text-sm leading-6 text-emerald-900/80">{t('narrativeUi.safetyNotice')}</p>
        </div>
      </aside>
    </motion.main>
  );
};
