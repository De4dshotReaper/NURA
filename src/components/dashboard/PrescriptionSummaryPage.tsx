import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Pill, 
  CheckCircle2, 
  ChevronDown, 
  ExternalLink, 
  AlertCircle,
  ArrowLeft,
  Download,
  X,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';
import type { ExtractedMedicine } from '../../types';

const defaultMedicines: ExtractedMedicine[] = [
  {
    name: 'Paracetamol 650 mg',
    dosage: '650 mg',
    frequency: '3 x day',
    instructions: null,
    confidence: 'high',
    whatItsFor: 'Commonly used to reduce fever and relieve mild to moderate pain.',
    commonSideEffects: ['Mild nausea', 'Upset stomach', 'Drowsiness'],
    thingsToRemember: ['Avoid exceeding the recommended daily dose.'],
  },
  {
    name: 'Amoxicillin 500 mg',
    dosage: '500 mg',
    frequency: 'Every 8 hours',
    instructions: null,
    confidence: 'high',
    whatItsFor: 'Commonly used to treat certain bacterial infections.',
    commonSideEffects: ['Mild diarrhea', 'Nausea', 'Skin rash (if allergic)'],
    thingsToRemember: ['Complete the full course as directed by your prescriber.'],
  },
];

interface PrescriptionSummaryPageProps {
  onBack?: () => void;
  prescriptionTitle?: string;
  uploadDate?: string;
  fileType?: string;
  medicines?: ExtractedMedicine[];
  isExplanationLoading?: boolean;
}

export const PrescriptionSummaryPage: React.FC<PrescriptionSummaryPageProps> = ({
  onBack,
  prescriptionTitle = 'Prescription_31_Jul.pdf',
  uploadDate = '31 Jul 2026',
  fileType = 'PDF',
  medicines,
  isExplanationLoading = false,
}) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    '0': true, // First card open by default
  });
  const [showOriginalModal, setShowOriginalModal] = useState(false);

  const displayMedicines = medicines ?? defaultMedicines;

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
            <span>Back to Medicines</span>
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 text-primary text-xs font-semibold tracking-wider uppercase">
          PRESCRIPTION SUMMARY
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          Your medicines, explained simply.
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          Everything has been organized into easy-to-understand information you can review before taking your medicines.
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
                Uploaded {uploadDate}
              </span>
              <span>•</span>
              <span>{displayMedicines.length} medicines detected</span>
              <span>•</span>
              <span className="uppercase font-semibold text-nuraText">{fileType}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowOriginalModal(true)}
          className="px-5 py-2.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-gray-100/80 text-nuraText font-semibold text-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-2xs"
        >
          <span>View Original Prescription</span>
          <ExternalLink className="w-4 h-4 opacity-60" />
        </button>
      </motion.div>

      {/* MEDICINE CARDS SECTION */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
            Prescribed Medicines
          </h2>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary">
            {isExplanationLoading
              ? 'Preparing general medicine information…'
              : 'Prescription details are shown alongside general medicine information.'}
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
                          {medicine.name || 'Not specified on prescription'}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {medicine.confidence ? `${medicine.confidence.charAt(0).toUpperCase() + medicine.confidence.slice(1)} confidence` : 'Confidence not specified'}
                        </span>
                      </div>
                      <p className="text-xs text-nuraTextSecondary font-medium">
                        Dosage: <span className="text-nuraText">{medicine.dosage || 'Not specified on prescription'}</span> • Frequency: <span className="text-nuraText">{medicine.frequency || 'Not specified on prescription'}</span>
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
                          <span>Dosage</span>
                        </div>
                        <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                          {medicine.dosage || 'Not specified on prescription'}
                        </p>
                      </div>

                      {/* How to take it */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>Frequency</span>
                        </div>
                        <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                          {medicine.frequency || 'Not specified on prescription'}
                        </p>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Instructions</span>
                        </div>
                        <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                          {medicine.instructions || 'Not specified on prescription'}
                        </p>
                      </div>

                      {/* General medicine information */}
                      <div className="space-y-1.5 pt-2 border-t border-gray-200/60">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70 mb-1.5">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>What It&apos;s For — General Information</span>
                        </div>
                        <p className="font-sans text-sm text-nuraText font-medium bg-white p-4 rounded-xl border border-gray-200/60 shadow-2xs">
                          {isExplanationLoading
                            ? 'General medicine information is being prepared.'
                            : medicine.whatItsFor || 'General educational information is not available.'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Common Side Effects — General Information</span>
                        </div>
                        {isExplanationLoading ? (
                          <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                            General medicine information is being prepared.
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
                            General educational information is not available.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Things to Remember — General Information</span>
                        </div>
                        {isExplanationLoading ? (
                          <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed pl-5.5">
                            General medicine information is being prepared.
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
                            General educational information is not available.
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
            Keep your original prescription.
          </h4>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
            Always follow your doctor's instructions. This page is meant to help you better understand your medicines and should not replace professional medical advice.
          </p>
        </div>
      </motion.div>

      {/* ORIGINAL PRESCRIPTION MODAL */}
      <AnimatePresence>
        {showOriginalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOriginalModal(false)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-nuraText">
                      {prescriptionTitle}
                    </h3>
                    <p className="text-xs text-nuraTextSecondary">
                      Uploaded on {uploadDate} • Verified Prescription
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOriginalModal(false)}
                  className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-nuraTextSecondary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Simulated Prescription Document View */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200/80 space-y-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-primary mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <h4 className="font-heading font-bold text-xl text-nuraText">Prescription Summary</h4>
                  <div className="pt-4 text-left text-xs text-nuraText space-y-2 border-t border-gray-200">
                    <p><strong>Date:</strong> {uploadDate}</p>
                    <p><strong>Medicines:</strong></p>
                    {displayMedicines.map((m, i) => (
                      <p key={i}>{i + 1}. {m.name || 'Not specified on prescription'} — {m.dosage || 'Not specified on prescription'}, {m.frequency || 'Not specified on prescription'}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowOriginalModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-nuraText hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Prescription downloaded successfully.');
                    setShowOriginalModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-blue-500/10"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PrescriptionSummaryPage;
