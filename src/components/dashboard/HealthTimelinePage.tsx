import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Pill,
  Clock,
  ArrowLeft,
  FileCheck,
  ChevronRight,
  ArrowDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ExtractedMedicine, LabParameter } from '../../types';

interface TimelineStep {
  id: string;
  timestamp: string;
  title: string;
  category: 'symptoms' | 'prescription' | 'lab';
  description: string;
  details?: string[];
  badge?: string;
  badgeColor?: string;
  icon: React.ElementType;
}

interface SymptomRow {
  id: string;
  symptoms: string;
  severity: number | null;
  duration: string | null;
  created_at: string;
}

interface PrescriptionRow {
  id: string;
  file_name: string;
  file_type: string;
  medicines: unknown;
  uploaded_at: string;
}

interface LabReportRow {
  id: string;
  file_name: string;
  report_type: string | null;
  parameters: unknown;
  uploaded_at: string;
}

interface TimelineGroup {
  dateKey: string;
  dateLabel: string;
  events: TimelineStep[];
}

const getLocalDateKey = (timestamp: string): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (timestamp: string): string =>
  new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

const summarizeMedicine = (medicine: ExtractedMedicine): string | null => {
  const summary = [medicine.name, medicine.dosage, medicine.frequency, medicine.instructions]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(' • ');
  return summary || null;
};

const summarizeParameter = (parameter: LabParameter): string | null => {
  const measuredValue = [parameter.value, parameter.unit].filter(Boolean).join(' ');
  const summary = [parameter.name, measuredValue, parameter.status].filter(Boolean).join(' • ');
  return summary || null;
};

interface HealthTimelinePageProps {
  onBackToDashboard?: () => void;
}

export const HealthTimelinePage: React.FC<HealthTimelinePageProps> = ({
  onBackToDashboard
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [events, setEvents] = useState<TimelineStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSymptoms = async (): Promise<TimelineStep[]> => {
      try {
        const { data, error } = await supabase
          .from('symptom_entries')
          .select('id, symptoms, severity, duration, created_at');
        if (error) {
          console.error('Failed to load symptom entries for health timeline:', error);
          return [];
        }
        return (data as SymptomRow[]).map((row) => ({
          id: `symptom-${row.id}`,
          timestamp: row.created_at,
          title: 'Symptoms Recorded',
          category: 'symptoms',
          description: row.symptoms,
          details: [
              row.severity !== null ? `Severity: ${row.severity} / 10` : null,
              row.duration ? `Duration: ${row.duration}` : null,
            ].filter((detail): detail is string => Boolean(detail)),
          badge: 'Recorded',
          badgeColor: 'bg-blue-50 text-primary border-blue-200/60',
          icon: Activity,
        }));
      } catch (error) {
        console.error('Unexpected error loading symptom entries for health timeline:', error);
        return [];
      }
    };

    const loadPrescriptions = async (): Promise<TimelineStep[]> => {
      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('id, file_name, file_type, medicines, uploaded_at');
        if (error) {
          console.error('Failed to load prescriptions for health timeline:', error);
          return [];
        }
        return (data as PrescriptionRow[]).map((row) => {
          const medicines = Array.isArray(row.medicines) ? row.medicines as ExtractedMedicine[] : [];
          const details = medicines
            .map(summarizeMedicine)
            .filter((detail): detail is string => Boolean(detail));
          return {
            id: `prescription-${row.id}`,
            timestamp: row.uploaded_at,
            title: 'Prescription Added',
            category: 'prescription' as const,
            description: `${row.file_name} (${row.file_type})`,
            details: details.length > 0 ? details : undefined,
            badge: medicines.length > 0
              ? `${medicines.length} ${medicines.length === 1 ? 'Medication' : 'Medications'}`
              : undefined,
            badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
            icon: Pill,
          };
        });
      } catch (error) {
        console.error('Unexpected error loading prescriptions for health timeline:', error);
        return [];
      }
    };

    const loadLabReports = async (): Promise<TimelineStep[]> => {
      try {
        const { data, error } = await supabase
          .from('lab_reports')
          .select('id, file_name, report_type, parameters, uploaded_at');
        if (error) {
          console.error('Failed to load lab reports for health timeline:', error);
          return [];
        }
        return (data as LabReportRow[]).map((row) => {
          const parameters = Array.isArray(row.parameters) ? row.parameters as LabParameter[] : [];
          return {
            id: `lab-${row.id}`,
            timestamp: row.uploaded_at,
            title: 'Lab Report Uploaded',
            category: 'lab' as const,
            description: row.report_type ? `${row.report_type} — ${row.file_name}` : row.file_name,
            details: parameters.length > 0 ? parameters
              .slice(0, 3)
              .map(summarizeParameter)
              .filter((detail): detail is string => Boolean(detail)) : undefined,
            badge: 'Report Analyzed',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
            icon: FileCheck,
          };
        });
      } catch (error) {
        console.error('Unexpected error loading lab reports for health timeline:', error);
        return [];
      }
    };

    const loadTimeline = async () => {
      const results = await Promise.all([loadSymptoms(), loadPrescriptions(), loadLabReports()]);
      if (!isMounted) return;
      setEvents(results.flat());
      setIsLoading(false);
    };

    void loadTimeline();
    return () => {
      isMounted = false;
    };
  }, []);

  const groupedEvents = events.reduce<Map<string, TimelineStep[]>>((groups, event) => {
    const dateKey = getLocalDateKey(event.timestamp);
    const group = groups.get(dateKey) ?? [];
    group.push(event);
    groups.set(dateKey, group);
    return groups;
  }, new Map());

  const timelineGroups: TimelineGroup[] = Array.from(groupedEvents.entries())
    .map(([dateKey, dateEvents]) => ({
      dateKey,
      dateLabel: formatDate(dateEvents[0].timestamp),
      events: dateEvents.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  const visibleGroups = selectedFilter === 'all'
    ? timelineGroups
    : timelineGroups.filter((group) => group.dateKey === selectedFilter);

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
                  <span>{formatDate(step.timestamp)} • {formatTime(step.timestamp)}</span>
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
      <div className="flex items-center gap-2 flex-wrap border-b border-gray-100 pb-4">
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
        {timelineGroups.map((group) => (
          <button
            key={group.dateKey}
            onClick={() => setSelectedFilter(group.dateKey)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              selectedFilter === group.dateKey
                ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-50 text-nuraTextSecondary hover:text-nuraText hover:bg-gray-100'
            }`}
          >
            {group.dateLabel}
          </button>
        ))}
      </div>

      {/* Timeline Flow */}
      <div className="space-y-10">
        {isLoading ? (
          <div className="bg-white rounded-[1.75rem] p-10 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <p className="text-sm font-medium text-nuraTextSecondary">Loading health events...</p>
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="bg-white rounded-[1.75rem] p-10 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <p className="text-sm font-medium text-nuraTextSecondary">No health events recorded yet.</p>
          </div>
        ) : (
          visibleGroups.map((group, groupIndex) => (
            <React.Fragment key={group.dateKey}>
              {groupIndex > 0 && (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="w-[1px] h-12 bg-gradient-to-b from-primary/30 via-primary to-primary/30" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-blue-100/80 text-primary font-heading font-extrabold text-sm sm:text-base tracking-tight border border-blue-200/50">
                    {group.dateLabel}
                  </div>
                  <div className="h-[1px] flex-1 bg-gray-100" />
                </div>

                <div className="space-y-2">
                  {group.events.map((step, index) =>
                    renderTimelineItem(step, index === group.events.length - 1)
                  )}
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default HealthTimelinePage;
