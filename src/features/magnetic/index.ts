import { qsa } from '@/core/dom';
import { gsap } from '@/core/gsap';
import type { Feature } from '../types';

export const magnetic: Feature = {
  name: 'magnetic',
  init({ env }) {
    if (env.reducedMotion || !env.finePointer) return;
    for (const element of qsa('[data-magnetic]')) {
      const toX = gsap.quickTo(element, 'x', { duration: 0.45, ease: 'power3.out' });
      const toY = gsap.quickTo(element, 'y', { duration: 0.45, ease: 'power3.out' });
      // Measured once on entry, at rest: re-reading it while the element moves would force a layout every move.
      let rect = element.getBoundingClientRect();
      element.addEventListener('pointerenter', () => {
        rect = element.getBoundingClientRect();
      });
      element.addEventListener('pointermove', (event) => {
        toX((event.clientX - (rect.left + rect.width / 2)) * 0.25);
        toY((event.clientY - (rect.top + rect.height / 2)) * 0.35);
      });
      element.addEventListener('pointerleave', () => {
        toX(0);
        toY(0);
      });
    }
  },
};
