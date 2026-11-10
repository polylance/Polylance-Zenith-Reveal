import React, { useEffect, useRef } from 'react';
import { BRAND } from '../brand';
import { RevealText } from './RevealText';
import { ArrowRight, Check } from 'lucide-react';
import { loadGsap } from '../motion/gsapLoader';

interface RebrandSectionProps {
  onZenithClick: () => void;
}

export const RebrandSection: React.FC<RebrandSectionProps> = ({ onZenithClick }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const polyRef = useRef<HTMLSpanElement>(null);
  const zenithRef = useRef<HTMLButtonElement>(null);
  const peakRef = useRef<SVGSVGElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !stageRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 1024;

    if (prefersReduced || isMobile) return;

    let isDisposed = false;
    let revertFn: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (isDisposed || !stageRef.current) return;
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: 'top top',
            end: '+=110%',
            pin: true,
            scrub: 0.5,
          },
        });

        tl.fromTo(
          polyRef.current,
          { opacity: 0.25 },
          { opacity: 1, duration: 0.6, ease: 'power2.out' },
          0
        )
          .fromTo(
            zenithRef.current,
            { y: 120, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
            0.1
          )
          .fromTo(
            peakRef.current,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
            0.55
          )
          .fromTo(
            captionRef.current,
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
            0.65
          );
      }, stageRef);

      revertFn = () => ctx.revert();
    });

    return () => {
      isDisposed = true;
      if (revertFn) revertFn();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !cardsRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let isDisposed = false;
    let revertFn: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (isDisposed || !cardsRef.current) return;
      const ctx = gsap.context(() => {
        const rows = cardsRef.current!.querySelectorAll('.rebrand-row');
        gsap.from(rows, {
          y: 12,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      }, cardsRef);

      revertFn = () => ctx.revert();
    });

    return () => {
      isDisposed = true;
      if (revertFn) revertFn();
    };
  }, []);

  const changingRows = [
    { label: 'Name', value: 'PolyLance → PolyLance Zenith' },
    { label: 'Address', value: 'polylancezenith.com' },
    { label: 'Interface', value: 'A new design arriving 17 Dec 2026' },
  ];

  const stayingRows = [
    'Our mission to make freelancing fair',
    'The 2.5% client + 2.5% freelancer fee model',
    'Non-custodial milestone escrow',
    'Wallet-only sign-in, no email or phone stored',
    'Your on-chain jobs, escrows and certificates',
  ];

  return (
    <section
      id="renamed"
      aria-labelledby="renamed-heading"
      className="w-full bg-[var(--bg)] border-t border-[var(--hairline)]"
    >
      {/* A. Pinned Wordmark Transformation Stage */}
      <div
        ref={stageRef}
        className="w-full min-h-[70vh] lg:min-h-[85vh] flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12 py-20"
      >
        <h2 id="renamed-heading" className="sr-only">
          PolyLance is now PolyLance Zenith
        </h2>

        <div className="min-h-[80px] sm:min-h-[120px] flex items-center justify-center flex-wrap gap-x-4 overflow-visible">
          <span
            ref={polyRef}
            className="text-[44px] sm:text-[76px] md:text-[108px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-none"
          >
            PolyLance
          </span>

          <button
            ref={zenithRef}
            type="button"
            onClick={onZenithClick}
            aria-label="Show the top milestone"
            className="relative inline-flex items-center text-[44px] sm:text-[76px] md:text-[108px] font-extrabold tracking-[-0.03em] text-[var(--brand-text)] leading-none hover:opacity-90 transition-opacity cursor-pointer"
          >
            {/* Flat Peak / Apex Triangle Mark above the Z */}
            <svg
              ref={peakRef}
              viewBox="0 0 24 14"
              className="absolute -top-4 sm:-top-6 left-2 sm:left-3 w-5 sm:w-7 h-3.5 sm:h-4 text-[var(--green-300)]"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="12,0 24,14 0,14" />
            </svg>
            <span>Zenith</span>
          </button>
        </div>

        <p
          ref={captionRef}
          className="mt-5 text-sm sm:text-base font-medium text-[var(--text-subtle)]"
        >
          {BRAND.zenithMeaning}
        </p>
      </div>

      {/* B. Unpinned Statement Lines & Comparison Cards */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 pb-[88px] lg:pb-[180px]">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="space-y-1 sm:space-y-2">
            <RevealText
              text="New name."
              className="text-[36px] sm:text-[58px] md:text-[80px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.06]"
              as="div"
            />
            <RevealText
              text="Old passion."
              className="text-[36px] sm:text-[58px] md:text-[80px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.06]"
              as="div"
            />
            <RevealText
              text="Higher aim."
              cobaltHighlight
              className="text-[36px] sm:text-[58px] md:text-[80px] font-extrabold tracking-[-0.03em] leading-[1.06]"
              as="div"
            />
          </div>

          <p className="mt-6 sm:mt-8 text-[17px] sm:text-[19px] text-[var(--text-muted)] leading-[1.6] max-w-[54ch]">
            {BRAND.subline}
          </p>
        </div>

        {/* C. Two Generous Cards (40px padding) */}
        <div
          ref={cardsRef}
          className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
        >
          {/* Left Card: What's Changing */}
          <div className="apple-card-flat bg-[var(--surface-2)] p-8 sm:p-10 rounded-[28px]">
            <h3 className="text-2xl font-extrabold text-[var(--text)] mb-8">
              What&apos;s changing
            </h3>
            <div className="space-y-5">
              {changingRows.map((row, idx) => (
                <div
                  key={idx}
                  className="rebrand-row flex items-start gap-3.5 pb-4 border-b border-[var(--hairline)] last:border-none last:pb-0"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-tint)] text-[var(--brand-text)] flex items-center justify-center shrink-0 mt-0.5">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-subtle)] block">
                      {row.label}
                    </span>
                    <span className="text-base sm:text-[17px] font-semibold text-[var(--text)]">
                      {row.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: What Stays the Same */}
          <div className="apple-card-flat bg-[var(--surface-2)] p-8 sm:p-10 rounded-[28px]">
            <h3 className="text-2xl font-extrabold text-[var(--text)] mb-8">
              What stays the same
            </h3>
            <div className="space-y-4">
              {stayingRows.map((row, idx) => (
                <div key={idx} className="rebrand-row flex items-center gap-3.5 py-1">
                  <div className="w-6 h-6 rounded-full bg-[var(--green-900)] text-[var(--green-300)] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                  </div>
                  <span className="text-base sm:text-[17px] text-[var(--text)] font-medium leading-snug">
                    {row}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
