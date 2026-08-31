import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Activity, 
  User, 
  Smartphone, 
  BookOpen, 
  Calendar, 
  HeartPulse,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Pill,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* -------------------------------------------------------------------------- */
/*                        STEP MINI-DASHBOARD PREVIEWS                        */
/* -------------------------------------------------------------------------- */

const SymptomChecklistPreview: React.FC = () => {
  const { t } = useTranslation();
  const symptoms = ["Low Fever (38°C)", "Dry Cough", "Mild Fatigue"];

  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/90 space-y-2 text-left pointer-events-none select-none">
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
        <span className="text-[10px] font-bold text-nuraText font-heading">{t('previewUi.loggedSymptoms')}</span>
        <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100/80">
          {t('previewUi.activeLog')}
        </span>
      </div>
      <div className="space-y-1">
        {symptoms.map((symptom, i) => (
          <motion.div 
            key={i} 
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
            className="flex items-center gap-1.5 text-[9px] bg-gray-50/80 p-1.5 rounded-lg border border-gray-100/80"
          >
            <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span className="font-medium text-nuraText">{symptom}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DoctorConsultationPreview: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/90 space-y-2 text-left pointer-events-none select-none">
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-nuraText font-heading leading-none">Dr. Sarah Jenkins</p>
            <p className="text-[8px] text-nuraTextSecondary mt-0.5">General Physician</p>
          </div>
        </div>
        <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/80">
          Visited
        </span>
      </div>
      <div className="bg-gray-50/80 p-2 rounded-lg border border-gray-100 text-[9px] text-nuraTextSecondary">
        <span className="font-semibold text-nuraText">Notes: </span>
        Prescribed rest, fluids & 5-day medication.
      </div>
    </div>
  );
};

const NuraDashboardPreview: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/90 space-y-2 text-left pointer-events-none select-none">
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center font-bold text-[9px]">
            N
          </div>
          <span className="text-[10px] font-bold text-nuraText font-heading">{t('previewUi.dashboard')}</span>
        </div>
        <motion.span 
          animate={{ scale: [0.98, 1, 0.98] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[8px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100/80"
        >
          {t('previewUi.insights')}
        </motion.span>
      </div>
      <div className="p-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-lg border border-blue-100/80 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-nuraText">{t('previewUi.consultationPlan')}</p>
          <p className="text-[8px] text-nuraTextSecondary">{t('previewUi.summaryInstructions')}</p>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
      </div>
    </div>
  );
};

const PrescriptionLabPreview: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/90 space-y-1.5 text-left pointer-events-none select-none">
      <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
        <div className="flex items-center gap-1.5">
          <Pill className="w-3 h-3 text-emerald-600" />
          <span className="text-[9px] font-bold text-nuraText">Amoxicillin 500mg</span>
        </div>
        <span className="text-[8px] font-semibold text-emerald-700">Rx Guide</span>
      </div>
      <div className="flex items-center justify-between p-1.5 rounded-lg bg-purple-50/70 border border-purple-100">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-purple-600" />
          <span className="text-[9px] font-bold text-nuraText">Blood Panel Report</span>
        </div>
        <span className="text-[8px] font-semibold text-purple-700">Explained</span>
      </div>
    </div>
  );
};

const AppointmentChecklistPreview: React.FC = () => {
  const { t } = useTranslation();
  const items = [t('previewUi.questionsPrepared'), t('previewUi.historyReady'), t('previewUi.reportSummarized')];

  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/90 space-y-1.5 text-left pointer-events-none select-none">
      <div className="flex items-center justify-between pb-1 border-b border-gray-100">
        <span className="text-[10px] font-bold text-nuraText font-heading">{t('previewUi.followUpPrep')}</span>
        <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100/80">
          3/3 Ready
        </span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[8.5px] font-medium text-nuraText bg-gray-50/60 p-1 rounded-md border border-gray-100/60">
          <ShieldCheck className="w-3 h-3 text-indigo-600 flex-shrink-0" />
          <span className="truncate">{item}</span>
        </div>
      ))}
    </div>
  );
};

const CompletedTimelinePreview: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/90 space-y-2 text-left pointer-events-none select-none">
      <div className="flex items-center justify-between pb-1 border-b border-gray-100">
        <span className="text-[10px] font-bold text-nuraText font-heading">{t('previewUi.healthJourney')}</span>
        <motion.span 
          animate={{ scale: [0.98, 1, 0.98] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          {t('previewUi.recovered')}
        </motion.span>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/80 border border-emerald-100 text-[9px] text-emerald-800 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span>{t('previewUi.recoveryComplete')}</span>
      </div>
    </div>
  );
};

const FinalDashboardRevealPreview: React.FC = () => {
  const { t } = useTranslation();
  const items = [
    { title: "Consultation Overview", desc: "Doctor's notes & symptoms", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Prescription Guide", desc: "Dosage schedule & purpose", icon: Pill, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Lab Report Explanation", desc: "Simplified findings & ranges", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Health Timeline", desc: "Complete healthcare journey", icon: Activity, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Follow-up Companion", desc: "Next visit & recovery flow", icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="w-full bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl border border-gray-200/80 space-y-6 text-left pointer-events-none select-none relative z-10">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-heading font-bold text-lg shadow-md shadow-blue-500/20">
            N
          </div>
          <div>
            <p className="font-heading font-bold text-base text-nuraText">{t('previewUi.unified')}</p>
            <p className="text-xs text-nuraTextSecondary">{t('previewUi.synchronized')}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {t('previewUi.journeyComplete')}
        </span>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-heading font-bold text-xs sm:text-sm text-nuraText">{item.title}</p>
                <p className="text-[11px] text-nuraTextSecondary mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          );
        })}
        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-100/80 flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
          <div>
            <p className="font-heading font-bold text-xs sm:text-sm text-primary">{t('previewUi.readyCare')}</p>
            <p className="text-[11px] text-nuraTextSecondary mt-0.5">{t('previewUi.secureHub')}</p>
          </div>
          <ArrowUpRight className="w-4.5 h-4.5 text-primary" />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               TIMELINE DATA                                */
/* -------------------------------------------------------------------------- */

interface TimelineStep {
  step: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconTextClass: string;
  preview: React.ReactNode;
}

const timelineSteps: TimelineStep[] = [
  {
    step: "01",
    title: "Feel Unwell",
    description: "Notice new symptoms or changes in how you feel in your day-to-day life and daily routine.",
    icon: Activity,
    iconBgClass: "bg-blue-500/10",
    iconTextClass: "text-blue-600",
    preview: <SymptomChecklistPreview />
  },
  {
    step: "02",
    title: "Visit Your Doctor",
    description: "Consult your physician for professional diagnosis, physical examination, and initial medical advice.",
    icon: User,
    iconBgClass: "bg-emerald-500/10",
    iconTextClass: "text-emerald-600",
    preview: <DoctorConsultationPreview />
  },
  {
    step: "03",
    title: "Open Nura",
    description: "Log into Nura right after your appointment to effortlessly capture and organize your consultation details.",
    icon: Smartphone,
    iconBgClass: "bg-amber-500/10",
    iconTextClass: "text-amber-600",
    preview: <NuraDashboardPreview />
  },
  {
    step: "04",
    title: "Understand Everything",
    description: "Review crystal-clear, jargon-free explanations of your doctor's notes, prescriptions, and lab test reports.",
    icon: BookOpen,
    iconBgClass: "bg-purple-500/10",
    iconTextClass: "text-purple-600",
    preview: <PrescriptionLabPreview />
  },
  {
    step: "05",
    title: "Prepare for Follow-up",
    description: "Organize your questions, monitor your recovery progress, and stay fully prepared for your next consultation.",
    icon: Calendar,
    iconBgClass: "bg-indigo-500/10",
    iconTextClass: "text-indigo-600",
    preview: <AppointmentChecklistPreview />
  },
  {
    step: "06",
    title: "Recover with Confidence",
    description: "Navigate your entire post-doctor healthcare journey with ongoing support, clarity, and peace of mind.",
    icon: HeartPulse,
    iconBgClass: "bg-teal-500/10",
    iconTextClass: "text-teal-600",
    preview: <CompletedTimelinePreview />
  }
];

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const localizedSteps = t('howPage.steps', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 85%"]
  });

  const timelineScaleY = useTransform(scrollYProgress, [0, 0.85], [0, 1]);

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-20 md:mb-28 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/60 text-primary text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{t('howPage.badge')}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-nuraText leading-[1.15] tracking-tight">
            {t('howPage.title')}
          </h2>
          
          <p className="text-base sm:text-lg text-nuraTextSecondary leading-relaxed font-normal opacity-90 max-w-2xl mx-auto">
            {t('howPage.subtitle')}
          </p>
        </motion.div>

        {/* Vertical Timeline Container */}
        <div ref={timelineRef} className="relative max-w-6xl mx-auto">
          
          {/* Base Gray Center Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-[520px] -translate-x-1/2 w-0.5 bg-gray-200/80 rounded-full" />
          
          {/* Growing Active Blue Center Line (Desktop) */}
          <motion.div 
            style={{ scaleY: timelineScaleY, originY: 0 }}
            className="hidden md:block absolute left-1/2 top-8 bottom-[520px] -translate-x-1/2 w-0.5 bg-primary rounded-full z-0 shadow-xs"
          />

          {/* Base Gray Mobile Line */}
          <div className="md:hidden absolute left-6 top-8 bottom-[520px] w-0.5 bg-gray-200/80 rounded-full" />

          {/* Growing Active Blue Mobile Line */}
          <motion.div 
            style={{ scaleY: timelineScaleY, originY: 0 }}
            className="md:hidden absolute left-6 top-8 bottom-[520px] w-0.5 bg-primary rounded-full z-0 shadow-xs"
          />

          {/* Timeline Steps List */}
          <div className="space-y-12 md:space-y-20">
            {timelineSteps.map((item, index) => {
              const isEven = index % 2 === 1;
              const Icon = item.icon;

              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.9, delay: index * 0.12, ease: [0.21, 0.45, 0.32, 0.9] }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  
                  {/* Center Node Indicator (Desktop) */}
                  <motion.div 
                    initial={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", color: "#9CA3AF", scale: 0.9 }}
                    whileInView={{ backgroundColor: "#3B82F6", borderColor: "#3B82F6", color: "#FFFFFF", scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                    className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 shadow-md items-center justify-center z-10 font-bold text-xs"
                  >
                    {item.step}
                  </motion.div>

                  {/* Node Indicator (Mobile) */}
                  <motion.div 
                    initial={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", color: "#9CA3AF", scale: 0.9 }}
                    whileInView={{ backgroundColor: "#3B82F6", borderColor: "#3B82F6", color: "#FFFFFF", scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                    className="md:hidden absolute left-6 -translate-x-1/2 top-6 w-8 h-8 rounded-full border-2 shadow-sm flex items-center justify-center z-10 font-bold text-[10px]"
                  >
                    {item.step}
                  </motion.div>

                  {/* Card Container (Takes ~50% width on desktop) */}
                  <div className="w-full md:w-[calc(50%-3rem)] pl-14 md:pl-0">
                    <div className="group bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-primary/20 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center justify-between">
                      
                      {/* Left Side Content inside Card */}
                      <div className="flex-1 space-y-4 text-left">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-xl ${item.iconBgClass} ${item.iconTextClass} flex items-center justify-center transition-transform duration-300 group-hover:scale-105 flex-shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {/* Step Number Badge */}
                          <span className="text-xs font-bold tracking-wider px-3 py-1 rounded-full bg-gray-100/80 text-nuraTextSecondary md:hidden">
                            {t('howPage.step', { step: item.step })}
                          </span>
                          <span className="hidden md:inline-block text-xs font-bold tracking-wider px-3 py-1 rounded-full bg-gray-100/80 text-nuraTextSecondary">
                            {t('howPage.step', { step: item.step })}
                          </span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold font-heading text-nuraText leading-tight">
                          {localizedSteps[index].title}
                        </h3>

                        <p className="text-nuraTextSecondary text-sm sm:text-base leading-relaxed">
                          {localizedSteps[index].description}
                        </p>
                      </div>

                      {/* Right Side: Mini-Dashboard UI Preview with Apple-like Float Animation */}
                      <motion.div 
                        animate={{ y: [-3, 3, -3] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full lg:w-60 bg-slate-50/70 rounded-2xl p-3.5 border border-gray-100/80 flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-inner/5"
                      >
                        <div className="w-full transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                          {item.preview}
                        </div>
                      </motion.div>

                    </div>
                  </div>

                  {/* Empty Spacer for the other side on Desktop */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />

                </motion.div>
              );
            })}
          </div>

          {/* Final Dashboard Reveal Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
            className="mt-28 md:mt-36 max-w-4xl mx-auto text-center space-y-8 relative pt-8"
          >
            <div className="space-y-4 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs inline-block">
                {t('howPage.complete')}
              </span>
              <h3 className="text-3xl md:text-5xl font-extrabold font-heading text-nuraText tracking-tight leading-[1.15]">
                {t('howPage.everything')}
              </h3>
              <p className="text-base sm:text-lg text-nuraTextSecondary leading-relaxed max-w-2xl mx-auto font-normal opacity-90">
                {t('howPage.completeHelp')}
              </p>
            </div>

            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-full relative z-10"
            >
              <FinalDashboardRevealPreview />
            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
