import { describe, expect, it } from 'vitest';
import { slicePosition, sliceOf } from './slices';

describe('works slices', () => {
  it('maps every slice midpoint back to its own project', () => {
    for (let index = 0; index < 6; index++) {
      const position = slicePosition(1000, 4000, index, 6);
      expect(sliceOf((position - 1000) / 3000, 6)).toBe(index);
    }
  });

  it('keeps the ends of the pinned range on the first and last project', () => {
    expect(sliceOf(0, 6)).toBe(0);
    expect(sliceOf(1, 6)).toBe(5);
    expect(sliceOf(-0.2, 6)).toBe(0);
    expect(sliceOf(1.3, 6)).toBe(5);
  });
});
