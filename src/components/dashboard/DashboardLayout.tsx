import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Stethoscope,
  RotateCcw,
  Clock,
  HelpCircle,
  Pill,
  FileText,
  List,
  Settings as SettingsIcon,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  Siren,
  MapPin,
  Copy,
} from 'lucide-react';
import { MedicineInformationPage } from './MedicineInformationPage';
import { LabReportExplanationPage } from './LabReportExplanationPage';
import { HealthTimelinePage } from './HealthTimelinePage';
import { HealthEpisodesPage } from './HealthEpisodesPage';
import { QuestionsPage } from './QuestionsPage';
import { AppointmentDetailsPage } from './AppointmentDetailsPage';
import { SettingsPage } from './SettingsPage';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { isSupportedLanguage, languageLocale } from '../../i18n';
import { buildMapsUrl, buildSmsUri, getCurrentLocation, normalizeSmsPhone, EMERGENCY_LOCATION_OPTIONS } from '../../lib/emergency';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SymptomEntry {
  symptoms: string;
  severity: number;
  duration: string;
  created_at: string;
}

interface HealthEpisode {
  id: string;
  initial_symptom_entry_id: string;
  status: 'active' | 'completed';
  started_at: string;
}

interface CurrentHealthEpisode extends HealthEpisode {
  initialSymptom: SymptomEntry;
}

interface FollowUpEntry {
  progress: string;
  current_symptoms: string | null;
  medicine_compliance: string | null;
  created_at: string;
}

interface EpisodeFollowUpEventRow {
  id: string;
  current_symptoms: string | null;
  progress: string | null;
  created_at: string;
}

interface EpisodeQuestionRow {
  id: string;
  question: string;
  created_at: string;
}

interface EpisodeConsultationRow {
  id: string;
  notes: string;
  doctor_name: string | null;
  clinic_name: string | null;
  consultation_at: string | null;
  created_at: string;
}

interface PreviewTimelineEvent {
  id: string;
  timestamp: string;
  timestampMs: number;
  title: string;
  description: string;
  dateKey: string;
  dateLabel: string;
  timeStr: string;
}

const getLocalDateKey = (timestamp: string): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatEventDate = (timestamp: string): string =>
  new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatEventTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'new-illness', label: 'nav.newIllness', icon: Stethoscope },
  { id: 'follow-up', label: 'nav.followUp', icon: RotateCcw },
  { id: 'health-episodes', label: 'nav.episodes', icon: List },
  { id: 'health-timeline', label: 'nav.timeline', icon: Clock },
];

const resourceNavItems: NavItem[] = [
  { id: 'questions', label: 'nav.questions', icon: HelpCircle },
  { id: 'medicines', label: 'nav.medicines', icon: Pill },
  { id: 'lab-reports', label: 'nav.labReports', icon: FileText },
];

const settingsNavItems: NavItem[] = [
  { id: 'settings', label: 'nav.settings', icon: SettingsIcon },
];

const getGreetingKey = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.morning';
  if (hour < 17) return 'dashboard.afternoon';
  return 'dashboard.evening';
};

const getFirstName = (fullName?: string): string =>
  fullName?.trim().split(/\s+/)[0] ?? '';

const getFormattedDate = (locale: string): string => {
  const today = new Date();
  const weekday = today.toLocaleDateString(locale, { weekday: 'long' });
  const day = today.getDate();
  const month = today.toLocaleDateString(locale, { month: 'long' });
  const year = today.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
};

interface DashboardLayoutProps {
  entryMode?: 'new' | 'follow-up';
  onStartNewIllness?: () => void;
  onStartFollowUp?: () => void;
  onStartQuestions?: () => void;
  onCloseQuestions?: () => void;
  onStartConsultation?: () => void;
  onCloseConsultation?: () => void;
  onConsultationSaved?: () => void;
  initialActiveItem?: 'dashboard' | 'health-timeline' | 'questions' | 'appointment';
  questionSymptomEntryId?: string | null;
  consultationSymptomEntryId?: string | null;
  userId?: string;
  userFullName?: string;
  userEmail?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  onAuthenticatedUserUpdated?: (user: User) => void;
  onSignedOut?: () => void;
  activeItem: string;
  selectedHealthEpisodeId: string | null;
  selectedPrescriptionId: string | null;
  selectedLabReportId: string | null;
  onNavigateDashboard: (item: string, context?: { healthEpisodeId?: string | null; prescriptionId?: string | null; labReportId?: string | null }) => void;
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  entryMode = 'follow-up',
  onStartNewIllness,
  onStartFollowUp,
  onStartQuestions,
  onCloseQuestions,
  onStartConsultation,
  onCloseConsultation,
  onConsultationSaved,
  initialActiveItem = 'dashboard',
  questionSymptomEntryId = null,
  consultationSymptomEntryId = null,
  userId,
  userFullName,
  userEmail,
  emergencyContactName,
  emergencyContactPhone,
  onAuthenticatedUserUpdated,
  onSignedOut,
  activeItem,
  selectedHealthEpisodeId,
  selectedPrescriptionId,
  selectedLabReportId,
  onNavigateDashboard,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
}) => {
  const { t, i18n } = useTranslation();
  const selectedLanguage = isSupportedLanguage(i18n.language) ? i18n.language : 'en';
  const locale = languageLocale[selectedLanguage];
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentEpisode, setCurrentEpisode] = useState<CurrentHealthEpisode | null>(null);
  const [isLoadingCurrentEpisode, setIsLoadingCurrentEpisode] = useState<boolean>(true);
  const [currentEpisodeError, setCurrentEpisodeError] = useState<string | null>(null);
  const [showCompleteEpisodeConfirmation, setShowCompleteEpisodeConfirmation] = useState<boolean>(false);
  const [isCompletingEpisode, setIsCompletingEpisode] = useState<boolean>(false);
  const [completeEpisodeError, setCompleteEpisodeError] = useState<string | null>(null);
  const [episodeRefreshKey, setEpisodeRefreshKey] = useState<number>(0);
  const [latestFollowUp, setLatestFollowUp] = useState<FollowUpEntry | null>(null);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState<boolean>(true);
  const [latestFollowUpError, setLatestFollowUpError] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<PreviewTimelineEvent[]>([]);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showLocationBlocked, setShowLocationBlocked] = useState(false);
  const [showMissingContact, setShowMissingContact] = useState(false);
  const [isPreparingEmergency, setIsPreparingEmergency] = useState(false);
  const [preparedEmergency, setPreparedEmergency] = useState<{ message: string; locationUrl: string | null } | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(true);
  const greeting = t(getGreetingKey());
  const firstName = getFirstName(userFullName);

  useEffect(() => {
    const key = 'nura-emergency-location-prompted';
    if (!sessionStorage.getItem(key)) setShowLocationPrompt(true);
  }, []);

  const dismissLocationPrompt = () => {
    sessionStorage.setItem('nura-emergency-location-prompted', '1');
    setShowLocationPrompt(false);
  };

  const requestLocationPermission = () => {
    dismissLocationPrompt();
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => undefined,
        (error) => {
          if (error.code === error.PERMISSION_DENIED) setShowLocationBlocked(true);
        },
        EMERGENCY_LOCATION_OPTIONS,
      );
    }
  };

  const handleEmergency = async () => {
    if (isPreparingEmergency) return;
    const phone = normalizeSmsPhone(emergencyContactPhone ?? '');
    if (!emergencyContactName?.trim() || !phone) { setShowMissingContact(true); return; }
    setIsPreparingEmergency(true);
    const position = await getCurrentLocation(() => setShowLocationBlocked(true));
    const locationUrl = position ? buildMapsUrl(position.coords.latitude, position.coords.longitude) : null;
    const message = `${t('emergency.message')}${locationUrl ? ` ${t('emergency.locationMessage', { url: locationUrl })}` : ''}`;
    setPreparedEmergency({ message, locationUrl });
    setIsPreparingEmergency(false);
    window.location.href = buildSmsUri(phone, message);
  };

  useEffect(() => {
    let isMounted = true;

    const loadCurrentEpisode = async () => {
      setIsLoadingCurrentEpisode(true);
      setCurrentEpisodeError(null);

      if (!userId) {
        setCurrentEpisode(null);
        setCurrentEpisodeError(t('dashboard.episodeUnavailable'));
        setIsLoadingCurrentEpisode(false);
        return;
      }

      try {
        const { data: episode, error: episodeError } = await supabase
          .from('health_episodes')
          .select('id, initial_symptom_entry_id, status, started_at')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle<HealthEpisode>();

        if (!isMounted) return;

        if (episodeError) {
          console.error('Failed to load current active health episode:', episodeError);
          setCurrentEpisode(null);
          setCurrentEpisodeError(t('dashboard.episodeUnavailable'));
          return;
        }

        if (!episode) {
          setCurrentEpisode(null);
          return;
        }

        const { data: initialSymptom, error: symptomError } = await supabase
          .from('symptom_entries')
          .select('symptoms, severity, duration, created_at')
          .eq('id', episode.initial_symptom_entry_id)
          .eq('user_id', userId)
          .maybeSingle<SymptomEntry>();

        if (!isMounted) return;

        if (symptomError || !initialSymptom) {
          console.error('Failed to load the initial symptom entry for current health episode:', symptomError ?? {
            episodeId: episode.id,
            symptomEntryId: episode.initial_symptom_entry_id,
          });
          setCurrentEpisode(null);
          setCurrentEpisodeError(t('dashboard.episodeUnavailable'));
          return;
        }

        setCurrentEpisode({ ...episode, initialSymptom });
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error loading current health episode:', error);
        setCurrentEpisode(null);
        setCurrentEpisodeError(t('dashboard.episodeUnavailable'));
      } finally {
        if (isMounted) setIsLoadingCurrentEpisode(false);
      }
    };

    void loadCurrentEpisode();

    return () => {
      isMounted = false;
    };
  }, [episodeRefreshKey, userId]);

  useEffect(() => {
    let isMounted = true;

    const loadLatestFollowUp = async () => {
      if (!currentEpisode) return;

      try {
        const { data, error } = await supabase
          .from('follow_up_entries')
          .select('progress, current_symptoms, medicine_compliance, created_at')
          .eq('symptom_entry_id', currentEpisode.initial_symptom_entry_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle<FollowUpEntry>();

        if (!isMounted) return;

        if (error) {
          console.error('Failed to load latest follow-up for current health episode:', error);
          setLatestFollowUp(null);
          setLatestFollowUpError(t('labels.followUpUnavailable'));
        } else {
          setLatestFollowUp(data);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error loading latest follow-up for current health episode:', error);
        setLatestFollowUp(null);
        setLatestFollowUpError(t('labels.followUpUnavailable'));
      }
    };

    const loadDashboardTimeline = async () => {
      if (!currentEpisode) return;

      try {
        const symptomEntryId = currentEpisode.initial_symptom_entry_id;
        const initialSymptom = currentEpisode.initialSymptom;
        const symptomEvent: PreviewTimelineEvent = {
          id: `symptom-${symptomEntryId}`,
          timestamp: initialSymptom.created_at,
          timestampMs: new Date(initialSymptom.created_at).getTime(),
          title: t('events.symptoms'),
          description: initialSymptom.symptoms || t('audit.symptomsRecordedFallback'),
          dateKey: getLocalDateKey(initialSymptom.created_at),
          dateLabel: formatEventDate(initialSymptom.created_at),
          timeStr: formatEventTime(initialSymptom.created_at),
        };

        const loadFollowUps = async (): Promise<PreviewTimelineEvent[]> => {
          try {
            const { data, error } = await supabase
              .from('follow_up_entries')
              .select('id, current_symptoms, progress, created_at')
              .eq('symptom_entry_id', symptomEntryId);
            if (error) {
              console.error('Failed to load current episode follow-ups for dashboard timeline:', error);
              return [];
            }
            return ((data ?? []) as EpisodeFollowUpEventRow[]).map((row) => {
              const currentSymptoms = row.current_symptoms?.trim() ?? '';
              const progress = row.progress?.trim() ?? '';
              return {
                id: `followup-${row.id}`,
                timestamp: row.created_at,
                timestampMs: new Date(row.created_at).getTime(),
                title: t('events.followUp'),
                description: currentSymptoms || progress || t('audit.followUpRecordedFallback'),
                dateKey: getLocalDateKey(row.created_at),
                dateLabel: formatEventDate(row.created_at),
                timeStr: formatEventTime(row.created_at),
              };
            });
          } catch (error) {
            console.error('Unexpected error loading current episode follow-ups for dashboard timeline:', error);
            return [];
          }
        };

        const loadQuestions = async (): Promise<PreviewTimelineEvent[]> => {
          try {
            const { data, error } = await supabase
              .from('consultation_questions')
              .select('id, question, created_at')
              .eq('symptom_entry_id', symptomEntryId)
              .order('created_at', { ascending: true });
            if (error) {
              console.error('Failed to load current episode questions for dashboard timeline:', error);
              return [];
            }
            const questions = (data ?? []) as EpisodeQuestionRow[];
            if (questions.length === 0) return [];

            const timestamp = questions[0].created_at;
            return [{
              id: `questions-${symptomEntryId}`,
              timestamp,
              timestampMs: new Date(timestamp).getTime(),
              title: t('events.questions'),
              description: t(questions.length === 1 ? 'audit.questionPrepared' : 'audit.questionsPrepared', { count: questions.length }),
              dateKey: getLocalDateKey(timestamp),
              dateLabel: formatEventDate(timestamp),
              timeStr: formatEventTime(timestamp),
            }];
          } catch (error) {
            console.error('Unexpected error loading current episode questions for dashboard timeline:', error);
            return [];
          }
        };

        const loadConsultations = async (): Promise<PreviewTimelineEvent[]> => {
          try {
            const { data, error } = await supabase
              .from('consultations')
              .select('id, notes, doctor_name, clinic_name, consultation_at, created_at')
              .eq('symptom_entry_id', symptomEntryId);
            if (error) {
              console.error('Failed to load current episode consultations for dashboard timeline:', error);
              return [];
            }
            return ((data ?? []) as EpisodeConsultationRow[]).map((row) => {
              const consultationTimestamp = row.consultation_at
                && !Number.isNaN(new Date(row.consultation_at).getTime())
                ? row.consultation_at
                : row.created_at;
              const description = [row.doctor_name?.trim(), row.clinic_name?.trim()]
                .filter(Boolean)
                .join(' • ') || row.notes?.trim() || t('audit.consultationDetailsRecorded');
              return {
                id: `consultation-${row.id}`,
                timestamp: consultationTimestamp,
                timestampMs: new Date(consultationTimestamp).getTime(),
                title: t('events.appointment'),
                description,
                dateKey: getLocalDateKey(consultationTimestamp),
                dateLabel: formatEventDate(consultationTimestamp),
                timeStr: formatEventTime(consultationTimestamp),
              };
            });
          } catch (error) {
            console.error('Unexpected error loading current episode consultations for dashboard timeline:', error);
            return [];
          }
        };

        const results = await Promise.all([
          loadFollowUps(),
          loadQuestions(),
          loadConsultations(),
        ]);

        if (!isMounted) return;

        const combined = [symptomEvent, ...results.flat()];
        combined.sort((a, b) => b.timestampMs - a.timestampMs);
        const latest5 = combined.slice(0, 5);
        latest5.sort((a, b) => a.timestampMs - b.timestampMs);

        setTimelineEvents(latest5);
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error loading dashboard timeline:', error);
        setTimelineEvents([]);
      }
    };

    setLatestFollowUp(null);
    setTimelineEvents([]);
    setLatestFollowUpError(null);

    if (isLoadingCurrentEpisode) {
      setIsLoadingFollowUp(true);
      setIsLoadingTimeline(true);
    } else if (currentEpisodeError || !currentEpisode) {
      setIsLoadingFollowUp(false);
      setIsLoadingTimeline(false);
    } else {
      setIsLoadingFollowUp(true);
      setIsLoadingTimeline(true);
      void Promise.all([loadLatestFollowUp(), loadDashboardTimeline()]).finally(() => {
        if (isMounted) {
          setIsLoadingFollowUp(false);
          setIsLoadingTimeline(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [currentEpisode, currentEpisodeError, isLoadingCurrentEpisode]);

  const handleCompleteEpisode = async () => {
    if (!currentEpisode || !userId || isCompletingEpisode) return;

    setIsCompletingEpisode(true);
    setCompleteEpisodeError(null);

    try {
      const { data: completedEpisode, error } = await supabase
        .from('health_episodes')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', currentEpisode.id)
        .eq('user_id', userId)
        .select('id')
        .maybeSingle();

      if (error || !completedEpisode) {
        console.error('Failed to complete health episode:', error ?? {
          episodeId: currentEpisode.id,
          reason: 'No matching episode was updated.',
        });
        setCompleteEpisodeError(t('labels.completeError'));
        return;
      }

      setShowCompleteEpisodeConfirmation(false);
      setEpisodeRefreshKey((key) => key + 1);
    } catch (error) {
      console.error('Unexpected error completing health episode:', error);
      setCompleteEpisodeError(t('labels.completeError'));
    } finally {
      setIsCompletingEpisode(false);
    }
  };

  const renderNavList = (items: NavItem[]) => (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const Icon = item.icon;

        return (
          <li key={item.id}>
            <button
              onClick={() => {
                if (item.id === 'new-illness') {
                  setMobileMenuOpen(false);
                  onStartNewIllness?.();
                } else if (item.id === 'follow-up') {
                  setMobileMenuOpen(false);
                  onStartFollowUp?.();
                } else if (item.id === 'questions') {
                  setMobileMenuOpen(false);
                  onStartQuestions?.();
                } else {
                  onNavigateDashboard(item.id, item.id === 'health-episodes' ? { healthEpisodeId: null } : undefined);
                  setMobileMenuOpen(false);
                }
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out cursor-pointer ${
                isActive
                  ? 'bg-blue-50/80 text-primary font-semibold shadow-xs'
                  : 'text-nuraTextSecondary hover:text-nuraText hover:bg-gray-50/80 hover:pl-4.5'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-nuraTextSecondary/70'}`} />
              <span className="truncate">{t(item.label)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full py-8 px-6 justify-between overflow-y-auto">
      <div>
        {/* Top section: Nura Logo & Subtitle */}
        <div className="mb-10 space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md shadow-blue-500/15">
              <span className="font-heading font-bold text-xl leading-none">N</span>
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-nuraText">
              Nura
            </span>
          </div>
          <p className="text-xs font-medium text-nuraTextSecondary/80 tracking-wide pl-0.5">
            {t('nav.patientCompanion')}
          </p>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-8">
          {/* Main Navigation */}
          <div>
            {renderNavList(mainNavItems)}
          </div>

          {/* Resources Section */}
          <div>
            <div className="px-3 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-nuraTextSecondary/60">
              {t('nav.resources')}
            </div>
            {renderNavList(resourceNavItems)}
          </div>

          {/* Settings Section */}
          <div>
            <div className="px-3 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-nuraTextSecondary/60">
              {t('nav.settings')}
            </div>
            {renderNavList(settingsNavItems)}
          </div>
          <div className="px-1">
            <button type="button" onClick={() => { setMobileMenuOpen(false); void handleEmergency(); }} disabled={isPreparingEmergency} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"><Siren className="h-4 w-4" />{isPreparingEmergency ? t('emergency.preparing') : t('emergency.button')}</button>
            <p className="mt-2 px-1 text-[11px] leading-relaxed text-nuraTextSecondary">{t('emergency.notAutomatic')}</p>
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex h-screen w-full bg-white overflow-hidden select-none"
    >
      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 z-30 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
            <span className="font-heading font-bold text-base leading-none">N</span>
          </div>
          <span className="font-heading font-extrabold text-lg text-nuraText">Nura</span>
        </div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => void handleEmergency()} disabled={isPreparingEmergency} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><Siren className="h-4 w-4" />{t('emergency.button')}</button><button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-nuraTextSecondary hover:text-nuraText hover:bg-gray-50 transition-colors"
          aria-label={t('audit.toggleNavigation')}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button></div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[270px] bg-white z-50 shadow-2xl border-r border-gray-100"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP & TABLET FIXED SIDEBAR */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden md:block w-[230px] lg:w-[260px] h-full bg-white border-r border-gray-100 shadow-[1px_0_12px_rgba(0,0,0,0.015)] shrink-0 z-20"
      >
        {sidebarContent}
      </motion.aside>

      {/* RIGHT MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto pt-24 md:pt-12 lg:pt-16 pb-20 px-6 sm:px-10 lg:px-16 bg-white">
        <div className="max-w-4xl mb-6 flex items-center gap-2" aria-label="Application navigation history">
          <button type="button" onClick={onBack} disabled={!canGoBack} aria-label="Back" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-nuraTextSecondary transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={onForward} disabled={!canGoForward} aria-label="Forward" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-nuraTextSecondary transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"><ArrowRight className="h-4 w-4" /></button>
        </div>
        {activeItem === 'medicines' ? (
          <MedicineInformationPage activePrescriptionId={selectedPrescriptionId} onOpenPrescription={(id) => onNavigateDashboard('medicines', { prescriptionId: id })} onBackToMedicines={onBack} onBackToDashboard={() => onNavigateDashboard('dashboard')} />
        ) : activeItem === 'lab-reports' ? (
          <LabReportExplanationPage activeReportId={selectedLabReportId} onOpenReport={(id) => onNavigateDashboard('lab-reports', { labReportId: id })} onBackToReports={onBack} onBackToDashboard={() => onNavigateDashboard('dashboard')} />
        ) : activeItem === 'health-timeline' ? (
          <HealthTimelinePage onBackToDashboard={() => onNavigateDashboard('dashboard')} />
        ) : activeItem === 'health-episodes' && userId ? (
          <HealthEpisodesPage
            userId={userId}
            selectedEpisodeId={selectedHealthEpisodeId}
            onSelectEpisode={(id) => onNavigateDashboard('health-episodes', { healthEpisodeId: id })}
            onBackToEpisodes={onBack}
            onBackToDashboard={() => onNavigateDashboard('dashboard')}
            onStartNewEpisode={() => onStartNewIllness?.()}
          />
        ) : activeItem === 'settings' && onAuthenticatedUserUpdated && onSignedOut ? (
          <SettingsPage
            fullName={userFullName ?? ''}
            email={userEmail ?? ''}
            emergencyContactName={emergencyContactName ?? ''}
            emergencyContactPhone={emergencyContactPhone ?? ''}
            onBackToDashboard={() => onNavigateDashboard('dashboard')}
            onUserUpdated={onAuthenticatedUserUpdated}
            onSignedOut={onSignedOut}
          />
        ) : activeItem === 'questions' && questionSymptomEntryId && userId ? (
          <QuestionsPage
            symptomEntryId={questionSymptomEntryId}
            userId={userId}
            onBackToDashboard={() => {
              onNavigateDashboard('dashboard');
              onCloseQuestions?.();
            }}
          />
        ) : activeItem === 'appointment' && consultationSymptomEntryId && userId ? (
          <AppointmentDetailsPage
            symptomEntryId={consultationSymptomEntryId}
            userId={userId}
            onBackToDashboard={() => {
              onNavigateDashboard('dashboard');
              onCloseConsultation?.();
            }}
            onSaved={onConsultationSaved}
          />
        ) : (
          <div className="max-w-4xl mr-auto space-y-10">
          {/* Top Greeting Section */}
          <div className="space-y-2.5">
            {/* 1. Personalized Greeting */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight"
            >
              {greeting}{firstName ? `, ${firstName}` : ''}.
            </motion.h1>

            {/* 2. Welcome back / Contextual Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-sans text-lg sm:text-xl text-nuraTextSecondary font-medium"
            >
              {t('dashboard.subtitle')}
            </motion.p>

            {/* 3. Subtle Date */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.38,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-sans text-xs sm:text-sm font-medium text-nuraTextSecondary/60 tracking-wide pt-1"
            >
              {getFormattedDate(locale)}
            </motion.p>
          </div>

          {/* DASHBOARD SECTIONS (UNDERNEATH GREETING) */}
          <div className="space-y-6">
            {/* TOP ROW: Current Health Episode (larger card) & Record Appointment (smaller card) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* CARD 1: Current Health Episode (Larger card - span 7) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg text-nuraText">
                      {t('dashboard.currentEpisode')}
                    </h3>
                  </div>

                  {isLoadingCurrentEpisode ? (
                    <div className="py-10 text-center" aria-busy="true">
                      <p className="text-sm font-medium text-nuraTextSecondary">
                        {t('dashboard.loadingEpisode')}
                      </p>
                    </div>
                  ) : currentEpisodeError ? (
                    <div className="py-10 text-center space-y-3" role="alert">
                      <p className="text-sm font-medium text-red-700">
                        {currentEpisodeError}
                      </p>
                    </div>
                  ) : currentEpisode ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-nuraTextSecondary/70 tracking-wide">
                          {t('dashboard.started', { date: new Date(currentEpisode.started_at).toLocaleString(locale) })}
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          {t('dashboard.status', { status: t('common.active') })}
                        </span>
                      </div>

                      <div className="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-100/80">
                        <div className="text-[11px] font-bold tracking-wider uppercase text-nuraTextSecondary/60">
                          {t('dashboard.symptoms')}
                        </div>
                        <p className="font-sans text-base sm:text-lg text-nuraText font-normal leading-relaxed whitespace-pre-line">
                          {currentEpisode.initialSymptom.symptoms}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-1 px-1">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-nuraTextSecondary uppercase tracking-wider">
                            {t('dashboard.severity')}
                          </span>
                          <div className="font-heading font-bold text-xl text-nuraText">
                            {currentEpisode.initialSymptom.severity} <span className="text-sm font-normal text-nuraTextSecondary">/ 10</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-nuraTextSecondary uppercase tracking-wider">
                            {t('dashboard.duration')}
                          </span>
                          <div className="font-heading font-bold text-xl text-nuraText">
                            {currentEpisode.initialSymptom.duration}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {showCompleteEpisodeConfirmation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-4">
                              <div className="space-y-1.5">
                                <p className="text-sm font-bold text-nuraText">
                                  {t('dashboard.completeQuestion')}
                                </p>
                                <p className="text-xs leading-relaxed text-nuraTextSecondary">
                                  {t('dashboard.completeHelp')}
                                </p>
                              </div>

                              {completeEpisodeError && (
                                <p className="text-xs font-semibold text-red-700" role="alert">
                                  {completeEpisodeError}
                                </p>
                              )}

                              <div className="flex flex-wrap justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowCompleteEpisodeConfirmation(false);
                                    setCompleteEpisodeError(null);
                                  }}
                                  disabled={isCompletingEpisode}
                                  className="px-4 py-2 text-sm font-semibold text-nuraTextSecondary hover:text-nuraText transition-colors disabled:opacity-50"
                                >
                                  {t('dashboard.keepActive')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleCompleteEpisode()}
                                  disabled={isCompletingEpisode}
                                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isCompletingEpisode ? t('dashboard.completing') : t('dashboard.completeEpisode')}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-4">
                      <p className="font-heading text-xl font-bold text-nuraText">
                        {t('dashboard.feeling')}
                      </p>
                      <p className="text-sm text-nuraTextSecondary max-w-sm mx-auto leading-relaxed">
                        {t('dashboard.noEpisode')}
                      </p>
                      <button
                        type="button"
                        onClick={onStartNewIllness}
                        className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors"
                      >
                        {t('dashboard.startEpisode')}
                      </button>
                    </div>
                  )}
                </div>

                {currentEpisode && !isLoadingCurrentEpisode && !currentEpisodeError && (
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex justify-end">
                    {!showCompleteEpisodeConfirmation && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompleteEpisodeError(null);
                          setShowCompleteEpisodeConfirmation(true);
                        }}
                        className="text-sm font-semibold text-nuraTextSecondary hover:text-primary transition-colors"
                      >
                        {t('dashboard.completeEpisode')}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>

              {/* CARD 2: Record Appointment (Smaller card - span 5) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={onStartConsultation}
                className="lg:col-span-5 bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg text-nuraText">
                      {t('dashboard.recordAppointment')}
                    </h3>
                  </div>
                  <div className="py-8 space-y-4">
                    <p className="text-sm text-nuraTextSecondary leading-relaxed">
                      {t('dashboard.recordAppointmentHelp')}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      {t('dashboard.startRecording')}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* LATEST FOLLOW-UP */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300"
            >
              <h3 className="font-heading font-bold text-lg text-nuraText mb-5">
                {t('dashboard.latestFollowUp')}
              </h3>

              {isLoadingFollowUp ? (
                <div className="py-8 text-center" aria-busy="true">
                  <p className="text-sm font-medium text-nuraTextSecondary">{t('miscUi.loadingLatest')}</p>
                </div>
              ) : currentEpisodeError ? (
                <div className="py-8 text-center" role="alert">
                  <p className="text-sm font-medium text-red-700">{t('audit.followUpUnavailable')}</p>
                </div>
              ) : latestFollowUpError ? (
                <div className="py-8 text-center" role="alert">
                  <p className="text-sm font-medium text-red-700">{latestFollowUpError}</p>
                </div>
              ) : latestFollowUp ? (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <p className="font-heading font-extrabold text-2xl text-nuraText">
                      {latestFollowUp.progress}
                    </p>
                    <time className="text-xs font-semibold text-nuraTextSecondary/70">
                      {new Date(latestFollowUp.created_at).toLocaleString()}
                    </time>
                  </div>

                  {(latestFollowUp.current_symptoms?.trim() || latestFollowUp.medicine_compliance?.trim()) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {latestFollowUp.current_symptoms?.trim() && (
                        <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100/80 space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/60">
                            {t('audit.currentSymptoms')}
                          </p>
                          <p className="text-sm text-nuraText whitespace-pre-line">
                            {latestFollowUp.current_symptoms}
                          </p>
                        </div>
                      )}
                      {latestFollowUp.medicine_compliance?.trim() && (
                        <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100/80 space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/60">
                            {t('audit.medicineCompliance')}
                          </p>
                          <p className="text-sm font-semibold text-nuraText">
                            {latestFollowUp.medicine_compliance}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : currentEpisode ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm font-medium text-nuraText">{t('dashboard.noFollowUp')}</p>
                  <p className="text-xs text-nuraTextSecondary/70">
                    {t('dashboard.noFollowUpHelp')}
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm font-medium text-nuraText">{t('dashboard.noActiveFollowUp')}</p>
                  <p className="text-xs text-nuraTextSecondary/70">
                    {t('dashboard.noActiveFollowUpHelp')}
                  </p>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100/80">
                <button
                  type="button"
                  onClick={() => onNavigateDashboard('health-timeline')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-600 transition-colors cursor-pointer group"
                >
                          <span>{t('common.viewDetails')}</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-200 inline-block">→</span>
                </button>
              </div>
            </motion.div>

            {/* HEALTH TIMELINE (Full width) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-nuraText">
                    {t('nav.timeline')}
                  </h3>
                  <p className="text-xs text-nuraTextSecondary mt-0.5">
                    {t('dashboard.recentActivity')}
                  </p>
                </div>
              </div>

              {isLoadingTimeline ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-nuraTextSecondary">{t('miscUi.loadingActivity')}</p>
                </div>
              ) : currentEpisodeError ? (
                <div className="py-12 text-center" role="alert">
                  <p className="text-sm font-medium text-red-700">{t('audit.activityUnavailable')}</p>
                </div>
              ) : timelineEvents.length > 0 ? (
                <div className="space-y-6">
                  {timelineEvents.reduce<Array<{ dateKey: string; dateLabel: string; events: PreviewTimelineEvent[] }>>((groups, event) => {
                    let group = groups.find((g) => g.dateKey === event.dateKey);
                    if (!group) {
                      group = { dateKey: event.dateKey, dateLabel: event.dateLabel, events: [] };
                      groups.push(group);
                    }
                    group.events.push(event);
                    return groups;
                  }, []).map((group, groupIndex) => (
                    <div key={group.dateKey} className={`space-y-3 ${groupIndex > 0 ? 'pt-2' : ''}`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50/80 px-2.5 py-1 rounded-md inline-block">
                        {group.dateLabel}
                      </div>
                      <div className="relative pl-6 space-y-2.5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
                        {group.events.map((event, eventIndex) => (
                          <div key={event.id} className="relative flex items-center gap-4">
                            <div className={`absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 ${groupIndex === 0 && eventIndex === 0 ? 'border-primary' : 'border-gray-300'} ring-4 ring-white`} />
                            <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                              <div>
                                <h4 className="font-heading font-semibold text-sm text-nuraText">{event.title}</h4>
                                <p className="text-xs text-nuraTextSecondary">{event.description}</p>
                              </div>
                              <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0 ml-3">{event.timeStr}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentEpisode ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm font-medium text-nuraTextSecondary">
                    {t('miscUi.noEpisodeActivity')}
                  </p>
                  <p className="text-xs text-nuraTextSecondary/70 max-w-sm mx-auto">
                    {t('miscUi.activityHelp')}
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm font-medium text-nuraText">
                    {t('dashboard.noActivity')}
                  </p>
                  <p className="text-xs text-nuraTextSecondary/70 max-w-sm mx-auto">
                    {t('dashboard.noActivityHelp')}
                  </p>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100/80">
                <a
                  href="#complete-timeline"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateDashboard('health-timeline');
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <span>{t('dashboard.viewTimeline')}</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-200 inline-block">→</span>
                </a>
              </div>
            </motion.div>

            {/* RESOURCES SECTION */}
            <div className="pt-8 space-y-6">
              <div className="space-y-1">
                <h2 className="font-heading font-extrabold text-2xl text-nuraText tracking-tight">
                  {t('nav.resources')}
                </h2>
                <p className="font-sans text-sm text-nuraTextSecondary">
                  {t('audit.resourcesHelp')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Questions Before Appointment */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  onClick={onStartQuestions}
                  className="bg-white rounded-[1.75rem] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:bg-blue-50/80 group-hover:text-primary transition-colors duration-200">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-bold text-base text-nuraText">
                        {t('nav.questions')}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                        {t('audit.questionsResource')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-primary transform group-hover:translate-x-1.5 transition-transform duration-200 inline-block">
                      {t('audit.open')} →
                    </span>
                  </div>
                </motion.div>

                {/* Card 2: Medicine Information */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onNavigateDashboard('medicines')}
                  className="bg-white rounded-[1.75rem] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:bg-blue-50/80 group-hover:text-primary transition-colors duration-200">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-bold text-base text-nuraText">
                        {t('nav.medicines')}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                        {t('miscUi.medicineCard')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-nuraText border border-gray-200/60 group-hover:border-primary/40 group-hover:text-primary transition-colors duration-200">
                      {t('documents.uploadPrescription')}
                    </span>
                  </div>
                </motion.div>

                {/* Card 3: Lab Report Explanation */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onNavigateDashboard('lab-reports')}
                  className="bg-white rounded-[1.75rem] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:bg-blue-50/80 group-hover:text-primary transition-colors duration-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-bold text-base text-nuraText">
                        {t('nav.labReports')}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                        {t('miscUi.labCard')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-nuraText border border-gray-200/60 group-hover:border-primary/40 group-hover:text-primary transition-colors duration-200">
                      {t('miscUi.uploadReport')}
                    </span>
                  </div>
                </motion.div>

                {/* Card 4: Health Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onNavigateDashboard('health-timeline')}
                  className="bg-white rounded-[1.75rem] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:bg-blue-50/80 group-hover:text-primary transition-colors duration-200">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-bold text-base text-nuraText">
                        {t('nav.timeline')}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                        {t('audit.timelineResource')}
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-primary transform group-hover:translate-x-1.5 transition-transform duration-200 inline-block">
                      {t('dashboard.viewTimeline')} →
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>

      {showLocationPrompt && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/25 p-4 sm:items-center" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary"><MapPin className="h-5 w-5" /></div><h2 className="font-heading text-xl font-bold text-nuraText">{t('emergency.locationTitle')}</h2><p className="mt-2 text-sm leading-relaxed text-nuraTextSecondary">{t('emergency.locationDescription')}</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={dismissLocationPrompt} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-nuraTextSecondary">{t('emergency.notNow')}</button><button type="button" onClick={requestLocationPermission} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">{t('emergency.allowLocation')}</button></div></div></div>}

      {showLocationBlocked && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/25 p-4 sm:items-center" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><MapPin className="h-5 w-5" /></div><h2 className="font-heading text-xl font-bold text-nuraText">{t('locationPermission.blockedTitle')}</h2><p className="mt-2 text-sm leading-relaxed text-nuraTextSecondary">{t('locationPermission.blockedDescription')}</p><p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-primary">{t('locationPermission.worksWithoutLocation')}</p><div className="mt-6 flex justify-end"><button type="button" onClick={() => setShowLocationBlocked(false)} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">{t('common.continue')}</button></div></div></div>}

      {showMissingContact && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/25 p-4 sm:items-center" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-2xl"><Siren className="h-8 w-8 text-red-600" /><h2 className="mt-4 font-heading text-xl font-bold text-nuraText">{t('emergency.missing')}</h2><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowMissingContact(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-nuraTextSecondary">{t('common.cancel')}</button><button type="button" onClick={() => { setShowMissingContact(false); onNavigateDashboard('settings'); }} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">{t('emergency.addContact')}</button></div></div></div>}

      {preparedEmergency && <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-lg rounded-2xl border border-red-100 bg-white p-5 shadow-2xl" role="status"><div className="flex items-start justify-between gap-3"><div><h2 className="font-heading font-bold text-nuraText">{t('emergency.fallbackTitle')}</h2><p className="mt-1 text-xs text-nuraTextSecondary">{t('emergency.notAutomatic')}</p></div><button type="button" onClick={() => setPreparedEmergency(null)} className="text-nuraTextSecondary"><X className="h-5 w-5" /></button></div><dl className="mt-4 space-y-2 text-sm"><div><dt className="font-semibold text-nuraTextSecondary">{t('emergency.contactName')}</dt><dd>{emergencyContactName}</dd></div><div><dt className="font-semibold text-nuraTextSecondary">{t('emergency.contactPhone')}</dt><dd>{emergencyContactPhone}</dd></div></dl><div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-nuraText">{preparedEmergency.message}</div>{preparedEmergency.locationUrl && <a href={preparedEmergency.locationUrl} target="_blank" rel="noreferrer" className="mt-3 block break-all text-xs font-semibold text-primary">{preparedEmergency.locationUrl}</a>}<button type="button" onClick={() => void navigator.clipboard?.writeText(preparedEmergency.message)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-nuraText"><Copy className="h-4 w-4" />{t('emergency.copyMessage')}</button></div>}
    </motion.div>
  );
};

export default DashboardLayout;
