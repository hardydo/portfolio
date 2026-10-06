import { gsap, ScrollTrigger } from '@/core/gsap';
import type { Feature } from '../types';

// Must run after every feature that renders [data-reveal] content.
export const reveal: Feature = {
  name: 'reveal',
  init({ env }) {
    if (env.reducedMotion) return;
    const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
    gsap.set(items, { autoAlpha: 0, y: 32 });
    ScrollTrigger.batch(items, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.05 }),
    });
  },
};
