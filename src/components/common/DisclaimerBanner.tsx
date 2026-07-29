import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <aside aria-label="Medical Disclaimer" className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-center gap-2 text-center transition-all">
      <Info className="w-4 h-4 text-amber-600 shrink-0" />
      <span>
        <strong>Nura is not a doctor or diagnosis tool.</strong> We only help you organize and understand information provided by your healthcare professionals. Always consult your doctor for medical advice.
      </span>
    </aside>
  );
};
