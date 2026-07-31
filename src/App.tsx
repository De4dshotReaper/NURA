import React, { useState, useEffect } from 'react';
import { LandingNavbar } from './components/landing/LandingNavbar';
import { Hero } from './components/landing/Hero';
import { OnboardingStep1 } from './components/onboarding/OnboardingStep1';
import { SymptomEntry } from './components/onboarding/SymptomEntry';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding-1' | 'next-flow'>('landing');
  const [journeyType, setJourneyType] = useState<'new-illness' | 'follow-up' | null>(null);

  const handleStartJourney = () => {
    setCurrentView('onboarding-1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Intercept clicks on anchor links like #get-started to trigger onboarding without modifying Hero
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.getAttribute('href') === '#get-started') {
        e.preventDefault();
        handleStartJourney();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-nuraBg text-nuraText font-sans relative selection:bg-primary/10 selection:text-primary">
      {currentView === 'landing' && (
        <>
          {/* Floating Landing Navbar */}
          <LandingNavbar onStartJourney={handleStartJourney} />

          {/* Hero Section */}
          <main>
            <Hero />
          </main>
        </>
      )}

      {currentView === 'onboarding-1' && (
        <OnboardingStep1
          onComplete={(option) => {
            setJourneyType(option);
            setCurrentView('next-flow');
          }}
        />
      )}

      {currentView === 'next-flow' && journeyType === 'new-illness' && (
        <SymptomEntry />
      )}

      {currentView === 'next-flow' && journeyType === 'follow-up' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-nuraBg">
          <div className="max-w-md space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-200/80">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <span className="font-heading font-bold text-xl">N</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-nuraText">Next Flow Prepared</h2>
            <p className="text-nuraTextSecondary">
              Selected path: <span className="font-semibold text-primary">Follow-up Visit (Review Consultation)</span>
            </p>
            <p className="text-xs text-nuraTextSecondary opacity-80">
              Navigation structure is fully configured. The subsequent onboarding screen will be implemented next.
            </p>
            <button
              onClick={() => {
                setCurrentView('landing');
                setJourneyType(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
            >
              Back to Landing Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
