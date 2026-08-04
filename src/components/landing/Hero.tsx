import React from 'react';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { FloatingPreviewCards } from './FloatingPreviewCards';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Two-column desktop, Single-column mobile layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* LEFT SIDE CONTENT - Visual Balance Refinement (Increased width by ~15% to lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-12 md:space-y-16 text-left animate-enter-hero">
            
            {/* Small Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50/50 border border-blue-100/50 text-primary text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Built Around Real Doctor Visits</span>
            </div>

            {/* Main Headline - Preferred visual rhythm */}
            <div className="space-y-10">
              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-nuraText leading-[1.08] tracking-tight">
                Understand Your<br className="hidden sm:inline" /> Healthcare Journey<br className="hidden sm:inline" /> With Confidence.
              </h1>

              {/* Subheading - Warmer, concise copy */}
              <p className="font-sans text-base sm:text-lg text-nuraTextSecondary leading-relaxed max-w-xl font-normal opacity-95">
                Doctor visits can be overwhelming, and it's easy to forget important details afterwards. Nura helps you stay organised, understand your care, and leave every appointment feeling informed and confident.
              </p>
            </div>

            {/* Buttons - Polished premium sizing and transition */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 pt-4">
              {/* Primary Button */}
              <a
                href="#get-started"
                className="inline-flex items-center justify-center px-14 py-3.5 text-base font-semibold text-white bg-primary rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out gap-2 group"
              >
                Start Your Health Journey
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </a>

              {/* Secondary Button */}
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-10 py-3.5 text-base font-medium text-nuraText bg-white border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50/80 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out gap-2 text-nuraTextSecondary hover:text-nuraText"
              >
                <Play className="w-4 h-4 text-primary fill-primary/20" />
                See How It Works
              </a>
            </div>

          </div>

          {/* RIGHT SIDE - Workspace preview */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end mt-12 lg:mt-0">
            <FloatingPreviewCards />
          </div>

        </div>
      </div>
    </section>
  );
};
