import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../common/Button';
import { Activity, Pill, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FollowUpIntakeValues {
  progress: string;
  currentSymptoms: string;
  medicineCompliance: string;
  medicineReason: string;
  hasSideEffects: boolean;
  sideEffectsText: string;
  questions: string;
}

interface FollowUpIntakeProps {
  onComplete: (values: FollowUpIntakeValues) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
}

export const FollowUpIntake: React.FC<FollowUpIntakeProps> = ({
  onComplete,
  isSaving = false,
  errorMessage = null,
}) => {
  const { t } = useTranslation();
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState<string>('Slightly Better');
  const [symptoms, setSymptoms] = useState('');
  const [medCompliance, setMedCompliance] = useState<string>('Yes, as prescribed');
  const [medReason, setMedReason] = useState('');
  const [hasSideEffects, setHasSideEffects] = useState<boolean>(false);
  const [sideEffectsText, setSideEffectsText] = useState('');
  const [questions, setQuestions] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const progressOptions = [
    { value: 'Much Better', labelKey: 'workflow.muchBetter' },
    { value: 'Slightly Better', labelKey: 'workflow.slightlyBetter' },
    { value: 'No Change', labelKey: 'workflow.noChange' },
    { value: 'Slightly Worse', labelKey: 'workflow.slightlyWorse' },
    { value: 'Much Worse', labelKey: 'workflow.muchWorse' },
  ];

  const complianceOptions = [
    { value: 'Yes, as prescribed', labelKey: 'workflow.asPrescribed' },
    { value: 'Sometimes missed doses', labelKey: 'workflow.missedDoses' },
    { value: 'Stopped taking them', labelKey: 'workflow.stoppedTaking' },
  ];

  return (
    <div className="min-h-screen bg-nuraBg py-16 px-6 flex flex-col items-center justify-center selection:bg-primary/10 selection:text-primary">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 16 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full mx-auto space-y-10"
      >
        {/* Top Logo & Caption */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-blue-500/15">
              <span className="font-heading font-bold text-2xl leading-none">N</span>
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-nuraText">
              Nura
            </span>
          </div>
          <p className="text-xs font-semibold text-nuraTextSecondary tracking-[0.3em] uppercase">
            {t('workflow.reviewConsultation')}
          </p>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight">
            {t('workflow.followUp')}
          </h1>
          <p className="font-sans text-base sm:text-lg text-nuraTextSecondary font-medium max-w-lg mx-auto">
            {t('workflow.followUpHelp')}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-xl shadow-blue-500/5 space-y-8">
          
          {/* Section 1 — Recovery Progress */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-nuraTextSecondary">
              {t('workflow.recoveryProgress')}
            </label>
            <p className="text-sm text-nuraText font-medium">
              {t('workflow.recoveryHelp')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {progressOptions.map((opt) => {
                const isSelected = progress === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setProgress(opt.value)}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md shadow-blue-500/20'
                        : 'bg-gray-50/80 text-nuraTextSecondary border-gray-200/80 hover:border-primary/40 hover:text-nuraText'
                    }`}
                  >
                    {t(opt.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2 — Current Symptoms */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-nuraTextSecondary">
              {t('workflow.currentSymptoms')}
            </label>
            <textarea
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={t('workflow.currentSymptomsPlaceholder')}
              className="w-full p-4 bg-gray-50/50 border border-gray-200/80 rounded-xl font-sans text-nuraText placeholder:text-nuraTextSecondary/50 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none text-sm sm:text-base leading-relaxed"
            />
          </div>

          {/* Section 3 — Medicines */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-nuraTextSecondary">
              {t('workflow.medicineCompliance')}
            </label>
            <p className="text-sm text-nuraText font-medium">
              {t('workflow.medicineComplianceHelp')}
            </p>
            <div className="space-y-2 pt-1">
              {complianceOptions.map((opt) => {
                const isSelected = medCompliance === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setMedCompliance(opt.value)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/[0.03] text-primary font-semibold shadow-xs'
                        : 'border-gray-200/80 bg-gray-50/40 text-nuraText hover:border-primary/40'
                    }`}
                  >
                    <span className="text-sm">{t(opt.labelKey)}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {(medCompliance === 'Sometimes missed doses' || medCompliance === 'Stopped taking them') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2"
              >
                <textarea
                  rows={3}
                  value={medReason}
                  onChange={(e) => setMedReason(e.target.value)}
                  placeholder={t('workflow.medicineReason')}
                  className="w-full p-4 bg-gray-50/50 border border-gray-200/80 rounded-xl font-sans text-nuraText placeholder:text-nuraTextSecondary/50 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none text-sm leading-relaxed"
                />
              </motion.div>
            )}
          </div>

          {/* Section 4 — Side Effects */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-nuraTextSecondary">
              {t('workflow.sideEffects')}
            </label>
            <p className="text-sm text-nuraText font-medium">
              {t('workflow.sideEffectsHelp')}
            </p>
            <div className="flex items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => setHasSideEffects(true)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  hasSideEffects
                    ? 'bg-primary text-white border-primary shadow-md shadow-blue-500/20'
                    : 'bg-gray-50 text-nuraTextSecondary border-gray-200 hover:border-primary/40'
                }`}
              >
                {t('common.yes')}
              </button>
              <button
                type="button"
                onClick={() => setHasSideEffects(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  !hasSideEffects
                    ? 'bg-primary text-white border-primary shadow-md shadow-blue-500/20'
                    : 'bg-gray-50 text-nuraTextSecondary border-gray-200 hover:border-primary/40'
                }`}
              >
                {t('common.no')}
              </button>
            </div>

            {hasSideEffects && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2"
              >
                <textarea
                  rows={3}
                  value={sideEffectsText}
                  onChange={(e) => setSideEffectsText(e.target.value)}
                  placeholder={t('workflow.sideEffectsPlaceholder')}
                  className="w-full p-4 bg-gray-50/50 border border-gray-200/80 rounded-xl font-sans text-nuraText placeholder:text-nuraTextSecondary/50 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none text-sm leading-relaxed"
                />
              </motion.div>
            )}
          </div>

          {/* Section 5 — New Questions */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-nuraTextSecondary">
              {t('workflow.newQuestions')}
            </label>
            <textarea
              rows={4}
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder={t('workflow.newQuestionsPlaceholder')}
              className="w-full p-4 bg-gray-50/50 border border-gray-200/80 rounded-xl font-sans text-nuraText placeholder:text-nuraTextSecondary/50 focus:outline-none focus:border-primary focus:bg-white transition-all resize-none text-sm sm:text-base leading-relaxed"
            />
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="pt-2 pb-12 flex flex-col items-center gap-3">
          {errorMessage && (
            <p className="text-sm font-medium text-red-600 text-center" role="alert">
              {errorMessage}
            </p>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={() => onComplete({
              progress,
              currentSymptoms: symptoms,
              medicineCompliance: medCompliance,
              medicineReason: medReason,
              hasSideEffects,
              sideEffectsText,
              questions,
            })}
            disabled={isSaving}
            className="w-full sm:w-auto min-w-[220px] py-4 text-base font-semibold rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            {isSaving ? t('common.saving') : t('common.continue')}
          </Button>
        </div>

      </motion.div>
    </div>
  );
};

export default FollowUpIntake;
