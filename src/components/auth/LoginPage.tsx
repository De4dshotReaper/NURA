import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { supabase } from '../../lib/supabase';

interface LoginPageProps {
  onBackToHome: () => void;
  onStartJourney?: () => void;
  onLoginSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToHome,
  onLoginSuccess,
  initialMode = 'signin',
}) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(initialMode === 'signup');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  
  // Validation and feedback states
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setAuthError('');
    setSuccessMessage('');

    if (isSignUp && !fullName.trim()) {
      setNameError('Please enter your full name.');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setAuthError('');
    setSuccessMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          setAuthError(error.message);
        } else {
          setSuccessMessage('Account created successfully! Redirecting to dashboard...');
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess();
          }, 1000);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAuthError(error.message);
        } else {
          setSuccessMessage('Signed in successfully! Redirecting...');
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess();
          }, 600);
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-nuraText font-sans relative selection:bg-primary/10 selection:text-primary overflow-x-hidden flex flex-col justify-between">
      {/* Animated Ambient Light Background Effect (Apple Health / OS style) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white">
        {/* Ribbon 1: Nura Primary Blue (#3B82F6) from top-left corner */}
        <div className="absolute -top-[40%] -left-[20%] w-[150vw] h-[60vh] bg-gradient-to-r from-[#3B82F6]/8 via-[#3B82F6]/4 to-transparent blur-[130px] animate-ribbon-1" />
        {/* Ribbon 2: Soft Mint Green (#34D399) from bottom-right corner */}
        <div className="absolute -bottom-[40%] -right-[20%] w-[150vw] h-[60vh] bg-gradient-to-l from-[#34D399]/8 via-[#34D399]/4 to-transparent blur-[130px] animate-ribbon-2" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar with Back Button */}
        <header className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-8 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-nuraTextSecondary bg-white border border-gray-200/80 rounded-xl shadow-xs hover:bg-gray-50 hover:text-nuraText transition-all duration-200 cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          {/* Minimal Nura Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); onBackToHome(); }} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition-all">
              <span className="font-heading font-bold text-xl leading-none">N</span>
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-nuraText group-hover:text-primary transition-colors">
              Nura
            </span>
          </a>
        </header>

        {/* Main Content Area: Centered Login Card */}
        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md bg-white border border-gray-200/80 rounded-[2.55rem] p-8 sm:p-10 shadow-2xl shadow-blue-500/10 animate-fade-up">
            
            {/* Branding Header Inside Card */}
            <div className="text-center mb-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary mx-auto shadow-sm">
                <span className="font-heading font-bold text-2xl leading-none">N</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-nuraText tracking-tight">
                {isSignUp ? 'Create your Nura account' : 'Welcome back to Nura'}
              </h1>
              <p className="text-sm text-nuraTextSecondary font-medium">
                {isSignUp
                  ? 'Start organizing your healthcare journey today'
                  : 'Sign in to access your consultations, prescriptions, and lab reports'}
              </p>
            </div>

            {/* Error Feedback Banner */}
            {authError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-3 animate-fade-in text-left">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-900">Authentication Error</p>
                  <p className="text-xs text-red-700 leading-relaxed">{authError}</p>
                </div>
              </div>
            )}

            {/* Success Feedback Banner */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 animate-fade-in text-left">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-900">Success</p>
                  <p className="text-xs text-emerald-700 leading-relaxed">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-nuraText uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={loading}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 bg-white border rounded-xl font-sans text-sm text-nuraText placeholder:text-nuraTextSecondary/40 focus:outline-none focus:ring-4 transition-all disabled:opacity-50 ${
                      nameError
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-gray-200/90 focus:border-primary focus:ring-primary/15'
                    }`}
                  />
                  {nameError && (
                    <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {nameError}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-nuraText uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nuraTextSecondary/50">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled={loading}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl font-sans text-sm text-nuraText placeholder:text-nuraTextSecondary/40 focus:outline-none focus:ring-4 transition-all disabled:opacity-50 ${
                      emailError
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-gray-200/90 focus:border-primary focus:ring-primary/15'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-nuraText uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nuraTextSecondary/50">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    disabled={loading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="At least 6 characters"
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl font-sans text-sm text-nuraText placeholder:text-nuraTextSecondary/40 focus:outline-none focus:ring-4 transition-all disabled:opacity-50 ${
                      passwordError
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15'
                        : 'border-gray-200/90 focus:border-primary focus:ring-primary/15'
                    }`}
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {passwordError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            {/* Switch between Sign In and Create Account */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-nuraTextSecondary">
                {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setEmailError('');
                    setPasswordError('');
                    setNameError('');
                    setAuthError('');
                    setSuccessMessage('');
                  }}
                  className="font-semibold text-primary hover:underline ml-1 cursor-pointer focus:outline-none disabled:opacity-50"
                >
                  {isSignUp ? 'Sign In' : 'Create account'}
                </button>
              </p>
            </div>

          </div>
        </main>

        {/* Footer info */}
        <footer className="py-6 text-center text-xs text-nuraTextSecondary/70">
          <p>© 2026 Nura Healthcare. Prototype development version.</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
