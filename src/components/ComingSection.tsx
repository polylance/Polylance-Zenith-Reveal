import React, { useState, useEffect, useRef } from 'react';
import { UPCOMING_FEATURES, UpcomingFeature } from '../config';
import { useCountdownPhase } from '../countdown/countdownStore';
import { StormCloudDivider } from './StormCloudDivider';
import { Check } from 'lucide-react';

export const ComingSection: React.FC = () => {
  const phase = useCountdownPhase();
  const isLive = phase === 'live';

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [certTilt, setCertTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024 || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const stageHeight = stageRef.current.offsetHeight;
      const vh = window.innerHeight;

      if (rect.top <= 140 && rect.bottom >= vh * 0.45) {
        const scrolledInto = Math.abs(rect.top - 140);
        const scrollable = Math.max(1, stageHeight - vh * 0.6);
        const ratio = Math.min(0.99, Math.max(0, scrolledInto / scrollable));
        const idx = Math.floor(ratio * UPCOMING_FEATURES.length);
        setActiveStepIndex(idx);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCertPointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCertTilt({
      rx: -y * 12,
      ry: x * 12,
    });
  };

  const renderIllustration = (id: string) => {
    switch (id) {
      case 'cleaner-interface':
        return (
          <div className="w-full max-w-md mx-auto p-6 bg-[var(--surface)] rounded-3xl border border-[var(--hairline)] shadow-sm">
            <div className="pb-3 border-b-2 border-[var(--brand-text)] mb-5 flex items-center justify-between">
              <div className="w-28 h-3 bg-[var(--text)] rounded-full" />
              <div className="w-12 h-3 bg-[var(--brand-tint)] rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] p-3 flex flex-col justify-between transition-transform duration-300">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-tint)]" />
                <div className="w-20 h-2 bg-[var(--text-subtle)]/40 rounded-full" />
              </div>
              <div className="h-24 rounded-2xl bg-[var(--surface-2)] border border-[var(--hairline)] p-3 flex flex-col justify-between transition-transform duration-300">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-tint)]" />
                <div className="w-16 h-2 bg-[var(--text-subtle)]/40 rounded-full" />
              </div>
              <div className="col-span-2 h-16 rounded-2xl bg-[var(--brand-tint)] border border-[var(--brand-border)] p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--brand)]" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-2.5 bg-[var(--brand-text)]/50 rounded-full" />
                  <div className="w-20 h-2 bg-[var(--brand-text)]/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'smarter-search':
        return (
          <div className="w-full max-w-md mx-auto p-6 bg-[var(--surface)] rounded-3xl border border-[var(--hairline)] shadow-sm">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--brand)] text-white">
                Fixed Budget
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--brand)] text-white">
                Escrow Ready
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--hairline)]">
                Milestones
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--hairline)]">
                Polygon
              </span>
            </div>
            <div className="space-y-3">
              <div className="h-10 rounded-xl bg-[var(--brand-tint)] border border-[var(--brand-border)] px-4 flex items-center justify-between">
                <div className="w-32 h-2.5 bg-[var(--brand-text)] rounded-full" />
                <div className="w-10 h-2.5 bg-[var(--brand-hi)]/45 rounded-full" />
              </div>
              <div className="h-10 rounded-xl bg-[var(--brand-tint)] border border-[var(--brand-border)] px-4 flex items-center justify-between">
                <div className="w-40 h-2.5 bg-[var(--brand-text)] rounded-full" />
                <div className="w-8 h-2.5 bg-[var(--brand-hi)]/45 rounded-full" />
              </div>
              <div className="h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] px-4 flex items-center">
                <div className="w-24 h-2 bg-[var(--text-subtle)]/35 rounded-full" />
              </div>
              <div className="h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] px-4 flex items-center">
                <div className="w-28 h-2 bg-[var(--text-subtle)]/35 rounded-full" />
              </div>
            </div>
          </div>
        );

      case 'profiles-certificates':
        return (
          <div
            className="w-full max-w-sm mx-auto perspective-[800px] cursor-pointer"
            onMouseMove={handleCertPointerMove}
            onMouseLeave={() => setCertTilt({ rx: 0, ry: 0 })}
          >
            <div
              className="p-8 bg-[var(--surface)] rounded-[28px] border border-[var(--hairline)] shadow-md transition-transform duration-200 flex flex-col items-center text-center"
              style={{
                transform: `rotateX(${certTilt.rx}deg) rotateY(${certTilt.ry}deg)`,
              }}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--brand-tint)] border border-[var(--brand-border)] flex items-center justify-center mb-5">
                <span className="brand-logo-tile">
                  <img
                    src="/logo.png"
                    alt="PolyLance Zenith Seal"
                    className="w-8 h-8 object-contain"
                    width="32"
                    height="32"
                  />
                </span>
              </div>

              <div className="w-36 h-3 bg-[var(--text)] rounded-full mb-3" />
              <div className="w-48 h-2.5 bg-[var(--text-subtle)]/40 rounded-full mb-6" />

              <div className="w-full pt-4 border-t border-[var(--hairline)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--green-100)] bg-[var(--green-900)] border border-[var(--green-border)] px-2.5 py-0.5 rounded-full">
                  Verified on-chain
                </span>
                <div className="w-14 h-2 bg-[var(--text-subtle)]/35 rounded-full" />
              </div>
            </div>
          </div>
        );

      case 'smoother-wallet':
        return (
          <div className="w-full max-w-md mx-auto p-8 bg-[var(--surface)] rounded-3xl border border-[var(--hairline)] shadow-sm">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-8 right-8 h-1 bg-[var(--hairline)] z-0">
                <div className="w-full h-full bg-[var(--brand)] rounded-full" />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[var(--brand)] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="text-xs font-semibold text-[var(--text)]">Connect</span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[var(--brand)] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="text-xs font-semibold text-[var(--text)]">Approve</span>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#047857] text-white flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-[var(--green-300)]">Done</span>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--hairline)] flex items-center justify-between">
              <div className="w-24 h-2.5 bg-[var(--text-subtle)]/40 rounded-full" />
              <div className="w-16 h-2.5 bg-[var(--brand-text)] rounded-full" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section
      id="coming"
      aria-labelledby="coming-heading"
      className="w-full bg-[var(--bg-alt)] border-t border-[var(--hairline)]"
    >
      <StormCloudDivider topBg="var(--bg)" bottomBg="var(--bg-alt)" />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 section-spacing">
        {/* Header with ONE arrival pill */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-4">
          <div className="max-w-2xl">
            <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text)] block mb-3">
              What&apos;s coming
            </span>
            <h2
              id="coming-heading"
              className="text-[34px] sm:text-[48px] lg:text-[60px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.08] max-w-[16ch]"
            >
              Four upgrades arrive on 17 December.
            </h2>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border self-start md:self-auto ${
              isLive
                ? 'bg-[var(--green-900)] text-[var(--green-100)] border-[var(--green-border)]'
                : 'bg-[var(--brand-tint)] text-[var(--brand-text)] border-[var(--brand-border)]'
            }`}
          >
            {isLive ? 'Live now' : 'Arrives 17 Dec 2026'}
          </span>
        </div>

        {/* Desktop Sticky Two-Column Stage */}
        <div ref={stageRef} className="hidden lg:grid grid-cols-12 gap-12 items-start min-h-[105vh] relative">
          <div className="col-span-5 sticky top-28 space-y-6">
            {UPCOMING_FEATURES.map((feat: UpcomingFeature, idx: number) => {
              const isActive = activeStepIndex === idx;
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`w-full text-left transition-colors duration-300 cursor-pointer block p-5 rounded-2xl border ${
                    isActive
                      ? 'bg-[var(--surface)] border-[var(--hairline)] shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-[var(--surface)]/60'
                  }`}
                >
                  <span className="text-xs font-semibold text-[var(--brand-text)] uppercase tracking-[0.08em] block mb-1">
                    {feat.stepNumber}
                  </span>
                  <h3 className="text-xl font-extrabold text-[var(--text)]">
                    {feat.title}
                  </h3>
                  <p className="mt-1 text-[15px] text-[var(--text-muted)] font-normal leading-relaxed">
                    {feat.copy}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="col-span-7 sticky top-28">
            <div className="w-full min-h-[420px] rounded-[32px] bg-[var(--surface)] border border-[var(--hairline)] p-10 flex items-center justify-center shadow-xs">
              {renderIllustration(UPCOMING_FEATURES[activeStepIndex].id)}
            </div>
          </div>
        </div>

        {/* Mobile Stacked Cards */}
        <div className="lg:hidden space-y-6">
          {UPCOMING_FEATURES.map((feat: UpcomingFeature) => (
            <div
              key={feat.id}
              className="apple-card-flat p-6 rounded-[24px] flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold text-[var(--brand-text)] uppercase tracking-[0.08em] block mb-1.5">
                  {feat.stepNumber}
                </span>
                <h3 className="text-xl font-extrabold text-[var(--text)]">
                  {feat.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)] leading-relaxed">
                  {feat.copy}
                </p>
              </div>

              <div className="p-4 bg-[var(--surface-2)] rounded-2xl border border-[var(--hairline)]">
                {renderIllustration(feat.id)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
