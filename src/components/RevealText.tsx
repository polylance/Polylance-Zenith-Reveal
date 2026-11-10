import React, { useEffect, useRef } from 'react';
import { loadGsap } from '../motion/gsapLoader';

interface RevealTextProps {
  text: string;
  className?: string;
  as?: 'p' | 'div' | 'h2' | 'h3';
  cobaltHighlight?: boolean;
}

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  className = '',
  as: Component = 'p',
  cobaltHighlight = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let isDisposed = false;
    let revertFn: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (isDisposed || !containerRef.current) return;

      const ctx = gsap.context(() => {
        const wordEls = containerRef.current!.querySelectorAll('.reveal-word');
        if (!wordEls.length) return;

        gsap.fromTo(
          wordEls,
          { opacity: 0.18 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              end: 'top 35%',
              scrub: 0.4,
            },
          }
        );
      }, containerRef);

      revertFn = () => ctx.revert();
    });

    return () => {
      isDisposed = true;
      if (revertFn) revertFn();
    };
  }, [text]);

  return (
    <Component
      ref={containerRef as React.RefObject<never>}
      className={`${className} ${cobaltHighlight ? 'text-[var(--brand-text)]' : ''}`}
    >
      {words.map((word, idx) => (
        <React.Fragment key={idx}>
          <span className="reveal-word inline-block">{word}</span>
          {idx < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Component>
  );
};
