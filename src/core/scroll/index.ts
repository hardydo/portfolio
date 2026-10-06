import Lenis from 'lenis';
import type { Environment } from '@/core/env';
import { gsap, ScrollTrigger } from '@/core/gsap';

const SCROLL_DURATION = 1.2;

export interface ScrollOptions {
  /** Called when the scroll lands; not called if the reader takes over the scroll first. */
  onComplete?: () => void;
}

export interface ScrollController {
  /** Scroll to an element, or to a pixel offset from the top. */
  scrollTo(target: HTMLElement | number, options?: ScrollOptions): void;
  pause(): void;
  resume(): void;
}

export function createScroll({ reducedMotion }: Environment): ScrollController {
  // env.ts owns the reduced-motion decision; Lenis would otherwise make every scrollTo instant on its own.
  const lenis = reducedMotion
    ? null
    : new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.2, respectReducedMotion: false });
  if (lenis) {
    lenis.on('scroll', () => ScrollTrigger.update());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  let timer: number | undefined;
  new ResizeObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
  }).observe(document.body);

  return {
    scrollTo(target, { onComplete } = {}) {
      if (lenis) {
        lenis.scrollTo(target, { duration: SCROLL_DURATION, onComplete });
        return;
      }
      // Without Lenis the motion is reduced, so the jump is instant and has already landed.
      if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'auto' });
      else target.scrollIntoView({ behavior: 'auto' });
      onComplete?.();
    },
    pause() {
      lenis?.stop();
    },
    resume() {
      lenis?.start();
    },
  };
}
