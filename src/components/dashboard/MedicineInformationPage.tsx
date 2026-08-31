import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, FileText, CheckCircle2, Clock, Calendar, Shield, ArrowLeft, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PrescriptionSummaryPage } from './PrescriptionSummaryPage';
import type { ExtractedMedicine } from '../../types';
import { useTranslation } from 'react-i18next';
import { languageLocale, normalizeLanguage } from '../../i18n';
import { removePrivateMedicalFile, uploadPrivateMedicalFile } from '../../lib/privateMedicalFiles';

interface PrescriptionItem {
  id: string;
  fileType: string;
  title: string;
  uploadedAt: string;
  rawText: string | null;
  medicines: ExtractedMedicine[];
  storagePath: string | null;
}

interface PrescriptionRow {
  id: string;
  file_name: string;
  file_type: string;
  raw_text: string | null;
  medicines: unknown;
  uploaded_at: string;
  storage_path: string | null;
}

const toPrescriptionItem = (row: PrescriptionRow): PrescriptionItem => ({
  id: row.id,
  title: row.file_name,
  fileType: row.file_type,
  uploadedAt: row.uploaded_at,
  rawText: row.raw_text,
  medicines: Array.isArray(row.medicines) ? row.medicines as ExtractedMedicine[] : [],
  storagePath: row.storage_path ?? null,
});

interface PrescriptionResponse {
  medicines: ExtractedMedicine[];
  rawText: string | null;
}

interface MedicineExplanationResponse {
  medicines: Array<Pick<ExtractedMedicine, 'name' | 'whatItsFor' | 'commonSideEffects' | 'thingsToRemember'>>;
}

interface MedicineInformationPageProps {
  onBackToDashboard?: () => void;
}

export const MedicineInformationPage: React.FC<MedicineInformationPageProps> = ({
  onBackToDashboard
}) => {
  const { t, i18n } = useTranslation();
  const language = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
  const locale = languageLocale[language];
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [latestPrescription, setLatestPrescription] = useState<PrescriptionItem | null>(null);
  const [isLoadingLatestPrescription, setIsLoadingLatestPrescription] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeSummaryRx, setActiveSummaryRx] = useState<PrescriptionItem | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<PrescriptionResponse | null>(null);
  const [processedPrescriptionId, setProcessedPrescriptionId] = useState<string | null>(null);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedPrescriptionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => setShowSuccess(false), 2500);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const addPrescriptionToHistory = (prescription: PrescriptionItem) => {
    setPrescriptions((currentPrescriptions) => [
      prescription,
      ...currentPrescriptions.filter((currentPrescription) => currentPrescription.id !== prescription.id),
    ].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
    setLatestPrescription((currentLatest) => !currentLatest || new Date(prescription.uploadedAt).getTime() >= new Date(currentLatest.uploadedAt).getTime()
      ? prescription
      : currentLatest);
  };

  const formatUploadedAt = (value: string) => new Date(value).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  useEffect(() => {
    let isMounted = true;

    const loadPrescriptionHistory = async () => {
      setIsLoadingLatestPrescription(true);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          if (isMounted) setErrorMessage(t('documentErrors.history'));
          return;
        }

        const [historyResult, latestResult] = await Promise.all([
          supabase
            .from('prescriptions')
            .select('id, file_name, file_type, raw_text, medicines, uploaded_at, storage_path')
            .eq('user_id', userData.user.id)
            .order('uploaded_at', { ascending: false }),
          supabase
            .from('prescriptions')
            .select('id, file_name, file_type, raw_text, medicines, uploaded_at, storage_path')
            .eq('user_id', userData.user.id)
            .order('uploaded_at', { ascending: false })
            .limit(1)
            .maybeSingle<PrescriptionRow>(),
        ]);

        if (!isMounted) {
          return;
        }

        if (historyResult.error || latestResult.error) {
          setErrorMessage(t('documentErrors.history'));
          return;
        }

        const savedPrescriptions = (historyResult.data as PrescriptionRow[]).map(toPrescriptionItem);
        setLatestPrescription(latestResult.data ? toPrescriptionItem(latestResult.data) : null);
        setPrescriptions((currentPrescriptions) => {
          const prescriptionsById = new Map(currentPrescriptions.map((prescription) => [prescription.id, prescription]));
          savedPrescriptions.forEach((prescription) => prescriptionsById.set(prescription.id, prescription));

          return Array.from(prescriptionsById.values())
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        });
      } catch {
        if (isMounted) {
          setErrorMessage(t('documentErrors.history'));
        }
      } finally {
        if (isMounted) setIsLoadingLatestPrescription(false);
      }
    };

    void loadPrescriptionHistory();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const persistProcessedPrescription = async ({
    fileName,
    fileType,
    rawText,
    medicines,
    file,
  }: {
    fileName: string;
    fileType: 'PDF' | 'JPG' | 'PNG';
    rawText: string | null;
    medicines: ExtractedMedicine[];
    file: File;
  }) => {
    let storagePath: string | null = null;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return null;
      }

      storagePath = await uploadPrivateMedicalFile('prescriptions', user.id, file);

      const { data, error } = await supabase.from('prescriptions').insert({
        user_id: user.id,
        file_name: fileName,
        file_type: fileType,
        raw_text: rawText,
        medicines,
        storage_path: storagePath,
      }).select('id, file_name, file_type, raw_text, medicines, uploaded_at, storage_path').single();

      if (error || !data) {
        const { data: existing } = await supabase
          .from('prescriptions')
          .select('id, file_name, file_type, raw_text, medicines, uploaded_at, storage_path')
          .eq('user_id', user.id)
          .eq('storage_path', storagePath)
          .maybeSingle<PrescriptionRow>();
        if (existing) {
          const savedPrescription = toPrescriptionItem(existing);
          addPrescriptionToHistory(savedPrescription);
          return savedPrescription;
        }
        await removePrivateMedicalFile('prescriptions', storagePath);
        return null;
      }

      const savedPrescription = toPrescriptionItem(data as PrescriptionRow);
      addPrescriptionToHistory(savedPrescription);
      return savedPrescription;
    } catch (error) {
      if (storagePath) {
        try { await removePrivateMedicalFile('prescriptions', storagePath); }
        catch (cleanupError) { console.error('Failed to clean up prescription storage object:', cleanupError); }
      }
      console.error('Failed to persist prescription and original file:', error);
      return null;
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    try {
      const prescription = prescriptions.find((item) => item.id === prescriptionId);
      if (prescription?.storagePath) {
        await removePrivateMedicalFile('prescriptions', prescription.storagePath);
      }
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId);

      if (error) {
        throw error;
      }

      setPrescriptions((currentPrescriptions) =>
        currentPrescriptions.filter((prescription) => prescription.id !== prescriptionId)
      );
      setLatestPrescription((currentLatest) => {
        if (currentLatest?.id !== prescriptionId) return currentLatest;
        return prescriptions.filter((prescription) => prescription.id !== prescriptionId)[0] ?? null;
      });
      setActiveSummaryRx((currentPrescription) =>
        currentPrescription?.id === prescriptionId ? null : currentPrescription
      );

      if (processedPrescriptionId === prescriptionId) {
        setProcessedPrescriptionId(null);
      }
    } catch {
      setErrorMessage(t('documentErrors.deletePrescription'));
    }
  };

  const handleFileSelect = async (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
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
      setErrorMessage(t('documentErrors.typePrescription'));
      setShowSuccess(false);
      return;
    }

    setErrorMessage(null);
    setPdfMessage(null);
    setExtractedData(null);
    setProcessedPrescriptionId(null);
    processedPrescriptionIdRef.current = null;
    setIsExplanationLoading(false);
    setSelectedFile(file);

    const newRx: PrescriptionItem = {
      id: Date.now().toString(),
      fileType: detectedType,
      title: file.name,
      uploadedAt: new Date().toISOString(),
      rawText: null,
      medicines: [],
      storagePath: null,
    };

    setShowSuccess(false);

    if (detectedType === 'PDF') {
      setPdfMessage(t('documentErrors.pdf'));
      const savedPrescription = await persistProcessedPrescription({
        fileName: file.name,
        fileType: detectedType,
        rawText: null,
        medicines: [],
        file,
      });
      if (savedPrescription) {
        setProcessedPrescriptionId(savedPrescription.id);
        processedPrescriptionIdRef.current = savedPrescription.id;
        setShowSuccess(true);
      } else {
        setErrorMessage(t('documentErrors.savePrescription'));
      }
    } else {
      setOcrLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);

        const { data, error } = await supabase.functions.invoke('analyze-prescription', {
          body: formData,
        });

        if (error) {
          throw new Error(error.message || t('labels.analyzePrescription'));
        }

        if (data && data.error) {
          throw new Error(data.error);
        }

        const prescriptionData = data as PrescriptionResponse;
        if (!prescriptionData || !Array.isArray(prescriptionData.medicines)) {
          throw new Error(t('labels.readPrescription'));
        }

        setExtractedData(prescriptionData);
        setProcessedPrescriptionId(newRx.id);
        processedPrescriptionIdRef.current = newRx.id;

        const medicineNames = prescriptionData.medicines
          .map((medicine) => medicine.name?.trim())
          .filter((name): name is string => Boolean(name));

        if (medicineNames.length > 0) {
          setIsExplanationLoading(true);

          void (async () => {
            try {
              const { data: explanationData, error: explanationError } = await supabase.functions.invoke('explain-medicines', {
                body: { medicineNames, language },
              });

              if (explanationError) {
                throw new Error(explanationError.message);
              }

              const explanations = explanationData as MedicineExplanationResponse;
              if (!explanations || !Array.isArray(explanations.medicines)) {
                throw new Error('Invalid medicine explanation response.');
              }

              const explanationsByName = new Map(
                explanations.medicines
                  .filter((medicine) => medicine.name)
                  .map((medicine) => [medicine.name!.trim().toLowerCase(), medicine])
              );

              if (processedPrescriptionIdRef.current === newRx.id) {
                const enrichedMedicines = prescriptionData.medicines.map((medicine) => {
                  const explanation = medicine.name
                    ? explanationsByName.get(medicine.name.trim().toLowerCase())
                    : undefined;

                  return explanation
                    ? {
                        ...medicine,
                        whatItsFor: explanation.whatItsFor ?? null,
                        commonSideEffects: explanation.commonSideEffects ?? [],
                        thingsToRemember: explanation.thingsToRemember ?? [],
                      }
                    : medicine;
                });

                setExtractedData({ ...prescriptionData, medicines: enrichedMedicines });

                const savedPrescription = await persistProcessedPrescription({
                  fileName: file.name,
                  fileType: detectedType,
                  rawText: prescriptionData.rawText,
                  medicines: enrichedMedicines,
                  file,
                });

                if (savedPrescription && processedPrescriptionIdRef.current === newRx.id) {
                  setProcessedPrescriptionId(savedPrescription.id);
                  setShowSuccess(true);
                } else if (!savedPrescription && processedPrescriptionIdRef.current === newRx.id) {
                  setErrorMessage(t('documentErrors.savePrescription'));
                }
              }
            } catch {
              if (processedPrescriptionIdRef.current === newRx.id) {
                setErrorMessage(t('documentErrors.medicineUnavailable'));

                const savedPrescription = await persistProcessedPrescription({
                  fileName: file.name,
                  fileType: detectedType,
                  rawText: prescriptionData.rawText,
                  medicines: prescriptionData.medicines,
                  file,
                });

                if (savedPrescription && processedPrescriptionIdRef.current === newRx.id) {
                  setProcessedPrescriptionId(savedPrescription.id);
                  setShowSuccess(true);
                } else if (!savedPrescription && processedPrescriptionIdRef.current === newRx.id) {
                  setErrorMessage(`${t('documentErrors.medicineUnavailable')} ${t('documentErrors.savePrescription')}`);
                }
              }
            } finally {
              if (processedPrescriptionIdRef.current === newRx.id) {
                setIsExplanationLoading(false);
              }
            }
          })();
        } else if (processedPrescriptionIdRef.current === newRx.id) {
          const savedPrescription = await persistProcessedPrescription({
            fileName: file.name,
            fileType: detectedType,
            rawText: prescriptionData.rawText,
            medicines: prescriptionData.medicines,
            file,
          });

          if (savedPrescription && processedPrescriptionIdRef.current === newRx.id) {
            setProcessedPrescriptionId(savedPrescription.id);
            setShowSuccess(true);
          } else if (!savedPrescription && processedPrescriptionIdRef.current === newRx.id) {
            setErrorMessage(t('documentErrors.savePrescription'));
          }
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : t('labels.analyzePrescription'));
      } finally {
        setOcrLoading(false);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  if (activeSummaryRx) {
    return (
      <PrescriptionSummaryPage
        onBack={() => setActiveSummaryRx(null)}
        prescriptionTitle={activeSummaryRx.title}
        uploadDate={formatUploadedAt(activeSummaryRx.uploadedAt)}
        fileType={activeSummaryRx.fileType}
        medicines={activeSummaryRx.medicines}
        storagePath={activeSummaryRx.storagePath}
        isExplanationLoading={activeSummaryRx.id === processedPrescriptionId && isExplanationLoading}
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
          {t('documents.medicineInfo')}
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          {t('documents.understandMedicines')}
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          {t('documents.medicineHelp')}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* ERROR TOAST NOTIFICATION */}
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

      {/* SUCCESS TOAST NOTIFICATION */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center gap-3 text-emerald-800"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{t('documents.uploadSuccess')}</span>
        </motion.div>
      )}

      {/* UPLOAD SECTION */}
      <motion.div
        whileHover={{ scale: 1.008 }}
        transition={{ duration: 0.2 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        onClick={handleUploadAreaClick}
        className={`bg-white rounded-[1.75rem] p-10 sm:p-14 border-2 border-dashed transition-all duration-250 cursor-pointer flex flex-col items-center justify-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] ${
          isDragging ? 'border-primary bg-blue-50/30' : 'border-gray-200/80 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50/80 text-primary flex items-center justify-center mb-6 shadow-xs">
          <Pill className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-nuraText">
            {t('documents.uploadPrescription')}
          </h3>
          <p className="font-sans text-sm text-nuraTextSecondary">
            {t('documents.prescriptionDrop')}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6 text-xs font-semibold text-nuraTextSecondary/70 uppercase tracking-wider">
          <span>JPG • PNG • PDF</span>
          <span>•</span>
          <span>{t('documents.maxSize')}</span>
        </div>
      </motion.div>

      {/* OCR LOADING STATE */}
      {ocrLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-blue-50 border border-blue-200/80 p-4 rounded-2xl flex items-center gap-3 text-blue-800"
        >
          <Clock className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <span className="text-sm font-semibold">{t('documents.readingPrescription')}</span>
        </motion.div>
      )}

      {/* PDF MESSAGE */}
      {pdfMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center gap-3 text-amber-800"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="text-sm font-semibold">{pdfMessage}</span>
        </motion.div>
      )}

      {/* EXTRACTED STRUCTURED RESPONSE (TEMPORARY DEBUG DISPLAY REMOVED) */}

      {/* NEW: PRESCRIPTION SUMMARY SECTION (INSERTED BETWEEN UPLOAD & MEDICINE ACCORDION) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6 pt-2"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
              {t('prescriptionLatest.title')}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary">
              {t('prescriptionLatest.subtitle')}
            </p>
          </div>
        </div>

        {isLoadingLatestPrescription ? (
          <div className="bg-white rounded-[1.75rem] p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <p className="text-sm font-medium text-nuraTextSecondary" aria-busy="true">{t('common.loading')}</p>
          </div>
        ) : latestPrescription ? (
          <div className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8">
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              {/* Stat 1: Medicines Detected */}
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                    {t('documents.medicinesDetected')}
                  </div>
                  <div className="font-heading font-bold text-lg sm:text-xl text-nuraText">
                    {t('summaryUi.detected', { count: latestPrescription.medicines.length })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                    {t('documents.uploaded')}
                  </div>
                  <div className="font-heading font-bold text-sm sm:text-base text-nuraText truncate">
                    {formatUploadedAt(latestPrescription.uploadedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Medicine List Preview (Chips) */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-nuraTextSecondary uppercase tracking-wider">
                {t('documents.detectedMedicines')}
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {latestPrescription.medicines.length > 0 ? (
                  latestPrescription.medicines.map((med, idx) => (
                    <span key={idx} className="px-3.5 py-1.5 rounded-xl border border-gray-200/80 bg-white text-xs font-semibold text-nuraText shadow-2xs">
                      {med.name || t('documents.notSpecified')} {med.dosage ? `(${med.dosage})` : ''}
                    </span>
                  ))
                ) : <span className="text-xs text-nuraTextSecondary">{t('documents.notSpecified')}</span>}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setActiveSummaryRx(latestPrescription)}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {t('documents.openMedicine')} →
              </button>
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white rounded-[1.75rem] p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-nuraTextSecondary flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="font-heading font-bold text-base text-nuraText">
                {t('documents.noPrescription')}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                {t('documents.noPrescriptionHelp')}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* RECENT PRESCRIPTIONS / ACCORDION SECTION BELOW */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
              {t('documents.recentPrescriptions')}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary mt-0.5">
              {t('documents.recentHelp')}
            </p>
          </div>
        </div>

        {prescriptions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {prescriptions.map((rx) => (
              <motion.div
                key={rx.id}
                whileHover={{ scale: 1.008 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveSummaryRx(rx)}
                className="bg-white rounded-[1.25rem] p-5 sm:p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:text-primary group-hover:bg-blue-50/60 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm sm:text-base text-nuraText group-hover:text-primary transition-colors">
                      {rx.title}
                    </h4>
                    <p className="font-sans text-xs text-nuraTextSecondary mt-0.5">
                      {formatUploadedAt(rx.uploadedAt)} • <span className="uppercase font-semibold">{rx.fileType}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span className="transform group-hover:translate-x-1 transition-transform">{t('documents.openMedicine')} →</span>
                  <button
                    type="button"
                    aria-label={`Delete ${rx.title}`}
                    title={t('documents.deletePrescription')}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDeletePrescription(rx.id);
                    }}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[1.75rem] p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-nuraTextSecondary flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h3 className="font-heading font-bold text-base text-nuraText">
                {t('documents.noPrescriptions')}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                {t('documents.noPrescriptionsHelp')}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MedicineInformationPage;
