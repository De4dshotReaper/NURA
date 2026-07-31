import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';

interface SymptomEntryProps {
  onContinue?: (symptoms: string) => void;
}

export const SymptomEntry: React.FC<SymptomEntryProps> = ({ onContinue }) => {
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState('');

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
        
        {/* Small Nura Logo */}
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
            START WHEREVER FEELS NATURAL.
          </p>
        </div>

        {/* Heading & Subheading */}
        <div 
          className="space-y-3 transition-all duration-700 delay-200 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight">
            What are you experiencing today?
          </h1>
          <p className="font-sans text-base sm:text-lg text-nuraTextSecondary font-medium">
            We'll save this entry with today's date and time automatically.
          </p>
        </div>

        {/* Main Input Section */}
        <div 
          className="w-full space-y-3 pt-2 transition-all duration-700 delay-300 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          <div className="relative">
            <textarea
              rows={7}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Start wherever feels natural..."
              className="w-full p-6 sm:p-8 bg-white border border-gray-200/80 rounded-[2rem] shadow-lg shadow-blue-500/5 font-sans text-nuraText placeholder:text-nuraTextSecondary/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300 resize-none text-base sm:text-lg leading-relaxed"
            />
          </div>

          {/* Recorded Info */}
          <div className="flex flex-col items-start px-2 space-y-0.5">
            <span className="text-xs font-medium text-nuraTextSecondary/70 uppercase tracking-wider">
              Recorded automatically
            </span>
            <span className="text-sm font-semibold text-nuraTextSecondary">
              31 July • 7:15 PM
            </span>
          </div>
        </div>

        {/* Bottom Action */}
        <div 
          className="w-full pt-4 transition-all duration-700 delay-400 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => onContinue && onContinue(value)}
            className="w-full sm:w-auto min-w-[200px] py-4 text-base font-semibold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Continue →
          </Button>
        </div>

      </div>
    </div>
  );
};
