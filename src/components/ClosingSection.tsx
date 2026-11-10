import React, { useEffect, useRef, useState } from 'react';
import { CountdownCard } from './CountdownCard';
import { RevealText } from './RevealText';
import { useTheme } from '../theme/themeStore';

export const ClosingSection: React.FC = () => {
  const { isStorm } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const [hasStruckOnce, setHasStruckOnce] = useState(false);

  // Storm-only single one-shot lightning strike on first viewport entry (no loop)
  useEffect(() => {
    if (!isStorm || hasStruckOnce || typeof window === 'undefined' || !sectionRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasStruckOnce(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [isStorm, hasStruckOnce]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="closing-heading"
      className="relative w-full bg-[var(--bg)] border-t border-[var(--hairline)] overflow-hidden"
    >
      {/* Storm Cloud Ceiling across top of closing band */}
      <div className="storm-only relative w-full overflow-hidden leading-none pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="w-full h-[76px] sm:h-[96px] block">
          <rect width="1440" height="96" fill="#0A0E11" />
          <path
            d="M0 0 L1440 0 L1440 44 Q1290 78 1120 52 Q960 88 790 54 Q620 84 460 50 Q280 86 120 48 L0 56 Z"
            fill="#1B252B"
          />
          <path
            d="M0 0 L1440 0 L1440 26 Q1310 52 1140 30 Q950 56 760 28 Q570 54 390 26 Q190 50 0 32 Z"
            fill="#232F36"
          />
          {hasStruckOnce && (
            <path
              d="M726 12 L714 48 L728 52 L712 88 L720 90 L740 46 L726 42 L738 12 Z"
              fill="#D8F7DC"
              className="anim-storm-bolt"
            />
          )}
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 section-spacing">
        <h2 id="closing-heading" className="sr-only">
          See you on 17 December
        </h2>

        {/* Solid Cobalt Rounded-[40px] Inset Band with Closing Countdown */}
        <CountdownCard variant="closing" />

        {/* Closing RevealText Statement */}
        <div className="mt-16 sm:mt-24 text-center max-w-4xl mx-auto">
          <RevealText
            text="PolyLance Zenith. New name, old passion."
            className="text-[32px] sm:text-[48px] md:text-[60px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.1]"
            as="p"
          />
        </div>
      </div>
    </section>
  );
};
