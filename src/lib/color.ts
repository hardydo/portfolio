const HEX = /^#?([0-9a-f]{6})$/i;

function channels(hex: string): [number, number, number] {
  const match = HEX.exec(hex.trim());
  if (!match) throw new Error(`Expected a 6-digit hex colour, got "${hex}"`);
  const n = parseInt(match[1] as string, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function isHexColor(value: string): boolean {
  return HEX.test(value.trim());
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = channels(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mixHex(hex: string, toHex: string, amount: number): string {
  const from = channels(hex);
  const to = channels(toHex);
  const mix = (i: 0 | 1 | 2) => Math.round(from[i] + (to[i] - from[i]) * amount);
  return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}

/** Rough perceived brightness in 0..1, good enough to decide if a colour reads on a dark page. */
export function perceivedBrightness(hex: string): number {
  const [r, g, b] = channels(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
