import React from 'react';
import { 
  Shield, 
  ArrowLeft, 
  Database, 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  Globe, 
  UserCheck, 
  Mail,
  Check
} from 'lucide-react';
import { LandingNavbar } from './LandingNavbar';
import { useTranslation } from 'react-i18next';

interface PrivacyPolicyProps {
  onBackToHome: () => void;
  onStartJourney: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBackToHome, onStartJourney }) => {
  const { t } = useTranslation();
  const collectItems = t('privacyPage.collectItems', { returnObjects: true }) as string[];
  const useItems = t('privacyPage.useItems', { returnObjects: true }) as string[];
  const thirdItems = t('privacyPage.thirdItems', { returnObjects: true }) as string[];
  return (
    <div className="min-h-screen bg-white text-nuraText font-sans relative selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      {/* Animated Ambient Light Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white">
        <div className="absolute -top-[40%] -left-[20%] w-[150vw] h-[60vh] bg-gradient-to-r from-[#3B82F6]/8 via-[#3B82F6]/4 to-transparent blur-[130px] animate-ribbon-1" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[150vw] h-[60vh] bg-gradient-to-l from-[#34D399]/8 via-[#34D399]/4 to-transparent blur-[130px] animate-ribbon-2" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingNavbar onStartJourney={onStartJourney} />

        <main className="flex-grow pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            
            {/* Back to Home Button */}
            <div className="mb-8 animate-fade-in">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-nuraTextSecondary bg-white border border-gray-200/80 rounded-xl shadow-xs hover:bg-gray-50 hover:text-nuraText transition-all duration-200 cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
                {t('privacyPage.back')}
              </button>
            </div>

            {/* Page Header */}
            <div className="text-left mb-16 space-y-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/60 text-primary text-xs font-bold uppercase tracking-wider shadow-xs">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>{t('privacyPage.badge')}</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-nuraText leading-[1.15] tracking-tight">
                {t('privacyPage.title')}
              </h1>
              
              <div className="flex items-center gap-2 text-xs font-semibold text-nuraTextSecondary uppercase tracking-wider pt-1">
                <span>{t('privacyPage.updated')}</span>
                <span className="text-primary bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100/50">{t('privacyPage.updatedValue')}</span>
              </div>

              <p className="text-base sm:text-lg text-nuraTextSecondary leading-relaxed font-normal opacity-95 pt-2 max-w-3xl">
                {t('privacyPage.intro')}
              </p>
            </div>

            {/* Content Cards */}
            <div className="space-y-8 animate-fade-in">
              
              {/* 1. Information We Collect */}
              <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 sm:p-10 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-nuraText">
                    {t('privacyPage.collect')}
                  </h2>
                </div>
                
                <p className="text-sm sm:text-base text-nuraTextSecondary mb-4">
                  {t('privacyPage.collectIntro')}
                </p>
                
                <ul className="space-y-3">
                  {collectItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-nuraTextSecondary/90">
                      <div className="mt-1.5 flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. How Your Information Is Used */}
              <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 sm:p-10 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-nuraText">
                    {t('privacyPage.use')}
                  </h2>
                </div>
                
                <p className="text-sm sm:text-base text-nuraTextSecondary mb-4">
                  {t('privacyPage.useIntro')}
                </p>
                
                <ul className="space-y-3">
                  {useItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-nuraTextSecondary/90">
                      <div className="mt-1.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Data Security */}
              <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 sm:p-10 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-nuraText">
                    {t('privacyPage.security')}
                  </h2>
                </div>
                
                <div className="space-y-4 text-sm sm:text-base text-nuraTextSecondary leading-relaxed">
                  <p className="font-semibold text-nuraText">
                    {t('privacyPage.securityText')}
                  </p>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-sm text-nuraTextSecondary">
                    <span className="font-semibold text-nuraText">{t('privacyPage.prototype')} </span>
                    {t('privacyPage.prototypeText')}
                  </div>
                </div>
              </div>

              {/* 4. Medical Disclaimer */}
              <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 sm:p-10 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-nuraText">
                    {t('privacyPage.disclaimer')}
                  </h2>
                </div>
                
                <div className="space-y-4 text-sm sm:text-base text-nuraTextSecondary leading-relaxed">
                  <p>
                    {t('privacyPage.disclaimerText')}
                  </p>
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 text-sm sm:text-base font-semibold text-amber-900">
                    {t('privacyPage.disclaimerStrong')}
                  </div>
                </div>
              </div>

              {/* 5. Third-Party Services */}
              <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 sm:p-10 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-nuraText">
                    {t('privacyPage.thirdParty')}
                  </h2>
                </div>
                
                <p className="text-sm sm:text-base text-nuraTextSecondary mb-4">
                  {t('privacyPage.thirdIntro')}
                </p>
                
                <ul className="space-y-3 mb-4">
                  {thirdItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-nuraTextSecondary/90">
                      <div className="mt-1.5 flex-shrink-0 w-4 h-4 rounded-full bg-purple-50 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-purple-600" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm sm:text-base text-nuraTextSecondary">
                  {t('privacyPage.thirdText')}
                </p>
              </div>

              {/* 6. Your Rights */}
              <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 sm:p-10 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-nuraText">
                    {t('privacyPage.rights')}
                  </h2>
                </div>
                
                <p className="text-sm sm:text-base text-nuraTextSecondary leading-relaxed">
                  {t('privacyPage.rightsText')}
                </p>
              </div>

              {/* 7. Contact */}
              <div className="bg-white border border-gray-200/80 rounded-[2rem] p-6 sm:p-10 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-nuraText">
                    {t('privacyPage.contact')}
                  </h2>
                </div>
                
                <div className="space-y-3 text-sm sm:text-base text-nuraTextSecondary leading-relaxed">
                  <p>
                    {t('privacyPage.contactText')}
                  </p>
                  <div>
                    <span className="font-semibold text-nuraText">{t('privacyPage.email')}</span>
                    <span className="ml-2 text-nuraTextSecondary">{t('privacyPage.comingSoon')}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
