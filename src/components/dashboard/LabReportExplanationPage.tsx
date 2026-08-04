import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, Calendar, ArrowLeft, Activity, Plus } from 'lucide-react';
import { LabReportSummaryPage } from './LabReportSummaryPage';

interface LabReportItem {
  id: string;
  date: string;
  fileType: 'PDF' | 'JPG' | 'PNG';
  title: string;
}

interface LabReportExplanationPageProps {
  onBackToDashboard?: () => void;
}

export const LabReportExplanationPage: React.FC<LabReportExplanationPageProps> = ({
  onBackToDashboard
}) => {
  const [reports, setReports] = useState<LabReportItem[]>([
    { id: '1', date: '31 Jul 2026', fileType: 'PDF', title: 'CBC_Report_31_Jul.pdf' },
    { id: '2', date: '12 Jul 2026', fileType: 'PDF', title: 'Lipid_Profile.pdf' },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeReport, setActiveReport] = useState<LabReportItem | null>(null);
  const [hasReports, setHasReports] = useState(true);

  const handleSimulateUpload = () => {
    const newReport: LabReportItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      fileType: 'PDF',
      title: `Lab_Report_${Date.now().toString().slice(-4)}.pdf`,
    };
    setReports([newReport, ...reports]);
    setHasReports(true);
    setShowSuccess(true);
    setActiveReport(newReport);
    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  if (activeReport) {
    return (
      <LabReportSummaryPage
        onBack={() => setActiveReport(null)}
        reportTitle={activeReport.title}
        uploadDate={activeReport.date}
        fileType={activeReport.fileType}
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
          LAB REPORT EXPLANATION
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          Understand your lab reports.
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          Upload a laboratory report and receive a clear, easy-to-read explanation of every important result.
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
          <span className="text-sm font-semibold">Report successfully processed and analyzed.</span>
        </motion.div>
      )}

      {/* UPLOAD SECTION (Reusing Prescription Upload style) */}
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
          <Activity className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-nuraText">
            Upload Lab Report
          </h3>
          <p className="font-sans text-sm text-nuraTextSecondary">
            Drag & drop a laboratory report or click to browse.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-6 text-xs font-semibold text-nuraTextSecondary/70 uppercase tracking-wider">
          <span>PDF</span>
          <span>•</span>
          <span>JPG</span>
          <span>•</span>
          <span>PNG</span>
          <span>•</span>
          <span>Maximum 10 MB</span>
        </div>
      </motion.div>

      {/* RECENT REPORTS SECTION */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-nuraText tracking-tight">
              Recent Reports
            </h2>
            <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary mt-0.5">
              Your uploaded laboratory history and plain-language breakdowns
            </p>
          </div>
          <button
            onClick={() => setHasReports(!hasReports)}
            className="text-xs text-nuraTextSecondary/60 hover:text-nuraText transition-colors cursor-pointer"
            title="Toggle state between populated and empty for demo"
          >
            {hasReports ? 'Show Empty State' : 'Show Populated History'}
          </button>
        </div>

        {hasReports && reports.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                whileHover={{ scale: 1.008 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActiveReport(report)}
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

                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span className="transform group-hover:translate-x-1 transition-transform">View →</span>
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
                No lab reports uploaded yet.
              </h3>
              <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                Upload a laboratory report to receive a clear, easy-to-read explanation of every important result.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LabReportExplanationPage;
