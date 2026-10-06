import { profile } from './profile.ts';
import { projects } from './projects.ts';
import type { Profile, Project } from './types.ts';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

function projectItem({ title, year, type, description, url }: Project): string {
  const link = url
    ? `<a class="link" href="${escapeHtml(url)}" target="_blank" rel="noopener">Visit project ↗</a>`
    : '';
  return `<li class="works__item"><span class="works__meta">${escapeHtml(`${year} · ${type}`)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p>${link}</li>`;
}

/** Values for the {{name}} slots in index.html, so static content ships in the HTML and never shifts the layout. */
export function contentSlots(
  source: Profile = profile,
  work: Project[] = projects,
  year = new Date().getFullYear(),
): Record<string, string> {
  return {
    name: escapeHtml(source.name),
    fullName: escapeHtml(source.fullName),
    email: escapeHtml(source.email),
    location: escapeHtml(source.location),
    year: String(year),
    role: escapeHtml(source.roles[0] ?? ''),
    roles: escapeHtml(source.roles.join(', ')),
    longestRole: escapeHtml(source.roles.reduce((a, b) => (b.length > a.length ? b : a), '')),
    focus: escapeHtml(source.roles.slice(0, 2).join(' · ')),
    facts: source.facts
      .map(({ label, value }) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
      .join(''),
    bio: source.bio.map((paragraph) => `<p data-reveal>${escapeHtml(paragraph)}</p>`).join(''),
    socials: source.socials
      .map(
        ({ label, url }) =>
          `<li><a class="link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)}</a></li>`,
      )
      .join(''),
    projectCount: String(work.length),
    projects: work.map(projectItem).join(''),
    cv: source.cvUrl
      ? `<a class="btn btn--ghost" href="${escapeHtml(source.cvUrl)}" download data-magnetic>Download CV</a>`
      : '',
  };
}

export function fillSlots(html: string, slots: Record<string, string>): string {
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name: string) => {
    const value = slots[name];
    if (value === undefined) throw new Error(`index.html uses an unknown content slot: {{${name}}}`);
    return value;
  });
}
