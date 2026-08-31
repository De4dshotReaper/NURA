import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Pill, 
  FileText, 
  MessageSquare, 
  Calendar, 
  Activity,
  Check,
  CheckCircle2,
  Clock,
  User,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* -------------------------------------------------------------------------- */
/*                        ANIMATED DASHBOARD PREVIEWS                         */
/* -------------------------------------------------------------------------- */

const ConsultationOverviewPreview: React.FC = () => {
  const { t } = useTranslation();
  const symptomTags = t('previewSamples.symptoms', { returnObjects: true }) as string[];

  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/80 space-y-2.5 text-left pointer-events-none select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-nuraText font-heading leading-none">Dr. Sarah Jenkins</p>
            <p className="text-[9px] text-nuraTextSecondary">General Physician</p>
          </div>
        </div>
        {/* Pulsing Summary Badge */}
        <motion.span 
          animate={{ opacity: [0.7, 1, 0.7], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100/60"
        >
          {t('previewUi.summary')}
        </motion.span>
      </div>

      {/* Sequential Fade-in Symptom Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {symptomTags.map((tag, i) => (
          <motion.span 
            key={i}
            animate={{ opacity: [0.3, 1, 1, 0.3] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
            className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-gray-100/80 text-nuraTextSecondary"
          >
            {tag}
          </motion.span>
        ))}
      </div>

      {/* Doctor Notes Preview */}
      <div className="bg-gray-50/80 p-2 rounded-lg border border-gray-100 text-[10px] text-nuraTextSecondary leading-tight">
        <span className="font-semibold text-nuraText">{t('previewUi.notes')}: </span>
        Patient reports 3 days of low fever. Rest & hydration recommended.
      </div>

      {/* Next Steps Row */}
      <div className="flex items-center justify-between pt-0.5 text-[10px]">
        <span className="text-nuraTextSecondary font-medium">{t('previewUi.nextSteps')}</span>
        <span className="text-blue-600 font-semibold flex items-center gap-0.5">
          Rest & Meds <ArrowUpRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
};

const PrescriptionGuidePreview: React.FC = () => {
  const { t } = useTranslation();
  const scheduleItems = t('previewSamples.schedule', { returnObjects: true }) as string[];

  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/80 space-y-2.5 text-left pointer-events-none select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Pill className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-nuraText font-heading leading-none">Amoxicillin 500mg</p>
            <p className="text-[9px] text-nuraTextSecondary">1 capsule • 3x daily</p>
          </div>
        </div>
        {/* Pulsing Active Badge */}
        <motion.span 
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          {t('previewUi.active')}
        </motion.span>
      </div>

      {/* Dosage Schedule Row with Animated Highlight Loop */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[10px] bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
          <span className="text-nuraTextSecondary">{t('previewUi.schedule')}</span>
          <div className="flex items-center gap-1">
            {scheduleItems.map((item, i) => (
              <motion.span
                key={i}
                animate={{ 
                  backgroundColor: ["rgba(243,244,246,1)", "rgba(16,185,129,0.15)", "rgba(243,244,246,1)"],
                  color: ["#6B7280", "#047857", "#6B7280"]
                }}
                transition={{ duration: 4.5, repeat: Infinity, delay: i * 1.5, ease: "easeInOut" }}
                className="px-1.5 py-0.5 rounded text-[8px] font-semibold"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] bg-gray-50/80 px-2.5 py-1.5 rounded-lg border border-gray-100">
          <span className="text-nuraTextSecondary">{t('previewUi.purpose')}</span>
          <span className="font-medium text-nuraText">Bacterial Infection</span>
        </div>
      </div>
    </div>
  );
};

const LabReportExplanationPreview: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/80 space-y-2 text-left pointer-events-none select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
        <span className="text-[11px] font-bold text-nuraText font-heading">Blood Panel Report</span>
        <span className="text-[9px] text-nuraTextSecondary">{t('previewUi.parameters', { count: 2 })}</span>
      </div>

      {/* Parameter Rows with Sequential Badges */}
      <div className="space-y-1.5">
        {/* Parameter 1: Normal Badge Fade-in */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50/60 border border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-nuraText leading-none">Hemoglobin</p>
            <p className="text-[8px] text-nuraTextSecondary mt-0.5">13.8 g/dL (12.0 - 15.5)</p>
          </div>
          <motion.span 
            animate={{ opacity: [0.3, 1, 1, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.2, ease: "easeInOut" }}
            className="text-[8px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1"
          >
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
            {t('previewUi.normal')}
          </motion.span>
        </div>

        {/* Parameter 2: Below Range Badge with Soft Glowing Pulse */}
        <motion.div 
          animate={{ 
            borderColor: ["rgba(229,231,235,1)", "rgba(245,158,11,0.5)", "rgba(229,231,235,1)"],
            boxShadow: ["0 0 0px rgba(245,158,11,0)", "0 0 8px rgba(245,158,11,0.2)", "0 0 0px rgba(245,158,11,0)"]
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1, ease: "easeInOut" }}
          className="flex items-center justify-between p-2 rounded-lg bg-gray-50/60 border border-gray-100"
        >
          <div>
            <p className="text-[10px] font-bold text-nuraText leading-none">Vitamin D3</p>
            <p className="text-[8px] text-nuraTextSecondary mt-0.5">18.2 ng/mL (30.0 - 100.0)</p>
          </div>
          <motion.span 
            animate={{ opacity: [0.4, 1, 1, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1.2, ease: "easeInOut" }}
            className="text-[8px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1"
          >
            <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
            {t('previewUi.below')}
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};

const QuestionsBeforeAppointmentPreview: React.FC = () => {
  const { t } = useTranslation();
  const questions = t('previewSamples.questions', { returnObjects: true }) as string[];

  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/80 space-y-2 text-left pointer-events-none select-none">
      {/* Header with Progress Badge Update */}
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
        <span className="text-[11px] font-bold text-nuraText font-heading">{t('previewUi.checklist')}</span>
        <motion.span 
          animate={{ opacity: [0.7, 1, 1, 0.7] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[9px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100"
        >
          {t('previewUi.ready', { value: '3/3' })}
        </motion.span>
      </div>

      {/* Checklist Items with Sequential Checkmark Animations */}
      <div className="space-y-1.5">
        {questions.map((question, i) => (
          <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-gray-50/60 border border-gray-100/80">
            <motion.div
              animate={{ scale: [0.8, 1.1, 1], opacity: [0.4, 1, 1, 0.4] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            </motion.div>
            <span className="text-[10px] font-medium text-nuraText truncate">{question}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FollowUpCompanionPreview: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/80 space-y-2.5 text-left pointer-events-none select-none">
      {/* Card Top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-nuraText font-heading leading-none">{t('previewUi.followUp')}</p>
            <p className="text-[9px] text-nuraTextSecondary">Dr. Sarah Jenkins</p>
          </div>
        </div>
        {/* Confirmed Badge Gentle Pulse */}
        <motion.span 
          animate={{ opacity: [0.7, 1, 0.7], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100/60"
        >
          {t('previewUi.confirmed')}
        </motion.span>
      </div>

      {/* Appointment Reminder Subtly Slide In */}
      <motion.div 
        animate={{ x: [-8, 0, 0, -8], opacity: [0.4, 1, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="p-2 bg-gray-50/80 rounded-lg border border-gray-100 flex items-center justify-between text-[10px]"
      >
        <div className="flex items-center gap-1.5 text-nuraText font-medium">
          <Clock className="w-3 h-3 text-nuraTextSecondary" />
          <span>Thu, Oct 24 • 10:30 AM</span>
        </div>
        <span className="text-[9px] font-semibold text-indigo-600">{t('previewUi.inDays')}</span>
      </motion.div>
    </div>
  );
};

const HealthTimelinePreview: React.FC = () => {
  const { t } = useTranslation();
  const events = [
    { title: t('previewUi.symptoms'), date: "Oct 12" },
    { title: t('previewUi.consultation'), date: "Oct 14" },
    { title: t('previewUi.prescription'), date: "Oct 14" },
    { title: t('previewUi.labReviewed'), date: "Oct 18" }
  ];

  return (
    <div className="w-full bg-white rounded-xl p-3.5 shadow-xs border border-gray-100/80 text-left pointer-events-none select-none">
      <div className="relative pl-4 space-y-2 ml-1.5 my-0.5">
        {/* Animated Downward Vertical Progress Line */}
        <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-teal-100 rounded-full overflow-hidden">
          <motion.div 
            animate={{ height: ["0%", "100%", "100%", "0%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full bg-teal-500 rounded-full"
          />
        </div>

        {/* Illuminated Sequential Dots & Events */}
        {events.map((item, i) => (
          <div key={i} className="relative flex items-center justify-between text-[10px]">
            <motion.div 
              animate={{ 
                scale: [0.8, 1.2, 1, 0.8],
                backgroundColor: ["#9CA3AF", "#0D9488", "#0D9488", "#9CA3AF"]
              }}
              transition={{ duration: 4.5, repeat: Infinity, delay: i * 0.9, ease: "easeInOut" }}
              className="absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs"
            />
            <span className="font-semibold text-nuraText truncate pr-2">{item.title}</span>
            <span className="text-[8px] font-medium text-nuraTextSecondary flex-shrink-0 bg-gray-100 px-1.5 py-0.5 rounded">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               FEATURE CARDS                                */
/* -------------------------------------------------------------------------- */

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  bullets: string[];
  preview: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  bullets, 
  preview,
  iconBgClass,
  iconTextClass
}) => {
  return (
    <div className="group bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-primary/20 flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Upper Portion: Handcrafted Miniature UI Preview */}
        <div className="w-full h-48 sm:h-52 bg-slate-50/70 rounded-2xl p-4 border border-gray-100/80 flex items-center justify-center mb-6 overflow-hidden relative shadow-inner/5">
          <div className="w-full max-w-sm transition-transform duration-300 ease-out group-hover:scale-[1.02]">
            {preview}
          </div>
        </div>

        {/* Header with Tinted Icon Background & Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-xl ${iconBgClass} ${iconTextClass} flex items-center justify-center transition-transform duration-300 group-hover:scale-105 flex-shrink-0`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-heading text-nuraText leading-tight">
            {title}
          </h3>
        </div>

        <p className="text-nuraTextSecondary text-sm mb-6 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bullets */}
      <ul className="space-y-2.5 pt-2 border-t border-gray-100/80">
        {bullets.map((bullet, index) => (
          <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-nuraTextSecondary/90">
            <div className="mt-1 flex-shrink-0 w-3.5 h-3.5 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-primary" />
            </div>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              MAIN SECTION                                  */
/* -------------------------------------------------------------------------- */

export const Features: React.FC = () => {
  const { t } = useTranslation();
  const localizedCards = t('featuresPage.cards', { returnObjects: true }) as Array<{ title: string; description: string; bullets: string[] }>;
  const features = [
    {
      icon: ClipboardList,
      title: "Consultation Overview",
      description: "Understand your consultation at a glance.",
      bullets: [
        "Doctor's consultation notes",
        "Reported symptoms",
        "Recommended next steps",
        "Follow-up information"
      ],
      preview: <ConsultationOverviewPreview />,
      iconBgClass: "bg-blue-500/10",
      iconTextClass: "text-blue-600"
    },
    {
      icon: Pill,
      title: "Prescription Guide",
      description: "Understand every prescribed medicine.",
      bullets: [
        "Purpose",
        "Dosage instructions",
        "Common side effects",
        "Important precautions"
      ],
      preview: <PrescriptionGuidePreview />,
      iconBgClass: "bg-emerald-500/10",
      iconTextClass: "text-emerald-600"
    },
    {
      icon: FileText,
      title: "Lab Report Explanation",
      description: "Make medical reports easier to understand.",
      bullets: [
        "Simple explanations",
        "Reference ranges",
        "Highlighted findings",
        "Helpful context"
      ],
      preview: <LabReportExplanationPreview />,
      iconBgClass: "bg-amber-500/10",
      iconTextClass: "text-amber-600"
    },
    {
      icon: MessageSquare,
      title: "Questions Before Your Appointment",
      description: "Prepare before meeting your doctor.",
      bullets: [
        "Important questions to ask",
        "Organize your concerns",
        "Never forget key symptoms",
        "Better conversations"
      ],
      preview: <QuestionsBeforeAppointmentPreview />,
      iconBgClass: "bg-purple-500/10",
      iconTextClass: "text-purple-600"
    },
    {
      icon: Calendar,
      title: "Follow-up Companion",
      description: "Stay on track after your consultation.",
      bullets: [
        "Follow-up visit flow",
        "Recovery tracking",
        "Updated consultation history",
        "Next appointment guidance"
      ],
      preview: <FollowUpCompanionPreview />,
      iconBgClass: "bg-indigo-500/10",
      iconTextClass: "text-indigo-600"
    },
    {
      icon: Activity,
      title: "Health Timeline",
      description: "See your complete healthcare journey.",
      bullets: [
        "Symptoms recorded",
        "Consultations",
        "Prescriptions",
        "Lab reports",
        "Follow-up visits"
      ],
      preview: <HealthTimelinePreview />,
      iconBgClass: "bg-teal-500/10",
      iconTextClass: "text-teal-600"
    }
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-nuraText leading-[1.15] mb-6 tracking-tight">
            {t('featuresPage.title')}
          </h2>
          <p className="text-lg text-nuraTextSecondary leading-relaxed font-normal opacity-90">
            {t('featuresPage.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={localizedCards[index].title}
              description={localizedCards[index].description}
              bullets={localizedCards[index].bullets}
              preview={feature.preview}
              iconBgClass={feature.iconBgClass}
              iconTextClass={feature.iconTextClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
