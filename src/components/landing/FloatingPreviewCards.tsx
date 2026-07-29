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
  ShieldCheck
} from 'lucide-react';

export const FloatingPreviewCards: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl lg:max-w-3xl mx-auto py-8">
      {/* 8. Soft Ambient Light: Behind ONLY the workspace, subtle radial glow, low opacity, blue with hint of teal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,rgba(20,184,166,0.08)_45%,transparent_70%)] blur-[80px] pointer-events-none -z-10" />

      {/* Main Composition Container */}
      <div className="relative">
        
        {/* Floating Highlight Card 1: Top-Left Visit Prep (Orbiting, Glass surface, soft shadow, tiny hover lift) */}
        <div className="absolute -top-16 -left-6 z-30 hidden sm:block animate-enter-floating">
          <div className="bg-white/90 backdrop-blur-2xl border border-white/90 rounded-2xl p-4 shadow-xl shadow-slate-900/8 flex items-center gap-3.5 hover:-translate-y-1 hover:shadow-2xl transition-all duration-180 ease-out animate-float cursor-default">
            <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-primary flex items-center justify-center border border-blue-100/60 shadow-sm">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-nuraText tracking-tight">Visit Preparation</p>
              <p className="text-[11px] text-nuraTextSecondary font-medium">Key questions structured</p>
            </div>
          </div>
        </div>

        {/* Floating Highlight Card 2: Bottom-Right Verification */}
        <div className="absolute -bottom-12 -right-4 z-30 hidden sm:block animate-enter-floating" style={{ animationDelay: '1.8s' }}>
          <div className="bg-white/90 backdrop-blur-2xl border border-white/90 rounded-2xl p-4 px-5 shadow-xl shadow-slate-900/8 flex items-center gap-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-180 ease-out animate-float-slow cursor-default">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-nuraText tracking-tight">Doctor Note Simplified</p>
              <p className="text-[11px] text-nuraTextSecondary font-medium">Clear clinical insights</p>
            </div>
          </div>
        </div>

        {/* 1. GLASS SURFACE & 2. DEPTH: CENTRAL WORKSPACE CONTAINER */}
        <div className="bg-white/75 backdrop-blur-2xl border border-white/90 rounded-[32px] shadow-[0_24px_60px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] overflow-hidden transition-all duration-300 hover:shadow-[0_30px_70px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,1)] animate-enter-workspace">
          
          {/* App / Workspace Top Header Bar */}
          <div className="bg-slate-50/70 border-b border-gray-100/80 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-blue-500/20">
                N
              </div>
              <span className="text-xs font-bold text-nuraText flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                Today's Consultation
              </span>
            </div>
            {/* 9. TINY MAGIC: Gentle shimmer across Active Session badge */}
            <div className="relative overflow-hidden px-3 py-1 rounded-full bg-blue-50/90 text-primary border border-blue-100/80 text-[11px] font-bold tracking-wide uppercase shadow-2xs">
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Active Session
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '12s' }} />
            </div>
          </div>

          {/* Workspace Sections Grid - Enhanced spacing and typography */}
          <div className="p-7 md:p-8 space-y-5">

            {/* Top Row: Symptoms & Follow-up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Section 1: Symptoms Logged (Card level hover + depth) */}
              <div className="bg-white/80 backdrop-blur-md border border-gray-100/90 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-180 ease-out animate-enter-symptoms">
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
                  <p className="text-xs text-nuraTextSecondary leading-relaxed line-clamp-2 font-normal">
                    Occasional morning headaches, energy dips post-noon.
                  </p>
                </div>
              </div>

              {/* Section 2: Follow-up Reminder */}
              <div className="bg-white/80 backdrop-blur-md border border-gray-100/90 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-180 ease-out animate-enter-symptoms" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-nuraTextSecondary uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Follow-up
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50/90 px-2 py-0.5 rounded-md border border-amber-100/80">
                    In 3 Days
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-bold text-nuraText">
                    Routine Cardiology Check
                  </p>
                  <div className="flex items-center text-xs text-nuraTextSecondary gap-1.5 pt-0.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-primary opacity-80" />
                    <span>Thursday, Oct 14 • 10:30 AM</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. ACTIVE CARD: Consultation Summary (Most important card, visually special, faint blue glow, subtle border, accent line) */}
            <div className="relative bg-gradient-to-br from-blue-50/40 via-white/90 to-teal-50/20 backdrop-blur-md border border-blue-200/60 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300/80 transition-all duration-180 ease-out animate-enter-summary group overflow-hidden">
              {/* Tiny accent top border line */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-blue-400 via-teal-400 to-transparent rounded-full" />
              
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-primary" />
                  Consultation Summary
                </span>
                <span className="text-[11px] font-medium text-nuraTextSecondary/70">Updated Today</span>
              </div>
              <p className="text-[13px] text-nuraText leading-relaxed font-normal">
                "Patient responded well to initial lifestyle adjustments. Blood pressure readings are stable. Adjusting dosage slightly to maintain evening consistency."
              </p>
            </div>

            {/* Bottom Row: Medicine Explained & Diagnostic Test */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Section 3: Medicine Explained */}
              <div className="bg-white/80 backdrop-blur-md border border-gray-100/90 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-180 ease-out animate-enter-medicine">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-nuraTextSecondary uppercase tracking-widest flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-600" />
                    Medicine
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded-md border border-blue-100/80">
                    10 mg • Daily
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-nuraText">Lisinopril</p>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-100/60">
                    @ 8:00 AM
                  </span>
                </div>
                <p className="text-xs text-nuraTextSecondary leading-relaxed font-normal">
                  Helps keep blood pressure balanced. Take with water.
                </p>
              </div>

              {/* Section 4: Diagnostic Test */}
              <div className="bg-white/80 backdrop-blur-md border border-gray-100/90 rounded-2xl p-5 space-y-3 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-180 ease-out animate-enter-diagnostic">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-nuraTextSecondary uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Results
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/90 px-2 py-0.5 rounded-md border border-emerald-100/80 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Normal
                  </span>
                </div>
                <p className="text-[13px] font-bold text-nuraText">
                  Metabolic Panel
                </p>
                <div className="flex items-center justify-between text-[11px] bg-slate-50/80 px-3 py-2 rounded-xl border border-gray-100/80">
                  <span className="text-nuraTextSecondary font-medium">Glucose Fasting</span>
                  <span className="font-bold text-nuraText">92 mg/dL</span>
                </div>
              </div>

            </div>

            {/* Section 5: Questions for Your Doctor */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-100/90 rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all duration-180 ease-out animate-enter-questions">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 shadow-xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-nuraText">Questions for Your Doctor</p>
                  <p className="text-xs text-nuraTextSecondary font-medium">3 questions prepared for next visit</p>
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

