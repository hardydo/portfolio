import { cssVar } from '@/core/dom';

/** Colours come from the CSS custom properties in src/styles/tokens.css, so the theme lives in one place. */
export interface Palette {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  leather: string;
  leatherLight: string;
  leatherDeep: string;
}

export function readPalette(): Palette {
  return {
    bg: cssVar('--bg'),
    ink: cssVar('--ink'),
    muted: cssVar('--muted'),
    accent: cssVar('--accent'),
    leather: cssVar('--leather'),
    leatherLight: cssVar('--leather-light'),
    leatherDeep: cssVar('--leather-deep'),
  };
}
