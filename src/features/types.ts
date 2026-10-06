import type { AppContext } from '@/app/context';

export interface Feature {
  name: string;
  init(ctx: AppContext): void;
  /** Short status shown on the boot screen, e.g. "25 tools". */
  describe?(): string;
}
