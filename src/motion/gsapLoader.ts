import type gsapType from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

let cachedPromise: Promise<{ gsap: typeof gsapType; ScrollTrigger: typeof ScrollTriggerType }> | null = null;

export function loadGsap() {
  if (!cachedPromise) {
    cachedPromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([gsapMod, stMod]) => {
      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return cachedPromise;
}

