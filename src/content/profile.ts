import type { Profile } from './types.ts';

export const profile: Profile = {
  name: 'hardydo',
  fullName: 'Hardy Do',
  since: 2020,
  roles: ['Frontend Engineer', 'Creative Developer', 'TypeScript specialist', 'WebGL tinkerer'],
  location: 'Bac Ninh, Viet Nam',
  bio: [
    "I'm Hardy Do, a frontend engineer from Bac Ninh, Viet Nam. For the past six years I've been turning designs and rough product ideas into web apps that load fast and hold up once real people start using them.",
    'Most days are TypeScript and React; the good ones also involve a little WebGL. I care about the details users only notice when they are missing: keyboard support, honest loading states, and pages that stay quick on a mid-range phone.',
    "Away from the editor I'm usually somewhere near the sea, or rebuilding this site one more time.",
  ],
  cvUrl: null,
  email: 'hardydo.dev@gmail.com',
  socials: [
    { label: 'GitHub', url: 'https://github.com/hardydo' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/hardydo/' },
    { label: 'Facebook', url: 'https://www.facebook.com/hardydo' },
  ],
  facts: [
    {
      value: '6+',
      label: 'years building for the web',
    },
    {
      value: '30+',
      label: 'projects shipped',
    },
    {
      value: '95+',
      label: 'Lighthouse performance',
    },
  ],
};
