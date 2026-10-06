import type { MountView } from './engine/types';

interface ViewEntry {
  name: string;
  /** The DOM placeholder the view renders into. Pages without it never download the view. */
  selector: string;
  load: () => Promise<{ mount: MountView }>;
}

export const views: ViewEntry[] = [
  { name: 'book', selector: '[data-view="book"]', load: () => import('./views/book') },
  { name: 'globe', selector: '[data-view="globe"]', load: () => import('./views/globe') },
  { name: 'helix', selector: '[data-view="helix"]', load: () => import('./views/helix') },
  { name: 'cards', selector: '[data-view="cards"]', load: () => import('./views/cards') },
];

/** Lines startScene prints to the boot log: the engine and the context, then one per mounted view. */
export const sceneSteps = (mountedViews: number): number => 2 + mountedViews;
