import React, { useState, useEffect, useRef } from 'react';
import { CountdownCard } from './CountdownCard';
import { AscentScene, ConceptHighlight } from './AscentScene';
import { scrollToAnchor } from '../motion/useLenisScroll';
import { loadGsap } from '../motion/gsapLoader';
import { Check, ArrowDown } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [highlightedConcept, setHighlightedConcept] = useState<ConceptHighlight>(null);
  const [scrollCueDismissed, setScrollCueDismissed] = useState<boolean>(false);
  const heroTextRef = useRef<HTMLDivElement>(null);

  // Fade out scroll cue permanently after user scrolls 80px
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY >= 80) {
        setScrollCueDismissed(true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Subtle orchestrated text intro (once per session, respects reduced motion)
  useEffect(() => {
    if (typeof window === 'undefined' || !heroTextRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem('pl_zenith_hero_intro') === 'true';
    if (prefersReduced || seen) return;

    let isDisposed = false;
    let revertFn: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (isDisposed || !heroTextRef.current) return;
      const ctx = gsap.context(() => {
        const words = heroTextRef.current!.querySelectorAll('.hero-word');
        gsap.from(words, {
          y: 12,
          opacity: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
        sessionStorage.setItem('pl_zenith_hero_intro', 'true');
      }, heroTextRef);
      revertFn = () => ctx.revert();
    });

    return () => {
      isDisposed = true;
      if (revertFn) revertFn();
    };
  }, []);

  const conceptChips: Array<{ id: Exclude<ConceptHighlight, null>; label: string; desc: string }> = [
    {
      id: 'escrow',
      label: 'Milestone escrow',
      desc: 'Highlights the four milestone steps along the trail',
    },
    {
      id: 'coin',
      label: 'USDC / POL',
      desc: 'Highlights the payment coin and settlement stack',
    },
    {
      id: 'reputation',
      label: 'Soulbound reputation',
      desc: 'Highlights the Zenith summit pennant',
    },
  ];

  const trustItems = [
    'Non-custodial escrow',
    '2.5% + 2.5% = 5% fee',
    'Wallet-only sign-in',
  ];

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="w-full bg-[var(--bg)] pt-5 pb-10 sm:pt-7 sm:pb-12 lg:min-h-[calc(100svh-104px)] flex flex-col justify-center relative overflow-x-clip"
    >
      {/* Subtle Storm Cloud Ceiling Backdrop (#top hero atmospheric silhouette) */}
      <div className="storm-only pointer-events-none absolute inset-x-0 top-0 overflow-hidden select-none" aria-hidden="true">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-full h-[120px] sm:h-[150px] block">
          <path
            d="M0 0 L1440 0 L1440 62 Q1260 110 1060 72 Q860 120 660 74 Q460 118 260 70 Q120 104 0 68 Z"
            fill="#1B252B"
            fillOpacity="0.48"
          />
          <rect
            data-ambient="storm-ceiling"
            width="1440"
            height="140"
            fill="#D8F7DC"
            className="anim-storm-ceiling"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto w-full px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_490px] xl:grid-cols-[minmax(0,1.12fr)_530px] gap-7 lg:gap-9 items-center">
          {/* Left Column */}
          <div ref={heroTextRef} className="flex flex-col items-start min-w-0">
            {/* Eyebrow chip (no "new name" wording) */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--brand-tint)] text-[var(--brand-text)] border border-[var(--brand-border)] mb-4">
              Reveal · 17 December 2026
            </div>

            {/* H1: <= 2 lines on >= 1024px, <= 3 lines on mobile */}
            <h1
              id="hero-heading"
              className="text-[34px] sm:text-[44px] lg:text-[clamp(38px,3.6vw,56px)] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.04] max-w-[19ch]"
              style={{ textWrap: 'balance' }}
            >
              <span className="hero-word inline-block">The</span>{' '}
              <span className="hero-word inline-block">new</span>{' '}
              <span className="hero-word inline-block">PolyLance</span>{' '}
              <span className="hero-word inline-block text-[var(--brand-text)]">Zenith</span>{' '}
              <span className="hero-word inline-block">is</span>{' '}
              <span className="hero-word inline-block">almost</span>{' '}
              <span className="hero-word inline-block">here.</span>
            </h1>

            {/* Definition with key protocol phrases bolded */}
            <p className="mt-3 sm:mt-4 text-[16px] sm:text-[18px] text-[var(--text-muted)] leading-[1.55] max-w-[60ch]">
              PolyLance Zenith is a freelancing protocol on{' '}
              <strong className="font-semibold text-[var(--text)]">Polygon</strong>. Clients fund{' '}
              <strong className="font-semibold text-[var(--text)]">milestone escrow</strong> in{' '}
              <strong className="font-semibold text-[var(--text)]">USDC or POL</strong>, freelancers get paid when work is approved, and reputation lives in your own wallet.
            </p>

            {/* Concept Chips (hidden below 640px to keep countdown card cleanly above fold on 375x812) */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 mt-4">
              {conceptChips.map((chip) => {
                const isActive = highlightedConcept === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    aria-describedby={`chip-desc-${chip.id}`}
                    onMouseEnter={() => setHighlightedConcept(chip.id)}
                    onMouseLeave={() => setHighlightedConcept(null)}
                    onFocus={() => setHighlightedConcept(chip.id)}
                    onBlur={() => setHighlightedConcept(null)}
                    onClick={() =>
                      setHighlightedConcept((prev) => (prev === chip.id ? null : chip.id))
                    }
                    className={`min-h-[34px] px-3.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                        : 'bg-[var(--surface)] text-[var(--text)] border-[var(--hairline)] hover:border-[var(--brand-text)] hover:text-[var(--brand-text)]'
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span id={`chip-desc-${chip.id}`} className="sr-only">
                      {chip.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Compact Countdown Card */}
            <div className="w-full mt-5">
              <CountdownCard variant="hero" />
            </div>

            {/* Trust Row: 1 line on desktop, balanced wrap on mobile */}
            <div className="mt-4 w-full">
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-6 gap-y-2 text-xs sm:text-[13px] font-medium text-[var(--text-muted)]">
                {trustItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <Check
                      className="w-4 h-4 text-[var(--green-300)] shrink-0 stroke-[2.5]"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: "The Ascent to Zenith" Inline SVG Scene */}
          <div className="w-full px-1 sm:px-0">
            <AscentScene highlightedConcept={highlightedConcept} />
          </div>
        </div>

        {/* Bottom Center Scroll Cue (fades out permanently after scrolling 80px) */}
        <div
          className={`mt-6 lg:mt-4 flex justify-center transition-opacity duration-500 ${
            scrollCueDismissed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <a
            href="#how"
            onClick={(e) => {
              e.preventDefault();
              scrollToAnchor('#how');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--brand-text)] transition-colors py-1.5 px-3 rounded-full"
          >
            <span>See how it works</span>
            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
