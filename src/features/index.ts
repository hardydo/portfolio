import { approach } from './approach';
import { backToTop } from './back-to-top';
import { experience } from './experience';
import { hero } from './hero';
import { magnetic } from './magnetic';
import { marquee } from './marquee';
import { navigation } from './navigation';
import { reveal } from './reveal';
import { stack } from './stack';
import type { Feature } from './types';
import { works } from './works';

/** Initialised in order. Features that render content come before the ones that animate it. */
export const features: Feature[] = [
  hero,
  marquee,
  stack,
  experience,
  works,
  navigation,
  backToTop,
  approach,
  reveal,
  magnetic,
];
