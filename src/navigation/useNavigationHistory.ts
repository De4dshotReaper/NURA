import { useCallback, useState } from 'react';

export type AppView = 'landing' | 'privacy' | 'login' | 'onboarding-1' | 'next-flow' | 'severity-selection' | 'duration-selection' | 'new-illness-summary' | 'consultation-transition' | 'duration-complete' | 'dashboard' | 'follow-up-selection' | 'follow-up-intake' | 'questions-selection' | 'consultation-selection';

export interface NavigationState {
  view: AppView;
  dashboardItem?: string;
  prescriptionId?: string | null;
  labReportId?: string | null;
  healthEpisodeId?: string | null;
  questionSymptomEntryId?: string | null;
  consultationSymptomEntryId?: string | null;
}

interface HistoryState {
  past: NavigationState[];
  current: NavigationState;
  future: NavigationState[];
}

const landingState: NavigationState = { view: 'landing' };

export const useNavigationHistory = () => {
  const [history, setHistory] = useState<HistoryState>({ past: [], current: landingState, future: [] });

  const navigate = useCallback((destination: NavigationState) => {
    setHistory((value) => ({ past: [...value.past, value.current], current: destination, future: [] }));
  }, []);

  const back = useCallback(() => {
    setHistory((value) => {
      if (!value.past.length) return value;
      const previous = value.past[value.past.length - 1];
      return { past: value.past.slice(0, -1), current: previous, future: [value.current, ...value.future] };
    });
  }, []);

  const forward = useCallback(() => {
    setHistory((value) => {
      if (!value.future.length) return value;
      const [next, ...future] = value.future;
      return { past: [...value.past, value.current], current: next, future };
    });
  }, []);

  const reset = useCallback((destination: NavigationState = landingState) => {
    setHistory({ past: [], current: destination, future: [] });
  }, []);

  return { current: history.current, navigate, back, forward, reset, canGoBack: history.past.length > 0, canGoForward: history.future.length > 0 };
};
