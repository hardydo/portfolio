export interface Pointer {
  /** Viewport pixels. */
  x: number;
  y: number;
  /** Normalised to -1..1 across the viewport. */
  nx: number;
  ny: number;
  /** True only for a mouse that is currently over the page. */
  active: boolean;
}

export function createPointer(): Pointer {
  const pointer: Pointer = { x: 0, y: 0, nx: 0, ny: 0, active: false };
  window.addEventListener(
    'pointermove',
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.nx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = (event.clientY / window.innerHeight) * 2 - 1;
      pointer.active = event.pointerType === 'mouse';
    },
    { passive: true },
  );
  window.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) pointer.active = false;
  });
  return pointer;
}
