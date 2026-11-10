import React, { useState, useEffect, useRef } from 'react';
import { FREELANCER_ROWS, CLIENT_ROWS } from '../config';
import { Check } from 'lucide-react';
import { loadGsap } from '../motion/gsapLoader';

export const WhySection: React.FC = () => {
  const [selectedAudience, setSelectedAudience] = useState<'freelancers' | 'clients'>('freelancers');
  const rowsContainerRef = useRef<HTMLDivElement>(null);

  const rows = selectedAudience === 'freelancers' ? FREELANCER_ROWS : CLIENT_ROWS;

  // Line-strike + fix rise-in reveal per row
  useEffect(() => {
    if (typeof window === 'undefined' || !rowsContainerRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let isDisposed = false;
    let revertFn: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (isDisposed || !rowsContainerRef.current) return;
      const ctx = gsap.context(() => {
        const rowEls = rowsContainerRef.current!.querySelectorAll('.why-row');
        rowEls.forEach((row) => {
          const strikeLine = row.querySelector('.strike-line');
          const problemText = row.querySelector('.problem-text');
          const fixBlock = row.querySelector('.fix-block');

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: 'top 88%',
              once: true,
            },
          });

          if (strikeLine) {
            tl.fromTo(
              strikeLine,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.45, ease: 'power2.out' },
              0
            );
          }
          if (problemText) {
            tl.fromTo(
              problemText,
              { opacity: 1 },
              { opacity: 0.45, duration: 0.35, ease: 'power1.out' },
              0.15
            );
          }
          if (fixBlock) {
            tl.fromTo(
              fixBlock,
              { y: 12, opacity: 0.65 },
              { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'transform' },
              0.2
            );
          }
        });
      }, rowsContainerRef);

      revertFn = () => ctx.revert();
    });

    return () => {
      isDisposed = true;
      if (revertFn) revertFn();
    };
  }, [selectedAudience]);

  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="w-full bg-[var(--bg)] border-t border-[var(--hairline)] section-spacing"
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Sticky Left Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text)] block mb-3">
              Why PolyLance Zenith
            </span>
            <h2
              id="why-heading"
              className="text-[34px] sm:text-[48px] lg:text-[56px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.08] max-w-[14ch]"
            >
              Freelancing has real problems.
            </h2>
            <p className="mt-4 text-[18px] sm:text-[19px] text-[var(--text-muted)] leading-[1.6] max-w-[40ch]">
              Here is how milestone escrow and on-chain reputation solve them.
            </p>

            {/* Left-aligned Pill Toggle with sliding indicator */}
            <div className="mt-8 relative inline-flex p-1 bg-[var(--surface-2)] rounded-full border border-[var(--hairline)]">
              {/* Sliding cobalt pill background */}
              <div
                aria-hidden="true"
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[var(--brand)] rounded-full transition-transform duration-200"
                style={{
                  transform:
                    selectedAudience === 'clients' ? 'translateX(100%)' : 'translateX(0)',
                }}
              />

              <button
                type="button"
                onClick={() => setSelectedAudience('freelancers')}
                className={`relative z-10 w-32 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  selectedAudience === 'freelancers'
                    ? 'text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Freelancers
              </button>
              <button
                type="button"
                onClick={() => setSelectedAudience('clients')}
                className={`relative z-10 w-32 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  selectedAudience === 'clients'
                    ? 'text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Clients
              </button>
            </div>
          </div>

          {/* Right Column: 5 Large Rows with Line-Strike Reveal */}
          <div
            ref={rowsContainerRef}
            key={selectedAudience}
            className="lg:col-span-7 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]"
          >
            {rows.map((row, idx) => (
              <div key={idx} className="why-row py-10 sm:py-14 flex flex-col gap-4">
                {/* Problem with animated 2px strike line */}
                <div className="relative inline-block self-start">
                  <span className="problem-text text-[17px] sm:text-[19px] text-[var(--text-subtle)] font-normal">
                    {row.problem}
                  </span>
                  <span
                    aria-hidden="true"
                    className="strike-line absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--text-subtle)] origin-left"
                  />
                </div>

                {/* Fix rising in */}
                <div className="fix-block flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-tint)] text-[var(--brand-text)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </div>
                  <p className="text-[18px] sm:text-[22px] font-semibold text-[var(--text)] leading-[1.4]">
                    {row.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
