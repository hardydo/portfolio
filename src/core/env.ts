export interface Environment {
  reducedMotion: boolean;
  finePointer: boolean;
  small: boolean;
}

/* Product decision: the site always animates, even when the OS asks for reduced motion. Setting this to true
   honours prefers-reduced-motion in the scripts only; the CSS animations would need their own media query. */
const HONOUR_REDUCED_MOTION = false;

export function readEnvironment(): Environment {
  const matches = (query: string) => window.matchMedia(query).matches;
  return {
    reducedMotion: HONOUR_REDUCED_MOTION && matches('(prefers-reduced-motion: reduce)'),
    finePointer: matches('(hover: hover) and (pointer: fine)'),
    small: matches('(max-width: 720px)'),
  };
}
