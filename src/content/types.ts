export interface Fact {
  value: string;
  label: string;
}

export interface Social {
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  fullName: string;
  /** First year of professional work, shown in the book's inside cover. */
  since: number;
  roles: string[];
  location: string;
  /** About section paragraphs, in order. */
  bio: string[];
  cvUrl: string | null;
  email: string;
  socials: Social[];
  facts: Fact[];
}

export type StackGroupId = 'languages' | 'frontend' | 'backend' | 'tooling';
export type StackLevel = 'Daily' | 'Production' | 'Familiar';

export interface StackGroup {
  id: StackGroupId;
  label: string;
}

export interface StackItem {
  /** A slug from src/lib/tech-icons.ts, e.g. "react" or "nextdotjs". */
  slug: string;
  group: StackGroupId;
  level: StackLevel;
}

export interface Experience {
  period: string;
  role: string;
  company: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface Project {
  title: string;
  year: string;
  type: string;
  description: string;
  tags: string[];
  /** Card background, as a 6-digit hex colour. */
  color: string;
  url: string | null;
}
