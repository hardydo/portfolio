import { describe, expect, it } from 'vitest';
import { meterText } from '.';

const barOf = (text: string) => text.slice(1, text.indexOf(']'));

describe('boot meter', () => {
  it('keeps a constant width at every progress value', () => {
    for (let p = 0; p <= 1; p += 0.013) expect(barOf(meterText(p))).toHaveLength(24);
  });

  it('renders empty and full bars', () => {
    expect(meterText(0)).toBe(`[${' '.repeat(24)}]   0%`);
    expect(meterText(1)).toBe(`[${'█'.repeat(24)}] 100%`);
  });

  it('uses a partial block between whole cells', () => {
    expect(barOf(meterText(0.5 + 1 / 48))).toBe(`${'█'.repeat(12)}▌${' '.repeat(11)}`);
  });

  it('clamps out-of-range progress', () => {
    expect(meterText(-1)).toBe(meterText(0));
    expect(meterText(2)).toBe(meterText(1));
  });
});
