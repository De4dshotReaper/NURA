import { supabase } from './supabase';
import { parseNarrativeAnalysis } from './labReports';
import type { ExtractedMedicine, LabParameter, NarrativeAnalysisPayload } from '../types';
import { buildQuestionCycleEvents, resolveEpisodeLinkedEventTimestamp, scopeVisitPacketAssociations } from './visitPacketScope';

export interface VisitPacketEpisode {
  id: string;
  title: string | null;
  status: 'active' | 'completed';
  startedAt: string;
  completedAt: string | null;
}

export interface VisitPacketInitialSymptoms {
  id: string;
  symptoms: string;
  severity: number | null;
  duration: string | null;
  createdAt: string;
}

export interface VisitPacketFollowUp {
  id: string;
  progress: string | null;
  currentSymptoms: string | null;
  medicineCompliance: string | null;
  medicineReason: string | null;
  hasSideEffects: boolean;
  sideEffectsText: string | null;
  createdAt: string;
}

export interface VisitPacketConsultation {
  id: string;
  consultationAt: string | null;
  doctorName: string | null;
  clinicName: string | null;
  notes: string;
  followUpRecommended: boolean;
  followUpNotes: string | null;
  createdAt: string;
}

export interface VisitPacketPrescription {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  medicines: ExtractedMedicine[];
  rawText: string | null;
  storagePath: string | null;
}

interface VisitPacketLabReportBase {
  id: string;
  fileName: string;
  fileType: string;
  reportType: string | null;
  laboratory: string | null;
  reportDate: string | null;
  uploadedAt: string;
  storagePath: string | null;
}

export type VisitPacketLabReport =
  | (VisitPacketLabReportBase & {
      analysisType: 'structured';
      parameters: LabParameter[];
      narrativeAnalysis: null;
    })
  | (VisitPacketLabReportBase & {
      analysisType: 'narrative';
      parameters: [];
      narrativeAnalysis: NarrativeAnalysisPayload;
    });

export interface VisitPacketQuestion {
  id: string;
  question: string;
  source: string | null;
  previousConsultationId: string | null;
  createdAt: string;
}

export type VisitPacketTimelineEventType =
  | 'symptoms_recorded'
  | 'questions_prepared'
  | 'follow_up_recorded'
  | 'consultation'
  | 'prescription_added'
  | 'lab_report_added';

export interface VisitPacketTimelineEvent {
  type: VisitPacketTimelineEventType;
  timestamp: string;
  label: string;
  sourceId: string;
  questionCount?: number;
  appointmentCycle?: 'initial' | 'next';
}

export interface VisitPacket {
  episode: VisitPacketEpisode;
  patient: { displayName: string | null };
  initialSymptoms: VisitPacketInitialSymptoms | null;
  followUps: VisitPacketFollowUp[];
  consultations: VisitPacketConsultation[];
  prescriptions: VisitPacketPrescription[];
  labReports: VisitPacketLabReport[];
  questions: VisitPacketQuestion[];
  timeline: VisitPacketTimelineEvent[];
  generatedAt: string;
}

interface EpisodeRow { id: string; initial_symptom_entry_id: string; status: 'active' | 'completed'; started_at: string; completed_at: string | null }
interface SymptomRow { id: string; symptoms: string; severity: number | null; duration: string | null; created_at: string }
interface FollowUpRow { id: string; progress: string | null; current_symptoms: string | null; medicine_compliance: string | null; medicine_reason: string | null; has_side_effects: boolean; side_effects_text: string | null; created_at: string }
interface ConsultationRow { id: string; consultation_at: string | null; doctor_name: string | null; clinic_name: string | null; notes: string; follow_up_recommended: boolean; follow_up_notes: string | null; created_at: string }
interface QuestionRow { id: string; question: string; source: string | null; previous_consultation_id: string | null; created_at: string }
interface PrescriptionRow { id: string; file_name: string; file_type: string; uploaded_at: string; medicines: unknown; raw_text: string | null; storage_path: string | null }
interface LabReportRow { id: string; file_name: string; file_type: string; analysis_type: 'structured' | 'narrative' | null; narrative_analysis: unknown; report_type: string | null; laboratory: string | null; report_date: string | null; parameters: unknown; uploaded_at: string; storage_path: string | null }

export class VisitPacketError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'VisitPacketError';
  }
}

const requireQuery = async <T>(label: string, query: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> => {
  const { data, error } = await query;
  if (error) throw new VisitPacketError(label, error);
  if (data === null) throw new VisitPacketError(label);
  return data;
};

const uniqueIds = (values: string[]) => [...new Set(values)];

const sortTimeline = (events: VisitPacketTimelineEvent[]) => events.sort((a, b) => {
  const timestampOrder = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  if (timestampOrder !== 0) return timestampOrder;
  const typeOrder = a.type.localeCompare(b.type);
  return typeOrder !== 0 ? typeOrder : a.sourceId.localeCompare(b.sourceId);
});

export const buildVisitPacket = async (episodeId: string): Promise<VisitPacket> => {
  if (!episodeId.trim()) throw new VisitPacketError('A health episode ID is required.');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new VisitPacketError('An authenticated user is required.', authError);
  const user = authData.user;

  const episode = await requireQuery<EpisodeRow>(
    'The selected health episode could not be loaded.',
    supabase.from('health_episodes')
      .select('id, initial_symptom_entry_id, status, started_at, completed_at')
      .eq('id', episodeId)
      .eq('user_id', user.id)
      .maybeSingle<EpisodeRow>(),
  );
  const anchor = episode.initial_symptom_entry_id;

  const [symptomResult, followUps, consultations, rawQuestions] = await Promise.all([
    supabase.from('symptom_entries')
      .select('id, symptoms, severity, duration, created_at')
      .eq('id', anchor)
      .eq('user_id', user.id)
      .maybeSingle<SymptomRow>(),
    requireQuery<FollowUpRow[]>('Episode follow-ups could not be loaded.', supabase.from('follow_up_entries')
      .select('id, progress, current_symptoms, medicine_compliance, medicine_reason, has_side_effects, side_effects_text, created_at')
      .eq('symptom_entry_id', anchor)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })),
    requireQuery<ConsultationRow[]>('Episode consultations could not be loaded.', supabase.from('consultations')
      .select('id, consultation_at, doctor_name, clinic_name, notes, follow_up_recommended, follow_up_notes, created_at')
      .eq('symptom_entry_id', anchor)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })),
    requireQuery<QuestionRow[]>('Episode questions could not be loaded.', supabase.from('consultation_questions')
      .select('id, question, source, previous_consultation_id, created_at')
      .eq('symptom_entry_id', anchor)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })),
  ]);

  if (symptomResult.error) throw new VisitPacketError('The initial symptom query failed.', symptomResult.error);
  const symptom = symptomResult.data;
  if (!symptom) console.warn(`Visit Packet: initial symptom ${anchor} is missing for episode ${episode.id}.`);

  const consultationIds = uniqueIds(consultations.map((item) => item.id));
  consultations.sort((a, b) => {
    const timeOrder = new Date(a.consultation_at ?? a.created_at).getTime()
      - new Date(b.consultation_at ?? b.created_at).getTime();
    return timeOrder !== 0 ? timeOrder : a.id.localeCompare(b.id);
  });

  const [prescriptionLinks, labLinks] = consultationIds.length === 0
    ? [[], []]
    : await Promise.all([
        requireQuery<Array<{ consultation_id: string; prescription_id: string; created_at: string | null }>>('Prescription links could not be loaded.', supabase.from('consultation_prescriptions')
          .select('consultation_id, prescription_id, created_at')
          .in('consultation_id', consultationIds)),
        requireQuery<Array<{ consultation_id: string; lab_report_id: string; created_at: string | null }>>('Lab report links could not be loaded.', supabase.from('consultation_lab_reports')
          .select('consultation_id, lab_report_id, created_at')
          .in('consultation_id', consultationIds)),
      ] as const);

  const { questions, prescriptionIds, labReportIds } = scopeVisitPacketAssociations(
    consultationIds,
    rawQuestions,
    prescriptionLinks,
    labLinks,
  );

  const [prescriptionRows, labReportRows] = await Promise.all([
    prescriptionIds.length === 0 ? Promise.resolve([]) : requireQuery<PrescriptionRow[]>('Linked prescriptions could not be loaded.', supabase.from('prescriptions')
      .select('id, file_name, file_type, uploaded_at, medicines, raw_text, storage_path')
      .eq('user_id', user.id)
      .in('id', prescriptionIds)),
    labReportIds.length === 0 ? Promise.resolve([]) : requireQuery<LabReportRow[]>('Linked lab reports could not be loaded.', supabase.from('lab_reports')
      .select('id, file_name, file_type, analysis_type, narrative_analysis, report_type, laboratory, report_date, parameters, uploaded_at, storage_path')
      .eq('user_id', user.id)
      .in('id', labReportIds)),
  ]);

  const prescriptions: VisitPacketPrescription[] = prescriptionRows.map((row) => {
    if (!Array.isArray(row.medicines)) console.warn(`Visit Packet: prescription ${row.id} has malformed medicines JSON.`);
    return {
      id: row.id,
      fileName: row.file_name,
      fileType: row.file_type,
      uploadedAt: row.uploaded_at,
      medicines: Array.isArray(row.medicines) ? row.medicines as ExtractedMedicine[] : [],
      rawText: row.raw_text,
      storagePath: row.storage_path,
    };
  }).sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime() || a.id.localeCompare(b.id));

  const labReports: VisitPacketLabReport[] = labReportRows.map((row): VisitPacketLabReport => {
    const base: VisitPacketLabReportBase = {
      id: row.id,
      fileName: row.file_name,
      fileType: row.file_type,
      reportType: row.report_type,
      laboratory: row.laboratory,
      reportDate: row.report_date,
      uploadedAt: row.uploaded_at,
      storagePath: row.storage_path,
    };
    if (row.analysis_type === 'narrative') {
      const narrativeAnalysis = parseNarrativeAnalysis(row.narrative_analysis);
      if (!narrativeAnalysis) throw new VisitPacketError(`Narrative analysis is malformed for lab report ${row.id}.`);
      return { ...base, analysisType: 'narrative', parameters: [], narrativeAnalysis };
    }
    if (!Array.isArray(row.parameters)) console.warn(`Visit Packet: lab report ${row.id} has malformed parameters JSON.`);
    return { ...base, analysisType: 'structured', parameters: Array.isArray(row.parameters) ? row.parameters as LabParameter[] : [], narrativeAnalysis: null };
  }).sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime() || a.id.localeCompare(b.id));

  const initialSymptoms = symptom ? {
    id: symptom.id,
    symptoms: symptom.symptoms,
    severity: symptom.severity,
    duration: symptom.duration,
    createdAt: symptom.created_at,
  } : null;
  const packetFollowUps = followUps.map((row) => ({ id: row.id, progress: row.progress, currentSymptoms: row.current_symptoms, medicineCompliance: row.medicine_compliance, medicineReason: row.medicine_reason, hasSideEffects: row.has_side_effects, sideEffectsText: row.side_effects_text, createdAt: row.created_at }));
  const packetConsultations = consultations.map((row) => ({ id: row.id, consultationAt: row.consultation_at, doctorName: row.doctor_name, clinicName: row.clinic_name, notes: row.notes, followUpRecommended: row.follow_up_recommended, followUpNotes: row.follow_up_notes, createdAt: row.created_at }));
  const packetQuestions = questions.map((row) => ({ id: row.id, question: row.question, source: row.source, previousConsultationId: row.previous_consultation_id, createdAt: row.created_at }));

  const timeline: VisitPacketTimelineEvent[] = [];
  if (initialSymptoms) timeline.push({ type: 'symptoms_recorded', timestamp: initialSymptoms.createdAt, label: 'Symptoms recorded', sourceId: initialSymptoms.id });
  buildQuestionCycleEvents(packetQuestions).forEach((event) => {
    timeline.push({
      type: 'questions_prepared',
      timestamp: event.timestamp,
      label: 'Questions prepared',
      sourceId: event.sourceId,
      questionCount: event.questionCount,
      appointmentCycle: event.appointmentCycle,
    });
  });
  packetFollowUps.forEach((item) => timeline.push({ type: 'follow_up_recorded', timestamp: item.createdAt, label: 'Follow-up recorded', sourceId: item.id }));
  packetConsultations.forEach((item) => timeline.push({ type: 'consultation', timestamp: item.consultationAt ?? item.createdAt, label: 'Consultation', sourceId: item.id }));
  const prescriptionAssociations = prescriptionLinks.map((link) => ({ resourceId: link.prescription_id, createdAt: link.created_at }));
  const labAssociations = labLinks.map((link) => ({ resourceId: link.lab_report_id, createdAt: link.created_at }));
  prescriptions.forEach((item) => {
    const timestamp = resolveEpisodeLinkedEventTimestamp({ resourceId: item.id, uploadedAt: item.uploadedAt, episodeStartedAt: episode.started_at, associations: prescriptionAssociations });
    if (timestamp) timeline.push({ type: 'prescription_added', timestamp, label: 'Prescription added', sourceId: item.id });
  });
  labReports.forEach((item) => {
    const timestamp = resolveEpisodeLinkedEventTimestamp({ resourceId: item.id, uploadedAt: item.uploadedAt, episodeStartedAt: episode.started_at, associations: labAssociations });
    if (timestamp) timeline.push({ type: 'lab_report_added', timestamp, label: 'Lab report added', sourceId: item.id });
  });

  return {
    episode: { id: episode.id, title: null, status: episode.status, startedAt: episode.started_at, completedAt: episode.completed_at },
    patient: { displayName: typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.trim() ? user.user_metadata.full_name : null },
    initialSymptoms,
    followUps: packetFollowUps,
    consultations: packetConsultations,
    prescriptions,
    labReports,
    questions: packetQuestions,
    timeline: sortTimeline(timeline),
    generatedAt: new Date().toISOString(),
  };
};
