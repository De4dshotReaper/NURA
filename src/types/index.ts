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
