import { experience as jobs } from '@/content';
import type { Experience } from '@/content';
import { cssVar, el, qs, qsa } from '@/core/dom';
import { gsap, ScrollTrigger } from '@/core/gsap';
import { displayColor, techIcon, techMark, techTitle } from '@/lib/tech-icons';
import type { Feature } from '../types';

function renderRole(job: Experience, ink: string): HTMLLIElement {
  const role = el('li', 'experience__role');
  const body = el('div', 'experience__body');
  body.dataset.reveal = '';

  const highlights = el('ul', 'experience__highlights');
  job.highlights.forEach((line) => highlights.append(el('li', '', line)));

  const tools = el('ul', 'experience__stack');
  tools.setAttribute('aria-label', 'Technologies used');
  for (const slug of job.stack) {
    const tool = el('li');
    tool.title = techTitle(slug);
    tool.style.setProperty('--brand', displayColor(techIcon(slug), ink));
    tool.append(techMark(slug), el('span', 'visually-hidden', techTitle(slug)));
    tools.append(tool);
  }

  body.append(
    el('h3', 'experience__title', job.role),
    el('p', 'experience__company', `${job.company} · ${job.location}`),
    el('p', 'experience__summary', job.summary),
    highlights,
    tools,
  );
  role.append(el('p', 'experience__period', job.period), body);
  return role;
}

function animate(timeline: HTMLElement, reducedMotion: boolean) {
  const progress = qs('.experience__progress', timeline);
  const roles = qsa('.experience__role', timeline);

  if (reducedMotion) {
    if (progress) gsap.set(progress, { scaleY: 1 });
    roles.forEach((role) => role.classList.add('is-reached'));
    return;
  }

  if (progress) {
    gsap.fromTo(
      progress,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 70%', scrub: true },
      },
    );
  }
  for (const role of roles) {
    ScrollTrigger.create({
      trigger: role,
      start: 'top 70%',
      onEnter: () => role.classList.add('is-reached'),
      onLeaveBack: () => role.classList.remove('is-reached'),
    });
  }
}

export const experience: Feature = {
  name: 'experience',
  describe: () => `${jobs.length} roles`,
  init({ env }) {
    const timeline = qs('[data-timeline]');
    if (!timeline) return;
    const ink = cssVar('--ink');
    const progress = el('span', 'experience__progress');
    progress.setAttribute('aria-hidden', 'true');
    timeline.replaceChildren(progress, ...jobs.map((job) => renderRole(job, ink)));
    animate(timeline, env.reducedMotion);
  },
};
