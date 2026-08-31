import React, { useState, useEffect } from 'react';
import { Activity, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OnboardingStep1Props {
  onComplete: (selectedOption: 'new-illness' | 'follow-up') => void;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const fullText = t('dashboard.feeling');
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [selectedCard, setSelectedCard] = useState<'new-illness' | 'follow-up' | null>(null);

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);
    setCursorVisible(true);
    setShowCards(false);
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        
        // Blink twice after typing finishes
        // Each blink is 0.8s (from globals.css)
        setTimeout(() => {
          setCursorVisible(false);
          setIsTypingComplete(true);
          
          // Show cards after cursor disappears
          setTimeout(() => {
            setShowCards(true);
          }, 350);
        }, 1600);
      }
    }, 45); // Smooth typing speed

    return () => clearInterval(typingInterval);
  }, [fullText, i18n.language]);

  const handleCardClick = (option: 'new-illness' | 'follow-up') => {
    if (selectedCard) return; // Prevent multiple clicks
    setSelectedCard(option);
    // After ~400ms, navigate to the next flow
    setTimeout(() => {
      onComplete(option);
    }, 400);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden selection:bg-primary/10 selection:text-primary bg-nuraBg">

      {/* Container centered vertically and horizontally */}
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center space-y-12 z-10">
        
        {/* Small Nura Logo at the top */}
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/15">
              <span className="font-heading font-bold text-2xl leading-none">N</span>
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-nuraText">
              Nura
            </span>
          </div>
          <p className="text-xs font-semibold text-nuraTextSecondary tracking-[0.3em] uppercase opacity-70">
            Let's get started.
          </p>
        </div>

        {/* Large Heading with Typewriter & Blinking Cursor */}
        <div className="min-h-[4rem] sm:min-h-[5rem] flex flex-col items-center justify-center">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight">
            {displayedText}
            {cursorVisible && (
              <span className="inline-block w-1 h-8 sm:h-10 ml-2 bg-primary align-middle animate-blink" />
            )}
          </h1>
          
          {/* Supporting Text */}
          <div className="h-8 mt-4">
            <p
              style={{
                opacity: showCards ? 0.8 : 0,
                transform: showCards ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 1000ms ease-out, transform 1000ms ease-out',
              }}
              className="text-base text-nuraTextSecondary max-w-md mx-auto font-medium"
            >
              Take your time. We'll guide you through the next steps.
            </p>
          </div>
        </div>

        {/* Two Option Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Card 1: New Illness */}
          <div
            onClick={() => handleCardClick('new-illness')}
            style={{
              opacity: showCards ? 1 : 0,
              transform: showCards ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1), border-color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className={`group text-left p-8 sm:p-10 rounded-[2rem] bg-white border border-gray-200/80 shadow-md cursor-pointer transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) hover:shadow-2xl hover:shadow-blue-500/15 hover:border-primary hover:-translate-y-1.5 ${
              selectedCard === 'new-illness'
                ? 'border-primary ring-4 ring-primary/20 scale-[1.03] shadow-2xl'
                : selectedCard === 'follow-up'
                ? 'opacity-45 scale-[0.98]'
                : ''
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white group-hover:scale-[1.08] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-sm">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-nuraText mb-2 group-hover:text-primary transition-colors duration-500 cubic-bezier(0.16, 1, 0.3, 1)">
              {t('workflow.newIllness')}
            </h3>
            <p className="font-sans text-nuraTextSecondary text-base sm:text-lg leading-relaxed">
              I'm preparing for a doctor visit.
            </p>
          </div>

          {/* Card 2: Follow-up Visit */}
          <div
            onClick={() => handleCardClick('follow-up')}
            style={{
              opacity: showCards ? 1 : 0,
              transform: showCards ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 150ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 150ms, box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1), border-color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className={`group text-left p-8 sm:p-10 rounded-[2rem] bg-white border border-gray-200/80 shadow-md cursor-pointer transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) hover:shadow-2xl hover:shadow-blue-500/15 hover:border-primary hover:-translate-y-1.5 ${
              selectedCard === 'follow-up'
                ? 'border-primary ring-4 ring-primary/20 scale-[1.03] shadow-2xl'
                : selectedCard === 'new-illness'
                ? 'opacity-45 scale-[0.98]'
                : ''
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white group-hover:scale-[1.08] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-sm">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-nuraText mb-2 group-hover:text-primary transition-colors duration-500 cubic-bezier(0.16, 1, 0.3, 1)">
              {t('workflow.followUp')}
            </h3>
            <p className="font-sans text-nuraTextSecondary text-base sm:text-lg leading-relaxed">
              I want to review my previous consultation.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
