import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Lightbulb, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ConsultationQuestion {
  id: string;
  question: string;
  source: string;
  created_at: string;
}

type AppointmentMode = 'first-appointment' | 'next-appointment';

interface LatestConsultation {
  id: string;
  notes: string;
  doctor_name: string | null;
  clinic_name: string | null;
  follow_up_recommended: boolean;
  follow_up_notes: string | null;
  consultation_at: string;
}

interface FollowUpContextRow {
  progress: string | null;
  current_symptoms: string | null;
  medicine_compliance: string | null;
  medicine_reason: string | null;
  has_side_effects: boolean;
  side_effects_text: string | null;
  questions: string | null;
  created_at: string;
}

interface PrescriptionContextRow {
  medicines: unknown;
}

interface LabReportContextRow {
  report_type: string | null;
  parameters: unknown;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const persistedText = (value: unknown): string | null => {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
};

interface QuestionsPageProps {
  onBackToDashboard?: () => void;
  symptomEntryId: string;
  userId: string;
}

export const QuestionsPage: React.FC<QuestionsPageProps> = ({
  onBackToDashboard,
  symptomEntryId,
  userId,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [askedQuestions, setAskedQuestions] = useState<ConsultationQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(true);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [suggestionAttempt, setSuggestionAttempt] = useState(0);
  const [addingSuggestion, setAddingSuggestion] = useState<string | null>(null);
  const [appointmentMode, setAppointmentMode] = useState<AppointmentMode | null>(null);
  const [latestConsultation, setLatestConsultation] = useState<LatestConsultation | null>(null);
  const [isDeterminingMode, setIsDeterminingMode] = useState(true);
  const [modeError, setModeError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const determineAppointmentMode = async () => {
      setIsDeterminingMode(true);
      setModeError(null);
      setAppointmentMode(null);
      setLatestConsultation(null);

      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('id, notes, doctor_name, clinic_name, follow_up_recommended, follow_up_notes, consultation_at')
          .eq('symptom_entry_id', symptomEntryId)
          .order('consultation_at', { ascending: false })
          .limit(1)
          .maybeSingle<LatestConsultation>();

        if (!isMounted) return;
        if (error) {
          console.error('Failed to determine consultation question preparation mode:', error);
          setModeError('Unable to determine the appointment context. Please try again later.');
          return;
        }

        if (data) {
          setLatestConsultation(data);
          setAppointmentMode('next-appointment');
        } else {
          setAppointmentMode('first-appointment');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error determining consultation question preparation mode:', error);
        setModeError('Unable to determine the appointment context. Please try again later.');
      } finally {
        if (isMounted) setIsDeterminingMode(false);
      }
    };

    void determineAppointmentMode();
    return () => {
      isMounted = false;
    };
  }, [symptomEntryId]);

  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      if (!appointmentMode) return;

      setIsLoading(true);
      setErrorMessage(null);
      setAskedQuestions([]);

      try {
        let query = supabase
          .from('consultation_questions')
          .select('id, question, source, created_at')
          .eq('symptom_entry_id', symptomEntryId);

        query = appointmentMode === 'first-appointment'
          ? query.is('previous_consultation_id', null)
          : query.eq('previous_consultation_id', latestConsultation!.id);

        const { data, error } = await query.order('created_at', { ascending: true });

        if (!isMounted) return;
        if (error) {
          console.error('Failed to load consultation questions:', error);
          setErrorMessage('Unable to load your prepared questions.');
          return;
        }

        setAskedQuestions((data ?? []) as ConsultationQuestion[]);
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error loading consultation questions:', error);
        setErrorMessage('Unable to load your prepared questions.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (appointmentMode) void loadQuestions();
    return () => {
      isMounted = false;
    };
  }, [appointmentMode, latestConsultation, symptomEntryId]);

  useEffect(() => {
    let isMounted = true;

    const generateSuggestions = async () => {
      if (!appointmentMode) return;

      setIsGeneratingSuggestions(true);
      setSuggestionError(null);
      setSuggestedQuestions([]);

      try {
        const { data: symptomEntry, error: symptomError } = await supabase
          .from('symptom_entries')
          .select('symptoms, severity, duration')
          .eq('id', symptomEntryId)
          .single<{ symptoms: string; severity: number | null; duration: string | null }>();

        if (!isMounted) return;
        if (symptomError) {
          console.error('Failed to load symptom context for question suggestions:', symptomError);
          setSuggestionError("Suggestions couldn't be generated right now.");
          return;
        }

        let functionBody: Record<string, unknown> = {
          mode: 'first-appointment',
          symptoms: symptomEntry.symptoms,
          severity: symptomEntry.severity,
          duration: symptomEntry.duration,
        };

        if (appointmentMode === 'next-appointment' && latestConsultation) {
          const loadLatestFollowUp = async () => {
            try {
              let query = supabase
                .from('follow_up_entries')
                .select('progress, current_symptoms, medicine_compliance, medicine_reason, has_side_effects, side_effects_text, questions, created_at')
                .eq('symptom_entry_id', symptomEntryId)
                .order('created_at', { ascending: false })
                .limit(1);

              if (!Number.isNaN(new Date(latestConsultation.consultation_at).getTime())) {
                query = query.gte('created_at', latestConsultation.consultation_at);
              }

              const { data, error } = await query.maybeSingle<FollowUpContextRow>();
              if (error) {
                console.error('Failed to load latest follow-up context for question suggestions:', error);
                return null;
              }
              return data;
            } catch (error) {
              console.error('Unexpected error loading latest follow-up context for question suggestions:', error);
              return null;
            }
          };

          const loadLinkedMedicines = async () => {
            try {
              const { data: links, error: linkError } = await supabase
                .from('consultation_prescriptions')
                .select('prescription_id')
                .eq('consultation_id', latestConsultation.id);

              if (linkError) {
                console.error('Failed to load consultation prescription links for question suggestions:', linkError);
                return [];
              }

              const prescriptionIds = (links ?? [])
                .map((link) => typeof link.prescription_id === 'string' ? link.prescription_id : null)
                .filter((id): id is string => Boolean(id));
              if (prescriptionIds.length === 0) return [];

              const { data: prescriptions, error: prescriptionError } = await supabase
                .from('prescriptions')
                .select('medicines')
                .in('id', prescriptionIds);

              if (prescriptionError) {
                console.error('Failed to load linked prescriptions for question suggestions:', prescriptionError);
                return [];
              }

              return ((prescriptions ?? []) as PrescriptionContextRow[]).flatMap((prescription) =>
                Array.isArray(prescription.medicines)
                  ? prescription.medicines.flatMap((medicine) => {
                      const value = asRecord(medicine);
                      if (!value) return [];
                      const context = {
                        name: persistedText(value.name),
                        dosage: persistedText(value.dosage),
                        frequency: persistedText(value.frequency),
                        instructions: persistedText(value.instructions),
                      };
                      return Object.values(context).some(Boolean) ? [context] : [];
                    })
                  : []
              );
            } catch (error) {
              console.error('Unexpected error loading linked prescriptions for question suggestions:', error);
              return [];
            }
          };

          const loadLinkedLabParameters = async () => {
            try {
              const { data: links, error: linkError } = await supabase
                .from('consultation_lab_reports')
                .select('lab_report_id')
                .eq('consultation_id', latestConsultation.id);

              if (linkError) {
                console.error('Failed to load consultation lab links for question suggestions:', linkError);
                return [];
              }

              const labReportIds = (links ?? [])
                .map((link) => typeof link.lab_report_id === 'string' ? link.lab_report_id : null)
                .filter((id): id is string => Boolean(id));
              if (labReportIds.length === 0) return [];

              const { data: labReports, error: labError } = await supabase
                .from('lab_reports')
                .select('report_type, parameters')
                .in('id', labReportIds);

              if (labError) {
                console.error('Failed to load linked lab reports for question suggestions:', labError);
                return [];
              }

              return ((labReports ?? []) as LabReportContextRow[]).flatMap((report) =>
                Array.isArray(report.parameters)
                  ? report.parameters.flatMap((parameter) => {
                      const value = asRecord(parameter);
                      if (!value) return [];
                      const context = {
                        reportType: persistedText(report.report_type),
                        name: persistedText(value.name),
                        value: persistedText(value.value),
                        unit: persistedText(value.unit),
                        referenceRange: persistedText(value.referenceRange),
                        status: persistedText(value.status),
                      };
                      return Object.values(context).some(Boolean) ? [context] : [];
                    })
                  : []
              );
            } catch (error) {
              console.error('Unexpected error loading linked lab reports for question suggestions:', error);
              return [];
            }
          };

          const [latestFollowUp, linkedMedicines, linkedLabParameters] = await Promise.all([
            loadLatestFollowUp(),
            loadLinkedMedicines(),
            loadLinkedLabParameters(),
          ]);

          functionBody = {
            mode: 'next-appointment',
            symptoms: symptomEntry.symptoms,
            severity: symptomEntry.severity,
            duration: symptomEntry.duration,
            previousConsultation: {
              notes: latestConsultation.notes,
              doctorName: latestConsultation.doctor_name,
              clinicName: latestConsultation.clinic_name,
              followUpRecommended: latestConsultation.follow_up_recommended,
              followUpNotes: latestConsultation.follow_up_notes,
              consultationAt: latestConsultation.consultation_at,
            },
            latestFollowUp: latestFollowUp
              ? {
                  progress: latestFollowUp.progress,
                  currentSymptoms: latestFollowUp.current_symptoms,
                  medicineCompliance: latestFollowUp.medicine_compliance,
                  medicineReason: latestFollowUp.medicine_reason,
                  hasSideEffects: latestFollowUp.has_side_effects,
                  sideEffectsText: latestFollowUp.side_effects_text,
                  questions: latestFollowUp.questions,
                  createdAt: latestFollowUp.created_at,
                }
              : null,
            linkedMedicines,
            linkedLabParameters,
          };
        }

        if (!isMounted) return;
        const { data, error } = await supabase.functions.invoke('generate-consultation-questions', {
          body: functionBody,
        });

        if (!isMounted) return;
        if (error) {
          console.error('Failed to generate consultation question suggestions:', error);
          setSuggestionError("Suggestions couldn't be generated right now.");
          return;
        }

        const questions = Array.isArray(data?.questions)
          ? data.questions
              .filter((question: unknown): question is string => typeof question === 'string')
              .map((question: string) => question.trim())
              .filter(Boolean)
          : [];

        if (questions.length === 0) {
          console.error('Consultation question function returned an invalid response shape.');
          setSuggestionError("Suggestions couldn't be generated right now.");
          return;
        }

        setSuggestedQuestions(questions);
      } catch (error) {
        if (!isMounted) return;
        console.error('Unexpected error generating consultation question suggestions:', error);
        setSuggestionError("Suggestions couldn't be generated right now.");
      } finally {
        if (isMounted) setIsGeneratingSuggestions(false);
      }
    };

    if (appointmentMode) void generateSuggestions();
    return () => {
      isMounted = false;
    };
  }, [appointmentMode, latestConsultation, symptomEntryId, suggestionAttempt]);

  const handleAddQuestion = async () => {
    if (isSaving) return;
    if (!appointmentMode) {
      setErrorMessage('Appointment context is not available yet.');
      return;
    }

    const trimmedQuestion = customQuestion.trim();
    if (!trimmedQuestion) {
      setErrorMessage('Enter a question before adding it.');
      return;
    }
    if (!userId) {
      setErrorMessage('You must be signed in to add a question.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('consultation_questions')
        .insert({
          user_id: userId,
          symptom_entry_id: symptomEntryId,
          previous_consultation_id: appointmentMode === 'next-appointment'
            ? latestConsultation!.id
            : null,
          question: trimmedQuestion,
          source: 'user',
        })
        .select('id, question, source, created_at')
        .single<ConsultationQuestion>();

      if (error) {
        console.error('Failed to insert consultation question:', error);
        setErrorMessage('Unable to add your question. Please try again.');
        return;
      }

      setAskedQuestions((questions) => [...questions, data]);
      setCustomQuestion('');
    } catch (error) {
      console.error('Unexpected error inserting consultation question:', error);
      setErrorMessage('Unable to add your question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (deletingQuestionId) return;
    if (!userId) {
      setErrorMessage('You must be signed in to delete a question.');
      return;
    }

    setDeletingQuestionId(id);
    setErrorMessage(null);

    try {
      const { error } = await supabase
        .from('consultation_questions')
        .delete()
        .eq('id', id)
        .eq('symptom_entry_id', symptomEntryId);

      if (error) {
        console.error('Failed to delete consultation question:', error);
        setErrorMessage('Unable to delete the question. Please try again.');
        return;
      }

      setAskedQuestions((questions) => questions.filter((question) => question.id !== id));
    } catch (error) {
      console.error('Unexpected error deleting consultation question:', error);
      setErrorMessage('Unable to delete the question. Please try again.');
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleAddSuggestion = async (suggestion: string) => {
    if (addingSuggestion || isSaving) return;
    if (!appointmentMode) {
      setErrorMessage('Appointment context is not available yet.');
      return;
    }

    const trimmedQuestion = suggestion.trim();
    if (!trimmedQuestion || !userId) return;

    setAddingSuggestion(suggestion);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('consultation_questions')
        .insert({
          user_id: userId,
          symptom_entry_id: symptomEntryId,
          previous_consultation_id: appointmentMode === 'next-appointment'
            ? latestConsultation!.id
            : null,
          question: trimmedQuestion,
          source: 'ai',
        })
        .select('id, question, source, created_at')
        .single<ConsultationQuestion>();

      if (error) {
        console.error('Failed to insert AI consultation question:', error);
        setErrorMessage('Unable to add the suggested question. Please try again.');
        return;
      }

      setAskedQuestions((questions) => [...questions, data]);
      setSuggestedQuestions((questions) => questions.filter((question) => question !== suggestion));
    } catch (error) {
      console.error('Unexpected error inserting AI consultation question:', error);
      setErrorMessage('Unable to add the suggested question. Please try again.');
    } finally {
      setAddingSuggestion(null);
    }
  };

  const preparedQuestionKeys = new Set(
    askedQuestions.map((preparedQuestion) => preparedQuestion.question.trim().toLocaleLowerCase())
  );
  const visibleSuggestedQuestions = suggestedQuestions.filter(
    (suggestion) => !preparedQuestionKeys.has(suggestion.trim().toLocaleLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mr-auto space-y-10 pb-16 select-none"
    >
      {/* BACK NAVIGATION */}
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

      {/* HERO SECTION */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 text-primary text-xs font-semibold tracking-wider uppercase">
          QUESTIONS BEFORE APPOINTMENT
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          Questions Before Appointment
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          Prepare thoughtful questions to ask your doctor during your next consultation to get the most out of your appointment.
        </p>
        {appointmentMode === 'next-appointment' && (
          <div className="pt-2 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Preparing for your next appointment
            </p>
            <p className="text-sm text-nuraTextSecondary">
              Suggestions use your previous consultation and linked health records for this episode.
            </p>
          </div>
        )}
      </div>

      {isDeterminingMode ? (
        <div className="bg-white rounded-[1.75rem] p-10 text-center border border-gray-100 text-nuraTextSecondary text-sm" aria-busy="true">
          Loading appointment context...
        </div>
      ) : modeError ? (
        <div className="bg-white rounded-[1.75rem] p-8 border border-red-100 text-sm font-medium text-red-600" role="alert">
          {modeError}
        </div>
      ) : (
        <>
      {/* ADD CUSTOM QUESTION INPUT */}
      <div className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <label className="block font-heading font-bold text-base text-nuraText">
          Add a Custom Question
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleAddQuestion();
            }}
            disabled={isSaving}
            placeholder="Type your question for the doctor..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-nuraText placeholder:text-nuraTextSecondary/50 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={() => void handleAddQuestion()}
            disabled={isSaving}
            className="px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>{isSaving ? 'Adding...' : 'Add'}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
        {errorMessage && (
          <p className="text-sm font-medium text-red-600" role="alert">{errorMessage}</p>
        )}
      </div>

      {/* MY PREPARED QUESTIONS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-xl text-nuraText tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>My Prepared Questions ({askedQuestions.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-[1.75rem] p-10 text-center border border-gray-100 text-nuraTextSecondary text-sm" aria-busy="true">
            Loading prepared questions...
          </div>
        ) : askedQuestions.length > 0 ? (
          <div className="space-y-3">
            {askedQuestions.map((preparedQuestion) => (
              <motion.div
                key={preparedQuestion.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[1.25rem] p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-start gap-3.5"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-nuraText leading-relaxed flex-1">{preparedQuestion.question}</span>
                <button
                  type="button"
                  onClick={() => void handleDeleteQuestion(preparedQuestion.id)}
                  disabled={deletingQuestionId !== null}
                  className="p-1.5 rounded-lg text-nuraTextSecondary/60 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[1.75rem] p-10 text-center border border-gray-100 text-nuraTextSecondary text-sm">
            No questions added yet.
          </div>
        )}
      </div>

      {/* SUGGESTED QUESTIONS */}
      <div className="space-y-4 pt-2">
        <h2 className="font-heading font-extrabold text-xl text-nuraText tracking-tight flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Suggested Questions</span>
        </h2>
        {isGeneratingSuggestions ? (
          <div className="bg-gray-50/80 rounded-[1.25rem] p-5 border border-gray-100 text-sm text-nuraTextSecondary" aria-busy="true">
            Preparing personalized questions...
          </div>
        ) : suggestionError ? (
          <div className="bg-gray-50/80 rounded-[1.25rem] p-5 border border-gray-100 space-y-3">
            <p className="text-sm text-nuraTextSecondary">{suggestionError}</p>
            <button
              type="button"
              onClick={() => setSuggestionAttempt((attempt) => attempt + 1)}
              className="text-xs font-semibold text-primary hover:text-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : visibleSuggestedQuestions.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {visibleSuggestedQuestions.map((suggestion) => (
              <motion.button
                key={suggestion}
                type="button"
                whileHover={{ scale: 1.005 }}
                onClick={() => void handleAddSuggestion(suggestion)}
                disabled={addingSuggestion !== null}
                className="bg-gray-50/80 hover:bg-blue-50/60 rounded-[1.25rem] p-4 sm:p-5 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between gap-4 group disabled:opacity-60"
              >
                <span className="text-left text-xs sm:text-sm font-medium text-nuraText group-hover:text-primary transition-colors">
                  {suggestion}
                </span>
                <span className="text-xs font-semibold text-primary shrink-0">
                  {addingSuggestion === suggestion ? 'Adding...' : '+ Add'}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50/80 rounded-[1.25rem] p-5 border border-gray-100 text-sm text-nuraTextSecondary">
            No new suggestions available.
          </div>
        )}
      </div>
        </>
      )}
    </motion.div>
  );
};

export default QuestionsPage;
