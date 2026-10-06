export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - clamp01(t), 3);
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Frame-rate independent factor for `value += (target - value) * damp(dt, rate)`. */
export function damp(dt: number, rate: number): number {
  return 1 - Math.exp(-dt * rate);
}

/** Returns a function that turns absolute ticker time into a clamped per-frame delta. */
export function createClock(maxStep = 0.05): (time: number) => number {
  let last: number | null = null;
  return (time) => {
    const dt = last === null ? 1 / 60 : Math.min(maxStep, time - last);
    last = time;
    return dt;
  };
}
