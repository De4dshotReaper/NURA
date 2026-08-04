import React, { useState } from 'react';
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

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

export const DashboardLayout: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [hasAppointment, setHasAppointment] = useState<boolean>(false);
  const [hasSymptoms, setHasSymptoms] = useState<boolean>(true);
  const [hasTimeline, setHasTimeline] = useState<boolean>(true);

  const renderNavList = (items: NavItem[]) => (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const Icon = item.icon;

        return (
          <li key={item.id}>
            <button
              onClick={() => {
                setActiveItem(item.id);
                setMobileMenuOpen(false);
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

            {/* 2. Welcome back */}
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
              Welcome back.
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
            {/* TOP ROW: Symptoms Recorded (larger card) & Upcoming Appointment (smaller card) */}
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
                    <button
                      onClick={() => setHasSymptoms(!hasSymptoms)}
                      className="text-[11px] text-nuraTextSecondary/60 hover:text-nuraText transition-colors"
                      title="Toggle state for demo"
                    >
                      {hasSymptoms ? 'Show Empty State' : 'Show Sample Entry'}
                    </button>
                  </div>

                  {hasSymptoms ? (
                    <div className="space-y-6">
                      <div className="text-xs font-semibold text-nuraTextSecondary/70 tracking-wide uppercase">
                        31 Jul • 7:15 PM
                      </div>

                      <div className="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-100/80">
                        <div className="text-[11px] font-bold tracking-wider uppercase text-nuraTextSecondary/60">
                          Symptoms
                        </div>
                        <p className="font-sans text-base sm:text-lg text-nuraText font-normal leading-relaxed whitespace-pre-line">
                          {"I've had a headache since yesterday.\nMy throat hurts."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-1 px-1">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-nuraTextSecondary uppercase tracking-wider">
                            Severity
                          </span>
                          <div className="font-heading font-bold text-xl text-nuraText">
                            7 <span className="text-sm font-normal text-nuraTextSecondary">/ 10</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-medium text-nuraTextSecondary uppercase tracking-wider">
                            Duration
                          </span>
                          <div className="font-heading font-bold text-xl text-nuraText">
                            2–3 Days
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

              {/* CARD 2: Upcoming Appointment (Smaller card - span 5) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg text-nuraText">
                      Upcoming Appointment
                    </h3>
                    <button
                      onClick={() => setHasAppointment(!hasAppointment)}
                      className="text-[11px] text-nuraTextSecondary/60 hover:text-nuraText transition-colors"
                      title="Toggle appointment state"
                    >
                      {hasAppointment ? 'Show Empty' : 'Show Scheduled'}
                    </button>
                  </div>

                  {hasAppointment ? (
                    <div className="space-y-4 py-2">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                          Consultation Follow-up
                        </div>
                        <h4 className="font-heading font-bold text-lg text-nuraText">
                          Dr. Sarah Jenkins
                        </h4>
                        <p className="text-xs text-nuraTextSecondary">
                          General Medicine • City Health Clinic
                        </p>
                      </div>

                      <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100 space-y-1.5">
                        <div className="text-xs font-semibold text-nuraTextSecondary uppercase tracking-wider">
                          Scheduled Date & Time
                        </div>
                        <div className="font-heading font-bold text-base text-nuraText">
                          Thursday, 3 Aug • 10:30 AM
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-base font-semibold text-nuraText">
                          No appointment scheduled.
                        </p>
                        <p className="text-xs text-nuraTextSecondary leading-relaxed max-w-xs mx-auto">
                          Book one after your consultation if needed.
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setHasAppointment(true)}
                          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-nuraText hover:border-primary hover:text-primary transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-2xs"
                        >
                          <span>Add Appointment</span>
                          <span className="text-xs">+</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {hasAppointment && (
                  <div className="pt-6 mt-6 border-t border-gray-100/80">
                    <button
                      onClick={() => setHasAppointment(false)}
                      className="text-xs text-nuraTextSecondary hover:text-nuraText transition-colors"
                    >
                      Reschedule or cancel appointment
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* SECOND ROW: Health Timeline (Full width) */}
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
                <button
                  onClick={() => setHasTimeline(!hasTimeline)}
                  className="text-[11px] text-nuraTextSecondary/60 hover:text-nuraText transition-colors"
                >
                  {hasTimeline ? 'Toggle Empty' : 'Show Timeline'}
                </button>
              </div>

              {hasTimeline ? (
                <div className="space-y-6">
                  {/* 31 Jul Section */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50/80 px-2.5 py-1 rounded-md inline-block">
                      31 July • Initial Consultation
                    </div>
                    <div className="relative pl-6 space-y-2.5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-primary ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">Symptoms Recorded</h4>
                            <p className="text-xs text-nuraTextSecondary">Headache and throat pain (7/10)</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">7:15 PM</span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">Consultation Summary Generated</h4>
                            <p className="text-xs text-nuraTextSecondary">Care plan & overview prepared</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">7:30 PM</span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">Prescription Added</h4>
                            <p className="text-xs text-nuraTextSecondary">Paracetamol & Amoxicillin prescribed</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">7:35 PM</span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">Lab Report Uploaded</h4>
                            <p className="text-xs text-nuraTextSecondary">CBC Report analyzed</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">7:45 PM</span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">Follow-up Scheduled</h4>
                            <p className="text-xs text-nuraTextSecondary">Appointment set for August 3</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">8:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Aug Section */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50/80 px-2.5 py-1 rounded-md inline-block">
                      3 August • Follow-up Review
                    </div>
                    <div className="relative pl-6 space-y-2.5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-teal-500 ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">Follow-up Started</h4>
                            <p className="text-xs text-nuraTextSecondary">Session initiated with Dr. Jenkins</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">10:30 AM</span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">Recovery Progress Recorded</h4>
                            <p className="text-xs text-nuraTextSecondary">Significant symptom improvement noted</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">10:40 AM</span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">New Questions Generated</h4>
                            <p className="text-xs text-nuraTextSecondary">Tailored follow-up questions prepared</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">10:45 AM</span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white" />
                        <div className="flex-1 bg-gray-50/40 py-2 px-3.5 rounded-xl border border-gray-100/80 flex items-center justify-between">
                          <div>
                            <h4 className="font-heading font-semibold text-sm text-nuraText">Updated Summary Created</h4>
                            <p className="text-xs text-nuraTextSecondary">Comprehensive updated health record</p>
                          </div>
                          <span className="text-xs font-medium text-nuraTextSecondary/60 shrink-0">11:00 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm font-medium text-nuraTextSecondary">
                    No recent healthcare activity recorded yet.
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
                  onClick={() => setActiveItem('questions')}
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
