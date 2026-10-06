import type { StackGroup, StackItem } from './types.ts';

export const stackGroups: StackGroup[] = [
  {
    id: 'languages',
    label: 'Languages',
  },
  {
    id: 'frontend',
    label: 'Frontend',
  },
  {
    id: 'backend',
    label: 'Backend & data',
  },
  {
    id: 'tooling',
    label: 'Tooling & cloud',
  },
];

export const stack: StackItem[] = [
  {
    slug: 'typescript',
    group: 'languages',
    level: 'Daily',
  },
  {
    slug: 'javascript',
    group: 'languages',
    level: 'Daily',
  },
  {
    slug: 'html5',
    group: 'languages',
    level: 'Daily',
  },
  {
    slug: 'css',
    group: 'languages',
    level: 'Daily',
  },
  {
    slug: 'react',
    group: 'frontend',
    level: 'Daily',
  },
  {
    slug: 'nextdotjs',
    group: 'frontend',
    level: 'Daily',
  },
  {
    slug: 'vite',
    group: 'frontend',
    level: 'Daily',
  },
  {
    slug: 'tailwindcss',
    group: 'frontend',
    level: 'Production',
  },
  {
    slug: 'threedotjs',
    group: 'frontend',
    level: 'Production',
  },
  {
    slug: 'gsap',
    group: 'frontend',
    level: 'Production',
  },
  {
    slug: 'shopify',
    group: 'frontend',
    level: 'Production',
  },
  {
    slug: 'nodedotjs',
    group: 'backend',
    level: 'Daily',
  },
  {
    slug: 'nestjs',
    group: 'backend',
    level: 'Production',
  },
  {
    slug: 'postgresql',
    group: 'backend',
    level: 'Production',
  },
  {
    slug: 'prisma',
    group: 'backend',
    level: 'Production',
  },
  {
    slug: 'supabase',
    group: 'backend',
    level: 'Familiar',
  },
  {
    slug: 'redis',
    group: 'backend',
    level: 'Familiar',
  },
  {
    slug: 'git',
    group: 'tooling',
    level: 'Daily',
  },
  {
    slug: 'github',
    group: 'tooling',
    level: 'Daily',
  },
  {
    slug: 'docker',
    group: 'tooling',
    level: 'Production',
  },
  {
    slug: 'nx',
    group: 'tooling',
    level: 'Production',
  },
  {
    slug: 'pnpm',
    group: 'tooling',
    level: 'Daily',
  },
  {
    slug: 'cloudflare',
    group: 'tooling',
    level: 'Production',
  },
  {
    slug: 'vercel',
    group: 'tooling',
    level: 'Production',
  },
  {
    slug: 'figma',
    group: 'tooling',
    level: 'Daily',
  },
];
