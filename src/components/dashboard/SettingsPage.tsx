import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, LogOut, UserRound, Phone } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import { isSupportedLanguage, supportedLanguages, type SupportedLanguage } from '../../i18n';
import { normalizeSmsPhone } from '../../lib/emergency';

interface SettingsPageProps {
  fullName: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  onBackToDashboard: () => void;
  onUserUpdated: (user: User) => void;
  onSignedOut: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  fullName,
  email,
  emergencyContactName,
  emergencyContactPhone,
  onBackToDashboard,
  onUserUpdated,
  onSignedOut,
}) => {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState(fullName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const [contactName, setContactName] = useState(emergencyContactName);
  const [contactPhone, setContactPhone] = useState(emergencyContactPhone);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [isSavingContact, setIsSavingContact] = useState(false);

  useEffect(() => {
    setName(fullName);
  }, [fullName]);

  useEffect(() => { setContactName(emergencyContactName); }, [emergencyContactName]);
  useEffect(() => { setContactPhone(emergencyContactPhone); }, [emergencyContactPhone]);

  const handleSaveContact = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedPhone = normalizeSmsPhone(contactPhone);
    setContactError(null);
    setContactSuccess(null);
    if (!contactName.trim()) { setContactError(t('emergency.nameRequired')); return; }
    if (!normalizedPhone) { setContactError(t('emergency.phoneInvalid')); return; }
    setIsSavingContact(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: {
        emergency_contact_name: contactName.trim(),
        emergency_contact_phone: normalizedPhone,
      } });
      if (error) { setContactError(t('emergency.saveError')); return; }
      setContactName(contactName.trim()); setContactPhone(normalizedPhone);
      onUserUpdated(data.user); setContactSuccess(t('emergency.saved'));
    } catch { setContactError(t('emergency.saveError')); }
    finally { setIsSavingContact(false); }
  };

  const handleSaveName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSavingName) return;

    const trimmedName = name.trim();
    setNameError(null);
    setNameSuccess(null);

    if (!trimmedName) {
      setNameError(t('settings.nameRequired'));
      return;
    }

    setIsSavingName(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
        },
      });

      if (error) {
        console.error('Failed to update account full name:', error);
        setNameError(t('settings.nameError'));
        return;
      }

      setName(trimmedName);
      onUserUpdated(data.user);
      setNameSuccess(t('settings.nameUpdated'));
    } catch (error) {
      console.error('Unexpected error updating account full name:', error);
      setNameError(t('settings.nameError'));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Failed to sign out of Nura:', error);
        setSignOutError(t('settings.signOutError'));
        return;
      }

      onSignedOut();
    } catch (error) {
      console.error('Unexpected error signing out of Nura:', error);
      setSignOutError(t('settings.signOutError'));
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (isSavingLanguage || language === i18n.language) return;
    const previousLanguage = isSupportedLanguage(i18n.language) ? i18n.language : 'en';
    setLanguageError(null);
    await i18n.changeLanguage(language);
    setIsSavingLanguage(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: { language } });
      if (error) {
        console.error('Failed to persist account language:', error);
        await i18n.changeLanguage(previousLanguage);
        setLanguageError(t('settings.languageError'));
        return;
      }
      onUserUpdated(data.user);
    } catch (error) {
      console.error('Unexpected error persisting account language:', error);
      await i18n.changeLanguage(previousLanguage);
      setLanguageError(t('settings.languageError'));
    } finally {
      setIsSavingLanguage(false);
    }
  };

  return (
    <div className="max-w-3xl mr-auto space-y-8">
      <button
        type="button"
        onClick={onBackToDashboard}
        className="inline-flex items-center gap-2 text-sm font-semibold text-nuraTextSecondary hover:text-primary transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        {t('common.backDashboard')}
      </button>

      <header className="space-y-3">
        <div className="inline-flex rounded-full bg-blue-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-primary">
          {t('settings.eyebrow')}
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-nuraText">
          {t('settings.title')}
        </h1>
        <p className="text-base sm:text-lg text-nuraTextSecondary">{t('settings.subtitle')}</p>
      </header>

      <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-nuraText">{t('settings.profile')}</h2>
            <p className="text-xs text-nuraTextSecondary">{t('settings.profileHelp')}</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="settings-full-name" className="text-xs font-semibold uppercase tracking-wider text-nuraTextSecondary">
              {t('settings.fullName')}
            </label>
            <input
              id="settings-full-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError(null);
                setNameSuccess(null);
              }}
              disabled={isSavingName}
              autoComplete="name"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-nuraText outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50 disabled:opacity-70"
            />
            {nameError && <p className="text-xs font-semibold text-red-700" role="alert">{nameError}</p>}
            {nameSuccess && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700" role="status">
                <CheckCircle2 className="h-4 w-4" />
                {nameSuccess}
              </p>
            )}
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={isSavingName}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingName ? t('common.saving') : t('settings.saveName')}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-red-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="mb-7 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700"><Phone className="h-5 w-5" /></div><div><h2 className="font-heading text-lg font-bold text-nuraText">{t('emergency.contactSection')}</h2><p className="text-xs text-nuraTextSecondary">{t('emergency.usedForHelp')}</p></div></div>
        <form onSubmit={handleSaveContact} className="space-y-5">
          <div className="space-y-2"><label htmlFor="emergency-name" className="text-xs font-semibold uppercase tracking-wider text-nuraTextSecondary">{t('emergency.contactName')}</label><input id="emergency-name" type="text" value={contactName} disabled={isSavingContact} onChange={(e) => { setContactName(e.target.value); setContactError(null); setContactSuccess(null); }} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></div>
          <div className="space-y-2"><label htmlFor="emergency-phone" className="text-xs font-semibold uppercase tracking-wider text-nuraTextSecondary">{t('emergency.contactPhone')}</label><input id="emergency-phone" type="tel" inputMode="tel" autoComplete="tel" value={contactPhone} disabled={isSavingContact} onChange={(e) => { setContactPhone(e.target.value); setContactError(null); setContactSuccess(null); }} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></div>
          {contactError && <p className="text-xs font-semibold text-red-700" role="alert">{contactError}</p>}
          {contactSuccess && <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700" role="status"><CheckCircle2 className="h-4 w-4" />{contactSuccess}</p>}
          <div className="flex justify-end border-t border-gray-100 pt-5"><button type="submit" disabled={isSavingContact} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{isSavingContact ? t('common.saving') : t('emergency.saveContact')}</button></div>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="mb-5">
          <h2 className="font-heading text-lg font-bold text-nuraText">{t('settings.language')}</h2>
          <p className="text-xs text-nuraTextSecondary">{t('settings.languageHelp')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {supportedLanguages.map((language) => (
            <button key={language} type="button" disabled={isSavingLanguage} onClick={() => void handleLanguageChange(language)} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${i18n.language === language ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 bg-white text-nuraTextSecondary hover:border-primary/40 hover:text-nuraText'} disabled:opacity-50`}>
              {t(`language.${language}`)}
            </button>
          ))}
        </div>
        {languageError && <p className="mt-3 text-xs font-semibold text-red-700" role="alert">{languageError}</p>}
      </section>

      <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="mb-7">
          <h2 className="font-heading text-lg font-bold text-nuraText">{t('settings.account')}</h2>
          <p className="text-xs text-nuraTextSecondary">{t('settings.accountHelp')}</p>
        </div>

        <div className="space-y-2 pb-7">
          <span className="text-xs font-semibold uppercase tracking-wider text-nuraTextSecondary">{t('settings.email')}</span>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-nuraText">
            {email}
          </div>
          <p className="text-xs text-nuraTextSecondary/70">{t('settings.emailHelp')}</p>
        </div>

        <div className="flex flex-col gap-5 border-t border-gray-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h3 className="font-heading text-base font-bold text-nuraText">{t('settings.signOutTitle')}</h3>
            <p className="max-w-lg text-sm leading-relaxed text-nuraTextSecondary">
              {t('settings.signOutHelp')}
            </p>
            {signOutError && <p className="text-xs font-semibold text-red-700" role="alert">{signOutError}</p>}
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? t('settings.signingOut') : t('settings.signOut')}
          </button>
        </div>
      </section>
    </div>
  );
};
