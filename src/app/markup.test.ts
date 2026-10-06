import { describe, expect, it } from 'vitest';
import { contentSlots, fillSlots } from '@/content/html';
import { views } from '@/gl/registry';
import page from '/index.html?raw';

const html = fillSlots(page, contentSlots());
const sources = import.meta.glob<string>(['/src/**/*.ts', '!/src/**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('index.html and the code agree', () => {
  it('has every data hook the scripts look up', () => {
    const hooks = new Set<string>();
    for (const source of Object.values(sources)) {
      for (const [, name] of source.matchAll(/\bqs\('\[data-([\w-]+)\]'/g)) hooks.add(name ?? '');
    }
    expect(hooks.size).toBeGreaterThan(10);
    const missing = [...hooks].filter((name) => !new RegExp(`\\sdata-${name}[\\s=>]`).test(html));
    expect(missing).toEqual([]);
  });

  it('has a placeholder for every registered 3D view', () => {
    for (const view of views) expect(html, view.name).toContain(view.selector.slice(1, -1));
  });

  it('links every nav item to a section that exists', () => {
    const spies = [...html.matchAll(/data-spy="([\w-]+)"/g)].map(([, id]) => id);
    expect(spies.length).toBeGreaterThan(0);
    for (const id of spies) expect(html, `#${id}`).toMatch(new RegExp(`<section[^>]*\\sid="${id}"`));
  });
});
