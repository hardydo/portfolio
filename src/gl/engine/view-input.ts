import { Vector2 } from 'three';

const DRAG_THRESHOLD = 6;

export interface DragMove {
  /** Pixels from where the gesture started. */
  dx: number;
  dy: number;
  /** Pixels since the previous move, and the milliseconds that took. */
  stepX: number;
  stepY: number;
  stepMs: number;
}

interface ViewInputOptions {
  /** Whether a gesture that has moved past the threshold is a drag of this view rather than a page scroll. */
  claim(dx: number, dy: number, event: PointerEvent): boolean;
  onDragStart?(event: PointerEvent): void;
  onDrag(move: DragMove, event: PointerEvent): void;
  onDragEnd?(event: PointerEvent): void;
  /** A press and release that never moved past the threshold. */
  onTap?(event: PointerEvent): void;
}

export interface ViewInput {
  /** The pointer in normalised device coordinates over the view, for raycasting. */
  readonly ndc: Vector2;
  /** True while a pointer is over the view or dragging it. */
  readonly hovering: boolean;
  readonly dragging: boolean;
  /** The view's on-screen box from the frame loop, so pointer moves never force a layout read. */
  setRect(rect: DOMRect): void;
}

interface Gesture {
  id: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  t: number;
  state: 'pending' | 'dragging';
}

/** Pointer tracking and drag-versus-tap handling shared by the interactive views. */
export function viewInput(element: HTMLElement, options: ViewInputOptions): ViewInput {
  const ndc = new Vector2();
  let rect: DOMRect | null = null;
  let hovering = false;
  let gesture: Gesture | null = null;

  const locate = (event: PointerEvent) => {
    const box = rect ?? element.getBoundingClientRect();
    ndc.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
  };

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    locate(event);
    const { clientX: x, clientY: y, timeStamp: t } = event;
    gesture = { id: event.pointerId, x0: x, y0: y, x, y, t, state: 'pending' };
  });

  element.addEventListener('pointermove', (event) => {
    locate(event);
    hovering = true;
    if (!gesture || event.pointerId !== gesture.id) return;

    const dx = event.clientX - gesture.x0;
    const dy = event.clientY - gesture.y0;
    if (gesture.state === 'pending') {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!options.claim(dx, dy, event)) {
        gesture = null;
        return;
      }
      // Captured only once the drag is certain, so plain clicks and page scrolls are never swallowed.
      gesture.state = 'dragging';
      element.setPointerCapture(event.pointerId);
      element.classList.add('is-dragging');
      options.onDragStart?.(event);
    }

    const move: DragMove = {
      dx,
      dy,
      stepX: event.clientX - gesture.x,
      stepY: event.clientY - gesture.y,
      stepMs: Math.max(1, event.timeStamp - gesture.t),
    };
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    gesture.t = event.timeStamp;
    options.onDrag(move, event);
  });

  const end = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    if (gesture.state === 'dragging') {
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      element.classList.remove('is-dragging');
      options.onDragEnd?.(event);
    } else if (event.type === 'pointerup') {
      options.onTap?.(event);
    }
    gesture = null;
  };
  element.addEventListener('pointerup', end);
  element.addEventListener('pointercancel', end);
  element.addEventListener('pointerleave', () => {
    if (gesture?.state !== 'dragging') hovering = false;
  });

  return {
    ndc,
    get hovering() {
      return hovering;
    },
    get dragging() {
      return gesture?.state === 'dragging';
    },
    setRect(next) {
      rect = next;
    },
  };
}
