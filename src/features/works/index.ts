import { projects } from '@/content';
import { qs } from '@/core/dom';
import { emit, on } from '@/core/events';
import { ScrollTrigger } from '@/core/gsap';
import type { ScrollController } from '@/core/scroll';
import type { Feature } from '../types';
import { slicePosition, sliceOf } from './slices';

const pad2 = (n: number) => String(n).padStart(2, '0');

function caption(section: HTMLElement) {
  const count = qs('[data-works-count]', section);
  const title = qs('[data-works-title]', section);
  const description = qs('[data-works-desc]', section);
  const link = qs('[data-works-link]', section, HTMLAnchorElement);
  const prev = qs('[data-works-prev]', section, HTMLButtonElement);
  const next = qs('[data-works-next]', section, HTMLButtonElement);

  return {
    prev,
    next,
    link,
    show(index: number) {
      const project = projects[index];
      if (!project) return;
      if (count) count.textContent = `${pad2(index + 1)} / ${pad2(projects.length)}`;
      if (title) title.textContent = project.title;
      if (description) description.textContent = project.description;
      if (link) {
        // Without a URL the button stays visible but inert, so the layout never jumps between projects.
        if (project.url) {
          link.href = project.url;
          link.removeAttribute('aria-disabled');
        } else {
          link.removeAttribute('href');
          link.setAttribute('aria-disabled', 'true');
        }
      }
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === projects.length - 1;
    },
  };
}

/* The works section owns which project is active. While the section is pinned, each project owns an equal
   slice of its scroll distance, so choosing a project scrolls to that slice and scrolling picks the project. */
function wire(section: HTMLElement, scroll: ScrollController) {
  const sticky = qs('[data-works-sticky]', section);
  const view = caption(section);
  let active = -1;
  let pinned = false;
  let seeking = false;

  const setActive = (index: number) => {
    if (index === active) return;
    active = index;
    view.show(index);
    emit('works:active', index);
  };

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onRefresh: () => {
      pinned = sticky !== null && getComputedStyle(sticky).position === 'sticky';
    },
    onUpdate: (self) => {
      if (pinned && !seeking) setActive(sliceOf(self.progress, projects.length));
    },
  });

  const select = (index: number) => {
    const target = Math.min(projects.length - 1, Math.max(0, index));
    setActive(target);
    if (!pinned) return;
    seeking = true;
    scroll.scrollTo(slicePosition(trigger.start, trigger.end, target, projects.length), {
      onComplete: () => {
        seeking = false;
      },
    });
  };

  // A wheel, touch or key during a seek takes over the scroll, and the seek never completes.
  const cancelSeek = () => {
    seeking = false;
  };
  for (const type of ['wheel', 'touchstart', 'keydown'] as const) {
    window.addEventListener(type, cancelSeek, { passive: true });
  }

  on('works:select', select);
  on('works:card-edge', (y) => view.link?.style.setProperty('--works-link-y', `${y}px`));
  view.prev?.addEventListener('click', () => select(active - 1));
  view.next?.addEventListener('click', () => select(active + 1));
  setActive(0);
}

export const works: Feature = {
  name: 'works',
  describe: () => `${projects.length} projects`,
  init({ scroll }) {
    const section = qs('[data-works]');
    if (section) wire(section, scroll);
  },
};
