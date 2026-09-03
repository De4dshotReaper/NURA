export interface SymptomNote {
  id: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  notes: string;
}

export interface VisitPrepData {
  id: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  location: string;
  symptoms: SymptomNote[];
  questions: { id: string; question: string; answered: boolean }[];
  currentConcerns: string;
}

export interface PrescriptionData {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  purpose: string;
  plainExplanation: string;
  howToTake: string;
  sideEffects: string[];
  tips: string[];
  refillsRemaining: number;
}

export interface DiagnosticTestData {
  id: string;
  testName: string;
  testDate: string;
  orderedBy: string;
  status: 'Completed' | 'Pending Review';
  summary: string;
  keyFindings: { term: string; explanation: string }[];
  questionsForDoctor: string[];
}

export interface TimelineEventData {
  id: string;
  date: string;
  title: string;
  category: 'visit' | 'prescription' | 'lab' | 'procedure' | 'note';
  provider: string;
  summary: string;
  details?: string;
}

export interface FollowUpTask {
  id: string;
  task: string;
  dueDate: string;
  completed: boolean;
  category: 'medication' | 'appointment' | 'lifestyle' | 'monitoring';
  notes?: string;
}

export interface AiExplanationQuery {
  id: string;
  sourceType: 'prescription' | 'lab' | 'doctor_note';
  originalText: string;
  plainExplanation: string;
  timestamp: string;
}

export interface ExtractedMedicine {
  name: string | null;
  dosage: string | null;
  frequency: string | null;
  instructions: string | null;
  confidence: 'high' | 'medium' | 'low' | null;
  whatItsFor?: string | null;
  commonSideEffects?: string[];
  thingsToRemember?: string[];
}

export interface LabParameter {
  id: string;
  name: string;
  subtitle: string | null;
  value: string | null;
  unit: string | null;
  referenceRange: string | null;
  status:
    | 'Normal'
    | 'Below Range'
    | 'Above Range'
    | 'Outside Range'
    | 'Unknown';
  shortExplanation: string | null;
  simpleExplanation: string | null;
  meaningOfResult: string | null;
}

export interface StructuredLabReportAnalysis {
  analysis_type: 'structured';
  reportFormat: 'structured' | 'unsupported';
  reportType: string | null;
  laboratory: string | null;
  reportDate: string | null;
  parameters: LabParameter[];
  rawText: string | null;
}

export interface NarrativeLabReportAnalysis {
  analysis_type: 'narrative';
  report_type: string | null;
  body_part_or_test: string | null;
  report_date: string | null;
  laboratory: string | null;
  summary: string;
  key_findings: Array<{ finding: string; explanation: string }>;
  impression: string | null;
  terms_explained: Array<{ term: string; explanation: string }>;
}

export type NarrativeAnalysisPayload = Omit<NarrativeLabReportAnalysis, 'analysis_type'>;

export interface PersistedLabReportRow {
  id: string;
  file_name: string;
  file_type: string;
  report_type: string | null;
  laboratory: string | null;
  report_date: string | null;
  raw_text: string | null;
  parameters: unknown;
  uploaded_at: string;
  storage_path: string | null;
  analysis_type?: 'structured' | 'narrative' | null;
  narrative_analysis?: unknown;
}

export interface UnsupportedLabReportAnalysis {
  analysis_type: 'unsupported';
  reportFormat: 'unsupported';
  reportType: null;
  laboratory: null;
  reportDate: null;
  parameters: [];
  rawText: null;
}

export type LabReportAnalysis =
  | StructuredLabReportAnalysis
  | NarrativeLabReportAnalysis
  | UnsupportedLabReportAnalysis;
