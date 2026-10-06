/** Index of the project whose equal slice of the pinned scroll contains `progress` (0..1). */
export function sliceOf(progress: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}

/** Scroll offset of the middle of a project's slice, between the pin's start and end offsets. */
export function slicePosition(start: number, end: number, index: number, count: number): number {
  return start + ((end - start) * (index + 0.5)) / count;
}
