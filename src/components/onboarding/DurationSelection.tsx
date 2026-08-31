import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DurationSelectionProps {
  onContinue: (duration: string) => void;
  symptoms?: string;
  severity?: number | null;
}

const durationOptions = [
  { value: 'Today', labelKey: 'workflow.durationToday' },
  { value: 'Yesterday', labelKey: 'workflow.durationYesterday' },
  { value: '2–3 Days', labelKey: 'workflow.durationTwoThree' },
  { value: 'About a Week', labelKey: 'workflow.durationWeek' },
  { value: 'More than a Week', labelKey: 'workflow.durationMoreWeek' },
  { value: "I'm Not Sure", labelKey: 'workflow.durationUnsure' },
];

export const DurationSelection: React.FC<DurationSelectionProps> = ({ onContinue, symptoms, severity }) => {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden bg-nuraBg selection:bg-primary/10 selection:text-primary">
      <div 
        className="max-w-2xl w-full mx-auto flex flex-col items-center text-center space-y-10 z-10 transition-all duration-700 ease-out"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        
        {/* Top Section: Small Nura Logo & Uppercase Caption */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/15">
              <span className="font-heading font-bold text-2xl leading-none">N</span>
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-nuraText">
              Nura
            </span>
          </div>
          <p 
            className="text-xs font-semibold text-nuraTextSecondary tracking-[0.3em] uppercase transition-all duration-700 delay-100 ease-out"
            style={{
              opacity: loaded ? 0.8 : 0,
              transform: loaded ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            ONE STEP AT A TIME.
          </p>
        </div>

        {/* Large Heading & Subheading */}
        <div 
          className="space-y-3 transition-all duration-700 delay-200 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight">
            {t('workflow.durationTitle')}
          </h1>
          <p className="font-sans text-base sm:text-lg text-nuraTextSecondary font-medium">
            {t('workflow.durationHelp')}
          </p>
        </div>

        {/* Duration Cards (6 Stacked Cards) */}
        <div className="w-full max-w-xl mx-auto space-y-3 sm:space-y-4 pt-2">
          {durationOptions.map((option, index) => {
            const isSelected = selectedDuration === option.value;
            return (
              <div
                key={option.value}
                onClick={() => setSelectedDuration(option.value)}
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? 'translateY(0)' : 'translateY(12px)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${300 + index * 50}ms`,
                }}
                className={`w-full h-16 sm:h-[72px] px-6 sm:px-8 bg-white border rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 group ${
                  isSelected
                    ? 'border-primary bg-primary/[0.03] shadow-xl shadow-blue-500/10 scale-[1.02]'
                    : 'border-gray-200/90 shadow-sm hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <span className={`font-sans font-semibold text-base sm:text-lg transition-colors duration-200 text-left ${
                  isSelected ? 'text-primary' : 'text-nuraText group-hover:text-primary'
                }`}>
                  {t(option.labelKey)}
                </span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  isSelected ? 'border-primary bg-primary text-white shadow-sm' : 'border-gray-300 group-hover:border-primary/50'
                }`}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Button */}
        <div 
          className="w-full pt-4 transition-all duration-700 delay-600 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <button
            disabled={selectedDuration === null}
            onClick={() => {
              if (selectedDuration !== null) {
                onContinue(selectedDuration);
              }
            }}
            className={`w-full sm:w-auto min-w-[200px] py-4 px-8 text-base font-semibold rounded-2xl transition-all duration-500 ${
              selectedDuration !== null
                ? 'bg-primary text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer opacity-100'
                : 'bg-gray-100 text-gray-400 border border-gray-200/60 cursor-not-allowed opacity-70 shadow-none'
            }`}
          >
            {t('common.continue')}
          </button>
        </div>

      </div>
    </div>
  );
};
