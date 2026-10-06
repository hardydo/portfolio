import type { Boot } from '@/core/boot';
import type { Environment } from '@/core/env';
import type { ScrollController } from '@/core/scroll';

export interface AppContext {
  env: Environment;
  scroll: ScrollController;
  boot: Boot;
}
