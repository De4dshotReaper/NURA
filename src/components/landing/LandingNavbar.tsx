import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  onStartJourney: () => void;
  onSignIn?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onStartJourney, onSignIn }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Privacy', href: '#privacy' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out animate-enter-navbar ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm/50 py-4'
          : 'bg-transparent border-b border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Left: Nura Wordmark */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-blue-500/10 group-hover:scale-105 group-hover:shadow-blue-500/20 transition-all duration-300">
            <span className="font-heading font-bold text-2xl leading-none">N</span>
          </div>
          <span className="font-heading font-extrabold text-[1.65rem] tracking-tight text-nuraText group-hover:text-primary transition-colors duration-300">
            Nura
          </span>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-nuraTextSecondary hover:text-primary transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href="#login"
            onClick={(e) => {
              if (onSignIn) {
                e.preventDefault();
                onSignIn();
              }
            }}
            className="px-4 py-2 text-sm font-medium text-nuraTextSecondary hover:text-nuraText transition-colors duration-300 rounded-xl cursor-pointer inline-flex items-center"
          >
            Sign In
          </a>
          <button
            onClick={onStartJourney}
            className="inline-flex items-center justify-center px-7 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-400 gap-1.5 cursor-pointer"
          >
            Start Journey
            <ArrowRight className="w-4 h-4 opacity-80" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-nuraText hover:text-primary transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200/80 px-6 py-6 space-y-4 shadow-lg animate-fade-in">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-nuraTextSecondary hover:text-nuraText py-1.5 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <a
              href="#login"
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (onSignIn) {
                  e.preventDefault();
                  onSignIn();
                }
              }}
              className="w-full py-2.5 text-center text-sm font-medium text-nuraTextSecondary hover:text-nuraText transition-colors"
            >
              Sign In
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartJourney();
              }}
              className="w-full text-center py-3.5 text-sm font-semibold text-white bg-primary rounded-xl shadow-lg shadow-blue-500/10 hover:bg-blue-600 transition-all cursor-pointer"
            >
              Start Journey
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
