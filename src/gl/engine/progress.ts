import { ScrollTrigger } from '@/core/gsap';

export function progressOf(trigger: Element, start: string, end: string): () => number {
  const instance = ScrollTrigger.create({ trigger, start, end });
  return () => instance.progress;
}
