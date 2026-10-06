import { stack as tools, stackGroups } from '@/content';
import { cssVar, el, qs, qsa } from '@/core/dom';
import { emit, on } from '@/core/events';
import { displayColor, techIcon, techMark, techTitle } from '@/lib/tech-icons';
import type { Feature } from '../types';

function renderGroups(container: HTMLElement) {
  const ink = cssVar('--ink');
  container.replaceChildren(
    ...stackGroups.map((group) => {
      const row = el('div', 'stack__group');
      row.dataset.reveal = '';
      const list = el('ul', 'stack__chips');
      list.setAttribute('aria-label', group.label);
      list.append(
        ...tools
          .filter((tech) => tech.group === group.id)
          .map((tech) => {
            const chip = el('li', 'stack__chip');
            chip.dataset.slug = tech.slug;
            chip.style.setProperty('--brand', displayColor(techIcon(tech.slug), ink));
            chip.append(techMark(tech.slug), el('span', 'stack__chip-name', techTitle(tech.slug)));
            return chip;
          }),
      );
      row.append(el('p', 'stack__group-label', group.label), list);
      return row;
    }),
  );
}

function wireInteractions(container: HTMLElement) {
  const chips = qsa('[data-slug]', container);
  for (const chip of chips) {
    chip.addEventListener('pointerenter', () => emit('stack:hover', chip.dataset.slug ?? null));
    chip.addEventListener('pointerleave', () => emit('stack:hover', null));
  }

  on('globe:highlight', (slug) => {
    chips.forEach((chip) => chip.classList.toggle('is-lit', chip.dataset.slug === slug));
  });
}

export const stack: Feature = {
  name: 'stack',
  describe: () => `${tools.length} tools`,
  init() {
    const container = qs('[data-stack-groups]');
    if (!container) return;
    renderGroups(container);
    wireInteractions(container);
  },
};
