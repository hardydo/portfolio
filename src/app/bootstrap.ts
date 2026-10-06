import { createBoot } from '@/core/boot';
import { markNoWebGL, qs } from '@/core/dom';
import { readEnvironment } from '@/core/env';
import { createScroll } from '@/core/scroll';
import { features } from '@/features';
import { sceneSteps, views } from '@/gl/registry';
import type { AppContext } from './context';

// Asked the same way as the renderer, so a device that would only get software WebGL skips the download too.
function supportsWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

function scheduleScene(ctx: AppContext, mounted: typeof views) {
  if (!supportsWebGL()) {
    markNoWebGL();
    ctx.boot.step('webgl', 'unavailable — text fallback', 'info');
    ctx.boot.finish();
    return;
  }

  const start = () => {
    // Fetched alongside the engine rather than after it; startScene reuses the same module promises.
    for (const view of mounted) view.load().catch(() => undefined);
    return import('@/gl')
      .then(({ startScene }) => startScene(ctx))
      .catch((error: unknown) => {
        console.error(error);
        markNoWebGL();
        ctx.boot.step('webgl', 'failed — text fallback', 'info');
        ctx.boot.finish();
      });
  };

  // The boot screen already covers the page, so WebGL can start immediately. Without it, wait for
  // first paint so the text content (the LCP) never waits on three.js.
  if (ctx.boot.active) {
    start();
    return;
  }
  const queue = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1200 });
    else setTimeout(start, 200);
  };
  if (document.readyState === 'complete') queue();
  else window.addEventListener('load', queue, { once: true });
}

export function bootstrap(): void {
  const env = readEnvironment();
  const scroll = createScroll(env);
  const boot = createBoot(() => scroll.resume());
  if (boot.active) scroll.pause();
  const ctx: AppContext = { env, scroll, boot };

  const mounted = views.filter((view) => qs(view.selector));
  boot.expect(1 + features.length + sceneSteps(mounted.length));
  boot.step(
    'env',
    `${env.finePointer ? 'mouse' : 'touch'} · ${window.innerWidth}×${window.innerHeight} · ${env.reducedMotion ? 'reduced motion' : 'full motion'}`,
    'info',
  );

  for (const feature of features) {
    feature.init(ctx);
    boot.step(feature.name, feature.describe?.() ?? 'ready');
  }
  scheduleScene(ctx, mounted);
}
