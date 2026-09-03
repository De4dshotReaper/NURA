import React from 'react';
import { Bell, Shield, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 bg-nuraSurface/90 backdrop-blur-md border-b border-nuraBorder px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/pwa-192x192.png" alt="" className="w-10 h-10 rounded-2xl object-contain shadow-sm shadow-primary/30" />
        <div>
          <span className="font-heading font-extrabold text-xl text-nuraText tracking-tight">Nura</span>
          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-primary border border-blue-200/50">{t('nav.patientCompanion')}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs text-nuraTextSecondary bg-nuraBg px-3 py-1.5 rounded-xl border border-nuraBorder">
          <Shield className="w-3.5 h-3.5 text-secondary" />
          <span>{t('legacyNav.private')}</span>
        </div>
        
        <button 
          className="p-2.5 text-nuraTextSecondary hover:text-nuraText rounded-xl hover:bg-nuraBg relative transition-colors"
          aria-label={t('legacyNav.notifications')}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary"></span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-nuraBorder">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-primary font-bold flex items-center justify-center text-sm">
            JD
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-nuraText">Jane Doe</div>
            <div className="text-[10px] text-nuraTextSecondary">{t('legacyNav.profile')}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
