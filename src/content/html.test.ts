import { describe, expect, it } from 'vitest';
import { contentSlots, fillSlots } from './html';
import { profile } from './profile';
import { projects } from './projects';

describe('content slots', () => {
  it('fills every slot and rejects unknown ones', () => {
    expect(fillSlots('<p>{{ name }}·{{year}}</p>', { name: 'a', year: '2026' })).toBe('<p>a·2026</p>');
    expect(() => fillSlots('{{missing}}', {})).toThrow(/missing/);
  });

  it('escapes content so it cannot break the markup', () => {
    const slots = contentSlots({ ...profile, bio: ['<b>"x" & y</b>'] }, projects, 2026);
    expect(slots.bio).toBe('<p data-reveal>&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;</p>');
  });

  it('leaves the CV link out until there is a CV', () => {
    expect(contentSlots({ ...profile, cvUrl: null }, projects, 2026).cv).toBe('');
    expect(contentSlots({ ...profile, cvUrl: '/cv.pdf' }, projects, 2026).cv).toContain('href="/cv.pdf"');
  });
});
