import type { Experience } from './types.ts';

export const experience: Experience[] = [
  {
    period: '2024 — Now',
    role: 'Senior Frontend Engineer',
    company: 'Company name',
    location: 'Remote',
    summary: 'Own the frontend of a multi-app TypeScript monorepo: architecture, performance and the component system.',
    highlights: [
      'Moved four apps into one Nx workspace with shared UI and contracts.',
      'Brought the main marketing site from a 3.1 s to a 1.2 s LCP.',
      'Mentor two junior developers through weekly pairing and code review.',
    ],
    stack: ['typescript', 'nextdotjs', 'react', 'nestjs', 'nx'],
  },
  {
    period: '2021 — 2024',
    role: 'Frontend Developer',
    company: 'Product studio',
    location: 'Ho Chi Minh City',
    summary: 'Built client products end to end, from Figma hand-off to production deploys.',
    highlights: [
      'Shipped 15+ web apps and storefronts for clients across three markets.',
      'Introduced a shared design-token pipeline between Figma and code.',
      'Created the studio’s WebGL starter used for interactive campaigns.',
    ],
    stack: ['react', 'threedotjs', 'gsap', 'shopify', 'figma'],
  },
  {
    period: '2019 — 2021',
    role: 'Web Developer',
    company: 'Digital agency',
    location: 'Vietnam',
    summary: 'Started in a fast-paced agency, building marketing sites on tight timelines.',
    highlights: [
      'Delivered 20+ responsive marketing sites, many with custom animation.',
      'Set up the agency’s first Git-based review and deploy workflow.',
    ],
    stack: ['javascript', 'html5', 'css', 'nodedotjs', 'git'],
  },
];
