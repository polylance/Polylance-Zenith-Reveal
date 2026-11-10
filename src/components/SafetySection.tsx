import React, { useState } from 'react';
import { OFFICIAL_HOSTS } from '../config';
import { Lock, Wrench, Check, AlertCircle, Search } from 'lucide-react';

export const SafetySection: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [checkResult, setCheckResult] = useState<{
    status: 'idle' | 'official' | 'unverified';
    hostname?: string;
  }>({ status: 'idle' });

  const handleLinkCheck = (val: string) => {
    setUrlInput(val);
    if (!val.trim()) {
      setCheckResult({ status: 'idle' });
      return;
    }

    try {
      let trimmed = val.trim().toLowerCase();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = 'https://' + trimmed;
      }
      const parsed = new URL(trimmed);
      const host = parsed.hostname;

      if (OFFICIAL_HOSTS.includes(host)) {
        setCheckResult({ status: 'official', hostname: host });
      } else {
        setCheckResult({ status: 'unverified', hostname: host });
      }
    } catch {
      setCheckResult({ status: 'unverified', hostname: val });
    }
  };

  const verifySteps = [
    { num: '1', text: 'Look at the address bar to confirm polylancezenith.com' },
    { num: '2', text: 'Type the address yourself or use a saved bookmark' },
    { num: '3', text: 'Never share your seed phrase with anyone' },
  ];

  return (
    <section
      id="safety"
      aria-labelledby="safety-heading"
      className="w-full bg-[var(--bg)] border-t border-[var(--hairline)] section-spacing"
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl mb-14 sm:mb-20">
          <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text)] block mb-3">
            Safety &amp; verification
          </span>
          <h2
            id="safety-heading"
            className="text-[34px] sm:text-[48px] lg:text-[60px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.08] max-w-[16ch]"
          >
            You&apos;re on the official PolyLance Zenith.
          </h2>
          <p className="mt-4 text-[18px] sm:text-[19px] text-[var(--text-muted)] leading-[1.6] max-w-[54ch]">
            PolyLance now lives at <strong className="text-[var(--text)]">polylancezenith.com</strong>. The old address, <strong className="text-[var(--text)]">polylance.codes</strong>, is under maintenance and not available right now.
          </p>
        </div>

        {/* 2-Column Domain Passport + Reassurance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Domain Passport + Link Checker */}
          <div className="lg:col-span-7 apple-card-flat p-6 sm:p-10 rounded-[28px] bg-[var(--surface-2)]">
            <div className="space-y-4">
              {/* Row 1: Official */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)] gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[var(--green-900)] text-[var(--green-300)] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-mono text-base font-bold text-[var(--text)] block">
                      polylancezenith.com
                    </span>
                    <span className="text-xs text-[var(--text-subtle)]">
                      Primary official domain
                    </span>
                  </div>
                </div>

                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--green-900)] text-[var(--green-100)] border border-[var(--green-border)] self-start sm:self-auto">
                  Official · you&apos;re here
                </span>
              </div>

              {/* Row 2: Maintenance */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[var(--maint-bg)] border border-[var(--maint-border)] gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[var(--surface)] border border-[var(--maint-border)] text-[var(--maint-icon)] flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-mono text-base font-bold text-[var(--text)] block">
                      polylance.codes
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Legacy domain
                    </span>
                  </div>
                </div>

                <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--maint-bg)] text-[var(--maint-text)] border border-[var(--maint-border)] self-start sm:self-auto">
                  Under maintenance
                </span>
              </div>
            </div>

            {/* Check a Link Tool */}
            <div className="mt-8 pt-6 border-t border-[var(--hairline)]">
              <label
                htmlFor="check-link-input"
                className="block text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-subtle)] mb-2.5"
              >
                Check a link
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-subtle)]">
                    <Search className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="check-link-input"
                    type="text"
                    value={urlInput}
                    onChange={(e) => handleLinkCheck(e.target.value)}
                    placeholder="Paste any link to verify (e.g. https://polylancezenith.com)"
                    className="w-full pl-10 pr-4 py-3 text-[16px] sm:text-sm rounded-full bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--text-subtle)] border border-[var(--hairline)] focus:outline-none focus:border-[var(--brand-hi)] transition-colors"
                  />
                </div>

                {checkResult.status !== 'idle' && (
                  <div className="flex items-center shrink-0">
                    {checkResult.status === 'official' ? (
                      <span className="px-4 py-2.5 rounded-full bg-[var(--green-900)] text-[var(--green-100)] text-xs font-semibold border border-[var(--green-border)] flex items-center gap-1.5">
                        <Check className="w-4 h-4" aria-hidden="true" />
                        OFFICIAL
                      </span>
                    ) : (
                      <span className="px-4 py-2.5 rounded-full bg-[var(--danger-bg)] text-[var(--danger-text)] text-xs font-semibold border border-[var(--danger-border)] flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" aria-hidden="true" />
                        NOT OFFICIAL
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-2.5 text-xs text-[var(--text-subtle)]">
                Client-side hostname check against our allow-list. Stores and logs nothing.
              </p>
            </div>
          </div>

          {/* Right: 3 Reassurance Cards */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="apple-card-flat p-7 rounded-[24px] flex items-start gap-4 transition-transform duration-200 hover:-translate-y-1">
              <div className="w-7 h-7 rounded-full bg-[var(--green-900)] text-[var(--green-300)] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </div>
              <p className="text-[16px] text-[var(--text)] font-semibold leading-relaxed">
                Same wallet, same on-chain jobs, escrows and certificates.
              </p>
            </div>

            <div className="apple-card-flat p-7 rounded-[24px] flex items-start gap-4 transition-transform duration-200 hover:-translate-y-1">
              <div className="w-7 h-7 rounded-full bg-[var(--green-900)] text-[var(--green-300)] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </div>
              <p className="text-[16px] text-[var(--text)] font-semibold leading-relaxed">
                We never ask for your seed phrase.
              </p>
            </div>

            <div className="apple-card-flat p-7 rounded-[24px] flex items-start gap-4 transition-transform duration-200 hover:-translate-y-1">
              <div className="w-7 h-7 rounded-full bg-[var(--green-900)] text-[var(--green-300)] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </div>
              <p className="text-[16px] text-[var(--text)] font-semibold leading-relaxed">
                Only polylancezenith.com is official.
              </p>
            </div>
          </div>
        </div>

        {/* How to Verify in 3 Steps row */}
        <div className="mt-10 pt-10 border-t border-[var(--hairline)]">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)] mb-6">
            How to verify in 3 steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verifySteps.map((step) => (
              <div key={step.num} className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-[var(--brand-tint)] text-[var(--brand-text)] font-bold text-xs flex items-center justify-center shrink-0">
                  {step.num}
                </span>
                <p className="text-sm sm:text-base text-[var(--text-muted)] font-medium leading-snug">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
