import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NewIllnessSummaryProps {
  symptoms: string;
  severity: number | null;
  duration: string;
  onContinue: () => void;
  isSaving?: boolean;
  errorMessage?: string | null;
}

export const NewIllnessSummary: React.FC<NewIllnessSummaryProps> = ({
  symptoms,
  severity,
  duration,
  onContinue,
  isSaving = false,
  errorMessage = null,
}) => {
  const { t } = useTranslation();
  const [recordedAt] = useState(() => new Date());
  const formattedRecordedAt = `${recordedAt.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })} • ${recordedAt.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })}`;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden bg-nuraBg selection:bg-primary/10 selection:text-primary">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-2xl w-full mx-auto flex flex-col items-center text-center space-y-10 z-10"
      >
        {/* Top Section: Small Nura Logo & Uppercase Caption */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-3">
            <img src="/pwa-192x192.png" alt="" className="h-12 w-12 rounded-2xl object-contain shadow-lg shadow-blue-500/15" />
            <span className="font-heading font-extrabold text-2xl tracking-tight text-nuraText">
              Nura
            </span>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
            className="text-xs font-semibold text-nuraTextSecondary tracking-[0.3em] uppercase"
          >
            {t('workflow.ready')}
          </motion.p>
        </div>

        {/* Large Heading & Subheading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className="space-y-3"
        >
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight">
            {t('workflow.summaryTitle')}
          </h1>
          <p className="font-sans text-base sm:text-lg text-nuraTextSecondary font-medium">
            {t('workflow.summaryHelp')}
          </p>
        </motion.div>

        {/* Error Banner if insert fails */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[590px] p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold flex items-center gap-3 text-left shadow-lg"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Centered Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
          className="w-full max-w-[590px] bg-[#1F1F1F] rounded-[24px] p-8 sm:p-10 text-left shadow-2xl shadow-black/20 border border-white/5"
        >
          {/* Card Header Title */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              {t('workflow.consultationSummary')}
            </span>
            <span className="text-xs font-normal text-gray-400/80 tracking-wide">
              {formattedRecordedAt}
            </span>
          </div>

          <div className="space-y-6">
            {/* Recorded Section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22, ease: 'easeOut' }}
            >
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                Recorded
              </h4>
              <p className="text-sm sm:text-base font-semibold text-white">
                {formattedRecordedAt}
              </p>
            </motion.div>

            {/* Symptoms Section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.30, ease: 'easeOut' }}
            >
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t('dashboard.symptoms')}
              </h4>
              <p className="text-sm sm:text-base text-white leading-relaxed font-semibold whitespace-pre-wrap">
                {symptoms || t('transition.noSymptoms')}
              </p>
            </motion.div>

            {/* Severity Section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.38, ease: 'easeOut' }}
            >
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t('dashboard.severity')}
              </h4>
              <p className="text-sm sm:text-base font-semibold text-white">
                {severity !== null ? `${severity} / 10` : 'Not specified'}
              </p>
            </motion.div>

            {/* Duration Section */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.46, ease: 'easeOut' }}
            >
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {t('dashboard.duration')}
              </h4>
              <p className="text-sm sm:text-base font-semibold text-white">
                {duration || 'Not specified'}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.62, ease: 'easeOut' }}
          className="w-full pt-4"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
            disabled={isSaving}
            className="w-full sm:w-auto min-w-[200px] py-4 text-base font-semibold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t('common.saving') : t('common.continue')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
