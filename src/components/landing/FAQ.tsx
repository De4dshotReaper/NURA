import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  session: Session | null;
  onSignIn: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ session, onSignIn }) => {
  const { t } = useTranslation();
  const faqData = t('faq.items', { returnObjects: true }) as FAQItem[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const feedbackSubmissionRef = useRef(false);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleFeedbackSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (feedbackSubmissionRef.current || isSubmittingFeedback || !session?.user) return;

    const message = feedbackMessage.trim();
    if (!message) {
      setFeedbackError(t('feedback.emptyError'));
      return;
    }
    if (message.length > 2000) {
      setFeedbackError(t('feedback.lengthError'));
      return;
    }

    feedbackSubmissionRef.current = true;
    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: session.user.id,
        message,
      });
      if (error) {
        console.error('Failed to submit feedback:', error);
        setFeedbackError(t('feedback.submitError'));
        return;
      }
      setFeedbackMessage('');
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Unexpected error submitting feedback:', error);
      setFeedbackError(t('feedback.submitError'));
    } finally {
      feedbackSubmissionRef.current = false;
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <section id="faq" className="py-24 md:py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/60 text-primary text-xs font-bold uppercase tracking-wider shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>{t('faq.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-nuraText leading-[1.15] tracking-tight">
            {t('faq.title')}
          </h2>
          <p className="text-base sm:text-lg text-nuraTextSecondary leading-relaxed font-normal opacity-90">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`bg-white border rounded-2xl transition-all duration-300 ease-out overflow-hidden shadow-xs ${
                  isOpen 
                    ? 'border-blue-300 shadow-md shadow-blue-500/5 ring-2 ring-blue-100/60' 
                    : 'border-gray-100/90 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 sm:px-8 sm:py-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none group"
                  aria-expanded={isOpen}
                >
                  <span className={`font-heading font-bold text-base sm:text-lg transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-nuraText group-hover:text-primary'}`}>
                    {item.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${isOpen ? 'bg-blue-50 text-primary' : 'bg-gray-50 text-nuraTextSecondary group-hover:bg-gray-100 group-hover:text-nuraText'}`}>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                        isOpen ? 'rotate-180 text-primary' : 'text-nuraTextSecondary'
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: -4 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -4 }}
                      transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-6 pb-6 sm:px-8 sm:pb-7 text-sm sm:text-base text-nuraTextSecondary leading-[1.7] border-t border-gray-100/80 pt-4">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-16 md:mt-20 rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2 text-center">
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-nuraText">{t('feedback.title')}</h3>
              <p className="text-sm sm:text-base leading-relaxed text-nuraTextSecondary">{t('feedback.description')}</p>
            </div>

            {feedbackSubmitted ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 text-center space-y-1" role="status">
                <p className="font-heading font-bold text-emerald-900">{t('feedback.success')}</p>
                <p className="text-sm text-emerald-800">{t('feedback.successHelp')}</p>
              </div>
            ) : session?.user ? (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <textarea
                  value={feedbackMessage}
                  onChange={(event) => {
                    setFeedbackMessage(event.target.value);
                    if (feedbackError) setFeedbackError(null);
                  }}
                  maxLength={2000}
                  rows={6}
                  disabled={isSubmittingFeedback}
                  placeholder={t('feedback.placeholder')}
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50/40 p-4 text-sm text-nuraText placeholder:text-nuraTextSecondary/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                />
                {feedbackError && <p className="text-sm font-medium text-red-700" role="alert">{feedbackError}</p>}
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmittingFeedback || !feedbackMessage.trim()} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
                    {isSubmittingFeedback ? t('feedback.sending') : t('feedback.send')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-center space-y-4">
                <p className="text-sm text-nuraTextSecondary">{t('feedback.signInRequired')}</p>
                <button type="button" onClick={onSignIn} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors">
                  {t('feedback.signIn')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
