import React, { useEffect, useRef } from 'react';
import { RevealText } from './RevealText';
import { EscrowVaultIcon, CertificateCardIcon, ShieldLockIcon } from './ProtocolObjects';
import { StormCloudDivider } from './StormCloudDivider';
import { loadGsap } from '../motion/gsapLoader';

export const AboutSection: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !cardsRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let isDisposed = false;
    let revertFn: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (isDisposed || !cardsRef.current) return;
      const ctx = gsap.context(() => {
        const cards = cardsRef.current!.querySelectorAll('.pillar-card');
        gsap.from(cards, {
          y: 20,
          duration: 0.55,
          stagger: 0.08,
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

  const pillars = [
    {
      icon: <EscrowVaultIcon className="w-8 h-8" />,
      title: 'Escrow that protects both sides',
      body: 'Funds are locked in a non-custodial smart contract before work starts and released only by milestone approval.',
    },
    {
      icon: <CertificateCardIcon className="w-8 h-8" />,
      title: 'Reputation you own',
      body: 'Every completed job mints a soulbound certificate directly into your own wallet, not trapped inside a platform.',
    },
    {
      icon: <ShieldLockIcon className="w-8 h-8" />,
      title: 'Private by design',
      body: 'Connect using wallet-only sign-in. PolyLance Zenith never asks for or stores an email address or phone number.',
    },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="w-full bg-[var(--bg-alt)] border-t border-[var(--hairline)]"
    >
      <StormCloudDivider topBg="var(--bg)" bottomBg="var(--bg-alt)" />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 section-spacing">
        {/* Eyebrow */}
        <h2 id="about-heading" className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text)] mb-6">
          What is PolyLance Zenith?
        </h2>

        {/* Giant gray -> crisp contrast RevealText Statement */}
        <RevealText
          text="Freelancing runs on trust, and trust usually means somebody else holds your money. PolyLance Zenith moves that trust into escrow you can verify on-chain."
          className="text-[28px] sm:text-[42px] lg:text-[54px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.12] max-w-[30ch]"
        />

        {/* Three Pillar Cards */}
        <div
          ref={cardsRef}
          className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="pillar-card apple-card-flat p-8 rounded-[24px] flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-tint)] border border-[var(--brand-border)] flex items-center justify-center mb-6">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-extrabold text-[var(--text)] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-[16px] text-[var(--text-muted)] leading-[1.6]">
                  {pillar.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Thin protocol strip */}
        <div className="mt-10 pt-6 border-t border-[var(--hairline)] flex flex-wrap items-center justify-center sm:justify-between gap-4 text-xs sm:text-sm font-medium text-[var(--text-subtle)]">
          <span>Built on Polygon</span>
          <span className="hidden sm:inline text-[var(--hairline)]">·</span>
          <span>Pay in USDC or POL</span>
          <span className="hidden sm:inline text-[var(--hairline)]">·</span>
          <span>2.5% + 2.5% = 5% total fee</span>
        </div>
      </div>
    </section>
  );
};
