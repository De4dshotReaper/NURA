import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, ArrowLeft, Activity, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LabReportSummaryPage } from './LabReportSummaryPage';
import { NarrativeReportSummaryPage } from './NarrativeReportSummaryPage';
import { LabReportAnalysis, NarrativeAnalysisPayload, PersistedLabReportRow } from '../../types';
import { useTranslation } from 'react-i18next';
import { normalizeLanguage } from '../../i18n';
import { removePrivateMedicalFile, uploadPrivateMedicalFile } from '../../lib/privateMedicalFiles';
import { analysisFromLabReportRow } from '../../lib/labReports';

interface LabReportItem {
  id: string;
  date: string;
  fileType: 'PDF' | 'JPG' | 'PNG';
  title: string;
  analysis?: LabReportAnalysis;
  analysisLoadFailed?: boolean;
  storagePath: string | null;
}

interface LabReportExplanationPageProps {
  onBackToDashboard?: () => void;
  activeReportId?: string | null;
  onOpenReport?: (id: string) => void;
  onBackToReports?: () => void;
}

export const LabReportExplanationPage: React.FC<LabReportExplanationPageProps> = ({
  onBackToDashboard, activeReportId = null, onOpenReport, onBackToReports
}) => {
  const { t, i18n } = useTranslation();
  const language = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
  const [reports, setReports] = useState<LabReportItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const activeReport = reports.find((item) => item.id === activeReportId) ?? null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAnalyzingRef = useRef(false);

  // Load saved reports from public.lab_reports on mount
  useEffect(() => {
    let isMounted = true;

    const fetchSavedReports = async () => {
      try {
        const { data, error } = await supabase
          .from('lab_reports')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (error) {
          console.error('Error fetching lab reports from Supabase:', error);
          return;
        }

        if (data && isMounted) {
          const loadedReports: LabReportItem[] = data.map((rawRow) => {
            const row = rawRow as PersistedLabReportRow;
            const analysis = analysisFromLabReportRow(row);
            return {
              id: row.id,
              title: row.file_name,
              fileType: row.file_type as 'PDF' | 'JPG' | 'PNG',
              date: new Date(row.uploaded_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              analysis: analysis ?? undefined,
              analysisLoadFailed: !analysis,
              storagePath: row.storage_path ?? null,
            };
          });

          setReports(loadedReports);
        }
      } catch (err) {
        console.error('Unexpected error loading saved lab reports:', err);
      }
    };

    fetchSavedReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const analyzeLabReport = async (file: File, newReportItem: LabReportItem) => {
    isAnalyzingRef.current = true;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      const { data, error } = await supabase.functions.invoke('analyze-lab-report', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      console.log('LAB REPORT ANALYSIS:', data);
      const analysis = data as LabReportAnalysis;

      if (!analysis) {
        setErrorMessage(t('documentErrors.panel'));
        setIsAnalyzing(false);
        isAnalyzingRef.current = false;
        return;
      }

      if (analysis.analysis_type === 'unsupported') {
        setErrorMessage(t('documentErrors.panel'));
        setIsAnalyzing(false);
        isAnalyzingRef.current = false;
        return;
      }

      if (analysis.analysis_type === 'narrative') {
        console.info('Narrative report analysis received:', analysis);
      } else if (!Array.isArray(analysis.parameters) || analysis.parameters.length === 0) {
        setErrorMessage(t('documentErrors.panel'));
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError ?? new Error('Authenticated user is required.');

      let storagePath: string | null = null;
      let insertedData: Record<string, unknown> | null = null;
      try {
        storagePath = await uploadPrivateMedicalFile('lab-reports', userData.user.id, file);
        const narrativePayload: NarrativeAnalysisPayload | null = analysis.analysis_type === 'narrative'
          ? {
              report_type: analysis.report_type,
              body_part_or_test: analysis.body_part_or_test,
              report_date: analysis.report_date,
              laboratory: analysis.laboratory,
              summary: analysis.summary,
              key_findings: analysis.key_findings,
              impression: analysis.impression,
              terms_explained: analysis.terms_explained,
            }
          : null;
        const insertResult = await supabase
          .from('lab_reports')
          .insert({
            user_id: userData.user.id,
            file_name: newReportItem.title,
            file_type: newReportItem.fileType,
            analysis_type: analysis.analysis_type,
            narrative_analysis: narrativePayload,
            report_type: analysis.analysis_type === 'structured' ? analysis.reportType : analysis.report_type,
            laboratory: analysis.laboratory,
            report_date: analysis.analysis_type === 'structured' ? analysis.reportDate : analysis.report_date,
            raw_text: analysis.analysis_type === 'structured' ? analysis.rawText : null,
            parameters: analysis.analysis_type === 'structured' ? analysis.parameters : [],
            uploaded_at: new Date().toISOString(),
            storage_path: storagePath,
          })
          .select()
          .single();

        insertedData = insertResult.data;
        if (insertResult.error || !insertedData) {
          const { data: existing } = await supabase
            .from('lab_reports')
            .select('*')
            .eq('user_id', userData.user.id)
            .eq('storage_path', storagePath)
            .maybeSingle();
          if (existing) insertedData = existing;
          else throw insertResult.error ?? new Error('Lab report row was not returned.');
        }
      } catch (saveError) {
        if (storagePath) {
          try { await removePrivateMedicalFile('lab-reports', storagePath); }
          catch (cleanupError) { console.error('Failed to clean up lab report storage object:', cleanupError); }
        }
        console.error('Error persisting lab report and original file:', saveError);
        throw new Error(t('documentErrors.saveLab'));
      }

      if (!insertedData) throw new Error(t('documentErrors.saveLab'));

      const finalReportItem: LabReportItem = {
        id: String(insertedData.id),
        title: String(insertedData.file_name),
        fileType: insertedData.file_type as 'PDF' | 'JPG' | 'PNG',
        date: new Date(String(insertedData.uploaded_at)).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        analysis,
        storagePath: typeof insertedData.storage_path === 'string' ? insertedData.storage_path : null,
      };

      setReports((currentReports) => [
        finalReportItem,
        ...currentReports.filter((r) => r.id !== newReportItem.id && r.id !== finalReportItem.id),
      ]);
      onOpenReport?.(finalReportItem.id);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

    } catch (error) {
      console.error('LAB REPORT ANALYSIS ERROR:', error);
      setErrorMessage(error instanceof Error && error.message === t('documentErrors.saveLab') ? error.message : t('documentErrors.analyzeLab'));
    } finally {
      isAnalyzingRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const handleDeleteReport = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    setErrorMessage(null);

    try {
      const report = reports.find((item) => item.id === reportId);
      if (report?.storagePath) await removePrivateMedicalFile('lab-reports', report.storagePath);
      const { error } = await supabase.from('lab_reports').delete().eq('id', reportId);

      if (error) {
        console.error('Supabase lab report delete error:', error);
        setErrorMessage(t('documentErrors.deleteLab'));
        return;
      }

      setReports((current) => current.filter((r) => r.id !== reportId));
      if (activeReportId === reportId) onBackToReports?.();
    } catch (err) {
      console.error('Unexpected error deleting lab report:', err);
      setErrorMessage(t('documentErrors.deleteLab'));
    }
  };

  const handleFileSelect = async (file: File) => {
    if (isAnalyzingRef.current) {
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(t('documentErrors.size'));
      setShowSuccess(false);
      return;
    }

    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();
    let detectedType: 'PDF' | 'JPG' | 'PNG' | null = null;

    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      detectedType = 'PDF';
    } else if (
      mimeType === 'image/jpeg' ||
      mimeType === 'image/jpg' ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg')
    ) {
      detectedType = 'JPG';
    } else if (mimeType === 'image/png' || fileName.endsWith('.png')) {
      detectedType = 'PNG';
    }

    if (!detectedType) {
      setErrorMessage(t('documentErrors.typeLab'));
      setShowSuccess(false);
      return;
    }

    const newReport: LabReportItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      fileType: detectedType,
      title: file.name,
      storagePath: null,
    };

    setErrorMessage(null);
    setSelectedFile(file);

    await analyzeLabReport(file, newReport);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    event.target.value = '';
  };

  if (activeReport?.analysisLoadFailed) {
    return (
      <div className="max-w-4xl mr-auto space-y-6 pb-16">
        <button onClick={() => onBackToReports?.()} className="inline-flex items-center gap-2 text-sm font-semibold text-nuraTextSecondary hover:text-nuraText">
          <ArrowLeft className="w-4 h-4" /> {t('documents.backLabs')}
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-sm font-semibold" role="alert">
          {t('narrativeUi.loadError')}
        </div>
      </div>
    );
  }

  if (activeReport && activeReport.analysis) {
    if (activeReport.analysis.analysis_type === 'narrative') {
      return (
        <NarrativeReportSummaryPage
          onBack={() => onBackToReports?.()}
          reportTitle={activeReport.title}
          uploadDate={activeReport.date}
          fileType={activeReport.fileType}
          analysisData={activeReport.analysis}
          storagePath={activeReport.storagePath}
        />
      );
    }
    if (activeReport.analysis.analysis_type === 'unsupported') {
      return (
        <div className="max-w-4xl mr-auto space-y-6 pb-16">
          <button onClick={() => onBackToReports?.()} className="inline-flex items-center gap-2 text-sm font-semibold text-nuraTextSecondary hover:text-nuraText">
            <ArrowLeft className="w-4 h-4" /> {t('documents.backLabs')}
          </button>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-sm font-semibold">
            {t('documentErrors.panel')}
          </div>
        </div>
      );
    }
    return (
      <LabReportSummaryPage
        onBack={() => onBackToReports?.()}
        reportTitle={activeReport.title}
        uploadDate={activeReport.date}
        fileType={activeReport.fileType}
        analysisData={activeReport.analysis}
        storagePath={activeReport.storagePath}
        showBackButton={false}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mr-auto space-y-12 pb-16 select-none"
    >
      {/* BACK NAVIGATION */}
      {onBackToDashboard && (
        <div className="pt-2">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-xs font-semibold text-nuraTextSecondary hover:text-nuraText transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>{t('common.backDashboard')}</span>
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 text-primary text-xs font-semibold tracking-wider uppercase">
          {t('documents.labInfo')}
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          {t('documents.understandLab')}
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          {t('documents.labHelp')}
        </p>
      </div>

      {/* SUCCESS TOAST NOTIFICATION */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 shadow-xs"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{t('documents.labSuccess')}</span>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-red-50 border border-red-200/80 p-4 rounded-2xl flex items-center gap-3 text-red-800"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </motion.div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={handleFileInputChange}
        disabled={isAnalyzing}
        className="hidden"
      />

      {/* UPLOAD SECTION */}
      <motion.div
        whileHover={{ scale: 1.008 }}
        transition={{ duration: 0.2 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (isAnalyzing) {
            return;
          }
          const file = event.dataTransfer.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        onClick={() => {
          if (!isAnalyzing) {
            fileInputRef.current?.click();
          }
        }}
        className={`bg-white rounded-[1.75rem] p-10 sm:p-14 border-2 border-dashed transition-all duration-250 cursor-pointer flex flex-col items-center justify-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] ${
          isDragging ? 'border-primary bg-blue-50/30' : 'border-gray-200/80 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50/80 text-primary flex items-center justify-center mb-6 shadow-xs">
          <Activity className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-nuraText">
            {t('documents.uploadLab')}
          </h3>
          <p className="font-sans text-sm text-nuraTextSecondary">
            {t('documents.labDrop')}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6 text-xs font-semibold text-nuraTextSecondary/70 uppercase tracking-wider">
          <span>PDF</span>
          <span>•</span>
          <span>JPG</span>
          <span>•</span>
          <span>PNG</span>
          <span>•</span>
          <span>{t('documents.maxSize')}</span>
        </div>
      </motion.div>

      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-2xl flex items-center gap-3 text-blue-800">
          <Activity className="w-5 h-5 text-blue-600 animate-pulse shrink-0" />
          <span className="text-sm font-semibold">{t('documents.analyzingLab')}</span>
        </div>
      )}

      {/* RECENT REPORTS SECTION */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
            {t('documents.recentLabs')}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary mt-0.5">
            {t('miscUi.recentLabHelp')}
          </p>
        </div>

        {reports.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                whileHover={{ scale: 1.008 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (report.analysis || report.analysisLoadFailed) {
                    onOpenReport?.(report.id);
                  }
                }}
                className="bg-white rounded-[1.25rem] p-5 sm:p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:text-primary group-hover:bg-blue-50/60 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm sm:text-base text-nuraText group-hover:text-primary transition-colors">
                      {report.title}
                    </h4>
                    <p className="font-sans text-xs text-nuraTextSecondary mt-0.5">
                      {report.date} • <span className="uppercase font-semibold">{report.fileType}</span>
                    </p>
                    {report.analysis?.analysis_type === 'narrative' && (
                      <p className="font-sans text-xs text-primary mt-1 font-semibold">
                        {report.analysis.report_type || t('narrativeUi.narrativeReport')}
                        {report.analysis.body_part_or_test ? ` • ${report.analysis.body_part_or_test}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary transform group-hover:translate-x-0.5 transition-transform">
                    {t('common.viewDetails')} →
                  </span>
                  <button
                    onClick={(e) => handleDeleteReport(e, report.id)}
                    className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                    title={t('miscUi.deleteReport')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* ELEGANT EMPTY STATE */
          <div className="bg-white rounded-[1.75rem] p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-nuraTextSecondary flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="font-heading font-bold text-base text-nuraText">
                {t('documents.noLabs')}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                {t('documents.labHelp')}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LabReportExplanationPage;
