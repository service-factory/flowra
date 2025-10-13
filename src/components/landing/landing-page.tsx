'use client';

import React, { useEffect } from 'react';
import HeroSection from './hero-section';
import ProblemSection from './problem-section';
import SolutionSection from './solution-section';
import FeaturesSection from './features-section';
import DiscordSection from './discord-section';
import CTASection from './cta-section';

const LandingPage = () => {
  useEffect(() => {
    // Smooth scroll behavior for anchor links
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.href && target.href.includes('#')) {
        e.preventDefault();
        const id = target.href.split('#')[1];
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Features Section */}
      <div id="features">
        <FeaturesSection />
      </div>

      {/* Discord Integration Section */}
      <DiscordSection />

      {/* CTA Section */}
      <div id="pricing">
        <CTASection />
      </div>
    </main>
  );
};

export default LandingPage;