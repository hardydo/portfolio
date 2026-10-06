import { qs, qsa } from '@/core/dom';
import { ScrollTrigger } from '@/core/gsap';
import type { Feature } from '../types';

export const approach: Feature = {
  name: 'approach',
  init() {
    const list = qs('[data-steps]');
    const section = list?.closest('section');
    const steps = list ? qsa(':scope > li', list) : [];
    if (!section || steps.length === 0) return;

    let active = 0;
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const next = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        if (next === active) return;
        active = next;
        steps.forEach((step, i) => step.classList.toggle('is-active', i === active));
      },
    });
  },
};
