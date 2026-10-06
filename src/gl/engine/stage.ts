import { WebGLRenderer } from 'three';
import type { Material, Object3D, Texture } from 'three';
import type { GLBackground, GLView } from './types';

// Without input for this long the page counts as idle and draws every other frame.
const IDLE_AFTER_MS = 3000;
// A device that keeps missing 45 fps for this many frames in a row drops to one pixel per CSS pixel.
const SLOW_FRAME_MS = 22;
const SLOW_STREAK = 90;
const WAKE_EVENTS = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart', 'scroll'] as const;

export interface Stage {
  render(time: number): void;
  /** Compiles the view's shaders and uploads its textures before it is added, so first sight never stalls. */
  add(view: GLView): Promise<void>;
  setBackground(view: GLBackground): void;
  /** Counts as input, keeping full frame rate for animations that play without any. */
  wake(): void;
}

interface StageOptions {
  small: boolean;
  clearColor: string;
}

function texturesOf(object: Object3D): Texture[] {
  const material = (object as Object3D & { material?: Material | Material[] }).material;
  const materials = Array.isArray(material) ? material : material ? [material] : [];
  return materials.flatMap((entry) => {
    const map = (entry as Material & { map?: Texture | null }).map;
    return map ? [map] : [];
  });
}

/** One WebGL context for the whole page; each view draws into its element's scissor box. */
export function createStage(canvas: HTMLCanvasElement, { small, clearColor }: StageOptions): Stage | null {
  const devicePixelRatio = window.devicePixelRatio || 1;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      // Multisampling buys little on a dense screen and costs a full-size buffer.
      antialias: devicePixelRatio < 1.5,
      alpha: false,
      powerPreference: 'default',
      // Software rendering would drag scrolling down with it; the text fallback serves those devices better.
      failIfMajorPerformanceCaveat: true,
    });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.25 : 1.5));
  renderer.setClearColor(clearColor, 1);
  // Views share the context and clear only their own region, so clearing is manual.
  renderer.autoClear = false;

  const views: GLView[] = [];
  let background: GLBackground | null = null;
  let width = 0;
  let height = 0;
  let sizeDirty = true;
  new ResizeObserver(() => {
    sizeDirty = true;
  }).observe(canvas);

  let lastInput = performance.now();
  const wake = () => {
    lastInput = performance.now();
  };
  for (const type of WAKE_EVENTS) window.addEventListener(type, wake, { passive: true });

  let lastTime = 0;
  let slowStreak = 0;
  let skipFrame = false;

  function syncSize() {
    if (!sizeDirty) return;
    sizeDirty = false;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    background?.resize(width, height, renderer.getPixelRatio());
  }

  function watchFrameRate(time: number) {
    const frameMs = (time - lastTime) * 1000;
    lastTime = time;
    if (renderer.getPixelRatio() <= 1 || document.hidden) return;
    slowStreak = frameMs > SLOW_FRAME_MS ? slowStreak + 1 : 0;
    if (slowStreak < SLOW_STREAK) return;
    renderer.setPixelRatio(1);
    sizeDirty = true;
  }

  function render(time: number) {
    watchFrameRate(time);
    if (performance.now() - lastInput > IDLE_AFTER_MS) {
      skipFrame = !skipFrame;
      if (skipFrame) return;
    }

    syncSize();
    renderer.setScissorTest(false);
    renderer.clear(true, true, true);

    if (background) {
      renderer.setViewport(0, 0, width, height);
      background.update(time);
      renderer.render(background.scene, background.camera);
    }

    renderer.setScissorTest(true);
    for (const view of views) {
      // Read every frame: the pinned sections move their views with position: sticky, which no cache would follow.
      const rect = view.element.getBoundingClientRect();
      if (rect.width === 0 || rect.bottom < 0 || rect.top > height || rect.right < 0 || rect.left > width) continue;

      const bottom = height - rect.bottom;
      renderer.setViewport(rect.left, bottom, rect.width, rect.height);
      renderer.setScissor(rect.left, bottom, rect.width, rect.height);

      const aspect = rect.width / rect.height;
      if (Math.abs(view.camera.aspect - aspect) > 1e-4) {
        view.camera.aspect = aspect;
        view.onAspect?.(aspect);
        view.camera.updateProjectionMatrix();
      }

      view.update(time, rect);
      renderer.clearDepth();
      renderer.render(view.scene, view.camera);
    }
  }

  return {
    render,
    async add(view) {
      await renderer.compileAsync(view.scene, view.camera);
      view.scene.traverse((object) => texturesOf(object).forEach((texture) => renderer.initTexture(texture)));
      views.push(view);
    },
    setBackground(view) {
      background = view;
      sizeDirty = true;
    },
    wake,
  };
}
