import React, { useState } from 'react';
import { Wrench, ChevronDown, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('pl_zenith_announcement_dismissed') === 'true';
  });

  const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pl_zenith_announcement_dismissed', 'true');
    }
  };

  if (isDismissed) return null;

  return (
    <div
      role="region"
      aria-label="Maintenance and rebrand notice"
      className="w-full bg-[var(--maint-bg)] border-b border-[var(--maint-border)] text-[var(--text)] text-xs sm:text-[13px] font-medium transition-colors"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 min-h-[40px] py-2 flex items-center justify-between gap-3">
        {/* Left: Icon + Content */}
        <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
          <Wrench className="w-3.5 h-3.5 text-[var(--maint-icon)] shrink-0" aria-hidden="true" />

          {/* Desktop Single-line content */}
          <div className="hidden md:flex items-center gap-2 truncate">
            <span className="font-semibold text-[var(--text)]">PolyLance is now PolyLance Zenith</span>
            <span className="text-[var(--text-subtle)]">·</span>
            <span className="text-[var(--text-muted)]">polylance.codes is under maintenance</span>
            <span className="text-[var(--text-subtle)]">·</span>
            <span className="text-[var(--text-muted)]">
              Official site: <strong className="text-[var(--text)]">polylancezenith.com</strong>
            </span>
          </div>

          {/* Mobile responsive view with More expander */}
          <div className="flex md:hidden flex-col gap-1 text-[12px] leading-tight flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-[var(--text)]">PolyLance is now PolyLance Zenith</span>
              <span className="text-[var(--text-muted)]">· polylance.codes under maintenance</span>
              {!isMobileExpanded && (
                <button
                  type="button"
                  onClick={() => setIsMobileExpanded(true)}
                  className="text-[var(--maint-text)] font-semibold underline ml-1 inline-flex items-center cursor-pointer"
                >
                  More
                  <ChevronDown className="w-3 h-3 ml-0.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {isMobileExpanded && (
              <div className="mt-1 pt-1 border-t border-[var(--maint-border)] text-[var(--text-muted)]">
                Official site: <strong className="text-[var(--text)]">polylancezenith.com</strong>
              </div>
            )}
          </div>
        </div>

        {/* Right: Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss notice"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
