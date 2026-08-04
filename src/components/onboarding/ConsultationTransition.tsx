import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';

interface ConsultationTransitionProps {
  onComplete: () => void;
  symptoms?: string;
  severity?: number | null;
  duration?: string;
}

const SUBTITLES = [
  'Saving your notes...',
  'Organizing your information...',
  'Almost ready...',
];

export const ConsultationTransition: React.FC<ConsultationTransitionProps> = ({
  onComplete,
  symptoms,
  severity,
  duration,
}) => {
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setSubtitleIndex(1);
    }, 800);

    const t2 = setTimeout(() => {
      setSubtitleIndex(2);
    }, 1600);

    const t3 = setTimeout(() => {
      setIsLoaded(true);
    }, 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-nuraBg flex flex-col items-center justify-center px-6 py-12 overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {!isLoaded ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-md w-full mx-auto flex flex-col items-center space-y-8 text-center"
          >
            {/* Nura Branding with Soft Blue Glow & Floating Logo */}
            <div className="relative flex flex-col items-center">
              <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none -top-3" />
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative flex items-center gap-3.5 z-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                  <span className="font-heading font-bold text-2xl leading-none">N</span>
                </div>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-nuraText">
                  Nura
                </span>
              </motion.div>
            </div>

            {/* Text Section */}
            <div className="space-y-3 z-10 w-full">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-nuraText tracking-tight">
                Preparing your consultation
              </h2>

              <div className="h-6 relative flex items-center justify-center w-full">
                <AnimatePresence>
                  <motion.p
                    key={subtitleIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="absolute inset-0 flex items-center justify-center font-sans text-sm sm:text-base font-medium text-nuraTextSecondary"
                  >
                    {SUBTITLES[subtitleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl w-full mx-auto flex flex-col items-center text-center space-y-8 z-10 py-6"
          >
            {/* Logo & Caption */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/15">
                  <span className="font-heading font-bold text-2xl leading-none">N</span>
                </div>
                <span className="font-heading font-extrabold text-2xl tracking-tight text-nuraText">
                  Nura
                </span>
              </div>
            </div>

            {/* 1. Heading fades in while moving upward about 16px */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-2"
            >
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-nuraText tracking-tight">
                Your consultation is prepared.
              </h1>
              {/* 2. Subheading fades in */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                className="font-sans text-base sm:text-lg text-nuraTextSecondary font-medium"
              >
                Everything has been organized into a clear summary for your consultation.
              </motion.p>
            </motion.div>

            {/* 3. Main content appears using staggered animation */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
              className="w-full max-w-[590px] bg-[#1F1F1F] rounded-[24px] p-8 sm:p-10 text-left shadow-2xl shadow-black/20 border border-white/5 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Consultation Summary
                </span>
                <span className="text-xs font-normal text-gray-400/80 tracking-wide">
                  Just now
                </span>
              </div>

              <div className="space-y-5">
                {/* 4. Cards or sections reveal one after another with approximately 80ms delay */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.28, ease: 'easeOut' }}
                >
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Recorded
                  </h4>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    Today • Just prepared
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.36, ease: 'easeOut' }}
                >
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Symptoms
                  </h4>
                  <p className="text-sm sm:text-base text-white leading-relaxed font-semibold whitespace-pre-wrap">
                    {symptoms || 'No symptoms specified.'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.44, ease: 'easeOut' }}
                >
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Severity
                  </h4>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {severity !== null && severity !== undefined ? `${severity} / 10` : 'Not specified'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.52, ease: 'easeOut' }}
                >
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    Duration
                  </h4>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {duration || 'Not specified'}
                  </p>
                </motion.div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <p className="text-xs font-medium text-emerald-300/90 flex items-center gap-2">
                  <span>✓</span> Ready for your consultation
                </p>
                <p className="text-xs font-medium text-emerald-300/90 flex items-center gap-2">
                  <span>✓</span> Summary prepared
                </p>
              </div>
            </motion.div>

            {/* 5. Continue button fades in last */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.6, ease: 'easeOut' }}
              className="w-full max-w-[590px] pt-2"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={onComplete}
                className="w-full py-4 text-base font-semibold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Go to Dashboard →
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
