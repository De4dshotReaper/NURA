import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  FileText,
  Pill,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileCheck,
  ChevronRight,
  ArrowDown
} from 'lucide-react';

interface TimelineStep {
  id: string;
  date: string;
  time: string;
  title: string;
  category: 'symptoms' | 'summary' | 'prescription' | 'lab' | 'followup' | 'progress' | 'questions';
  description: string;
  details?: string[];
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
}

interface HealthTimelinePageProps {
  onBackToDashboard?: () => void;
}

export const HealthTimelinePage: React.FC<HealthTimelinePageProps> = ({
  onBackToDashboard
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | '31 Jul' | '3 Aug'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const timelineGroup1: TimelineStep[] = [
    {
      id: 'step-1',
      date: '31 Jul',
      time: '07:15 PM',
      title: 'Symptoms Recorded',
      category: 'symptoms',
      description: 'Initial entry logged for headache and throat discomfort with mild fever.',
      details: [
        'Symptoms: Headache, Throat pain, Body fatigue',
        'Severity: 7 / 10',
        'Duration: 2–3 Days'
      ],
      badge: 'Recorded',
      badgeColor: 'bg-blue-50 text-primary border-blue-200/60',
      icon: Activity
    },
    {
      id: 'step-2',
      date: '31 Jul',
      time: '07:30 PM',
      title: 'Consultation Summary Generated',
      category: 'summary',
      description: 'Clinical findings and consultation overview synthesized into clear patient insights.',
      details: [
        'Primary Diagnosis: Acute Upper Respiratory Infection',
        'Recommendation: Rest, hydration, and completion of prescribed medication course.',
        'Red Flags to Watch: High fever above 102°F or difficulty breathing.'
      ],
      badge: 'Summary Ready',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/60',
      icon: FileText
    },
    {
      id: 'step-3',
      date: '31 Jul',
      time: '07:35 PM',
      title: 'Prescription Added',
      category: 'prescription',
      description: '2 medications added to active treatment plan with plain-language usage instructions.',
      details: [
        'Paracetamol 650 mg — Thrice daily after meals for pain/fever',
        'Amoxicillin 500 mg — Every 8 hours with water for bacterial coverage'
      ],
      badge: '2 Medications',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      icon: Pill
    },
    {
      id: 'step-4',
      date: '31 Jul',
      time: '07:45 PM',
      title: 'Lab Report Uploaded',
      category: 'lab',
      description: 'Complete Blood Count (CBC) test report attached and simplified.',
      details: [
        'CBC_Report_31_Jul.pdf analyzed',
        'White Blood Cell Count: Slightly elevated (11.2 x10^3/µL)',
        'Hemoglobin & Platelets: Within normal reference range'
      ],
      badge: 'Report Analyzed',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      icon: FileCheck
    },
    {
      id: 'step-5',
      date: '31 Jul',
      time: '08:00 PM',
      title: 'Follow-up Scheduled',
      category: 'followup',
      description: 'Routine check-in scheduled to review symptom resolution and lab response.',
      details: [
        'Scheduled Date: Thursday, 3 Aug at 10:30 AM',
        'Doctor: Dr. Sarah Jenkins (General Medicine)',
        'Location: City Health Clinic'
      ],
      badge: 'Scheduled for 3 Aug',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
      icon: Calendar
    }
  ];

  const timelineGroup2: TimelineStep[] = [
    {
      id: 'step-6',
      date: '3 Aug',
      time: '10:30 AM',
      title: 'Follow-up Started',
      category: 'followup',
      description: 'Follow-up consultation session initiated as scheduled.',
      details: [
        'Session Type: In-person Follow-up Consultation',
        'Status: In Progress with Dr. Sarah Jenkins'
      ],
      badge: 'Visit Started',
      badgeColor: 'bg-blue-50 text-primary border-blue-200/60',
      icon: Calendar
    },
    {
      id: 'step-7',
      date: '3 Aug',
      time: '10:40 AM',
      title: 'Recovery Progress Recorded',
      category: 'progress',
      description: 'Patient symptom reassessment completed showing significant improvement.',
      details: [
        'Throat pain: Resolved (0/10)',
        'Headache: Reduced significantly (2/10)',
        'Energy level: Improved, fever subsiding'
      ],
      badge: 'Progress Saved',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      icon: TrendingUp
    },
    {
      id: 'step-8',
      date: '3 Aug',
      time: '10:45 AM',
      title: 'New Questions Generated',
      category: 'questions',
      description: 'Tailored queries prepared for discussion regarding medication completion and remaining symptoms.',
      details: [
        'Should I complete the remaining 2 days of Amoxicillin?',
        'When can I safely resume regular exercise routines?',
        'Do I need a repeat CBC blood test?'
      ],
      badge: '3 Questions Ready',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/60',
      icon: HelpCircle
    },
    {
      id: 'step-9',
      date: '3 Aug',
      time: '11:00 AM',
      title: 'Updated Summary Created',
      category: 'summary',
      description: 'Comprehensive updated health overview incorporating follow-up outcomes.',
      details: [
        'Follow-up outcome: Excellent clinical recovery',
        'Medication plan: Complete antibiotic course as prescribed',
        'Next steps: No further immediate visits required unless symptoms recur'
      ],
      badge: 'Latest Summary',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/60',
      icon: CheckCircle2
    }
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderTimelineItem = (step: TimelineStep, isLastInGroup: boolean) => {
    const Icon = step.icon;
    const isExpanded = expandedId === step.id;

    return (
      <React.Fragment key={step.id}>
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => toggleExpand(step.id)}
          className="bg-white rounded-[1.5rem] p-5 sm:p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.025)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-primary/30 transition-all duration-200 cursor-pointer group relative"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:text-primary group-hover:bg-blue-50/70 transition-colors shrink-0 mt-0.5">
                <Icon className="w-5.5 h-5.5" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-nuraText group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  {step.badge && (
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${step.badgeColor}`}>
                      {step.badge}
                    </span>
                  )}
                </div>

                <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
                  {step.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-medium text-nuraTextSecondary/70 pt-1">
                  <Clock className="w-3.5 h-3.5 opacity-70" />
                  <span>{step.date} • {step.time}</span>
                </div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraTextSecondary group-hover:text-nuraText transition-colors shrink-0 self-center">
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && step.details && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 rounded-xl p-4 space-y-2"
            >
              <div className="text-xs font-semibold text-nuraTextSecondary uppercase tracking-wider mb-2">
                Event Details
              </div>
              <ul className="space-y-1.5">
                {step.details.map((detail, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-nuraText flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>

        {/* Arrow Down Connector */}
        {!isLastInGroup && (
          <div className="flex justify-center my-2 text-primary/40">
            <ArrowDown className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mr-auto space-y-10 pb-16 select-none"
    >
      {/* Back Navigation */}
      {onBackToDashboard && (
        <div className="pt-2">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-xs font-semibold text-nuraTextSecondary hover:text-nuraText transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 text-primary text-xs font-semibold tracking-wider uppercase">
          CHRONOLOGICAL HEALTH TIMELINE
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          Your Complete Health Journey
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          A continuous, chronological flow of all symptoms, consultations, lab reports, and follow-up milestones.
        </p>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-primary text-white shadow-md shadow-blue-500/20'
              : 'bg-gray-50 text-nuraTextSecondary hover:text-nuraText hover:bg-gray-100'
          }`}
        >
          All Events (Full Journey)
        </button>
        <button
          onClick={() => setSelectedFilter('31 Jul')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedFilter === '31 Jul'
              ? 'bg-primary text-white shadow-md shadow-blue-500/20'
              : 'bg-gray-50 text-nuraTextSecondary hover:text-nuraText hover:bg-gray-100'
          }`}
        >
          31 Jul (Initial Visit)
        </button>
        <button
          onClick={() => setSelectedFilter('3 Aug')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            selectedFilter === '3 Aug'
              ? 'bg-primary text-white shadow-md shadow-blue-500/20'
              : 'bg-gray-50 text-nuraTextSecondary hover:text-nuraText hover:bg-gray-100'
          }`}
        >
          3 Aug (Follow-up Review)
        </button>
      </div>

      {/* Timeline Flow */}
      <div className="space-y-10">
        {/* Section 1: 31 Jul */}
        {(selectedFilter === 'all' || selectedFilter === '31 Jul') && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-100/80 text-primary font-heading font-extrabold text-sm sm:text-base tracking-tight border border-blue-200/50">
                31 Jul
              </div>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>

            <div className="space-y-2">
              {timelineGroup1.map((step, idx) =>
                renderTimelineItem(step, idx === timelineGroup1.length - 1 && selectedFilter !== 'all')
              )}
            </div>
          </div>
        )}

        {/* Transition Arrow between 31 Jul and 3 Aug if both shown */}
        {selectedFilter === 'all' && (
          <div className="flex flex-col items-center justify-center py-2 space-y-1">
            <div className="w-[1px] h-8 bg-gradient-to-b from-primary/30 to-primary" />
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
              3 Days Progress
            </div>
            <div className="w-[1px] h-8 bg-gradient-to-b from-primary to-primary/30" />
          </div>
        )}

        {/* Section 2: 3 Aug */}
        {(selectedFilter === 'all' || selectedFilter === '3 Aug') && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-teal-100/80 text-teal-800 font-heading font-extrabold text-sm sm:text-base tracking-tight border border-teal-200/50">
                3 Aug
              </div>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>

            <div className="space-y-2">
              {timelineGroup2.map((step, idx) =>
                renderTimelineItem(step, idx === timelineGroup2.length - 1)
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HealthTimelinePage;
