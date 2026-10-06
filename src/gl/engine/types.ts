import type { Camera, PerspectiveCamera, Scene } from 'three';
import type { Palette } from './palette';
import type { Pointer } from './pointer';

/** A 3D scene drawn into the on-screen box of a DOM element. */
export interface GLView {
  element: HTMLElement;
  scene: Scene;
  camera: PerspectiveCamera;
  update(time: number, rect: DOMRect): void;
  onAspect?(aspect: number): void;
}

/** A full-viewport layer drawn behind every view. */
export interface GLBackground {
  scene: Scene;
  camera: Camera;
  resize(width: number, height: number, pixelRatio: number): void;
  update(time: number): void;
}

export interface ViewEnv {
  reducedMotion: boolean;
  small: boolean;
  pointer: Pointer;
  palette: Palette;
  /** Runs once the boot screen starts lifting, or straight away if it already has. */
  whenBooted(callback: () => void): void;
}

export type MountView = (element: HTMLElement, env: ViewEnv) => GLView;
