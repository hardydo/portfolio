import { profile } from '@/content';
import { qs } from '@/core/dom';
import { gsap } from '@/core/gsap';
import type { Feature } from '../types';

function startRotator(reducedMotion: boolean) {
  const roles = profile.roles;
  const label = qs('[data-rotator]');
  if (!label || reducedMotion || roles.length < 2) return;

  let index = 0;
  window.setInterval(() => {
    if (document.hidden) return;
    index = (index + 1) % roles.length;
    gsap
      .timeline()
      .to(label, { yPercent: -110, autoAlpha: 0, duration: 0.35, ease: 'power2.in' })
      .call(() => {
        label.textContent = roles[index] ?? '';
      })
      .fromTo(label, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
  }, 2600);
}

export const hero: Feature = {
  name: 'hero',
  init({ env }) {
    startRotator(env.reducedMotion);
  },
};
