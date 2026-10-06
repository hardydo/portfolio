import { stack } from '@/content';
import { cssVar, el, qs } from '@/core/dom';
import { displayColor, techIcon, techMark, techTitle } from '@/lib/tech-icons';
import type { Feature } from '../types';

export const marquee: Feature = {
  name: 'marquee',
  describe: () => `${stack.length * 2} logos`,
  init() {
    const track = qs('[data-marquee]');
    if (!track) return;
    const ink = cssVar('--ink');

    // Two identical groups let the track slide by exactly -50% and loop without a seam.
    const group = () => {
      const list = el('div', 'marquee__group');
      for (const { slug } of stack) {
        const item = el('span', 'marquee__item');
        item.style.setProperty('--brand', displayColor(techIcon(slug), ink));
        item.append(techMark(slug), document.createTextNode(techTitle(slug)));
        list.append(item);
      }
      return list;
    };
    track.replaceChildren(group(), group());

    // A masked, endlessly moving strip keeps the compositor busy even when it is scrolled away.
    new IntersectionObserver(([entry]) => {
      track.classList.toggle('is-paused', !entry?.isIntersecting);
    }).observe(track);
  },
};
