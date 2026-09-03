import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  ArrowLeft,
  Download,
  Shield,
  AlertTriangle,
  Activity,
  Check,
} from 'lucide-react';
import { StructuredLabReportAnalysis, LabParameter } from '../../types';
import { useTranslation } from 'react-i18next';
import { createPrivateMedicalFileUrl, downloadPrivateMedicalFile } from '../../lib/privateMedicalFiles';

interface LabReportSummaryPageProps {
  onBack?: () => void;
  reportTitle: string;
  uploadDate: string;
  fileType: string;
  analysisData: StructuredLabReportAnalysis;
  storagePath: string | null;
  showBackButton?: boolean;
}

export const LabReportSummaryPage: React.FC<LabReportSummaryPageProps> = ({
  onBack,
  reportTitle,
  uploadDate,
  fileType,
  analysisData,
  storagePath,
  showBackButton = true,
}) => {
  const { t } = useTranslation();
  const displayStatus = (status?: string | null) => {
    if (status === 'Normal') return t('statusUi.normal');
    if (status === 'Below Range') return t('statusUi.below');
    if (status === 'Above Range') return t('statusUi.above');
    if (status === 'Outside Range') return t('statusUi.outside');
    return status || t('statusUi.unknown');
  };
  const parameters: LabParameter[] = analysisData?.parameters || [];
  const reportType = analysisData?.reportType || t('summaryUi.notAvailable');
  const laboratory = analysisData?.laboratory || t('summaryUi.notAvailable');
  const reportDate = analysisData?.reportDate || uploadDate || t('summaryUi.notAvailable');

  const [expandedParams, setExpandedParams] = useState<Record<string, boolean>>(
    parameters.length > 0 ? { [parameters[0].id]: true } : {}
  );
  const [fileActionError, setFileActionError] = useState<string | null>(null);
  const [downloadSucceeded, setDownloadSucceeded] = useState(false);
  const [isViewingFile, setIsViewingFile] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);

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
      console.error('Failed to open original lab report:', error);
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
      console.error('Failed to download original lab report:', error);
      setFileActionError(t('fileActions.downloadError'));
    } finally {
      setIsDownloadingFile(false);
    }
  };

  const toggleParam = (id: string) => {
    setExpandedParams((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const abnormalParameters = parameters.filter(
    (p) =>
      p.status === 'Below Range' ||
      p.status === 'Above Range' ||
      p.status === 'Outside Range'
  );

  const normalParameters = parameters.filter((p) => p.status === 'Normal');
  const unknownParameters = parameters.filter((p) => p.status === 'Unknown');

  // Build key findings: up to 3 cards. Priority: abnormal first, then normal, then unknown.
  const keyFindingCandidates = [
    ...abnormalParameters,
    ...normalParameters,
    ...unknownParameters,
  ];
  const keyFindings = keyFindingCandidates.slice(0, 3);
  const abnormalCount = abnormalParameters.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mr-auto space-y-10 pb-20 select-none"
    >
      {/* Back navigation */}
      {showBackButton && onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-nuraTextSecondary hover:text-nuraText transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>{t('documents.backLabs')}</span>
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/85 text-primary text-xs font-semibold tracking-wider uppercase">
          {t('documents.labInfo')}
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          {t('summaryUi.labTitle')}
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          {t('summaryUi.labSubtitle')}
        </p>
      </div>

      {/* REPORT SUMMARY CARD */}
      <motion.div
        whileHover={{ scale: 1.004 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8"
      >
        {/* Top bar of summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-primary border border-blue-100/60 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-base sm:text-lg text-nuraText">
                {reportTitle}
              </h3>
              <div className="flex items-center gap-2 text-xs text-nuraTextSecondary font-medium flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  {uploadDate}
                </span>
                <span>•</span>
                <span className="uppercase font-semibold text-nuraText">{fileType}</span>
              </div>
            </div>
          </div>

          {storagePath && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void handleViewOriginal()} disabled={isViewingFile} className="px-5 py-2.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-gray-100/80 text-nuraText font-semibold text-sm transition-all disabled:opacity-50 inline-flex items-center gap-2 shadow-2xs">
                <ExternalLink className="w-4 h-4 opacity-60" />
                {isViewingFile ? t('fileActions.opening') : t('documents.originalReport')}
              </button>
              <button type="button" onClick={() => void handleDownloadOriginal()} disabled={isDownloadingFile} className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isDownloadingFile ? t('fileActions.downloading') : t('fileActions.downloadOriginal')}
              </button>
            </div>
          )}
        </div>

        {!storagePath && <p className="text-sm text-nuraTextSecondary">{t('fileActions.olderUnavailable')}</p>}
        {fileActionError && <p className="text-sm font-medium text-red-700" role="alert">{fileActionError}</p>}
        {downloadSucceeded && <p className="text-sm font-medium text-emerald-700" role="status">{t('fileActions.downloadSuccess')}</p>}

        {/* Four Detail Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
              {t('summaryUi.reportType')}
            </div>
            <div className="font-heading font-bold text-base text-nuraText">
              {reportType}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
              {t('summaryUi.laboratory')}
            </div>
            <div className="font-heading font-bold text-base text-nuraText">
              {laboratory}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
              {t('summaryUi.reportDate')}
            </div>
            <div className="font-heading font-bold text-base text-nuraText">
              {reportDate}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
              {t('summaryUi.parameters')}
            </div>
            <div className="font-heading font-bold text-base text-nuraText">
              {t('previewUi.parameters', { count: parameters.length })}
            </div>
          </div>
        </div>

        {/* Overall Status and Success Message */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-nuraTextSecondary uppercase tracking-wider">
              {t('labels.status')}:
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              {t('summaryUi.analysisComplete')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50/50 text-blue-800 border border-blue-200/40">
              {parameters.length} parameters processed
            </span>
            {abnormalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                Review {abnormalCount} parameter{abnormalCount === 1 ? '' : 's'} with your doctor
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            ✓ {t('summaryUi.processed')}
          </div>
        </div>
      </motion.div>

      {/* KEY FINDINGS SECTION */}
      {keyFindings.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
              {t('summaryUi.findings')}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary">
              {t('summaryUi.findingsHelp')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {keyFindings.map((param) => {
              const isAbnormal =
                param.status === 'Below Range' ||
                param.status === 'Above Range' ||
                param.status === 'Outside Range';
              const isUnknown = param.status === 'Unknown';
              const currentValue =
                [param.value, param.unit].filter(Boolean).join(' ') ||
                'Not available';

              return (
                <div
                  key={param.id}
                  className={`rounded-[1.5rem] p-6 space-y-4 flex flex-col justify-between relative overflow-hidden ${
                    isAbnormal
                      ? 'bg-amber-50/25 border-2 border-amber-200/70 shadow-[0_4px_24px_rgba(245,158,11,0.04)]'
                      : isUnknown
                      ? 'bg-gray-50 border border-gray-200 shadow-2xs'
                      : 'bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  {isAbnormal && (
                    <div className="absolute top-0 right-0 bg-amber-100/70 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      {t('summaryUi.attention')}
                    </div>
                  )}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-base text-nuraText flex items-center gap-1.5">
                        {param.name}
                        {param.status === 'Below Range' && (
                          <span className="text-amber-600 font-bold">↓</span>
                        )}
                        {param.status === 'Above Range' && (
                          <span className="text-amber-600 font-bold">↑</span>
                        )}
                        {param.status === 'Normal' && (
                          <span className="text-emerald-600 font-bold">✓</span>
                        )}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isAbnormal
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                            : isUnknown
                            ? 'bg-gray-100 text-gray-700 border border-gray-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {displayStatus(param.status)}
                      </span>
                    </div>
                    <div className="font-heading font-extrabold text-2xl text-nuraText">
                      {param.value || t('summaryUi.notAvailable')}{' '}
                      {param.unit && (
                        <span className="text-sm font-normal text-nuraTextSecondary">
                          {param.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`pt-3 border-t ${
                      isAbnormal
                        ? 'border-amber-200/40'
                        : isUnknown
                        ? 'border-gray-200'
                        : 'border-gray-100'
                    }`}
                  >
                    <p className="text-xs text-nuraTextSecondary font-medium">
                      {param.shortExplanation ||
                        param.simpleExplanation ||
                        t('summaryUi.noExplanation')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COMPLETE REPORT ACCORDION SECTION */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
            {t('summaryUi.completeReport')}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary">
            {t('summaryUi.completeHelp')}
          </p>
        </div>

        {parameters.length === 0 ? (
          <div className="bg-white rounded-[1.75rem] p-8 text-center border border-gray-100 text-nuraTextSecondary text-sm">
            {t('summaryUi.noParameters')}
          </div>
        ) : (
          <div className="space-y-4">
            {parameters.map((param) => {
              const isExpanded = expandedParams[param.id] ?? false;
              const isNormal = param.status === 'Normal';
              const isAbnormal =
                param.status === 'Below Range' ||
                param.status === 'Above Range' ||
                param.status === 'Outside Range';
              const currentValue =
                [param.value, param.unit].filter(Boolean).join(' ') ||
                t('summaryUi.notAvailable');
              const referenceRange = param.referenceRange || t('summaryUi.notProvided');

              return (
                <motion.div
                  key={param.id}
                  layout
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-[1.75rem] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleParam(param.id)}
                    className="p-6 sm:p-7 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 text-nuraText group-hover:text-primary group-hover:bg-blue-50/60 transition-colors flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-heading font-extrabold text-lg sm:text-xl text-nuraText group-hover:text-primary transition-colors">
                            {param.name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${
                              isNormal
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : isAbnormal
                                ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {isNormal && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            {isAbnormal && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            {displayStatus(param.status)}
                          </span>
                        </div>
                        {param.subtitle && (
                          <p className="text-xs text-nuraText font-medium opacity-90">
                            {param.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-nuraTextSecondary font-medium pt-0.5">
                          <span className="font-heading font-bold text-nuraText text-sm mr-2">
                            {currentValue}
                          </span>
                          <span>• Reference: {referenceRange}</span>
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

                  {/* Accordion Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="border-t border-gray-100 bg-gray-50/40 px-6 sm:px-8 py-6 space-y-6"
                      >
                        {/* Current Value & Reference Range grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                          <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                              {t('summaryUi.currentValue')}
                            </span>
                            <div className="font-heading font-extrabold text-lg text-nuraText">
                              {currentValue}
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                              {t('summaryUi.referenceRange')}
                            </span>
                            <div className="font-heading font-extrabold text-lg text-nuraText">
                              {referenceRange}
                            </div>
                          </div>
                        </div>

                        {/* What it measures / simpleExplanation */}
                        {param.simpleExplanation && (
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                              {t('summaryUi.measures')}
                            </div>
                            <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed">
                              "{param.simpleExplanation}"
                            </p>
                          </div>
                        )}

                        {/* Your result / meaningOfResult */}
                        {param.meaningOfResult && (
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                              {t('summaryUi.yourResult')}
                            </div>
                            <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed">
                              "{param.meaningOfResult}"
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* IMPORTANT NOTICE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-blue-50/40 rounded-[1.75rem] p-6 sm:p-8 border border-blue-100/70 shadow-[0_4px_24px_rgba(0,0,0,0.015)] flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-primary shrink-0 shadow-xs">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h4 className="font-heading font-bold text-base text-nuraText">
            {t('summaryUi.labDisclaimer')}
          </h4>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
            {t('summaryUi.labDisclaimerHelp')}
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default LabReportSummaryPage;
