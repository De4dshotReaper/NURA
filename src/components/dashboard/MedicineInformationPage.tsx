import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, FileText, CheckCircle2, Clock, Calendar, Sun, Shield, ArrowLeft } from 'lucide-react';
import { PrescriptionSummaryPage } from './PrescriptionSummaryPage';

interface PrescriptionItem {
  id: string;
  date: string;
  fileType: 'PDF' | 'JPG' | 'PNG';
  title: string;
}

interface MedicineInformationPageProps {
  onBackToDashboard?: () => void;
}

export const MedicineInformationPage: React.FC<MedicineInformationPageProps> = ({
  onBackToDashboard
}) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { id: '1', date: '31 Jul 2026', fileType: 'PDF', title: 'Prescription_31_Jul.pdf' },
    { id: '2', date: '18 Jul 2026', fileType: 'JPG', title: 'Consultation_Rx_18_Jul.jpg' },
    { id: '3', date: '4 Jul 2026', fileType: 'PNG', title: 'Clinic_Prescription_04_Jul.png' },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSummaryRx, setActiveSummaryRx] = useState<PrescriptionItem | null>(null);
  const [hasUploaded, setHasUploaded] = useState(true);

  const handleSimulateUpload = () => {
    const newRx: PrescriptionItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      fileType: 'PDF',
      title: `Prescription_${Date.now().toString().slice(-4)}.pdf`,
    };
    setPrescriptions([newRx, ...prescriptions]);
    setHasUploaded(true);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  if (activeSummaryRx) {
    return (
      <PrescriptionSummaryPage
        onBack={() => setActiveSummaryRx(null)}
        prescriptionTitle={activeSummaryRx.title}
        uploadDate={activeSummaryRx.date}
        fileType={activeSummaryRx.fileType}
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
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 text-primary text-xs font-semibold tracking-wider uppercase">
          MEDICINE INFORMATION
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          Understand your medicines.
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          Upload your prescription and we'll organize every prescribed medicine into a simple, easy-to-read explanation.
        </p>
      </div>

      {/* SUCCESS TOAST NOTIFICATION */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center gap-3 text-emerald-800"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">Prescription uploaded successfully. Summary updated below.</span>
        </motion.div>
      )}

      {/* UPLOAD SECTION */}
      <motion.div
        whileHover={{ scale: 1.008 }}
        transition={{ duration: 0.2 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleSimulateUpload(); }}
        onClick={handleSimulateUpload}
        className={`bg-white rounded-[1.75rem] p-10 sm:p-14 border-2 border-dashed transition-all duration-250 cursor-pointer flex flex-col items-center justify-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] ${
          isDragging ? 'border-primary bg-blue-50/30' : 'border-gray-200/80 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50/80 text-primary flex items-center justify-center mb-6 shadow-xs">
          <Pill className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-nuraText">
            Upload Prescription
          </h3>
          <p className="font-sans text-sm text-nuraTextSecondary">
            Drag & drop a prescription or click to browse.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6 text-xs font-semibold text-nuraTextSecondary/70 uppercase tracking-wider">
          <span>JPG • PNG • PDF</span>
          <span>•</span>
          <span>Maximum size: 10 MB</span>
        </div>
      </motion.div>

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
              Prescription Summary
            </h2>
            <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary">
              A quick overview of the medicines detected from your uploaded prescription.
            </p>
          </div>
          <button
            onClick={() => setHasUploaded(!hasUploaded)}
            className="text-xs text-nuraTextSecondary/60 hover:text-nuraText transition-colors"
            title="Toggle state between populated and empty for demo"
          >
            {hasUploaded ? 'Show Empty State' : 'Show Populated Summary'}
          </button>
        </div>

        {hasUploaded ? (
          <div className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8">
            {/* Four Statistic Blocks in a Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-gray-100">
              {/* Stat 1: Medicines Detected */}
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                    Medicines Detected
                  </div>
                  <div className="font-heading font-bold text-lg sm:text-xl text-nuraText">
                    3 Medicines
                  </div>
                </div>
              </div>

              {/* Stat 2: Estimated Duration */}
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                    Estimated Duration
                  </div>
                  <div className="font-heading font-bold text-lg sm:text-xl text-nuraText">
                    5 Days
                  </div>
                </div>
              </div>

              {/* Stat 3: Daily Schedule */}
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                    Daily Schedule
                  </div>
                  <div className="font-heading font-bold text-sm sm:text-base text-nuraText truncate">
                    Morning • Afternoon • Night
                  </div>
                </div>
              </div>

              {/* Stat 4: Uploaded */}
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/70">
                    Uploaded
                  </div>
                  <div className="font-heading font-bold text-sm sm:text-base text-nuraText truncate">
                    Today • 2:14 PM
                  </div>
                </div>
              </div>
            </div>

            {/* Medicine List Preview (Chips) */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-nuraTextSecondary uppercase tracking-wider">
                Detected Medicines
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-xl border border-gray-200/80 bg-white text-xs font-semibold text-nuraText shadow-2xs">
                  Paracetamol 650 mg
                </span>
                <span className="px-3.5 py-1.5 rounded-xl border border-gray-200/80 bg-white text-xs font-semibold text-nuraText shadow-2xs">
                  Amoxicillin 500 mg
                </span>
                <span className="px-3.5 py-1.5 rounded-xl border border-gray-200/80 bg-white text-xs font-semibold text-nuraText shadow-2xs">
                  Vitamin D3
                </span>
              </div>
            </div>

            {/* Status Footer */}
            <div className="pt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Prescription processed successfully
              </span>

              <button
                onClick={() => setActiveSummaryRx({ id: '1', date: 'Today', fileType: 'PDF', title: 'Prescription_Summary.pdf' })}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Open Medicine Details →
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
                No prescription uploaded yet.
              </h3>
              <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                Upload a prescription to automatically organize your medicines into an easy-to-read summary.
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
              Recent Prescriptions
            </h2>
            <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary mt-0.5">
              Your uploaded prescription history and simple breakdowns
            </p>
          </div>
          {prescriptions.length > 0 && (
            <button
              onClick={() => setPrescriptions([])}
              className="text-xs text-nuraTextSecondary/60 hover:text-nuraText transition-colors"
            >
              Clear All (Test Empty State)
            </button>
          )}
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
                      {rx.date} • <span className="uppercase font-semibold">{rx.fileType}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span className="transform group-hover:translate-x-1 transition-transform">Open Medicine Details →</span>
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
                No prescriptions uploaded yet
              </h3>
              <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                Your uploaded prescriptions will appear here for future reference.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MedicineInformationPage;
