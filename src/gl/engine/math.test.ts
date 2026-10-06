import { describe, expect, it } from 'vitest';
import { clamp01, createClock, damp, easeInOutCubic, easeOutCubic } from './math';

describe('math', () => {
  it('clamps to 0..1', () => {
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(3)).toBe(1);
  });

  it('eases between fixed endpoints', () => {
    for (const ease of [easeOutCubic, easeInOutCubic]) {
      expect(ease(0)).toBe(0);
      expect(ease(1)).toBe(1);
      expect(ease(-1)).toBe(0);
      expect(ease(2)).toBe(1);
    }
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  it('damps independently of frame rate', () => {
    const oneStep = damp(1 / 30, 5);
    const twoSteps = 1 - (1 - damp(1 / 60, 5)) ** 2;
    expect(oneStep).toBeCloseTo(twoSteps, 10);
  });

  it('clamps large frame gaps so a background tab does not cause a jump', () => {
    const tick = createClock(0.05);
    tick(10);
    expect(tick(10.016)).toBeCloseTo(0.016);
    expect(tick(25)).toBe(0.05);
  });
});
