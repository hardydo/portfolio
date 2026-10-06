import { REVISION } from 'three';
import type { AppContext } from '@/app/context';
import { markNoWebGL, qs } from '@/core/dom';
import { gsap, ScrollTrigger } from '@/core/gsap';
import { readPalette } from './engine/palette';
import { createPointer } from './engine/pointer';
import { createStage } from './engine/stage';
import type { ViewEnv } from './engine/types';
import { views } from './registry';
import { createDotGrid } from './views/dot-grid';

export async function startScene({ env, boot }: AppContext): Promise<void> {
  try {
    boot.step('three.js', `r${REVISION} · lazy chunk`);
    const palette = readPalette();
    const canvas = qs('#gl', document, HTMLCanvasElement);
    const stage = canvas ? createStage(canvas, { small: env.small, clearColor: palette.bg }) : null;
    if (!canvas || !stage) {
      markNoWebGL();
      boot.step('webgl', 'unavailable — text fallback', 'info');
      return;
    }
    boot.step('webgl', `${canvas.clientWidth}×${canvas.clientHeight} · one shared context`);

    const viewEnv: ViewEnv = {
      reducedMotion: env.reducedMotion,
      small: env.small,
      pointer: createPointer(),
      palette,
      whenBooted: boot.whenDone,
    };
    stage.setBackground(createDotGrid(viewEnv));
    gsap.ticker.add(stage.render);

    await Promise.all(
      views.map(async ({ name, selector, load }) => {
        const element = qs(selector);
        if (!element) return;
        const { mount } = await load();
        await stage.add(mount(element, viewEnv));
        boot.step(name, 'scene mounted');
      }),
    );
    // Intro animations play once the boot screen lifts, with no input to keep the frame rate up.
    boot.whenDone(stage.wake);

    ScrollTrigger.refresh();
    document.documentElement.classList.add('gl-ready');
  } finally {
    boot.finish();
  }
}
