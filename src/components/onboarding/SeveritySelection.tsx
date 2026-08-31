import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { useTranslation } from 'react-i18next';

interface SeveritySelectionProps {
  onContinue?: (severity: number) => void;
}

export const SeveritySelection: React.FC<SeveritySelectionProps> = ({ onContinue }) => {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const getHelpText = (val: number | null) => {
    if (val === null) return "Select a number above to see symptom guidance.";
    if (val >= 1 && val <= 3) {
      return "Mild — noticeable but manageable.";
    }
    if (val >= 4 && val <= 6) {
      return "Moderate — affecting daily activities.";
    }
    if (val >= 7 && val <= 8) {
      return "Severe — difficult to ignore.";
    }
    if (val >= 9 && val <= 10) {
      return "Very severe — you should seek medical attention if symptoms are worsening.";
    }
    return "";
  };

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
            {t('workflow.severityTitle')}
          </h1>
          <p className="font-sans text-base sm:text-lg text-nuraTextSecondary font-medium">
            Choose the number that feels closest.
          </p>
        </div>

        {/* Severity Selector (10 Circular Buttons) */}
        <div 
          className="w-full pt-6 pb-2 transition-all duration-700 delay-300 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, index) => {
              const isSelected = selectedSeverity === num;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedSeverity(num)}
                  style={{
                    animationDelay: `${350 + index * 40}ms`,
                  }}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full font-heading font-bold text-lg sm:text-xl flex items-center justify-center transition-all duration-300 transform cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white shadow-xl shadow-blue-500/25 scale-110 ring-4 ring-primary/20'
                      : 'bg-white text-nuraText border border-gray-200/90 shadow-sm hover:shadow-lg hover:border-primary/50 hover:-translate-y-1'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Help Text */}
          <div className="mt-8 min-h-[3rem] flex items-center justify-center px-4 transition-all duration-500">
            <p className="font-sans text-sm sm:text-base text-nuraTextSecondary font-medium tracking-wide transition-opacity duration-300">
              {getHelpText(selectedSeverity)}
            </p>
          </div>
        </div>

        {/* Bottom Button */}
        <div 
          className="w-full pt-4 transition-all duration-700 delay-400 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <button
            disabled={selectedSeverity === null}
            onClick={() => {
              if (selectedSeverity !== null && onContinue) {
                onContinue(selectedSeverity);
              }
            }}
            className={`w-full sm:w-auto min-w-[200px] py-4 px-8 text-base font-semibold rounded-2xl transition-all duration-500 ${
              selectedSeverity !== null
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
