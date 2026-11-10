import React, { useState, useEffect, useRef } from 'react';
import { useCountdownTick } from '../countdown/countdownStore';
import { scrollToAnchor } from '../motion/useLenisScroll';
import { useTheme } from '../theme/themeStore';
import { Menu, X, Sun, CloudLightning } from 'lucide-react';

const NAV_LINKS = [
  { href: '#about', id: 'about', label: 'About' },
  { href: '#how', id: 'how', label: 'How it works' },
  { href: '#why', id: 'why', label: 'Why' },
  { href: '#safety', id: 'safety', label: 'Safety' },
  { href: '#faq', id: 'faq', label: 'FAQ' },
];

const NavCountdownPill: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { units } = useCountdownTick();
  const formatUnit = (n: number) => String(Math.max(0, n)).padStart(2, '0');

  return (
    <div
      className={`transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none hidden sm:block'
      }`}
    >
      {units.isLive ? (
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--green-900)] text-[var(--green-100)] border border-[var(--green-border)]">
          Live now
        </span>
      ) : (
        <div className="px-3 py-1.5 rounded-full bg-[var(--brand-tint)] text-[var(--brand-text)] border border-[var(--brand-border)] text-xs font-semibold font-tabular whitespace-nowrap">
          <span className="sm:hidden">
            {formatUnit(units.days)}d {formatUnit(units.hours)}h
          </span>
          <span className="hidden sm:inline">
            {formatUnit(units.days)}d {formatUnit(units.hours)}h{' '}
            {formatUnit(units.minutes)}m {formatUnit(units.seconds)}s
          </span>
        </div>
      )}
    </div>
  );
};

export const TopNav: React.FC = () => {
  const { isStorm, toggleTheme } = useTheme();
  const [showMiniPill, setShowMiniPill] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileCloseBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowMiniPill(window.scrollY > 440);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active link highlight via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -55% 0px' }
    );

    NAV_LINKS.forEach((link) => {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Esc closes mobile menu & focus management
  useEffect(() => {
    if (!mobileMenuOpen) return;
    mobileCloseBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    scrollToAnchor(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[var(--bg)] border-b border-[var(--hairline)]">
      <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Supplied hexagon mark (on white rounded tile in Storm) + Wordmark */}
        <a
          href="#top"
          onClick={(e) => handleLinkClick(e, '#top')}
          className="flex items-center gap-2.5 rounded-lg shrink-0"
          aria-label="PolyLance Zenith Home"
        >
          <span className="brand-logo-tile">
            <img
              src="/logo.png"
              alt="PolyLance Zenith hexagon mark"
              className="w-7 h-7 object-contain"
              width="28"
              height="28"
            />
          </span>
          <span className="text-base sm:text-xl font-extrabold tracking-tight text-[var(--text)] whitespace-nowrap">
            PolyLance <span className="text-[var(--brand-text)]">Zenith</span>
          </span>
        </a>

        {/* Center: Desktop Nav Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7 text-[15px] font-medium">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--brand-text)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Mini Countdown Pill + 44px Theme Toggle + Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <NavCountdownPill visible={showMiniPill} />

          <button
            type="button"
            data-theme-toggle="true"
            onClick={toggleTheme}
            aria-label="Switch theme"
            aria-pressed={isStorm}
            title={isStorm ? 'Switch to Light theme' : 'Switch to Storm theme'}
            className="w-11 h-11 rounded-full border border-[var(--hairline)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-hover)] hover:border-[var(--brand-text)] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            {isStorm ? (
              <Sun className="w-4 h-4 text-[var(--green-300)]" aria-hidden="true" />
            ) : (
              <CloudLightning className="w-4 h-4 text-[var(--brand-text)]" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden w-11 h-11 rounded-full border border-[var(--hairline)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--surface-hover)] shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Full-screen Mobile Sheet Menu (Focus-trapped, Esc closes) */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 bg-[var(--bg)] flex flex-col justify-between p-6 md:hidden"
        >
          <div className="flex items-center justify-between h-12">
            <span className="text-lg font-extrabold tracking-tight text-[var(--text)]">
              PolyLance <span className="text-[var(--brand-text)]">Zenith</span>
            </span>
            <button
              ref={mobileCloseBtnRef}
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="w-11 h-11 rounded-full border border-[var(--hairline)] bg-[var(--surface)] flex items-center justify-center text-[var(--text)] cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile Navigation" className="flex flex-col gap-3 my-auto">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="w-full py-3.5 px-6 rounded-full border border-[var(--hairline)] bg-[var(--surface)] text-lg font-semibold text-[var(--text)] text-center hover:border-[var(--brand-text)] hover:text-[var(--brand-text)]"
              >
                {link.label}
              </a>
            ))}

            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={isStorm}
              aria-label="Switch theme"
              className="mt-2 w-full py-3.5 px-6 rounded-full border border-[var(--brand-border)] bg-[var(--brand-tint)] text-base font-semibold text-[var(--brand-text)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isStorm ? (
                <>
                  <Sun className="w-4 h-4" aria-hidden="true" />
                  <span>Theme: Storm (Switch to Light)</span>
                </>
              ) : (
                <>
                  <CloudLightning className="w-4 h-4" aria-hidden="true" />
                  <span>Theme: Light (Switch to Storm)</span>
                </>
              )}
            </button>
          </nav>

          <p className="text-center text-xs text-[var(--text-subtle)]">
            Official site: polylancezenith.com
          </p>
        </div>
      )}
    </header>
  );
};
