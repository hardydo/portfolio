export interface AppEvents {
  /** A stack chip is under the pointer (its tech slug), or none is. */
  'stack:hover': string | null;
  /** The globe highlights this tech, from its own hover, a pinned logo or a stack chip. */
  'globe:highlight': string | null;
  /** The carousel asks for a project; the works section decides how to show it. */
  'works:select': number;
  /** The works section's active project changed. */
  'works:active': number;
  /** Pixels from the top of the carousel to just below its centred card. */
  'works:card-edge': number;
}

export function emit<K extends keyof AppEvents>(name: K, detail: AppEvents[K]): void {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<K extends keyof AppEvents>(name: K, handler: (detail: AppEvents[K]) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<AppEvents[K]>).detail);
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
