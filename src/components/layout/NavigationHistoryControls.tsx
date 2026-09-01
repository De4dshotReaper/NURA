import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationHistoryControlsProps {
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  className?: string;
}

export const NavigationHistoryControls: React.FC<NavigationHistoryControlsProps> = ({
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  className = '',
}) => (
  <div
    className={`flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-lg shadow-slate-900/10 backdrop-blur-md ${className}`}
    aria-label="Application navigation history"
  >
    <button
      type="button"
      onClick={onBack}
      disabled={!canGoBack}
      aria-label="Back"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-nuraTextSecondary transition-colors hover:bg-blue-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={onForward}
      disabled={!canGoForward}
      aria-label="Forward"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-nuraTextSecondary transition-colors hover:bg-blue-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
    >
      <ArrowRight className="h-4 w-4" />
    </button>
  </div>
);
