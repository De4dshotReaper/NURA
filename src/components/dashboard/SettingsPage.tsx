import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, LogOut, UserRound } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface SettingsPageProps {
  fullName: string;
  email: string;
  onBackToDashboard: () => void;
  onUserUpdated: (user: User) => void;
  onSignedOut: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  fullName,
  email,
  onBackToDashboard,
  onUserUpdated,
  onSignedOut,
}) => {
  const [name, setName] = useState(fullName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    setName(fullName);
  }, [fullName]);

  const handleSaveName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSavingName) return;

    const trimmedName = name.trim();
    setNameError(null);
    setNameSuccess(null);

    if (!trimmedName) {
      setNameError('Please enter your full name.');
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
        setNameError('Nura couldn’t update your name. Please try again.');
        return;
      }

      setName(trimmedName);
      onUserUpdated(data.user);
      setNameSuccess('Your name has been updated.');
    } catch (error) {
      console.error('Unexpected error updating account full name:', error);
      setNameError('Nura couldn’t update your name. Please try again.');
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
        setSignOutError('Nura couldn’t sign you out. Please try again.');
        return;
      }

      onSignedOut();
    } catch (error) {
      console.error('Unexpected error signing out of Nura:', error);
      setSignOutError('Nura couldn’t sign you out. Please try again.');
    } finally {
      setIsSigningOut(false);
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
        Back to Dashboard
      </button>

      <header className="space-y-3">
        <div className="inline-flex rounded-full bg-blue-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-primary">
          SETTINGS
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-nuraText">
          Settings
        </h1>
        <p className="text-base sm:text-lg text-nuraTextSecondary">Manage your Nura account.</p>
      </header>

      <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-nuraText">Profile</h2>
            <p className="text-xs text-nuraTextSecondary">Your personal account information.</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="settings-full-name" className="text-xs font-semibold uppercase tracking-wider text-nuraTextSecondary">
              Full name
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
              {isSavingName ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="mb-7">
          <h2 className="font-heading text-lg font-bold text-nuraText">Account</h2>
          <p className="text-xs text-nuraTextSecondary">Your sign-in information and account access.</p>
        </div>

        <div className="space-y-2 pb-7">
          <span className="text-xs font-semibold uppercase tracking-wider text-nuraTextSecondary">Email</span>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-nuraText">
            {email}
          </div>
          <p className="text-xs text-nuraTextSecondary/70">Email changes aren&apos;t available in this prototype.</p>
        </div>

        <div className="flex flex-col gap-5 border-t border-gray-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h3 className="font-heading text-base font-bold text-nuraText">Sign out of Nura</h3>
            <p className="max-w-lg text-sm leading-relaxed text-nuraTextSecondary">
              You&apos;ll need to sign in again to access your health records.
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
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </section>
    </div>
  );
};
