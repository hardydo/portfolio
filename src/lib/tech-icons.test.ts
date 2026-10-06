import { describe, expect, it } from 'vitest';
import { displayColor, techIcon, techTitle } from './tech-icons';

const INK = '#efe9df';

describe('tech icons', () => {
  it('resolves known slugs and falls back for unknown ones', () => {
    expect(techIcon('react')?.title).toBe('React');
    expect(techIcon('not-a-tech')).toBeNull();
    expect(techTitle('not-a-tech')).toBe('not-a-tech');
  });

  it('keeps bright brand colours', () => {
    expect(displayColor(techIcon('react'), INK)).toBe('#61DAFB');
  });

  it('swaps near-black brand colours for the ink colour so they stay visible', () => {
    expect(displayColor(techIcon('nextdotjs'), INK)).toBe(INK);
    expect(displayColor(techIcon('vercel'), INK)).toBe(INK);
    expect(displayColor(null, INK)).toBe(INK);
  });
});
