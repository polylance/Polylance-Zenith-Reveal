import React from 'react';
import { BRAND } from '../brand';
import { scrollToAnchor } from '../motion/useLenisScroll';
import { ArrowUp, ExternalLink, Lock, Wrench } from 'lucide-react';

export const Footer: React.FC = () => {
  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToAnchor(href);
  };

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#how', label: 'How it works' },
    { href: '#why', label: 'Why' },
    { href: '#safety', label: 'Safety' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <footer className="w-full bg-[var(--bg-alt)] border-t border-[var(--hairline)] py-16 sm:py-24">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-[var(--hairline)]">
          {/* Col 1: Large Wordmark & Definition */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="brand-logo-tile">
                <img
                  src="/logo.png"
                  alt="PolyLance Zenith hexagon mark"
                  className="w-8 h-8 object-contain"
                  width="32"
                  height="32"
                />
              </span>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-[var(--text)] block leading-none">
                  PolyLance <span className="text-[var(--brand-text)]">Zenith</span>
                </span>
                <span className="text-xs font-medium text-[var(--text-muted)] block mt-1">
                  formerly {BRAND.formerName}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-[15px] text-[var(--text-muted)] leading-relaxed max-w-[44ch]">
              {BRAND.definition}
            </p>

            {BRAND.socials.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {BRAND.socials.map((soc) => (
                  <a
                    key={soc.label}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--hairline)] text-xs font-semibold text-[var(--text)] hover:border-[var(--brand-text)] hover:text-[var(--brand-text)] transition-colors"
                  >
                    <span>{soc.label}</span>
                    <ExternalLink className="w-3 h-3 text-[var(--text-subtle)]" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Col 2: Page Sections */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-4">
              Sections
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-[var(--text-muted)]">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchor(e, link.href)}
                    className="hover:text-[var(--brand-text)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Official Addresses */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-4">
              Official addresses
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Lock className="w-4 h-4 text-[var(--green-300)] shrink-0" aria-hidden="true" />
                  <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                    polylancezenith.com
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--green-900)] text-[var(--green-100)] border border-[var(--green-border)] shrink-0">
                  Official
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--maint-bg)] border border-[var(--maint-border)] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Wrench className="w-4 h-4 text-[var(--maint-icon)] shrink-0" aria-hidden="true" />
                  <span className="font-mono text-xs sm:text-sm font-bold text-[var(--text)] truncate">
                    polylance.codes
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--maint-bg)] text-[var(--maint-text)] border border-[var(--maint-border)] shrink-0">
                  Maintenance
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            Built on Polygon · USDC / POL milestone escrow · 5% total protocol fee
          </p>

          <button
            type="button"
            onClick={() => scrollToAnchor('#top')}
            className="btn-pill-secondary h-10 px-5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};
