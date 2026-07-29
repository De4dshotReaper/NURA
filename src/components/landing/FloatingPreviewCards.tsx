import React from 'react';
import {
  Activity,
  Pill,
  FileText,
  Calendar,
  CheckCircle2,
  Sparkles,
  Clock,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  Bell
} from 'lucide-react';

export const FloatingPreviewCards: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl lg:max-w-3xl mx-auto py-6">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/20 via-teal-100/25 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Main Composition Container */}
      <div className="relative">
        
        {/* Floating Highlight Card 1: Top-Left Visit Prep */}
        <div className="absolute -top-10 -left-6 z-30 hidden sm:block animate-enter-floating">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-4 shadow-xl shadow-slate-900/5 flex items-center gap-3.5 hover:scale-105 transition-transform duration-500 animate-float">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-nuraText">Visit Preparation</p>
              <p className="text-[11px] text-nuraTextSecondary">Key questions structured</p>
            </div>
          </div>
        </div>

        {/* Floating Highlight Card 2: Bottom-Right Verification */}
        <div className="absolute -bottom-10 -right-4 z-30 hidden sm:block animate-enter-floating" style={{ animationDelay: '1.8s' }}>
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-4 px-5 shadow-xl shadow-slate-900/5 flex items-center gap-3 hover:scale-105 transition-transform duration-500 animate-float-slow">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-nuraText">Doctor Note Simplified</span>
          </div>
        </div>

        {/* CENTRAL WORKSPACE CARD - Enhanced internal spacing and premium polish */}
        <div className="bg-white/95 backdrop-blur-2xl border border-gray-300/70 rounded-[32px] shadow-2xl shadow-slate-900/12 overflow-hidden transition-all duration-500 hover:shadow-slate-900/15 animate-enter-workspace">
          
          {/* App / Workspace Top Header Bar */}
          <div className="bg-slate-50/80 border-b border-gray-200/60 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
                N
              </div>
              <span className="text-xs font-bold text-nuraText flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                Today's Consultation
              </span>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 tracking-wide uppercase">
              Active Session
            </span>
          </div>

          {/* Workspace Sections Grid - Improved breathing room */}
          <div className="p-7 md:p-9 space-y-6">

            {/* Top Row: Symptoms & Follow-up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Section 1: Symptoms Logged */}
              <div className="bg-slate-50/50 border border-gray-100/80 rounded-2xl p-5 space-y-3 animate-enter-symptoms">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-nuraTextSecondary uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    Symptoms Logged
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-bold text-nuraText">
                    Mild Tension & Sleep Fatigue
                  </p>
                  <p className="text-xs text-nuraTextSecondary leading-relaxed line-clamp-2">
                    Occasional morning headaches, energy dips post-noon.
                  </p>
                </div>
              </div>

              {/* Section 2: Follow-up Reminder */}
              <div className="bg-slate-50/50 border border-gray-100/80 rounded-2xl p-5 space-y-3 animate-enter-symptoms" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-nuraTextSecondary uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Follow-up
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    In 3 Days
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-bold text-nuraText">
                    Routine Cardiology Check
                  </p>
                  <div className="flex items-center text-xs text-nuraTextSecondary gap-1.5 pt-0.5">
                    <Clock className="w-3.5 h-3.5 text-primary opacity-80" />
                    <span>Thursday, Oct 14 • 10:30 AM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Row: Consultation Summary */}
            <div className="bg-blue-50/20 border border-blue-100/50 rounded-2xl p-6 space-y-3 animate-enter-summary">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-primary" />
                  Consultation Summary
                </span>
                <span className="text-[11px] font-medium text-nuraTextSecondary/60">Updated Today</span>
              </div>
              <p className="text-[13px] text-nuraText leading-relaxed">
                "Patient responded well to initial lifestyle adjustments. Blood pressure readings are stable. Adjusting dosage slightly to maintain evening consistency."
              </p>
            </div>

            {/* Bottom Row: Medicine Explained & Diagnostic Test */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Section 3: Medicine Explained */}
              <div className="bg-slate-50/50 border border-gray-100/80 rounded-2xl p-5 space-y-3 animate-enter-medicine">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-nuraTextSecondary uppercase tracking-widest flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-600" />
                    Medicine
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    10 mg • Daily
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-nuraText">Lisinopril</p>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    @ 8:00 AM
                  </span>
                </div>
                <p className="text-xs text-nuraTextSecondary leading-relaxed">
                  Helps keep blood pressure balanced. Take with water.
                </p>
              </div>

              {/* Section 4: Diagnostic Test */}
              <div className="bg-slate-50/50 border border-gray-100/80 rounded-2xl p-5 space-y-3 animate-enter-diagnostic">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-nuraTextSecondary uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Results
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Normal
                  </span>
                </div>
                <p className="text-[13px] font-bold text-nuraText">
                  Metabolic Panel
                </p>
                <div className="flex items-center justify-between text-[11px] bg-white/80 px-3 py-1.5 rounded-xl border border-gray-100/80">
                  <span className="text-nuraTextSecondary font-medium">Glucose Fasting</span>
                  <span className="font-bold text-nuraText">92 mg/dL</span>
                </div>
              </div>

            </div>

            {/* Section 5: Questions for Your Doctor */}
            <div className="bg-slate-50/50 border border-gray-100/80 rounded-2xl p-5 flex items-center justify-between animate-enter-questions">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-nuraText">Questions for Your Doctor</p>
                  <p className="text-xs text-nuraTextSecondary">3 questions prepared for next visit</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer group">
                <span>View All</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
