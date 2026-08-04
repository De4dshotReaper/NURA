import React, { useState, useEffect } from 'react';
import { LandingNavbar } from './components/landing/LandingNavbar';
import { Hero } from './components/landing/Hero';
import { OnboardingStep1 } from './components/onboarding/OnboardingStep1';
import { SymptomEntry } from './components/onboarding/SymptomEntry';
import { SeveritySelection } from './components/onboarding/SeveritySelection';
import { DurationSelection } from './components/onboarding/DurationSelection';
import { NewIllnessSummary } from './components/onboarding/NewIllnessSummary';
import { ConsultationTransition } from './components/onboarding/ConsultationTransition';
import { FollowUpIntake } from './components/onboarding/FollowUpIntake';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding-1' | 'next-flow' | 'severity-selection' | 'duration-selection' | 'new-illness-summary' | 'consultation-transition' | 'duration-complete' | 'dashboard'>('landing');
  const [journeyType, setJourneyType] = useState<'new-illness' | 'follow-up' | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [severityScore, setSeverityScore] = useState<number | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  const handleStartJourney = () => {
    setCurrentView('onboarding-1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Intercept clicks on anchor links like #get-started or #dashboard
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target) {
        const href = target.getAttribute('href');
        if (href === '#get-started') {
          e.preventDefault();
          handleStartJourney();
        } else if (href === '#dashboard') {
          e.preventDefault();
          setCurrentView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (currentView === 'dashboard') {
    return <DashboardLayout entryMode={journeyType === 'new-illness' ? 'new' : 'follow-up'} />;
  }

  return (
    <div className="min-h-screen bg-white text-nuraText font-sans relative selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      {/* Animated Ambient Light Background Effect (Apple Health / OS style) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white">
        {/* Ribbon 1: Nura Primary Blue (#3B82F6) from top-left corner */}
        <div className="absolute -top-[40%] -left-[20%] w-[150vw] h-[60vh] bg-gradient-to-r from-[#3B82F6]/8 via-[#3B82F6]/4 to-transparent blur-[130px] animate-ribbon-1" />

        {/* Ribbon 2: Soft Mint Green (#34D399) from bottom-right corner */}
        <div className="absolute -bottom-[40%] -right-[20%] w-[150vw] h-[60vh] bg-gradient-to-l from-[#34D399]/8 via-[#34D399]/4 to-transparent blur-[130px] animate-ribbon-2" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
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
            if (option === 'follow-up') {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setCurrentView('next-flow');
            }
          }}
        />
      )}

      {currentView === 'next-flow' && journeyType === 'new-illness' && (
        <SymptomEntry
          onContinue={(enteredSymptoms) => {
            setSymptoms(enteredSymptoms);
            setCurrentView('severity-selection');
          }}
        />
      )}

      {currentView === 'severity-selection' && (
        <SeveritySelection
          onContinue={(severity) => {
            setSeverityScore(severity);
            setCurrentView('duration-selection');
          }}
        />
      )}

      {currentView === 'duration-selection' && (
        <DurationSelection
          symptoms={symptoms}
          severity={severityScore}
          onContinue={(selectedDuration) => {
            setDuration(selectedDuration);
            setCurrentView('new-illness-summary');
          }}
        />
      )}

      {currentView === 'new-illness-summary' && (
        <NewIllnessSummary
          symptoms={symptoms}
          severity={severityScore}
          duration={duration || ''}
          onContinue={() => setCurrentView('consultation-transition')}
        />
      )}

      {currentView === 'consultation-transition' && (
        <ConsultationTransition
          symptoms={symptoms}
          severity={severityScore}
          duration={duration || ''}
          onComplete={() => {
            setCurrentView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentView === 'next-flow' && journeyType === 'follow-up' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-transparent">
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
    </div>
  );
};

export default App;
