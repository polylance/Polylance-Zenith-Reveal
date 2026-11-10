import React, { useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { TopNav } from './components/TopNav';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { RebrandSection } from './components/RebrandSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { WhySection } from './components/WhySection';
import { ComingSection } from './components/ComingSection';
import { SafetySection } from './components/SafetySection';
import { FaqSection } from './components/FaqSection';
import { ClosingSection } from './components/ClosingSection';
import { Footer } from './components/Footer';
import { useLenisScroll, scrollToAnchor } from './motion/useLenisScroll';

export const App: React.FC = () => {
  const { progressBarRef } = useLenisScroll();

  // Desktop-only subtle magnetic pointer pull (<= 8px, transform only)
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleMove = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.magnetic-btn') as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      const clampedX = Math.max(-8, Math.min(8, dx));
      const clampedY = Math.max(-8, Math.min(8, dy));
      target.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;
    };

    const handleLeave = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.magnetic-btn') as HTMLElement | null;
      if (target) {
        target.style.transform = '';
      }
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseout', handleLeave, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseout', handleLeave);
    };
  }, []);

  const handleZenithTrigger = () => {
    scrollToAnchor('#top');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[#0047AB] selection:text-white">
      {/* 2px Fixed Top Scroll Progress Bar */}
      <div
        ref={progressBarRef}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--brand-hi)] origin-left z-50 pointer-events-none"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Slim Announcement Bar */}
      <AnnouncementBar />

      {/* Sticky 64px Header */}
      <TopNav />

      {/* Main Content Landmarks */}
      <main className="flex-1 w-full">
        {/* 01 Hero */}
        <HeroSection />

        {/* 02 About */}
        <AboutSection />

        {/* 03 The Rename */}
        <RebrandSection onZenithClick={handleZenithTrigger} />

        {/* 04 How It Works */}
        <HowItWorksSection />

        {/* 05 Why */}
        <WhySection />

        {/* 06 What's Coming */}
        <ComingSection />

        {/* 07 Safety */}
        <SafetySection />

        {/* 08 FAQ */}
        <FaqSection />

        {/* 09 Closing Band */}
        <ClosingSection />
      </main>

      {/* 10 Substantial Footer */}
      <Footer />
    </div>
  );
};

export default App;
