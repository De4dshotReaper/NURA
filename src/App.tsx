import React from 'react';
import { LandingNavbar } from './components/landing/LandingNavbar';
import { Hero } from './components/landing/Hero';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-nuraBg text-nuraText font-sans relative selection:bg-primary/10 selection:text-primary">
      {/* Floating Landing Navbar */}
      <LandingNavbar />

      {/* Hero Section */}
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default App;
