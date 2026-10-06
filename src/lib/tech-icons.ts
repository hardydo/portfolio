import type { SimpleIcon } from 'simple-icons';
import {
  siCloudflare,
  siCss,
  siDocker,
  siFigma,
  siFramer,
  siGit,
  siGithub,
  siGithubactions,
  siGsap,
  siHtml5,
  siJavascript,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siNx,
  siPnpm,
  siPostgresql,
  siPrisma,
  siReact,
  siRedis,
  siShopify,
  siSupabase,
  siTailwindcss,
  siThreedotjs,
  siTurborepo,
  siTypescript,
  siVercel,
  siVite,
} from 'simple-icons';
import { el } from '@/core/dom';
import { perceivedBrightness } from './color';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Import only the icons in use; the full simple-icons set is several megabytes.
const registry = new Map<string, SimpleIcon>(
  [
    siCloudflare,
    siCss,
    siDocker,
    siFigma,
    siFramer,
    siGit,
    siGithub,
    siGithubactions,
    siGsap,
    siHtml5,
    siJavascript,
    siNestjs,
    siNextdotjs,
    siNodedotjs,
    siNx,
    siPnpm,
    siPostgresql,
    siPrisma,
    siReact,
    siRedis,
    siShopify,
    siSupabase,
    siTailwindcss,
    siThreedotjs,
    siTurborepo,
    siTypescript,
    siVercel,
    siVite,
  ].map((icon) => [icon.slug, icon]),
);

export function techIcon(slug: string): SimpleIcon | null {
  return registry.get(slug) ?? null;
}

export function techTitle(slug: string): string {
  return registry.get(slug)?.title ?? slug;
}

/** Brands like Next.js, Vercel and Three.js are black, which disappears on a dark page. */
export function displayColor(icon: SimpleIcon | null, ink: string): string {
  if (!icon) return ink;
  const brand = `#${icon.hex}`;
  return perceivedBrightness(brand) < 0.25 ? ink : brand;
}

function iconSvg(icon: SimpleIcon): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', icon.path);
  svg.append(path);
  return svg;
}

export function techMark(slug: string): Element {
  const icon = techIcon(slug);
  if (icon) return iconSvg(icon);
  const fallback = el('span', 'tech-fallback', techTitle(slug).charAt(0).toUpperCase());
  fallback.setAttribute('aria-hidden', 'true');
  return fallback;
}
