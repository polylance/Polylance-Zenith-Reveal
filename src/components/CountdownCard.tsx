import React, { useState, useEffect, useMemo } from 'react';
import { useCountdownTick } from '../countdown/countdownStore';
import { NEW_ORIGIN, REVEAL_AT_UTC, START_AT_UTC, START_LABEL, REVEAL_IST_LABEL } from '../config';
import { Calendar, Share2, CheckCircle2, ArrowRight } from 'lucide-react';

interface CountdownCardProps {
  variant?: 'hero' | 'closing';
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ variant = 'hero' }) => {
  const { units, usingDeviceClock, accessibleSummary } = useCountdownTick();
  const [copiedToast, setCopiedToast] = useState(false);

  // Count-up intro (00 -> live values over 1.2s, once per session, skipped under reduced motion)
  const [introProgress, setIntroProgress] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem('pl_zenith_counted_up') === 'true';
    return prefersReduced || seen ? 1 : 0;
  });

  useEffect(() => {
    if (introProgress >= 1 || units.isLive) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pl_zenith_counted_up', 'true');
      }
      return;
    }

    const duration = 1200;
    const start = performance.now();
    let rafId: number;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setIntroProgress(eased);

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        sessionStorage.setItem('pl_zenith_counted_up', 'true');
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [units.isLive]);

  const displayDays = introProgress < 1 ? Math.round(units.days * introProgress) : units.days;
  const displayHours = introProgress < 1 ? Math.round(units.hours * introProgress) : units.hours;
  const displayMinutes = introProgress < 1 ? Math.round(units.minutes * introProgress) : units.minutes;
  const displaySeconds = introProgress < 1 ? Math.round(units.seconds * introProgress) : units.seconds;

  const localTimeString = useMemo(() => {
    try {
      const targetDate = new Date(REVEAL_AT_UTC);
      return new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(targetDate);
    } catch {
      return null;
    }
  }, []);

  const progressPercent = useMemo(() => {
    const startMs = new Date(START_AT_UTC).getTime();
    const endMs = new Date(REVEAL_AT_UTC).getTime();
    const total = endMs - startMs;
    if (total <= 0) return 100;
    const progress = Math.max(0, Math.min(100, ((total - units.totalRemainingMs) / total) * 100));
    return Math.round(progress);
  }, [units.totalRemainingMs]);

  const handleAddToCalendar = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PolyLance Zenith//Reveal Countdown//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:polylance-zenith-reveal-20261216T183000Z@polylancezenith.com',
      'DTSTAMP:20261110T000000Z',
      'DTSTART:20261216T183000Z',
      'DTEND:20261216T193000Z',
      'SUMMARY:PolyLance Zenith reveal',
      'DESCRIPTION:PolyLance (now PolyLance Zenith) reveals its new interface on https://polylancezenith.com. Freelancing protocol on Polygon with milestone escrow and a 5% total fee.',
      'URL:https://polylancezenith.com',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'polylance-zenith-reveal.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://polylancezenith.com/';
    const shareData = {
      title: 'PolyLance Zenith reveal',
      text: 'PolyLance (now PolyLance Zenith) reveals its new interface on 17 Dec 2026.',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      // Fallback
    }
  };

  const formatTile = (num: number) => {
    if (isNaN(num)) return '--';
    return String(Math.max(0, num)).padStart(2, '0');
  };

  const isFinalMinute = !units.isLive && units.totalRemainingMs > 0 && units.totalRemainingMs < 60000;
  const isClosing = variant === 'closing';

  return (
    <div
      className={`w-full bg-[#0047AB] text-white relative overflow-hidden border border-white/15 ${
        isClosing
          ? 'rounded-[32px] sm:rounded-[40px] p-8 sm:p-14'
          : 'rounded-[28px] p-5 sm:p-7 shadow-sm'
      }`}
      style={{ backgroundColor: '#0047AB', color: '#FFFFFF' }}
    >
      {/* Screen reader live summary */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {accessibleSummary}
      </div>

      {units.isLive ? (
        /* We're Live state */
        <div className="py-5 text-center flex flex-col items-center">
          <div className="w-11 h-11 rounded-full bg-white text-[#0047AB] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            We&apos;re live
          </h3>
          <p className="mt-1.5 text-sm sm:text-base text-[#EFF6FF] max-w-md">
            The new PolyLance Zenith interface is now open.
          </p>
          <div className="mt-5">
            <a
              href={NEW_ORIGIN}
              className="btn-pill-secondary magnetic-btn inline-flex items-center gap-2 text-sm font-bold shadow-md"
            >
              <span>Enter the new PolyLance Zenith</span>
              <ArrowRight className="w-4 h-4 text-[#0047AB]" />
            </a>
          </div>
        </div>
      ) : (
        <>
          {usingDeviceClock && (
            <div className="mb-3 flex justify-end">
              <span className="text-[11px] font-medium text-white bg-white/15 px-2.5 py-0.5 rounded-full">
                Using your device clock
              </span>
            </div>
          )}

          {/* 4 Numeral Groups in ONE horizontal row with thin 30%-opacity hairlines */}
          <div className="grid grid-cols-4 items-center" aria-hidden="true">
            <div className="flex flex-col items-center text-center px-1">
              <span
                data-countdown-digit="days"
                className={`font-tabular font-extrabold text-white tracking-tight leading-none ${
                  isClosing
                    ? 'text-[40px] sm:text-[64px] md:text-[84px]'
                    : 'text-[36px] sm:text-[50px] xl:text-[64px]'
                }`}
                style={{ color: '#FFFFFF', opacity: 1 }}
              >
                {formatTile(displayDays)}
              </span>
              <span className="mt-1.5 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-white/85">
                Days
              </span>
            </div>

            <div className="flex flex-col items-center text-center px-1 border-l border-white/30">
              <span
                data-countdown-digit="hours"
                className={`font-tabular font-extrabold text-white tracking-tight leading-none ${
                  isClosing
                    ? 'text-[40px] sm:text-[64px] md:text-[84px]'
                    : 'text-[36px] sm:text-[50px] xl:text-[64px]'
                }`}
                style={{ color: '#FFFFFF', opacity: 1 }}
              >
                {formatTile(displayHours)}
              </span>
              <span className="mt-1.5 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-white/85">
                Hours
              </span>
            </div>

            <div className="flex flex-col items-center text-center px-1 border-l border-white/30">
              <span
                data-countdown-digit="minutes"
                className={`font-tabular font-extrabold text-white tracking-tight leading-none ${
                  isClosing
                    ? 'text-[40px] sm:text-[64px] md:text-[84px]'
                    : 'text-[36px] sm:text-[50px] xl:text-[64px]'
                }`}
                style={{ color: '#FFFFFF', opacity: 1 }}
              >
                {formatTile(displayMinutes)}
              </span>
              <span className="mt-1.5 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-white/85">
                Minutes
              </span>
            </div>

            <div
              className={`flex flex-col items-center text-center px-1 border-l border-white/30 rounded-2xl py-1 transition-transform ${
                isFinalMinute ? 'bg-[#FF6A1F] scale-[1.03]' : ''
              }`}
            >
              <span
                key={displaySeconds}
                data-countdown-digit="seconds"
                className={`animate-digit-roll font-tabular font-extrabold text-white tracking-tight leading-none ${
                  isClosing
                    ? 'text-[40px] sm:text-[64px] md:text-[84px]'
                    : 'text-[36px] sm:text-[50px] xl:text-[64px]'
                }`}
                style={{ color: '#FFFFFF', opacity: 1 }}
              >
                {formatTile(displaySeconds)}
              </span>
              <span className="mt-1.5 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.08em] text-white/85">
                Seconds
              </span>
            </div>
          </div>

          {/* Meta line + Right-aligned pill buttons (same row on desktop, stacked on mobile) */}
          <div className="mt-5 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-white/95 font-medium leading-snug text-center sm:text-left">
              Reveals {REVEAL_IST_LABEL}
              {localTimeString && (
                <span className="text-white/85 block xl:inline"> · your time: {localTimeString}</span>
              )}
            </p>

            <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="bg-white text-[#0A0A0F] hover:bg-[#F5F7FB] rounded-full min-h-[38px] px-4 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#0047AB]" aria-hidden="true" />
                <span>Add to calendar</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[38px] px-4 rounded-full border border-white/45 text-white hover:bg-white/10 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{copiedToast ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* 4px Progress Bar flush along card bottom edge */}
          <div
            role="progressbar"
            aria-label="Progress to reveal"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            title={`Starts counting from ${START_LABEL} · reveals 17 Dec 2026`}
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/25"
          >
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
};
