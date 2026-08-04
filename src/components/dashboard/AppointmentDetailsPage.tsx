import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, ArrowLeft, CheckCircle2, AlertCircle, Phone } from 'lucide-react';

interface AppointmentDetailsPageProps {
  onBackToDashboard?: () => void;
}

export const AppointmentDetailsPage: React.FC<AppointmentDetailsPageProps> = ({
  onBackToDashboard
}) => {
  const [isCancelled, setIsCancelled] = useState(false);

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
          APPOINTMENT DETAILS
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-nuraText tracking-tight leading-tight">
          Upcoming Appointment
        </h1>
        <p className="font-sans text-base sm:text-lg text-nuraTextSecondary max-w-2xl leading-relaxed font-medium">
          Review your scheduled consultation details, venue information, and preparation guidelines.
        </p>
      </div>

      {!isCancelled ? (
        <div className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8">
          {/* STATUS BADGE */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-heading font-bold text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                Confirmed Appointment
              </span>
            </div>
            <span className="text-xs text-nuraTextSecondary font-medium">Ref ID: #APT-84920</span>
          </div>

          {/* DOCTOR INFO */}
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50/80 text-primary flex items-center justify-center font-heading font-extrabold text-2xl shrink-0 shadow-xs">
              DJ
            </div>
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-nuraText">
                Dr. Sarah Jenkins
              </h2>
              <p className="text-sm font-semibold text-primary">
                General Medicine Specialist
              </p>
              <p className="text-xs text-nuraTextSecondary">
                City Health Medical Center • Department of Internal Medicine
              </p>
            </div>
          </div>

          {/* DATE & LOCATION GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-nuraTextSecondary uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Date & Time</span>
              </div>
              <p className="font-heading font-bold text-base text-nuraText">
                Thursday, 3 August 2026
              </p>
              <div className="flex items-center gap-1.5 text-xs text-nuraTextSecondary">
                <Clock className="w-3.5 h-3.5" />
                <span>10:30 AM (Duration: ~30 mins)</span>
              </div>
            </div>

            <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-nuraTextSecondary uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Location</span>
              </div>
              <p className="font-heading font-bold text-base text-nuraText">
                City Health Clinic
              </p>
              <p className="text-xs text-nuraTextSecondary">
                Suite 402, Building B, 124 Health Park Way
              </p>
            </div>
          </div>

          {/* PREPARATION INSTRUCTIONS */}
          <div className="space-y-3 pt-2">
            <h3 className="font-heading font-bold text-base text-nuraText">
              Appointment Preparation Checklist
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-nuraTextSecondary">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Arrive 10-15 minutes prior to your scheduled time slot.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Bring your photo ID and valid insurance card.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Have your latest symptom log and lab reports ready on Nura.</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setIsCancelled(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
            >
              Cancel Appointment
            </button>
            <div className="flex items-center gap-3">
              <a
                href="tel:+18005550199"
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-nuraText hover:border-primary transition-colors inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-nuraTextSecondary" />
                <span>Call Clinic</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[1.75rem] p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-heading font-bold text-base text-nuraText">
              Appointment Cancelled
            </h3>
            <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">
              This appointment has been cancelled. You can schedule a new appointment from your dashboard anytime.
            </p>
          </div>
          <button
            onClick={() => setIsCancelled(false)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Restore Scheduled Appointment
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentDetailsPage;
