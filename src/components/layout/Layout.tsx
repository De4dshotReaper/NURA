import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-nuraBg">
      <DisclaimerBanner />
      <Navbar />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
