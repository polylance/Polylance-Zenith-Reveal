import { useEffect, useRef } from 'react';
import type LenisType from 'lenis';
import { loadGsap } from './gsapLoader';

let globalLenis: LenisType | null = null;

export function scrollToAnchor(targetId: string): void {
  if (typeof window === 'undefined') return;
  const el = document.querySelector(targetId) as HTMLElement | null;
  if (!el) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (globalLenis && !prefersReduced) {
    globalLenis.scrollTo(el, {
      offset: -64,
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else {
    el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
  }
}

export function useLenisScroll() {
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return;
    }

    let isDisposed = false;
    let cleanupTicker: (() => void) | null = null;
    let lenisInstance: LenisType | null = null;

    Promise.all([import('lenis'), loadGsap()]).then(([lenisMod, { gsap, ScrollTrigger }]) => {
      if (isDisposed) return;

      const Lenis = lenisMod.default;
      const lenis = new Lenis({
        lerp: 0.09,
        wheelMultiplier: 1,
        syncTouch: false,
      });

      lenisInstance = lenis;
      globalLenis = lenis;

      lenis.on('scroll', () => {
        ScrollTrigger.update();

        if (progressBarRef.current) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
          progressBarRef.current.style.transform = `scaleX(${progress})`;
        }
      });

      const tickerCallback = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      cleanupTicker = () => {
        gsap.ticker.remove(tickerCallback);
      };
    });

    return () => {
      isDisposed = true;
      if (cleanupTicker) cleanupTicker();
      if (lenisInstance) {
        lenisInstance.destroy();
        globalLenis = null;
      }
    };
  }, []);

  return { progressBarRef };
}
