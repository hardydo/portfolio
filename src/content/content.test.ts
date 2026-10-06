import { describe, expect, it } from 'vitest';
import { isHexColor } from '@/lib/color';
import { techIcon } from '@/lib/tech-icons';
import { experience, profile, projects, stack, stackGroups } from './index';

describe('content integrity', () => {
  it('uses only tech slugs that have a logo', () => {
    const unknown = [...stack.map((tech) => tech.slug), ...experience.flatMap((job) => job.stack)].filter(
      (slug) => !techIcon(slug),
    );
    expect(unknown, 'add these to src/lib/tech-icons.ts or fix the slug').toEqual([]);
  });

  it('lists each technology once', () => {
    const slugs = stack.map((tech) => tech.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('only references stack groups that exist', () => {
    const groups = new Set(stackGroups.map((group) => group.id));
    expect(stack.filter((tech) => !groups.has(tech.group))).toEqual([]);
  });

  it('gives every project a valid colour and an https link or none', () => {
    for (const project of projects) {
      expect(isHexColor(project.color), project.title).toBe(true);
      if (project.url !== null) expect(project.url, project.title).toMatch(/^https:\/\//);
    }
  });

  it('has the profile fields the page renders', () => {
    expect(profile.roles.length).toBeGreaterThan(0);
    expect(profile.facts.length).toBeGreaterThan(0);
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(profile.bio.length).toBeGreaterThan(0);
  });

  it('links every social profile over https', () => {
    for (const social of profile.socials) expect(social.url, social.label).toMatch(/^https:\/\//);
  });
});
