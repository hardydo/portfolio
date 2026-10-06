import { qsa } from '@/core/dom';
import { ScrollTrigger } from '@/core/gsap';
import type { ScrollController } from '@/core/scroll';
import type { Feature } from '../types';

const OWNS_KEYS = 'input, textarea, select, [contenteditable="true"]';

// On narrow screens the header nav scrolls sideways; keep the active item in view.
function centerInNav(link: HTMLAnchorElement, reducedMotion: boolean) {
  const nav = link.parentElement;
  if (!nav || nav.scrollWidth <= nav.clientWidth) return;
  nav.scrollTo({
    left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
    behavior: reducedMotion ? 'auto' : 'smooth',
  });
}

function trackActiveSection(links: HTMLAnchorElement[], sections: HTMLElement[], reducedMotion: boolean) {
  const setActive = (id: string) => {
    for (const link of links) {
      const active = link.dataset.spy === id;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'true');
        centerInNav(link, reducedMotion);
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  for (const section of sections) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) setActive(section.id);
      },
    });
  }
  if (sections[0]) setActive(sections[0].id);
}

function handleAnchorClicks(scroll: ScrollController) {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const hash = link.getAttribute('href') ?? '';
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!target) return;

    event.preventDefault();
    scroll.scrollTo(target);
    history.replaceState(null, '', hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

function handleKeyboard(sections: HTMLElement[], scroll: ScrollController) {
  const currentIndex = () => {
    const probe = window.innerHeight * 0.35;
    let index = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= probe) index = i;
    });
    return index;
  };

  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(OWNS_KEYS)) return;

    const index = currentIndex();
    let next: number;
    switch (event.key) {
      case 'PageDown':
        next = index + 1;
        break;
      case 'PageUp':
        next = index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = sections.length - 1;
        break;
      case ' ':
        if (target?.closest('button, a, summary, [role="button"]')) return;
        next = event.shiftKey ? index - 1 : index + 1;
        break;
      default:
        return;
    }

    const section = sections[Math.max(0, Math.min(sections.length - 1, next))];
    if (!section) return;
    event.preventDefault();
    scroll.scrollTo(section);
  });
}

export const navigation: Feature = {
  name: 'navigation',
  init({ env, scroll }) {
    // [data-spy] links are the single source of truth for which sections exist and in what order.
    // More than one nav may carry the same ids, so deduplicate before resolving sections.
    const links = qsa('[data-spy]', document, HTMLAnchorElement);
    const ids = [...new Set(links.map((link) => link.dataset.spy ?? ''))];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    trackActiveSection(links, sections, env.reducedMotion);
    handleAnchorClicks(scroll);
    handleKeyboard(sections, scroll);
  },
};
