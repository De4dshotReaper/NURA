import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DisclaimerBanner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <aside aria-label={t('disclaimer.label')} className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-center gap-2 text-center transition-all">
      <Info className="w-4 h-4 text-amber-600 shrink-0" />
      <span>
        <strong>{t('disclaimer.strong')}</strong> {t('disclaimer.text')}
      </span>
    </aside>
  );
};
