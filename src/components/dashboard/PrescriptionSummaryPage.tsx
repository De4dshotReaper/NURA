import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Pill, 
  CheckCircle2, 
  ChevronDown, 
  AlertCircle,
  ArrowLeft,
  Download,
  ExternalLink,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';
import type { ExtractedMedicine } from '../../types';
import { useTranslation } from 'react-i18next';
import { createPrivateMedicalFileUrl, downloadPrivateMedicalFile } from '../../lib/privateMedicalFiles';

interface PrescriptionSummaryPageProps {
  onBack?: () => void;
  prescriptionTitle: string;
  uploadDate: string;
  fileType: string;
  medicines: ExtractedMedicine[];
  storagePath: string | null;
  isExplanationLoading?: boolean;
}

export const PrescriptionSummaryPage: React.FC<PrescriptionSummaryPageProps> = ({
  onBack,
  prescriptionTitle,
  uploadDate,
  fileType,
  medicines,
  storagePath,
  isExplanationLoading = false,
}) => {
  const { t } = useTranslation();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    '0': true, // First card open by default
  });
  const [fileActionError, setFileActionError] = useState<string | null>(null);
  const [downloadSucceeded, setDownloadSucceeded] = useState(false);
  const [isViewingFile, setIsViewingFile] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const displayMedicines = medicines;

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleViewOriginal = async () => {
    if (!storagePath || isViewingFile) return;
    const previewWindow = window.open('about:blank', '_blank');
    setIsViewingFile(true);
    setFileActionError(null);
    try {
      const signedUrl = await createPrivateMedicalFileUrl('prescriptions', storagePath);
      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.href = signedUrl;
      } else {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      previewWindow?.close();
      console.error('Failed to open original prescription:', error);
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
      await downloadPrivateMedicalFile('prescriptions', storagePath, prescriptionTitle);
      setDownloadSucceeded(true);
    } catch (error) {
      console.error('Failed to download original prescription:', error);
      setFileActionError(t('fileActions.downloadError'));
    } finally {
      setIsDownloadingFile(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mr-auto space-y-10 pb-20 select-none"
    >
      {/* Back navigation if provided */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-nuraTextSecondary hover:text-nuraText transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>{t('documents.backMedicines')}</span>
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 text-primary text-xs font-semibold tracking-wider uppercase">
          {t('documents.prescriptionSummary')}
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          {t('summaryUi.medTitle')}
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          {t('summaryUi.medSubtitle')}
        </p>
      </div>

      {/* PRESCRIPTION OVERVIEW CARD */}
      <motion.div
        whileHover={{ scale: 1.004 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-primary border border-blue-100/60 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base sm:text-lg text-nuraText">
              {prescriptionTitle}
            </h3>
            <div className="flex items-center gap-3 text-xs text-nuraTextSecondary font-medium">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                {t('documents.uploaded')} {uploadDate}
              </span>
              <span>•</span>
              <span>{t('summaryUi.detected', { count: displayMedicines.length })}</span>
              <span>•</span>
              <span className="uppercase font-semibold text-nuraText">{fileType}</span>
            </div>
          </div>
        </div>

      </motion.div>

      {storagePath ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void handleViewOriginal()} disabled={isViewingFile} className="px-5 py-2.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-gray-100/80 text-nuraText font-semibold text-sm transition-all disabled:opacity-50 inline-flex items-center gap-2">
            <ExternalLink className="w-4 h-4 opacity-60" />
            {isViewingFile ? t('fileActions.opening') : t('documents.originalPrescription')}
          </button>
          <button type="button" onClick={() => void handleDownloadOriginal()} disabled={isDownloadingFile} className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
            <Download className="w-4 h-4" />
            {isDownloadingFile ? t('fileActions.downloading') : t('fileActions.downloadOriginal')}
          </button>
        </div>
      ) : (
        <p className="text-sm text-nuraTextSecondary">{t('fileActions.olderUnavailable')}</p>
      )}
      {fileActionError && <p className="text-sm font-medium text-red-700" role="alert">{fileActionError}</p>}
      {downloadSucceeded && <p className="text-sm font-medium text-emerald-700" role="status">{t('fileActions.downloadSuccess')}</p>}

      {/* MEDICINE CARDS SECTION */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
            {t('summaryUi.prescribed')}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary">
            {isExplanationLoading
              ? t('summaryUi.preparing')
              : t('summaryUi.alongside')}
          </p>
        </div>

        <div className="space-y-4">
          {displayMedicines.map((medicine, index) => {
            const isExpanded = expandedCards[index] ?? false;

            return (
              <motion.div
                key={index}
                layout
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-[1.75rem] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              >
                {/* Card Header (Always visible, click to toggle) */}
                <div
                  onClick={() => toggleCard(index.toString())}
                  className="p-6 sm:p-7 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 text-nuraText group-hover:text-primary group-hover:bg-blue-50/60 transition-colors flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-heading font-extrabold text-lg sm:text-xl text-nuraText group-hover:text-primary transition-colors">
                          {medicine.name || t('documents.notSpecified')}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {medicine.confidence ? t('summaryUi.confidence', { value: medicine.confidence }) : t('summaryUi.confidenceUnknown')}
                        </span>
                      </div>
                      <p className="text-xs text-nuraTextSecondary font-medium">
                        {t('documents.dosage')}: <span className="text-nuraText">{medicine.dosage || t('documents.notSpecified')}</span> • {t('documents.frequency')}: <span className="text-nuraText">{medicine.frequency || t('documents.notSpecified')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraTextSecondary group-hover:text-nuraText transition-colors shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-280 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expandable Content Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="border-t border-gray-100 bg-gray-50/40 px-6 sm:px-8 py-6 space-y-6"
                    >
                      {/* What it's for */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <Pill className="w-3.5 h-3.5 text-primary" />
                          <span>{t('documents.dosage')}</span>
                        </div>
                        <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                          {medicine.dosage || t('documents.notSpecified')}
                        </p>
                      </div>

                      {/* How to take it */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{t('documents.frequency')}</span>
                        </div>
                        <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                          {medicine.frequency || t('documents.notSpecified')}
                        </p>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('documents.instructions')}</span>
                        </div>
                        <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                          {medicine.instructions || t('documents.notSpecified')}
                        </p>
                      </div>

                      {/* General medicine information */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-200/60">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70 mb-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('documents.generalPurpose')}</span>
                        </div>
                        <p className="font-sans text-sm text-nuraText font-medium bg-white p-4 rounded-xl border border-gray-200/60 shadow-2xs">
                          {isExplanationLoading
                            ? t('summaryUi.educationPreparing')
                            : medicine.whatItsFor || t('summaryUi.educationMissing')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>{t('documents.generalSideEffects')}</span>
                        </div>
                        {isExplanationLoading ? (
                          <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                            {t('summaryUi.educationPreparing')}
                          </p>
                        ) : medicine.commonSideEffects && medicine.commonSideEffects.length > 0 ? (
                          <ul className="space-y-1.5 pl-5.5">
                            {medicine.commonSideEffects.map((effect, effectIndex) => (
                              <li key={effectIndex} className="font-sans text-sm text-nuraText flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                                <span>{effect}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                            {t('summaryUi.educationMissing')}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('documents.remember')}</span>
                        </div>
                        {isExplanationLoading ? (
                          <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                            {t('summaryUi.educationPreparing')}
                          </p>
                        ) : medicine.thingsToRemember && medicine.thingsToRemember.length > 0 ? (
                          <ul className="space-y-1.5 pl-5.5">
                            {medicine.thingsToRemember.map((item, itemIndex) => (
                              <li key={itemIndex} className="font-sans text-sm text-nuraText flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                            {t('summaryUi.educationMissing')}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FOOTER INFORMATIONAL CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-blue-50/40 rounded-[1.75rem] p-6 sm:p-8 border border-blue-100/70 shadow-[0_4px_24px_rgba(0,0,0,0.015)] flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-primary shrink-0 shadow-xs">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h4 className="font-heading font-bold text-base text-nuraText">
            {t('summaryUi.keepOriginal')}
          </h4>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
            {t('summaryUi.medicineDisclaimer')}
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default PrescriptionSummaryPage;
