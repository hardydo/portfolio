import { describe, expect, it } from 'vitest';
import { isHexColor, mixHex, perceivedBrightness, withAlpha } from './color';

describe('color helpers', () => {
  it('converts hex to rgba with alpha', () => {
    expect(withAlpha('#e8a34a', 0.5)).toBe('rgba(232, 163, 74, 0.5)');
  });

  it('mixes two colours by amount', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('rgb(0, 0, 0)');
    expect(mixHex('#000000', '#ffffff', 1)).toBe('rgb(255, 255, 255)');
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('rgb(128, 128, 128)');
  });

  it('ranks brightness from black to white', () => {
    expect(perceivedBrightness('#000000')).toBe(0);
    expect(perceivedBrightness('#ffffff')).toBeCloseTo(1);
    expect(perceivedBrightness('#61dafb')).toBeGreaterThan(perceivedBrightness('#143055'));
  });

  it('validates 6-digit hex colours only', () => {
    expect(isHexColor('#3d5a80')).toBe(true);
    expect(isHexColor('#fff')).toBe(false);
    expect(isHexColor('blue')).toBe(false);
    expect(() => withAlpha('blue', 1)).toThrow(/6-digit hex/);
  });
});
