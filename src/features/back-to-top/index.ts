import { qs } from '@/core/dom';
import { ScrollTrigger } from '@/core/gsap';
import type { Feature } from '../types';

const SHOW_AFTER_PX = 4;
// The ring is drawn with pathLength="100", so a dash offset of N hides N percent of it.
const RING_LENGTH = 100;

export const backToTop: Feature = {
  name: 'back-to-top',
  init({ scroll }) {
    const button = qs('[data-back-to-top]', document, HTMLButtonElement);
    const ring = qs('[data-back-to-top-ring]', document, SVGCircleElement);
    if (!button || !ring) return;

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        ring.style.strokeDashoffset = String(RING_LENGTH * (1 - self.progress));
        button.classList.toggle('is-visible', self.scroll() > SHOW_AFTER_PX);
      },
    });

    button.addEventListener('click', () => {
      scroll.scrollTo(0);
      // The button hides at the top, which would drop keyboard focus onto the document.
      qs('[data-back-to-top-focus]')?.focus({ preventScroll: true });
    });
  },
};
