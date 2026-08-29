import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ChevronRight, Clock } from 'lucide-react';

export interface TimelineEventCardData {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ElementType;
  details?: string[];
  badge?: string;
  badgeColor?: string;
  relationshipLabel?: string | null;
  actionLabel?: string;
  onAction?: () => void;
}

interface TimelineEventCardProps {
  event: TimelineEventCardData;
  expanded: boolean;
  isLastInGroup: boolean;
  onToggle: () => void;
  formatDate: (timestamp: string) => string;
  formatTime: (timestamp: string) => string;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  expanded,
  isLastInGroup,
  onToggle,
  formatDate,
  formatTime,
}) => {
  const Icon = event.icon;

  return (
    <React.Fragment>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onToggle}
        className="bg-white rounded-[1.5rem] p-5 sm:p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.025)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-primary/30 transition-all duration-200 cursor-pointer group relative"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraText group-hover:text-primary group-hover:bg-blue-50/70 transition-colors shrink-0 mt-0.5">
              <Icon className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-heading font-bold text-base sm:text-lg text-nuraText group-hover:text-primary transition-colors">{event.title}</h3>
                {event.badge && <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${event.badgeColor}`}>{event.badge}</span>}
                {event.relationshipLabel && <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gray-200/80 bg-gray-50 text-nuraTextSecondary">{event.relationshipLabel}</span>}
              </div>
              <p className="font-sans text-xs sm:text-sm text-nuraTextSecondary leading-relaxed">{event.description}</p>
              <div className="flex items-center gap-2 text-xs font-medium text-nuraTextSecondary/70 pt-1">
                <Clock className="w-3.5 h-3.5 opacity-70" />
                <span>{formatDate(event.timestamp)} • {formatTime(event.timestamp)}</span>
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-nuraTextSecondary group-hover:text-nuraText transition-colors shrink-0 self-center">
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {expanded && ((event.details?.length ?? 0) > 0 || event.onAction) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 rounded-xl p-4 space-y-3">
            {event.details && event.details.length > 0 && (
              <>
                <div className="text-xs font-semibold text-nuraTextSecondary uppercase tracking-wider">Event Details</div>
                <ul className="space-y-1.5">
                  {event.details.map((detail, index) => <li key={index} className="text-xs sm:text-sm text-nuraText flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" /><span>{detail}</span></li>)}
                </ul>
              </>
            )}
            {event.onAction && event.actionLabel && (
              <button type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); event.onAction?.(); }} className="text-sm font-semibold text-primary hover:text-blue-600 transition-colors">{event.actionLabel} →</button>
            )}
          </motion.div>
        )}
      </motion.div>
      {!isLastInGroup && <div className="flex justify-center py-3 text-primary/45"><ArrowDown className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} /></div>}
    </React.Fragment>
  );
};
