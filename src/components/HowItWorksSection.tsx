import React, { useState, useEffect, useRef } from 'react';
import { HOW_IT_WORKS_STEPS } from '../config';
import { StormCloudDivider } from './StormCloudDivider';
import { useTheme } from '../theme/themeStore';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const { isStorm } = useTheme();
  const [activeStep, setActiveStep] = useState<number>(1);
  const stageRef = useRef<HTMLDivElement>(null);

  // Scroll-linked progression on desktop
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 1024 || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const totalHeight = stageRef.current.offsetHeight;
      const vh = window.innerHeight;

      if (rect.top <= vh * 0.35 && rect.bottom >= vh * 0.45) {
        const scrolled = Math.max(0, vh * 0.35 - rect.top);
        const scrollable = Math.max(1, totalHeight - vh * 0.5);
        const ratio = Math.min(0.99, scrolled / scrollable);
        const nextStep = Math.floor(ratio * HOW_IT_WORKS_STEPS.length) + 1;
        setActiveStep(nextStep);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handlePrev = () => setActiveStep((s) => Math.max(1, s - 1));
  const handleNext = () => setActiveStep((s) => Math.min(4, s + 1));
  const handleReplay = () => setActiveStep(1);

  const getCoinX = () => {
    switch (activeStep) {
      case 1:
      case 2:
        return 240;
      case 3:
      case 4:
        return 390;
      default:
        return 90;
    }
  };

  const c = isStorm
    ? {
        track: '#26323A',
        brand: '#4C8DFF',
        nodeFill: '#1A242A',
        nodeStroke: '#26323A',
        activeFill: '#132236',
        circleFill: '#131B20',
        text: '#EAF0F3',
        dotInactive: '#3A4A54',
        green: '#62D26F',
        greenBg: '#0F2A1A',
        certFill: '#131B20',
      }
    : {
        track: '#E5E7EB',
        brand: '#0047AB',
        nodeFill: '#F5F7FB',
        nodeStroke: '#E5E7EB',
        activeFill: '#EFF6FF',
        circleFill: '#FFFFFF',
        text: '#0A0A0F',
        dotInactive: '#D1D5DB',
        green: '#059669',
        greenBg: '#ECFDF5',
        certFill: '#FFFFFF',
      };

  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="w-full bg-[var(--bg-alt)] border-t border-[var(--hairline)]"
    >
      <StormCloudDivider topBg="var(--bg)" bottomBg="var(--bg-alt)" flip />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 section-spacing">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 sm:mb-20">
          <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text)] block mb-3">
            How it works
          </span>
          <h2
            id="how-heading"
            className="text-[34px] sm:text-[48px] lg:text-[60px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.08] max-w-[18ch]"
          >
            Four steps from brief to wallet.
          </h2>
          <p className="mt-4 text-[18px] sm:text-[20px] text-[var(--text-muted)] leading-[1.55] max-w-[54ch]">
            Every milestone is protected on-chain so neither side carries blind risk.
          </p>
        </div>

        {/* Desktop Sticky Two-Column Stepper */}
        <div
          ref={stageRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:min-h-[110vh]"
        >
          {/* Left: 4 Steps */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
            {HOW_IT_WORKS_STEPS.map((step) => {
              const isActive = activeStep === step.stepNumber;
              return (
                <button
                  key={step.stepNumber}
                  type="button"
                  onClick={() => setActiveStep(step.stepNumber)}
                  className={`w-full text-left p-6 rounded-[24px] transition-colors duration-300 cursor-pointer border ${
                    isActive
                      ? 'bg-[var(--surface)] border-[var(--hairline)] shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-[var(--surface)]/60'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-text)] block mb-1">
                    Step 0{step.stepNumber}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text)]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] sm:text-[16px] text-[var(--text-muted)] leading-[1.55]">
                    {step.description}
                  </p>
                  {step.note && (
                    <p className="mt-2.5 text-xs font-semibold text-[var(--brand-text)] bg-[var(--brand-tint)] inline-block px-3 py-1 rounded-full">
                      {step.note}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: Large SVG Stage */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <div className="w-full rounded-[32px] bg-[var(--surface)] border border-[var(--hairline)] p-6 sm:p-10 shadow-xs">
              <svg
                viewBox="0 0 480 260"
                className="w-full h-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label={`Workflow step ${activeStep}: ${HOW_IT_WORKS_STEPS[activeStep - 1].title}`}
              >
                <line x1="90" y1="130" x2="390" y2="130" stroke={c.track} strokeWidth="3" strokeDasharray="6 6" />
                <line
                  x1="90"
                  y1="130"
                  x2={activeStep >= 3 ? 390 : 240}
                  y2="130"
                  stroke={c.brand}
                  strokeWidth="3"
                  className="transition-all duration-500"
                />

                {/* Node 1: Client Wallet */}
                <g transform="translate(90, 130)">
                  <rect x="-44" y="-36" width="88" height="72" rx="16" fill={c.nodeFill} stroke={c.nodeStroke} strokeWidth="1.5" />
                  <circle cx="0" cy="-6" r="14" fill={c.circleFill} stroke={c.brand} strokeWidth="1.5" />
                  <text x="0" y="24" fontSize="12" fontWeight="700" fill={c.text} textAnchor="middle">
                    Client
                  </text>
                </g>

                {/* Node 2: Escrow Vault */}
                <g transform="translate(240, 130)">
                  <rect
                    x="-50"
                    y="-44"
                    width="100"
                    height="88"
                    rx="20"
                    fill={activeStep <= 2 ? c.activeFill : c.nodeFill}
                    stroke={activeStep <= 2 ? c.brand : c.nodeStroke}
                    strokeWidth="2"
                  />
                  <g transform="translate(-10, -24)">
                    <rect x="0" y="8" width="20" height="16" rx="4" fill={c.brand} />
                    <path
                      d={activeStep >= 1 ? 'M4 8V5C4 2 16 2 16 5V8' : 'M4 8V3C4 0 16 0 16 3'}
                      stroke={c.brand}
                      strokeWidth="2"
                      fill="none"
                    />
                  </g>
                  <g transform="translate(-26, 2)">
                    <circle cx="8" cy="4" r="4" fill={activeStep >= 2 ? c.brand : c.dotInactive} />
                    <circle cx="26" cy="4" r="4" fill={activeStep >= 2 ? c.brand : c.dotInactive} />
                    <circle cx="44" cy="4" r="4" fill={activeStep >= 3 ? c.brand : c.dotInactive} />
                  </g>
                  <text x="0" y="30" fontSize="12" fontWeight="700" fill={c.brand} textAnchor="middle">
                    Escrow
                  </text>
                </g>

                {/* Node 3: Freelancer Wallet */}
                <g transform="translate(390, 130)">
                  <rect
                    x="-44"
                    y="-36"
                    width="88"
                    height="72"
                    rx="16"
                    fill={activeStep >= 3 ? c.activeFill : c.nodeFill}
                    stroke={activeStep >= 3 ? c.brand : c.nodeStroke}
                    strokeWidth="1.5"
                  />
                  <circle cx="0" cy="-6" r="14" fill={c.circleFill} stroke={c.brand} strokeWidth="1.5" />
                  <text x="0" y="24" fontSize="12" fontWeight="700" fill={c.text} textAnchor="middle">
                    Freelancer
                  </text>
                </g>

                {/* Step 4 Certificate Card */}
                <g
                  transform={`translate(352, ${activeStep === 4 ? 38 : 65})`}
                  opacity={activeStep === 4 ? 1 : 0}
                  className="transition-all duration-500"
                >
                  <rect x="0" y="0" width="76" height="44" rx="10" fill={c.certFill} stroke={c.green} strokeWidth="1.5" />
                  <circle cx="20" cy="22" r="8" fill={c.greenBg} />
                  <path d="M16.5 22L19 24.5L24 19.5" stroke={c.green} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="34" y1="18" x2="64" y2="18" stroke={c.text} strokeWidth="2" strokeLinecap="round" />
                  <line x1="34" y1="26" x2="54" y2="26" stroke={c.dotInactive} strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* Animated Travelling Coin Disc */}
                <g transform={`translate(${getCoinX()}, 86)`} className="transition-transform duration-500">
                  <circle cx="0" cy="0" r="13" fill="#0047AB" stroke={c.green} strokeWidth="2" />
                  <text x="0" y="4" fontSize="8" fontWeight="800" fill="#FFFFFF" textAnchor="middle">
                    USDC
                  </text>
                </g>
              </svg>

              {/* Controls under stage */}
              <div className="mt-8 pt-6 border-t border-[var(--hairline)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={activeStep === 1}
                    className="btn-pill-secondary h-10 px-4 text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={activeStep === 4}
                    className="btn-pill-primary h-10 px-5 text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                    aria-label="Next step"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReplay}
                  className="text-xs font-semibold text-[var(--text-subtle)] hover:text-[var(--brand-text)] inline-flex items-center gap-1.5 cursor-pointer py-2 px-3 rounded-full"
                  aria-label="Replay workflow steps"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
