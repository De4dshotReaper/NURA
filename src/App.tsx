import React, { useState, useEffect } from 'react';
import { LandingNavbar } from './components/landing/LandingNavbar';
import { Hero } from './components/landing/Hero';
import { HowItWorks } from './components/landing/HowItWorks';
import { Features } from './components/landing/Features';
import { FAQ } from './components/landing/FAQ';
import { PrivacyPolicy } from './components/landing/PrivacyPolicy';
import { OnboardingStep1 } from './components/onboarding/OnboardingStep1';
import { SymptomEntry } from './components/onboarding/SymptomEntry';
import { SeveritySelection } from './components/onboarding/SeveritySelection';
import { DurationSelection } from './components/onboarding/DurationSelection';
import { NewIllnessSummary } from './components/onboarding/NewIllnessSummary';
import { ConsultationTransition } from './components/onboarding/ConsultationTransition';
import { FollowUpIntake } from './components/onboarding/FollowUpIntake';
import type { FollowUpIntakeValues } from './components/onboarding/FollowUpIntake';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { LoginPage } from './components/auth/LoginPage';
import { supabase } from './lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface PreviousSymptomEntry {
  id: string;
  symptoms: string;
  severity: number;
  duration: string;
  created_at: string;
}

interface PersistedSymptomEntry {
  id: string;
  created_at: string;
}

interface ActiveFollowUpEpisode {
  initial_symptom_entry_id: string;
}

interface SymptomEpisodeSelectionProps {
  onSelect: (id: string) => void;
  onBack: () => void;
  purpose: 'follow-up' | 'questions' | 'consultation';
}

const SymptomEpisodeSelection: React.FC<SymptomEpisodeSelectionProps> = ({ onSelect, onBack, purpose }) => {
  const [entries, setEntries] = useState<PreviousSymptomEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('symptom_entries')
          .select('id, symptoms, severity, duration, created_at')
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (error) {
          console.error('Failed to load symptom entries for episode selection:', error);
          setErrorMessage('Unable to load previous symptom entries. Please try again.');
          return;
        }

        setEntries((data ?? []) as PreviousSymptomEntry[]);
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error loading symptom entries for episode selection:', error);
        setErrorMessage('Unable to load previous symptom entries. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadEntries();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-nuraBg px-6 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-nuraTextSecondary hover:text-primary transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {purpose === 'follow-up'
              ? 'Follow-up Visit'
              : purpose === 'questions'
                ? 'Questions Before Appointment'
                : 'Record Appointment'}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-nuraText tracking-tight">
            Choose a previous symptom entry
          </h1>
          <p className="text-nuraTextSecondary">
            {purpose === 'follow-up'
              ? 'Select the illness you want to follow up on.'
              : purpose === 'questions'
                ? 'Select the symptom episode you want to prepare questions for.'
                : 'Select the symptom episode this appointment belongs to.'}
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-[1.5rem] border border-gray-100 bg-white p-10 text-center shadow-sm" aria-busy="true">
            <p className="text-sm font-medium text-nuraTextSecondary">Loading previous symptom entries...</p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-[1.5rem] border border-red-100 bg-white p-8 text-center shadow-sm" role="alert">
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-[1.5rem] border border-gray-100 bg-white p-10 text-center shadow-sm space-y-5">
            <p className="font-medium text-nuraText">No previous symptom entries found. Record a new illness first.</p>
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry.id)}
                className="w-full rounded-[1.5rem] border border-gray-100 bg-white p-6 text-left shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <p className="font-heading text-lg font-bold text-nuraText whitespace-pre-line">{entry.symptoms}</p>
                  <time className="text-xs font-semibold text-nuraTextSecondary shrink-0">
                    {new Date(entry.created_at).toLocaleString()}
                  </time>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-nuraTextSecondary">
                  <span className="rounded-lg bg-gray-50 px-3 py-2">Severity: <strong className="text-nuraText">{entry.severity} / 10</strong></span>
                  <span className="rounded-lg bg-gray-50 px-3 py-2">Duration: <strong className="text-nuraText">{entry.duration}</strong></span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'privacy' | 'login' | 'onboarding-1' | 'next-flow' | 'severity-selection' | 'duration-selection' | 'new-illness-summary' | 'consultation-transition' | 'duration-complete' | 'dashboard' | 'follow-up-selection' | 'follow-up-intake' | 'questions-selection' | 'consultation-selection'>('landing');
  const [journeyType, setJourneyType] = useState<'new-illness' | 'follow-up' | null>(null);
  const [symptoms, setSymptoms] = useState<string>('');
  const [severityScore, setSeverityScore] = useState<number | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSavingSymptoms, setIsSavingSymptoms] = useState(false);
  const [symptomSaveError, setSymptomSaveError] = useState<string | null>(null);
  const [persistedSymptomEntry, setPersistedSymptomEntry] = useState<PersistedSymptomEntry | null>(null);
  const [selectedSymptomEntryId, setSelectedSymptomEntryId] = useState<string | null>(null);
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);
  const [followUpSaveError, setFollowUpSaveError] = useState<string | null>(null);
  const [isLoadingFollowUpEpisode, setIsLoadingFollowUpEpisode] = useState(false);
  const [followUpEpisodeError, setFollowUpEpisodeError] = useState<string | null>(null);
  const [followUpEpisodeRefreshKey, setFollowUpEpisodeRefreshKey] = useState(0);
  const [isFollowUpSaved, setIsFollowUpSaved] = useState(false);
  const [dashboardInitialItem, setDashboardInitialItem] = useState<'dashboard' | 'health-timeline'>('dashboard');
  const [selectedQuestionSymptomEntryId, setSelectedQuestionSymptomEntryId] = useState<string | null>(null);
  const [selectedConsultationSymptomEntryId, setSelectedConsultationSymptomEntryId] = useState<string | null>(null);

  const handleConfirmNewIllness = async () => {
    if (isSavingSymptoms) return;

    const trimmedSymptoms = symptoms ? symptoms.trim() : '';
    const trimmedDuration = duration ? duration.trim() : '';

    if (!trimmedSymptoms || severityScore === null || !trimmedDuration) {
      setSymptomSaveError('Please ensure all symptom details are provided.');
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      setSymptomSaveError('User authentication required to save symptom entry.');
      return;
    }

    setIsSavingSymptoms(true);
    setSymptomSaveError(null);

    let symptomEntry = persistedSymptomEntry;

    try {
      if (!symptomEntry) {
        const { data, error } = await supabase
          .from('symptom_entries')
          .insert({
            user_id: userId,
            symptoms: trimmedSymptoms,
            severity: severityScore,
            duration: trimmedDuration,
          })
          .select('id, created_at')
          .single();

        if (error) {
          console.error('Failed to insert symptom entry into Supabase:', error);
          setSymptomSaveError('Failed to save symptom details. Please try again.');
          return;
        }

        symptomEntry = data as PersistedSymptomEntry;
        setPersistedSymptomEntry(symptomEntry);
      }

      const { error: episodeInsertError } = await supabase.from('health_episodes').insert({
        user_id: userId,
        initial_symptom_entry_id: symptomEntry.id,
        started_at: symptomEntry.created_at,
      });

      if (episodeInsertError) {
        console.error('Failed to insert health episode into Supabase:', episodeInsertError);

        const { data: existingEpisode, error: episodeLookupError } = await supabase
          .from('health_episodes')
          .select('id')
          .eq('initial_symptom_entry_id', symptomEntry.id)
          .eq('user_id', userId)
          .maybeSingle();

        if (episodeLookupError) {
          console.error('Failed to verify health episode after insert error:', episodeLookupError);
        }

        if (!existingEpisode) {
          setSymptomSaveError("Your symptoms were saved, but Nura couldn't finish creating this health episode. Please try again.");
          return;
        }
      }

      setPersistedSymptomEntry(null);
      setCurrentView('consultation-transition');
    } catch (err) {
      console.error('Unexpected error saving new illness:', err);
      setSymptomSaveError(symptomEntry
        ? "Your symptoms were saved, but Nura couldn't finish creating this health episode. Please try again."
        : 'An unexpected error occurred while saving.');
    } finally {
      setIsSavingSymptoms(false);
    }
  };

  const handleStartJourney = () => {
    setCurrentView('onboarding-1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewIllness = () => {
    setJourneyType('new-illness');
    setSymptoms('');
    setSeverityScore(null);
    setDuration(null);
    setIsSavingSymptoms(false);
    setSymptomSaveError(null);
    setPersistedSymptomEntry(null);
    setCurrentView('next-flow');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartFollowUp = () => {
    setJourneyType('follow-up');
    setSelectedSymptomEntryId(null);
    setIsSavingFollowUp(false);
    setIsLoadingFollowUpEpisode(true);
    setFollowUpSaveError(null);
    setFollowUpEpisodeError(null);
    setIsFollowUpSaved(false);
    setCurrentView('follow-up-intake');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteFollowUp = async (values: FollowUpIntakeValues) => {
    if (isSavingFollowUp) return;

    const userId = session?.user?.id;
    if (!userId) {
      setFollowUpSaveError('You must be signed in to save this follow-up.');
      return;
    }

    if (!selectedSymptomEntryId) {
      setFollowUpSaveError('An active health episode is required to save a follow-up.');
      return;
    }

    setIsSavingFollowUp(true);
    setFollowUpSaveError(null);

    try {
      const { error } = await supabase.from('follow_up_entries').insert({
        user_id: userId,
        symptom_entry_id: selectedSymptomEntryId,
        progress: values.progress.trim(),
        current_symptoms: values.currentSymptoms.trim(),
        medicine_compliance: values.medicineCompliance.trim(),
        medicine_reason: values.medicineReason.trim(),
        has_side_effects: values.hasSideEffects,
        side_effects_text: values.sideEffectsText.trim(),
        questions: values.questions.trim(),
      });

      if (error) {
        console.error('Failed to insert follow-up entry into Supabase:', error);
        setFollowUpSaveError('Failed to save your follow-up. Please try again.');
        return;
      }

      setIsFollowUpSaved(true);
    } catch (error) {
      console.error('Unexpected error inserting follow-up entry:', error);
      setFollowUpSaveError('Failed to save your follow-up. Please try again.');
    } finally {
      setIsSavingFollowUp(false);
    }
  };

  const handleStartQuestions = () => {
    setSelectedQuestionSymptomEntryId(null);
    setCurrentView('questions-selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartConsultation = () => {
    setSelectedConsultationSymptomEntryId(null);
    setCurrentView('consultation-selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthenticatedUserUpdated = (user: User) => {
    setSession((currentSession) => currentSession
      ? { ...currentSession, user }
      : currentSession);
  };

  const handleSignedOut = () => {
    setSession(null);
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentView !== 'follow-up-intake' || !session) return;

    let isMounted = true;

    const loadActiveFollowUpEpisode = async () => {
      setIsLoadingFollowUpEpisode(true);
      setFollowUpEpisodeError(null);
      setSelectedSymptomEntryId(null);

      try {
        const { data, error } = await supabase
          .from('health_episodes')
          .select('initial_symptom_entry_id')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle<ActiveFollowUpEpisode>();

        if (!isMounted) return;

        if (error) {
          console.error('Failed to load active health episode for follow-up visit:', error);
          setFollowUpEpisodeError('Nura couldn’t load your active health episode. Please try again.');
          return;
        }

        setSelectedSymptomEntryId(data?.initial_symptom_entry_id ?? null);
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error loading active health episode for follow-up visit:', error);
        setFollowUpEpisodeError('Nura couldn’t load your active health episode. Please try again.');
      } finally {
        if (isMounted) setIsLoadingFollowUpEpisode(false);
      }
    };

    void loadActiveFollowUpEpisode();

    return () => {
      isMounted = false;
    };
  }, [currentView, followUpEpisodeRefreshKey, session?.user.id]);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(session);
        setIsAuthLoading(false);
      }
    };

    void loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setIsAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const requiresAuthentication = currentView === 'dashboard'
      || currentView === 'follow-up-selection'
      || currentView === 'follow-up-intake'
      || currentView === 'questions-selection'
      || currentView === 'consultation-selection';

    if (!isAuthLoading && requiresAuthentication && !session) {
      setCurrentView('login');
    }
  }, [currentView, isAuthLoading, session]);

  useEffect(() => {
    if (currentView === 'dashboard' && dashboardInitialItem === 'health-timeline') {
      setDashboardInitialItem('dashboard');
    }
  }, [currentView, dashboardInitialItem]);

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
        } else if (href === '#privacy') {
          e.preventDefault();
          setCurrentView('privacy');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (href === '#login' || href === '#signin') {
          e.preventDefault();
          setCurrentView('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (href === '#' || href === '#features' || href === '#faq' || href === '#how-it-works') {
          if (currentView !== 'landing') {
            e.preventDefault();
            setCurrentView('landing');
            setTimeout(() => {
              if (href !== '#') {
                const el = document.querySelector(href);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }, 50);
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [currentView]);

  if (isAuthLoading) {
    return <div aria-busy="true" />;
  }

  if (currentView === 'dashboard' && session) {
    return (
      <DashboardLayout
        entryMode={journeyType === 'new-illness' ? 'new' : 'follow-up'}
        onStartNewIllness={handleStartNewIllness}
        onStartFollowUp={handleStartFollowUp}
        onStartQuestions={handleStartQuestions}
        onCloseQuestions={() => setSelectedQuestionSymptomEntryId(null)}
        onStartConsultation={handleStartConsultation}
        onCloseConsultation={() => setSelectedConsultationSymptomEntryId(null)}
        onConsultationSaved={() => {
          setSelectedConsultationSymptomEntryId(null);
          setCurrentView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        initialActiveItem={selectedQuestionSymptomEntryId
          ? 'questions'
          : selectedConsultationSymptomEntryId
            ? 'appointment'
            : dashboardInitialItem}
        questionSymptomEntryId={selectedQuestionSymptomEntryId}
        consultationSymptomEntryId={selectedConsultationSymptomEntryId}
        userId={session.user.id}
        userFullName={typeof session.user.user_metadata.full_name === 'string'
          ? session.user.user_metadata.full_name
          : undefined}
        userEmail={session.user.email}
        onAuthenticatedUserUpdated={handleAuthenticatedUserUpdated}
        onSignedOut={handleSignedOut}
      />
    );
  }

  if (currentView === 'questions-selection' && session) {
    return (
      <SymptomEpisodeSelection
        purpose="questions"
        onBack={() => setCurrentView('dashboard')}
        onSelect={(id) => {
          setSelectedQuestionSymptomEntryId(id);
          setCurrentView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (currentView === 'consultation-selection' && session) {
    return (
      <SymptomEpisodeSelection
        purpose="consultation"
        onBack={() => setCurrentView('dashboard')}
        onSelect={(id) => {
          setSelectedConsultationSymptomEntryId(id);
          setCurrentView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (currentView === 'follow-up-intake' && session) {
    const goToDashboard = () => {
      setDashboardInitialItem('dashboard');
      setSelectedSymptomEntryId(null);
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToHealthTimeline = () => {
      setDashboardInitialItem('health-timeline');
      setSelectedSymptomEntryId(null);
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isLoadingFollowUpEpisode) {
      return (
        <div className="min-h-screen bg-nuraBg px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-xl shadow-blue-500/5" aria-busy="true">
            <p className="text-sm font-medium text-nuraTextSecondary">Loading your active health episode...</p>
          </div>
        </div>
      );
    }

    if (followUpEpisodeError) {
      return (
        <div className="min-h-screen bg-nuraBg px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-red-100 bg-white p-8 sm:p-10 text-center shadow-xl shadow-blue-500/5 space-y-5">
            <div className="space-y-2">
              <h1 className="font-heading text-2xl font-extrabold text-nuraText">Follow-up unavailable</h1>
              <p className="text-sm text-red-700" role="alert">{followUpEpisodeError}</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
              <button type="button" onClick={goToDashboard} className="px-5 py-3 text-sm font-semibold text-nuraTextSecondary hover:text-nuraText transition-colors">Back to Dashboard</button>
              <button type="button" onClick={() => setFollowUpEpisodeRefreshKey((key) => key + 1)} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors">Try Again</button>
            </div>
          </div>
        </div>
      );
    }

    if (isFollowUpSaved) {
      return (
        <div className="min-h-screen bg-nuraBg px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-xl shadow-blue-500/5 space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 font-heading font-bold">✓</div>
            <div className="space-y-2">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-nuraText">Follow-up recorded</h1>
              <p className="text-sm sm:text-base text-nuraTextSecondary">Your update has been added to your health timeline.</p>
            </div>
            <div className="flex flex-col items-center gap-3 pt-2">
              <button type="button" onClick={goToDashboard} className="w-full sm:w-auto min-w-[210px] rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors">Back to Dashboard</button>
              <button type="button" onClick={goToHealthTimeline} className="text-sm font-semibold text-primary hover:text-blue-600 transition-colors">View in Health Timeline →</button>
            </div>
          </div>
        </div>
      );
    }

    if (!selectedSymptomEntryId) {
      return (
        <div className="min-h-screen bg-nuraBg px-6 py-16 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-xl shadow-blue-500/5 space-y-6">
            <div className="space-y-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-nuraText">No active health episode</h1>
              <p className="text-sm sm:text-base leading-relaxed text-nuraTextSecondary">Follow-ups are recorded as part of an ongoing health episode. Start a new episode to begin tracking a new health concern.</p>
            </div>
            <button type="button" onClick={handleStartNewIllness} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors">Start New Episode</button>
          </div>
        </div>
      );
    }

    return (
      <FollowUpIntake
        onComplete={handleCompleteFollowUp}
        isSaving={isSavingFollowUp}
        errorMessage={followUpSaveError}
      />
    );
  }

  if (currentView === 'privacy') {
    return (
      <PrivacyPolicy
        onBackToHome={() => {
          setCurrentView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartJourney={handleStartJourney}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onBackToHome={() => {
          setCurrentView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLoginSuccess={() => {
          setCurrentView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartJourney={handleStartJourney}
      />
    );
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
          <LandingNavbar
            onStartJourney={handleStartJourney}
            onSignIn={() => {
              setCurrentView('login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isAuthenticated={!!session}
          />

          {/* Hero Section */}
          <main>
            <Hero />
            <HowItWorks />
            <Features />
            <FAQ />
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
          onContinue={handleConfirmNewIllness}
          isSaving={isSavingSymptoms}
          errorMessage={symptomSaveError}
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
