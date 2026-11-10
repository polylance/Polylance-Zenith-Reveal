import React from 'react';
import { FAQ_ITEMS } from '../config';
import { ChevronDown } from 'lucide-react';
import { StormCloudDivider } from './StormCloudDivider';

export const FaqSection: React.FC = () => {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="w-full bg-[var(--bg-alt)] border-t border-[var(--hairline)]"
    >
      <StormCloudDivider topBg="var(--bg)" bottomBg="var(--bg-alt)" flip />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 section-spacing">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Header */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-text)] block mb-3">
              FAQ
            </span>
            <h2
              id="faq-heading"
              className="text-[34px] sm:text-[48px] font-extrabold tracking-[-0.03em] text-[var(--text)] leading-[1.08] max-w-[14ch]"
            >
              Questions, answered.
            </h2>
            <p className="mt-4 text-[17px] text-[var(--text-muted)] leading-[1.6] max-w-[36ch]">
              Key details about the rename, escrow mechanics, and the 17 December reveal.
            </p>
          </div>

          {/* Right Accessible Accordion (<details> / <summary>) */}
          <div className="lg:col-span-8 space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group bg-[var(--surface)] border border-[var(--hairline)] rounded-[24px] overflow-hidden transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 p-6 sm:p-7 cursor-pointer list-none font-bold text-base sm:text-lg text-[var(--text)] select-none hover:text-[var(--brand-text)] transition-colors">
                  <span>{item.question}</span>
                  <span className="w-8 h-8 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <ChevronDown className="w-4 h-4 text-[var(--text)]" aria-hidden="true" />
                  </span>
                </summary>
                <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-1 text-[16px] text-[var(--text-muted)] leading-[1.65] max-w-[62ch]">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
