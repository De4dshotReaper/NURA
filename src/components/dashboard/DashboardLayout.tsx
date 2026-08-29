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
  Settings as SettingsIcon,
  Menu,
  X,
} from 'lucide-react';
import { MedicineInformationPage } from './MedicineInformationPage';
import { LabReportExplanationPage } from './LabReportExplanationPage';
import { HealthTimelinePage } from './HealthTimelinePage';
import { QuestionsPage } from './QuestionsPage';
import { AppointmentDetailsPage } from './AppointmentDetailsPage';
import { supabase } from '../../lib/supabase';

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

interface FollowUpEntry {
  progress: string;
  current_symptoms: string | null;
  medicine_compliance: string | null;
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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'new-illness', label: 'New Illness', icon: Stethoscope },
  { id: 'follow-up', label: 'Follow-up Visit', icon: RotateCcw },
  { id: 'health-timeline', label: 'Health Timeline', icon: Clock },
];

const resourceNavItems: NavItem[] = [
  { id: 'questions', label: 'Questions Before Appointment', icon: HelpCircle },
  { id: 'medicines', label: 'Medicines', icon: Pill },
  { id: 'lab-reports', label: 'Lab Reports', icon: FileText },
];

const settingsNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getFormattedDate = (): string => {
  const today = new Date();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
  const day = today.getDate();
  const month = today.toLocaleDateString('en-US', { month: 'long' });
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
  initialActiveItem?: 'dashboard' | 'questions' | 'appointment';
  questionSymptomEntryId?: string | null;
  consultationSymptomEntryId?: string | null;
  userId?: string;
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
}) => {
  const [activeItem, setActiveItem] = useState<string>(initialActiveItem);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [latestSymptom, setLatestSymptom] = useState<SymptomEntry | null>(null);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState<boolean>(true);
  const [latestFollowUp, setLatestFollowUp] = useState<FollowUpEntry | null>(null);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState<boolean>(true);
  const [timelineEvents, setTimelineEvents] = useState<PreviewTimelineEvent[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadLatestSymptom = async () => {
      try {
        const { data, error } = await supabase
          .from('symptom_entries')
          .select('symptoms, severity, duration, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle<SymptomEntry>();

        if (!isMounted) return;

        if (error) {
          console.error('Failed to load latest symptom entry:', error);
          setLatestSymptom(null);
        } else {
          setLatestSymptom(data);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load latest symptom entry:', error);
        setLatestSymptom(null);
      } finally {
        if (isMounted) setIsLoadingSymptoms(false);
      }
    };

    const loadLatestFollowUp = async () => {
      try {
        const { data, error } = await supabase
          .from('follow_up_entries')
          .select('progress, current_symptoms, medicine_compliance, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle<FollowUpEntry>();

        if (!isMounted) return;

        if (error) {
          console.error('Failed to load latest follow-up entry:', error);
          setLatestFollowUp(null);
        } else {
          setLatestFollowUp(data);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load latest follow-up entry:', error);
        setLatestFollowUp(null);
      } finally {
        if (isMounted) setIsLoadingFollowUp(false);
      }
    };

    const loadDashboardTimeline = async () => {
      try {
        const loadSymptoms = async (): Promise<PreviewTimelineEvent[]> => {
          try {
            const { data, error } = await supabase
              .from('symptom_entries')
              .select('id, symptoms, severity, duration, created_at');
            if (error) {
              console.error('Failed to load symptom entries for dashboard timeline:', error);
              return [];
            }
            return (data || []).map((row: any) => ({
              id: `symptom-${row.id}`,
              timestamp: row.created_at,
              timestampMs: new Date(row.created_at).getTime(),
              title: 'Symptoms Recorded',
              description: row.symptoms || 'Symptoms recorded',
              dateKey: getLocalDateKey(row.created_at),
              dateLabel: formatEventDate(row.created_at),
              timeStr: formatEventTime(row.created_at),
            }));
          } catch (error) {
            console.error('Unexpected error loading symptom entries for dashboard timeline:', error);
            return [];
          }
        };

        const loadPrescriptions = async (): Promise<PreviewTimelineEvent[]> => {
          try {
            const { data, error } = await supabase
              .from('prescriptions')
              .select('id, file_name, file_type, medicines, uploaded_at');
            if (error) {
              console.error('Failed to load prescriptions for dashboard timeline:', error);
              return [];
            }
            return (data || []).map((row: any) => {
              const medicines = Array.isArray(row.medicines) ? row.medicines : [];
              const medNames = medicines
                .map((m: any) => m?.name || m?.medicineName)
                .filter(Boolean)
                .join(', ');
              const desc = medNames ? `${row.file_name} (${medNames})` : row.file_name;
              return {
                id: `prescription-${row.id}`,
                timestamp: row.uploaded_at,
                timestampMs: new Date(row.uploaded_at).getTime(),
                title: 'Prescription Added',
                description: desc || 'Prescription uploaded',
                dateKey: getLocalDateKey(row.uploaded_at),
                dateLabel: formatEventDate(row.uploaded_at),
                timeStr: formatEventTime(row.uploaded_at),
              };
            });
          } catch (error) {
            console.error('Unexpected error loading prescriptions for dashboard timeline:', error);
            return [];
          }
        };

        const loadLabReports = async (): Promise<PreviewTimelineEvent[]> => {
          try {
            const { data, error } = await supabase
              .from('lab_reports')
              .select('id, file_name, report_type, uploaded_at');
            if (error) {
              console.error('Failed to load lab reports for dashboard timeline:', error);
              return [];
            }
            return (data || []).map((row: any) => {
              const desc = row.report_type ? `${row.report_type} — ${row.file_name}` : row.file_name;
              return {
                id: `lab-${row.id}`,
                timestamp: row.uploaded_at,
                timestampMs: new Date(row.uploaded_at).getTime(),
                title: 'Lab Report Uploaded',
                description: desc || 'Lab report uploaded',
                dateKey: getLocalDateKey(row.uploaded_at),
                dateLabel: formatEventDate(row.uploaded_at),
                timeStr: formatEventTime(row.uploaded_at),
              };
            });
          } catch (error) {
            console.error('Unexpected error loading lab reports for dashboard timeline:', error);
            return [];
          }
        };

        const loadFollowUps = async (): Promise<PreviewTimelineEvent[]> => {
          try {
            const { data, error } = await supabase
              .from('follow_up_entries')
              .select('id, current_symptoms, progress, created_at');
            if (error) {
              console.error('Failed to load follow-up entries for dashboard timeline:', error);
              return [];
            }
            return (data || []).map((row: any) => {
              const currentSymptoms = row.current_symptoms?.trim() ?? '';
              const progress = row.progress?.trim() ?? '';
              const desc = currentSymptoms || progress || 'Follow-up information recorded.';
              return {
                id: `followup-${row.id}`,
                timestamp: row.created_at,
                timestampMs: new Date(row.created_at).getTime(),
                title: 'Follow-up Recorded',
                description: desc,
                dateKey: getLocalDateKey(row.created_at),
                dateLabel: formatEventDate(row.created_at),
                timeStr: formatEventTime(row.created_at),
              };
            });
          } catch (error) {
            console.error('Unexpected error loading follow-up entries for dashboard timeline:', error);
            return [];
          }
        };

        const results = await Promise.all([
          loadSymptoms(),
          loadPrescriptions(),
          loadLabReports(),
          loadFollowUps(),
        ]);

        if (!isMounted) return;

        const combined = results.flat();
        combined.sort((a, b) => b.timestampMs - a.timestampMs);
        const latest5 = combined.slice(0, 5);
        latest5.sort((a, b) => a.timestampMs - b.timestampMs);

        setTimelineEvents(latest5);
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error loading dashboard timeline:', error);
        setTimelineEvents([]);
      } finally {
        if (isMounted) setIsLoadingTimeline(false);
      }
    };

    void loadLatestSymptom();
    void loadLatestFollowUp();
    void loadDashboardTimeline();

    return () => {
      isMounted = false;
    };
  }, []);

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
                  setActiveItem(item.id);
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
              <span className="truncate">{item.label}</span>
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
            Patient Companion
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
              Resources
            </div>
            {renderNavList(resourceNavItems)}
          </div>

          {/* Settings Section */}
          <div>
            <div className="px-3 mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-nuraTextSecondary/60">
              Settings
            </div>
            {renderNavList(settingsNavItems)}
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
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-nuraTextSecondary hover:text-nuraText hover:bg-gray-50 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
        {activeItem === 'medicines' ? (
          <MedicineInformationPage onBackToDashboard={() => setActiveItem('dashboard')} />
        ) : activeItem === 'lab-reports' ? (
          <LabReportExplanationPage onBackToDashboard={() => setActiveItem('dashboard')} />
        ) : activeItem === 'health-timeline' ? (
          <HealthTimelinePage onBackToDashboard={() => setActiveItem('dashboard')} />
        ) : activeItem === 'questions' && questionSymptomEntryId && userId ? (
          <QuestionsPage
            symptomEntryId={questionSymptomEntryId}
            userId={userId}
            onBackToDashboard={() => {
              setActiveItem('dashboard');
              onCloseQuestions?.();
            }}
          />
        ) : activeItem === 'appointment' && consultationSymptomEntryId && userId ? (
          <AppointmentDetailsPage
            symptomEntryId={consultationSymptomEntryId}
            userId={userId}
            onBackToDashboard={() => {
              setActiveItem('dashboard');
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
              {getGreeting()}, Divyanshu.
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
              {entryMode === 'new' 
                ? "Let's prepare for your consultation." 
                : "Welcome back. Here's everything from your previous visit."}
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
              {getFormattedDate()}
            </motion.p>
          </div>

          {/* DASHBOARD SECTIONS (UNDERNEATH GREETING) */}
          <div className="space-y-6">
            {/* TOP ROW: Symptoms Recorded (larger card) & Record Appointment (smaller card) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* CARD 1: Symptoms Recorded (Larger card - span 7) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg text-nuraText">
                      Symptoms Recorded
                    </h3>
                  </div>

                  {isLoadingSymptoms ? (
                    <div className="py-10 text-center">
                      <p className="text-sm font-medium text-nuraTextSecondary">
                        Loading symptoms...
                      </p>
                    </div>
                  ) : latestSymptom ? (
                    <div className="space-y-6">
                      <div className="text-xs font-semibold text-nuraTextSecondary/70 tracking-wide uppercase">
                        {new Date(latestSymptom.created_at).toLocaleString()}
                      </div>

                      <div className="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-100/80">
                        <div className="text-[11px] font-bold tracking-wider uppercase text-nuraTextSecondary/60">
                          Symptoms
                        </div>
                        <p className="font-sans text-base sm:text-lg text-nuraText font-normal leading-relaxed whitespace-pre-line">
                          {latestSymptom.symptoms}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-1 px-1">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-nuraTextSecondary uppercase tracking-wider">
                            Severity
                          </span>
                          <div className="font-heading font-bold text-xl text-nuraText">
                            {latestSymptom.severity} <span className="text-sm font-normal text-nuraTextSecondary">/ 10</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-nuraTextSecondary uppercase tracking-wider">
                            Duration
                          </span>
                          <div className="font-heading font-bold text-xl text-nuraText">
                            {latestSymptom.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-3">
                      <p className="text-sm font-medium text-nuraTextSecondary">
                        No symptoms recorded yet.
                      </p>
                      <p className="text-xs text-nuraTextSecondary/70 max-w-xs mx-auto">
                        Record how you're feeling to keep your care team informed.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                  <a
                    href="#full-entry"
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-600 transition-colors cursor-pointer group"
                  >
                    <span>View Full Entry</span>
                    <span className="transform group-hover:translate-x-1.5 transition-transform duration-200 inline-block">→</span>
                  </a>
                </div>
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
                      Record Appointment
                    </h3>
                  </div>
                  <div className="py-8 space-y-4">
                    <p className="text-sm text-nuraTextSecondary leading-relaxed">
                      Save what happened during a completed consultation and link the health records that belong to it.
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Start recording <span>→</span>
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
                Latest Follow-up
              </h3>

              {isLoadingFollowUp ? (
                <div className="py-8 text-center" aria-busy="true">
                  <p className="text-sm font-medium text-nuraTextSecondary">Loading latest follow-up...</p>
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
                            Current Symptoms
                          </p>
                          <p className="text-sm text-nuraText whitespace-pre-line">
                            {latestFollowUp.current_symptoms}
                          </p>
                        </div>
                      )}
                      {latestFollowUp.medicine_compliance?.trim() && (
                        <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100/80 space-y-1.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-nuraTextSecondary/60">
                            Medicine Compliance
                          </p>
                          <p className="text-sm font-semibold text-nuraText">
                            {latestFollowUp.medicine_compliance}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-nuraTextSecondary">No follow-up recorded yet.</p>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100/80">
                <button
                  type="button"
                  onClick={() => setActiveItem('health-timeline')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <span>View Details</span>
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
                    Health Timeline
                  </h3>
                  <p className="text-xs text-nuraTextSecondary mt-0.5">
                    Recent healthcare activity in chronological order
                  </p>
                </div>
              </div>

              {isLoadingTimeline ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-nuraTextSecondary">Loading health activity...</p>
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
              ) : (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm font-medium text-nuraTextSecondary">
                    No health activity recorded yet.
                  </p>
                  <p className="text-xs text-nuraTextSecondary/70 max-w-sm mx-auto">
                    Your timeline will automatically update as you record symptoms and consult with your care team.
                  </p>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100/80">
                <a
                  href="#complete-timeline"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem('health-timeline');
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-blue-600 transition-colors cursor-pointer group"
                >
                  <span>View Complete Timeline</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform duration-200 inline-block">→</span>
                </a>
              </div>
            </motion.div>

            {/* RESOURCES SECTION */}
            <div className="pt-8 space-y-6">
              <div className="space-y-1">
                <h2 className="font-heading font-extrabold text-2xl text-nuraText tracking-tight">
                  Resources
                </h2>
                <p className="font-sans text-sm text-nuraTextSecondary">
                  Everything you need before and after your appointment.
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
                        Questions Before Appointment
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                        Generate thoughtful questions to ask your doctor based on your symptoms.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-primary transform group-hover:translate-x-1.5 transition-transform duration-200 inline-block">
                      Open →
                    </span>
                  </div>
                </motion.div>

                {/* Card 2: Medicine Information */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveItem('medicines')}
                  className="bg-white rounded-[1.75rem] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:bg-blue-50/80 group-hover:text-primary transition-colors duration-200">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-bold text-base text-nuraText">
                        Medicine Information
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                        Upload a prescription and understand every medicine in simple language.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-nuraText border border-gray-200/60 group-hover:border-primary/40 group-hover:text-primary transition-colors duration-200">
                      Upload Prescription
                    </span>
                  </div>
                </motion.div>

                {/* Card 3: Lab Report Explanation */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveItem('lab-reports')}
                  className="bg-white rounded-[1.75rem] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:bg-blue-50/80 group-hover:text-primary transition-colors duration-200">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-bold text-base text-nuraText">
                        Lab Report Explanation
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                        Upload blood tests or diagnostic reports and receive an easy-to-read explanation.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-nuraText border border-gray-200/60 group-hover:border-primary/40 group-hover:text-primary transition-colors duration-200">
                      Upload Report
                    </span>
                  </div>
                </motion.div>

                {/* Card 4: Health Timeline */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveItem('health-timeline')}
                  className="bg-white rounded-[1.75rem] p-6 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:bg-blue-50/80 group-hover:text-primary transition-colors duration-200">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-heading font-bold text-base text-nuraText">
                        Health Timeline
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                        Browse every consultation, symptom, prescription and follow-up in one chronological history.
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100/80 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-primary transform group-hover:translate-x-1.5 transition-transform duration-200 inline-block">
                      View Timeline →
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </motion.div>
  );
};

export default DashboardLayout;
