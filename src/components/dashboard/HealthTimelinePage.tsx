import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Pill,
  ArrowLeft,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ExtractedMedicine, LabParameter } from '../../types';
import { TimelineEventCard } from './TimelineEventCard';

interface TimelineStep {
  id: string;
  timestamp: string;
  title: string;
  category: 'symptoms' | 'prescription' | 'lab' | 'followup' | 'questions' | 'consultation';
  description: string;
  details?: string[];
  badge?: string;
  badgeColor?: string;
  episodeId?: string;
  linkedSymptomId?: string;
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

interface FollowUpRow {
  id: string;
  symptom_entry_id: string;
  progress: string | null;
  current_symptoms: string | null;
  medicine_compliance: string | null;
  medicine_reason: string | null;
  has_side_effects: boolean;
  side_effects_text: string | null;
  questions: string | null;
  created_at: string;
}

interface ConsultationQuestionRow {
  id: string;
  symptom_entry_id: string;
  question: string;
  source: string;
  created_at: string;
}

interface ConsultationRow {
  id: string;
  symptom_entry_id: string;
  notes: string;
  doctor_name: string | null;
  clinic_name: string | null;
  follow_up_recommended: boolean;
  follow_up_notes: string | null;
  consultation_at: string | null;
  created_at: string;
}

interface ConsultationPrescriptionRow {
  consultation_id: string;
  prescription_id: string;
}

interface ConsultationLabReportRow {
  consultation_id: string;
  lab_report_id: string;
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
          episodeId: row.id,
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

    const loadFollowUps = async (): Promise<TimelineStep[]> => {
      try {
        const { data, error } = await supabase
          .from('follow_up_entries')
          .select('id, symptom_entry_id, progress, current_symptoms, medicine_compliance, medicine_reason, has_side_effects, side_effects_text, questions, created_at');
        if (error) {
          console.error('Failed to load follow-up entries for health timeline:', error);
          return [];
        }

        return (data as FollowUpRow[]).map((row) => {
          const progress = row.progress?.trim() ?? '';
          const currentSymptoms = row.current_symptoms?.trim() ?? '';
          const medicineCompliance = row.medicine_compliance?.trim() ?? '';
          const medicineReason = row.medicine_reason?.trim() ?? '';
          const sideEffectsText = row.side_effects_text?.trim() ?? '';
          const questions = row.questions?.trim() ?? '';
          const details = [
            progress ? `Recovery progress: ${progress}` : null,
            medicineCompliance ? `Medicine compliance: ${medicineCompliance}` : null,
            medicineReason ? `Medicine reason: ${medicineReason}` : null,
            row.has_side_effects
              ? sideEffectsText
                ? `Side effects: ${sideEffectsText}`
                : 'Side effects reported: Yes'
              : 'Side effects reported: No',
            questions ? `Questions: ${questions}` : null,
          ].filter((detail): detail is string => Boolean(detail));

          return {
            id: `followup-${row.id}`,
            timestamp: row.created_at,
            title: 'Follow-up Recorded',
            category: 'followup' as const,
            description: currentSymptoms || 'Follow-up information recorded.',
            details: details.length > 0 ? details : undefined,
            badge: progress || undefined,
            badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/60',
            episodeId: row.symptom_entry_id,
            linkedSymptomId: row.symptom_entry_id,
            icon: CheckCircle2,
          };
        });
      } catch (error) {
        console.error('Unexpected error loading follow-up entries for health timeline:', error);
        return [];
      }
    };

    const loadConsultationQuestions = async (): Promise<TimelineStep[]> => {
      try {
        const { data, error } = await supabase
          .from('consultation_questions')
          .select('id, symptom_entry_id, question, source, created_at')
          .order('created_at', { ascending: true });
        if (error) {
          console.error('Failed to load consultation questions for health timeline:', error);
          return [];
        }

        // Until consultation/question-set entities exist, prepared questions are grouped by symptom_entry_id for timeline display.
        const questionsByEpisode = ((data ?? []) as ConsultationQuestionRow[]).reduce<
          Map<string, ConsultationQuestionRow[]>
        >((groups, row) => {
          const episodeQuestions = groups.get(row.symptom_entry_id) ?? [];
          episodeQuestions.push(row);
          groups.set(row.symptom_entry_id, episodeQuestions);
          return groups;
        }, new Map());

        return Array.from(questionsByEpisode.entries()).map(([symptomEntryId, questions]) => ({
          id: `questions-${symptomEntryId}`,
          timestamp: questions[0].created_at,
          title: 'Questions Prepared',
          category: 'questions' as const,
          description: 'Questions prepared for your next appointment',
          details: questions.map((row) => row.question),
          badge: `${questions.length} ${questions.length === 1 ? 'Question' : 'Questions'}`,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60',
          episodeId: symptomEntryId,
          linkedSymptomId: symptomEntryId,
          icon: HelpCircle,
        }));
      } catch (error) {
        console.error('Unexpected error loading consultation questions for health timeline:', error);
        return [];
      }
    };

    const loadConsultations = async (): Promise<TimelineStep[]> => {
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('id, symptom_entry_id, notes, doctor_name, clinic_name, follow_up_recommended, follow_up_notes, consultation_at, created_at');
        if (error) {
          console.error('Failed to load consultations for health timeline:', error);
          return [];
        }

        const consultations = (data ?? []) as ConsultationRow[];
        if (consultations.length === 0) return [];

        const consultationIds = consultations.map((consultation) => consultation.id);
        const prescriptionCounts = new Map<string, number>();
        const labReportCounts = new Map<string, number>();
        let prescriptionCountsAvailable = true;
        let labReportCountsAvailable = true;

        const [prescriptionLinksResult, labReportLinksResult] = await Promise.allSettled([
          supabase
            .from('consultation_prescriptions')
            .select('consultation_id, prescription_id')
            .in('consultation_id', consultationIds),
          supabase
            .from('consultation_lab_reports')
            .select('consultation_id, lab_report_id')
            .in('consultation_id', consultationIds),
        ]);

        if (prescriptionLinksResult.status === 'rejected') {
          console.error('Unexpected error loading consultation prescription links for health timeline:', prescriptionLinksResult.reason);
          prescriptionCountsAvailable = false;
        } else if (prescriptionLinksResult.value.error) {
          console.error('Failed to load consultation prescription links for health timeline:', prescriptionLinksResult.value.error);
          prescriptionCountsAvailable = false;
        } else {
          ((prescriptionLinksResult.value.data ?? []) as ConsultationPrescriptionRow[]).forEach((row) => {
            prescriptionCounts.set(row.consultation_id, (prescriptionCounts.get(row.consultation_id) ?? 0) + 1);
          });
        }

        if (labReportLinksResult.status === 'rejected') {
          console.error('Unexpected error loading consultation lab report links for health timeline:', labReportLinksResult.reason);
          labReportCountsAvailable = false;
        } else if (labReportLinksResult.value.error) {
          console.error('Failed to load consultation lab report links for health timeline:', labReportLinksResult.value.error);
          labReportCountsAvailable = false;
        } else {
          ((labReportLinksResult.value.data ?? []) as ConsultationLabReportRow[]).forEach((row) => {
            labReportCounts.set(row.consultation_id, (labReportCounts.get(row.consultation_id) ?? 0) + 1);
          });
        }

        return consultations.map((consultation) => {
          const notes = consultation.notes?.trim() ?? '';
          const doctorName = consultation.doctor_name?.trim() ?? '';
          const clinicName = consultation.clinic_name?.trim() ?? '';
          const followUpNotes = consultation.follow_up_notes?.trim() ?? '';
          const consultationTime = consultation.consultation_at
            && !Number.isNaN(new Date(consultation.consultation_at).getTime())
            ? consultation.consultation_at
            : consultation.created_at;
          const description = [doctorName, clinicName].filter(Boolean).join(' • ')
            || 'Consultation details recorded';
          const prescriptionCount = prescriptionCounts.get(consultation.id) ?? 0;
          const labReportCount = labReportCounts.get(consultation.id) ?? 0;
          const details = [
            notes ? `Notes: ${notes}` : null,
            doctorName ? `Doctor: ${doctorName}` : null,
            clinicName ? `Clinic: ${clinicName}` : null,
            `Follow-up recommended: ${consultation.follow_up_recommended ? 'Yes' : 'No'}`,
            followUpNotes ? `Follow-up notes: ${followUpNotes}` : null,
            prescriptionCountsAvailable
              ? `${prescriptionCount} ${prescriptionCount === 1 ? 'prescription' : 'prescriptions'} attached`
              : null,
            labReportCountsAvailable
              ? `${labReportCount} ${labReportCount === 1 ? 'lab report' : 'lab reports'} attached`
              : null,
          ].filter((detail): detail is string => Boolean(detail));

          return {
            id: `consultation-${consultation.id}`,
            timestamp: consultationTime,
            title: 'Appointment Recorded',
            category: 'consultation' as const,
            description,
            details,
            badge: 'Consultation',
            badgeColor: 'bg-violet-50 text-violet-700 border-violet-200/60',
            episodeId: consultation.symptom_entry_id,
            linkedSymptomId: consultation.symptom_entry_id,
            icon: Calendar,
          };
        });
      } catch (error) {
        console.error('Unexpected error loading consultations for health timeline:', error);
        return [];
      }
    };

    const loadTimeline = async () => {
      const results = await Promise.all([
        loadSymptoms(),
        loadPrescriptions(),
        loadLabReports(),
        loadFollowUps(),
        loadConsultationQuestions(),
        loadConsultations(),
      ]);
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

  const symptomEventsByEpisodeId = new Map(
    events
      .filter((event) => event.category === 'symptoms' && event.episodeId)
      .map((event) => [event.episodeId as string, event])
  );

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderTimelineItem = (step: TimelineStep, isLastInGroup: boolean) => {
    const isExpanded = expandedId === step.id;
    const linkedSymptom = step.linkedSymptomId
      ? symptomEventsByEpisodeId.get(step.linkedSymptomId)
      : undefined;
    const relationshipLabel = step.category === 'symptoms'
      ? 'Episode'
      : linkedSymptom
        ? step.category === 'questions' || step.category === 'consultation'
          ? 'For episode'
          : 'Follow-up to episode'
        : null;
    const displayDetails = linkedSymptom && step.category === 'followup'
      ? [
          ...(step.details ?? []),
          `Linked to symptom episode from ${formatDate(linkedSymptom.timestamp)} • ${formatTime(linkedSymptom.timestamp)}`,
        ]
      : step.details;

    return <TimelineEventCard key={step.id} event={{ ...step, details: displayDetails, relationshipLabel }} expanded={isExpanded} isLastInGroup={isLastInGroup} onToggle={() => toggleExpand(step.id)} formatDate={formatDate} formatTime={formatTime} />;
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

                <div className="space-y-3">
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
