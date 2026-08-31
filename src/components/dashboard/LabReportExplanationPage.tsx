import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, ArrowLeft, Activity, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LabReportSummaryPage } from './LabReportSummaryPage';
import { LabReportAnalysis } from '../../types';
import { useTranslation } from 'react-i18next';

interface LabReportItem {
  id: string;
  date: string;
  fileType: 'PDF' | 'JPG' | 'PNG';
  title: string;
  analysis?: LabReportAnalysis;
}

interface LabReportExplanationPageProps {
  onBackToDashboard?: () => void;
}

export const LabReportExplanationPage: React.FC<LabReportExplanationPageProps> = ({
  onBackToDashboard
}) => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<LabReportItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeReport, setActiveReport] = useState<LabReportItem | null>(null);
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
          const loadedReports: LabReportItem[] = data.map((row) => ({
            id: row.id,
            title: row.file_name,
            fileType: row.file_type as 'PDF' | 'JPG' | 'PNG',
            date: new Date(row.uploaded_at).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            analysis: {
              reportFormat: 'structured',
              reportType: row.report_type ?? null,
              laboratory: row.laboratory ?? null,
              reportDate: row.report_date ?? null,
              rawText: row.raw_text ?? null,
              parameters: row.parameters || [],
            },
          }));

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

      const { data, error } = await supabase.functions.invoke('analyze-lab-report', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      console.log('LAB REPORT ANALYSIS:', data);
      const analysis = data as LabReportAnalysis;

      if (
        !analysis ||
        analysis.reportFormat === 'unsupported' ||
        !Array.isArray(analysis.parameters) ||
        analysis.parameters.length === 0
      ) {
        setErrorMessage(t('documentErrors.panel'));
        setIsAnalyzing(false);
        isAnalyzingRef.current = false;
        return;
      }

      let finalReportItem: LabReportItem = {
        ...newReportItem,
        analysis,
      };

      // Attempt to persist structured analysis to public.lab_reports table
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: insertedData, error: insertError } = await supabase
            .from('lab_reports')
            .insert({
              user_id: userData.user.id,
              file_name: newReportItem.title,
              file_type: newReportItem.fileType,
              report_type: analysis.reportType,
              laboratory: analysis.laboratory,
              report_date: analysis.reportDate,
              raw_text: analysis.rawText,
              parameters: analysis.parameters,
              uploaded_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            console.error('Supabase lab_reports insert error:', insertError);
            setErrorMessage(t('documentErrors.saveLab'));
          } else if (insertedData) {
            finalReportItem = {
              id: insertedData.id,
              title: insertedData.file_name,
              fileType: insertedData.file_type as 'PDF' | 'JPG' | 'PNG',
              date: new Date(insertedData.uploaded_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              analysis,
            };
          }
        }
      } catch (saveErr) {
        console.error('Error persisting lab report to Supabase:', saveErr);
        setErrorMessage(t('documentErrors.saveLab'));
      }

      setReports((currentReports) => [
        finalReportItem,
        ...currentReports.filter((r) => r.id !== newReportItem.id && r.id !== finalReportItem.id),
      ]);
      setActiveReport(finalReportItem);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

    } catch (error) {
      console.error('LAB REPORT ANALYSIS ERROR:', error);
      setErrorMessage(t('documentErrors.analyzeLab'));
    } finally {
      isAnalyzingRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const handleDeleteReport = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    setErrorMessage(null);

    try {
      const { error } = await supabase.from('lab_reports').delete().eq('id', reportId);

      if (error) {
        console.error('Supabase lab report delete error:', error);
        setErrorMessage(t('documentErrors.deleteLab'));
        return;
      }

      setReports((current) => current.filter((r) => r.id !== reportId));
      if (activeReport?.id === reportId) {
        setActiveReport(null);
      }
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

  if (activeReport && activeReport.analysis) {
    return (
      <LabReportSummaryPage
        onBack={() => setActiveReport(null)}
        reportTitle={activeReport.title}
        uploadDate={activeReport.date}
        fileType={activeReport.fileType}
        analysisData={activeReport.analysis}
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
                  if (report.analysis) {
                    setActiveReport(report);
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
