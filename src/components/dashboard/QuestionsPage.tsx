import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowLeft, Send, CheckCircle2, MessageSquare, Lightbulb } from 'lucide-react';

interface QuestionsPageProps {
  onBackToDashboard?: () => void;
}

export const QuestionsPage: React.FC<QuestionsPageProps> = ({
  onBackToDashboard
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [askedQuestions, setAskedQuestions] = useState<string[]>([
    'How long should I expect these symptoms to last?',
    'Are there any side effects from the prescribed medication I should watch out for?',
    'When should I schedule a follow-up appointment?'
  ]);
  const [suggestedQuestions] = useState<string[]>([
    'Is it safe to continue my regular physical activity?',
    'Should I make any dietary changes while recovering?',
    'What symptoms indicate I need to seek urgent care?'
  ]);

  const handleAddQuestion = (q: string) => {
    if (!q.trim()) return;
    setAskedQuestions([...askedQuestions, q.trim()]);
    setCustomQuestion('');
  };

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
      </div>

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
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion(customQuestion)}
            placeholder="Type your question for the doctor..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-nuraText placeholder:text-nuraTextSecondary/50 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={() => handleAddQuestion(customQuestion)}
            className="px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Add</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MY PREPARED QUESTIONS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-xl text-nuraText tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>My Prepared Questions ({askedQuestions.length})</span>
          </h2>
        </div>

        {askedQuestions.length > 0 ? (
          <div className="space-y-3">
            {askedQuestions.map((q, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[1.25rem] p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-start gap-3.5"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-nuraText leading-relaxed">{q}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[1.75rem] p-10 text-center border border-gray-100 text-nuraTextSecondary text-sm">
            No questions added yet. Choose from suggestions below or type your own above.
          </div>
        )}
      </div>

      {/* SUGGESTED QUESTIONS */}
      <div className="space-y-4 pt-2">
        <h2 className="font-heading font-extrabold text-xl text-nuraText tracking-tight flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Suggested Questions</span>
        </h2>
        <p className="text-xs sm:text-sm text-nuraTextSecondary">
          Tap any suggested question to add it to your consultation list.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {suggestedQuestions.map((sq, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.005 }}
              onClick={() => handleAddQuestion(sq)}
              className="bg-gray-50/80 hover:bg-blue-50/60 rounded-[1.25rem] p-4 sm:p-5 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between group"
            >
              <span className="text-xs sm:text-sm font-medium text-nuraText group-hover:text-primary transition-colors">
                {sq}
              </span>
              <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                + Add
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionsPage;
