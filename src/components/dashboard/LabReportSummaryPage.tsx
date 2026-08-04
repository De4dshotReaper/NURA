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
  X,
  Clock,
  Shield,
  AlertTriangle,
  Activity,
  Building2,
  Check,
} from 'lucide-react';

interface LabParameter {
  id: string;
  name: string;
  subtitle: string;
  currentValue: string;
  referenceRange: string;
  status: 'Normal' | 'Below Range' | 'Above Range' | 'Outside Range';
  shortExplanation: string;
  simpleExplanation: string;
  meaningOfResult: string;
  thingsToRemember: string;
}

interface LabReportSummaryPageProps {
  onBack?: () => void;
  reportTitle?: string;
  uploadDate?: string;
  fileType?: string;
}

const defaultParameters: LabParameter[] = [
  {
    id: '2',
    name: 'Vitamin D (25-OH)',
    subtitle: 'Essential bone and immune support nutrient',
    currentValue: '18 ng/mL',
    referenceRange: '30 – 100 ng/mL',
    status: 'Below Range',
    shortExplanation: 'Lower than the usual reference value.',
    simpleExplanation: 'Vitamin D plays an important role in calcium absorption, bone health, and immune system support.',
    meaningOfResult: 'Your value is lower than the typical reference range. This is common and often discussed during routine check-ups.',
    thingsToRemember: 'Discuss abnormal or out-of-range values with your doctor to determine if lifestyle adjustments or supplements are appropriate.',
  },
  {
    id: '1',
    name: 'Hemoglobin',
    subtitle: 'Healthy oxygen-carrying protein',
    currentValue: '13.8 g/dL',
    referenceRange: '13.0 – 17.0 g/dL',
    status: 'Normal',
    shortExplanation: 'Within the expected range.',
    simpleExplanation: 'Hemoglobin is the protein in red blood cells that carries oxygen from your lungs throughout your body.',
    meaningOfResult: 'Your value falls within the normal reference range, indicating healthy oxygen-carrying capacity.',
    thingsToRemember: 'Always discuss your complete lab findings with your healthcare professional alongside your symptoms.',
  },
  {
    id: '3',
    name: 'Blood Sugar (Fasting)',
    subtitle: 'Measures your body\'s glucose management',
    currentValue: '92 mg/dL',
    referenceRange: '70 – 99 mg/dL',
    status: 'Normal',
    shortExplanation: 'Falls within the standard fasting range.',
    simpleExplanation: 'Fasting blood glucose measures the amount of sugar in your blood after going without food overnight.',
    meaningOfResult: 'Your fasting blood glucose level is within the standard healthy reference range.',
    thingsToRemember: 'Routine monitoring helps track metabolic health over time. Discuss any questions with your care team.',
  },
  {
    id: '4',
    name: 'Total WBC Count',
    subtitle: 'Key indicator of immune system activity',
    currentValue: '6,800 /µL',
    referenceRange: '4,500 – 11,000 /µL',
    status: 'Normal',
    shortExplanation: 'Within the standard range.',
    simpleExplanation: 'White blood cells are key components of your immune system that help your body defend against infections.',
    meaningOfResult: 'Your white blood cell count falls within the expected normal range.',
    thingsToRemember: 'Always interpret immune markers in conjunction with your current symptoms and physical examination.',
  },
  {
    id: '5',
    name: 'Platelet Count',
    subtitle: 'Helps your blood clot and heal naturally',
    currentValue: '250,000 /µL',
    referenceRange: '150,000 – 450,000 /µL',
    status: 'Normal',
    shortExplanation: 'Within the expected range.',
    simpleExplanation: 'Platelets are small blood cells that help form clots to stop bleeding and support natural healing.',
    meaningOfResult: 'Your platelet count is normal and well within standard clinical limits.',
    thingsToRemember: 'Keep this report accessible for your next physician review.',
  },
];

export const LabReportSummaryPage: React.FC<LabReportSummaryPageProps> = ({
  onBack,
  reportTitle = 'CBC_Report_31_Jul.pdf',
  uploadDate = '31 July 2026',
  fileType = 'PDF',
}) => {
  const [expandedParams, setExpandedParams] = useState<Record<string, boolean>>({
    '2': true, // Vitamin D expanded by default
  });
  const [showOriginalModal, setShowOriginalModal] = useState(false);

  const toggleParam = (id: string) => {
    setExpandedParams((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mr-auto space-y-10 pb-20 select-none"
    >
      {/* Back navigation */}
      {onBack && (
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-nuraTextSecondary hover:text-nuraText transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Lab Reports</span>
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/85 text-primary text-xs font-semibold tracking-wider uppercase">
          LAB REPORT EXPLANATION
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          Understand your lab reports.
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          Upload a laboratory report and receive a clear, easy-to-read explanation of every important result.
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

          <button
            onClick={() => setShowOriginalModal(true)}
            className="px-5 py-2.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-gray-100/80 text-nuraText font-semibold text-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-2xs"
          >
            <span>View Original Report</span>
            <ExternalLink className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {/* Four Detail Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
              Report Type
            </div>
            <div className="font-heading font-bold text-base text-nuraText">
              Complete Blood Count (CBC)
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
              Laboratory
            </div>
            <div className="font-heading font-bold text-base text-nuraText">
              City Diagnostic Centre
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
              Report Date
            </div>
            <div className="font-heading font-bold text-base text-nuraText">
              31 July 2026
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
              Parameters Analysed
            </div>
            <div className="font-heading font-bold text-base text-nuraText">
              18 Parameters
            </div>
          </div>
        </div>

        {/* Overall Status and Success Message */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-nuraTextSecondary uppercase tracking-wider">
              Status:
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Analysis Complete
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50/50 text-blue-800 border border-blue-200/40">
              18 parameters processed
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
              Review 3 parameters with your doctor
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            ✓ Report successfully processed
          </div>
        </div>
      </motion.div>

      {/* KEY FINDINGS SECTION */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
            Key Findings
          </h2>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary">
            Highlighted parameters from your report with simple explanations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Finding 1: Vitamin D (Abnormal / Requires Discussion First) */}
          <div className="bg-amber-50/20 rounded-[1.5rem] p-6 border-2 border-amber-200/60 shadow-[0_4px_24px_rgba(245,158,11,0.04)] space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-100/70 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Requires Attention
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-heading font-extrabold text-base text-nuraText flex items-center gap-1.5">
                  Vitamin D <span className="text-amber-600 font-bold">↓</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                  Below Range
                </span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-nuraText">
                18 <span className="text-sm font-normal text-nuraTextSecondary">ng/mL</span>
              </div>
            </div>
            <div className="pt-3 border-t border-amber-200/40">
              <p className="text-xs text-nuraTextSecondary font-medium">
                Lower than the usual reference value.
              </p>
            </div>
          </div>

          {/* Finding 2: Hemoglobin (Normal) */}
          <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-nuraText flex items-center gap-1.5">
                  Hemoglobin <span className="text-emerald-600 font-bold">✓</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Normal
                </span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-nuraText">
                13.8 <span className="text-sm font-normal text-nuraTextSecondary">g/dL</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-nuraTextSecondary font-medium">
                Within the expected range.
              </p>
            </div>
          </div>

          {/* Finding 3: Blood Sugar (Normal) */}
          <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-base text-nuraText flex items-center gap-1.5">
                  Blood Sugar <span className="text-emerald-600 font-bold">✓</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Normal
                </span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-nuraText">
                92 <span className="text-sm font-normal text-nuraTextSecondary">mg/dL</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-nuraTextSecondary font-medium">
                Falls within the standard fasting range.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLETE REPORT ACCORDION SECTION */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
            Complete Report
          </h2>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary">
            Every result from your report, explained in simple language.
          </p>
        </div>

        <div className="space-y-4">
          {defaultParameters.map((param) => {
            const isExpanded = expandedParams[param.id] ?? false;
            const isNormal = param.status === 'Normal';

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
                              : 'bg-amber-50 text-amber-800 border border-amber-200/70'
                          }`}
                        >
                          {isNormal ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          {param.status}
                        </span>
                      </div>
                      <p className="text-xs text-nuraText font-medium opacity-90">
                        {param.subtitle}
                      </p>
                      <p className="text-xs text-nuraTextSecondary font-medium pt-0.5">
                        <span className="font-heading font-bold text-nuraText text-sm mr-2">{param.currentValue}</span>
                        <span>• Reference: {param.referenceRange}</span>
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
                            Current Value
                          </span>
                          <div className="font-heading font-extrabold text-lg text-nuraText">
                            {param.currentValue}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                            Reference Range
                          </span>
                          <div className="font-heading font-extrabold text-lg text-nuraText">
                            {param.referenceRange}
                          </div>
                        </div>
                      </div>

                      {/* What it measures */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          What it measures
                        </div>
                        <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed">
                          "{param.simpleExplanation}"
                        </p>
                      </div>

                      {/* Your result */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                          Your result
                        </div>
                        <p className="font-sans text-sm sm:text-base text-nuraText font-normal leading-relaxed">
                          "{param.meaningOfResult}"
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
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
            Lab reports provide information—not a diagnosis.
          </h4>
          <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
            Abnormal values do not always indicate illness. Only a qualified healthcare professional can interpret your complete medical history together with these results.
          </p>
        </div>
      </motion.div>

      {/* ORIGINAL REPORT MODAL */}
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
                      {reportTitle}
                    </h3>
                    <p className="text-xs text-nuraTextSecondary">
                      City Diagnostic Centre • Uploaded {uploadDate}
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

              {/* Simulated Document Preview */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200/80 space-y-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center text-primary mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <h4 className="font-heading font-bold text-xl text-nuraTrust">City Diagnostic Centre</h4>
                  <p className="text-xs text-nuraTextSecondary">Certified Pathology & Laboratory Services</p>
                  <div className="pt-4 text-left text-xs text-nuraText space-y-2 border-t border-gray-200">
                    <p><strong>Patient Name:</strong> Divyanshu</p>
                    <p><strong>Test Ordered:</strong> Complete Blood Count (CBC)</p>
                    <p><strong>Date:</strong> {uploadDate}</p>
                    <div className="pt-2 space-y-1">
                      <p>• Hemoglobin: 13.8 g/dL (Normal)</p>
                      <p>• Vitamin D: 18 ng/mL (Below Range)</p>
                      <p>• Blood Sugar (Fasting): 92 mg/dL (Normal)</p>
                      <p>• Total WBC: 6,800 /µL (Normal)</p>
                      <p>• Platelets: 250,000 /µL (Normal)</p>
                    </div>
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
                    alert('Lab report PDF downloaded successfully.');
                    setShowOriginalModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-blue-500/10"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LabReportSummaryPage;
