import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Nura?",
    answer: "Nura is a patient companion that helps you understand your consultation, prescriptions, lab reports, and follow-up visits after leaving the doctor's office."
  },
  {
    question: "Is Nura a replacement for a doctor?",
    answer: "No. Nura is designed to help you better understand your healthcare information. Always follow the advice of your healthcare professional."
  },
  {
    question: "Does Nura diagnose illnesses?",
    answer: "No. Nura does not provide medical diagnoses. It explains information from your consultation and medical documents in simple language."
  },
  {
    question: "Can I upload my lab reports?",
    answer: "Yes. Upload supported laboratory reports to receive simplified explanations, highlighted findings, and reference ranges."
  },
  {
    question: "How does the follow-up visit work?",
    answer: "During a follow-up visit, Nura helps you review your recovery, organize your symptoms, prepare questions, and keep track of your healthcare journey."
  },
  {
    question: "Is my medical information private?",
    answer: "Yes. Your health information is stored securely and is only used to provide the features you choose to use. (Later, when you actually implement Supabase/auth, you can make this statement more specific.)"
  },
  {
    question: "Which medical documents are supported?",
    answer: "Nura currently supports consultation summaries, prescriptions, and common laboratory reports. Support for additional document types may be added in future versions."
  },
  {
    question: "Can I access previous consultations?",
    answer: "Yes. Your dashboard includes a health timeline where you can view previous consultations, prescriptions, lab reports, and follow-up visits in chronological order."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 md:py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/60 text-primary text-xs font-bold uppercase tracking-wider shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-nuraText leading-[1.15] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-nuraTextSecondary leading-relaxed font-normal opacity-90">
            Everything you need to know about how Nura helps you navigate your healthcare journey.
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
      </div>
    </section>
  );
};
