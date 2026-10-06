import * as THREE from 'three';
import { projects } from '@/content';
import { emit, on } from '@/core/events';
import { createClock, damp } from '../engine/math';
import { progressOf } from '../engine/progress';
import type { MountView } from '../engine/types';
import { viewInput } from '../engine/view-input';
import { cardTexture } from '../textures/card';

const CARD_W = 2.1;
const CARD_H = 2.73;
const STEP = 0.34;
const RADIUS = 8;
// How far below centre the cards sit before the section has scrolled in.
const ENTER_DROP = 0.7;
const EDGE_GAP = 18;
const FLING = 220;

function roundedPlane(width: number, height: number, radius: number): THREE.ShapeGeometry {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  // ShapeGeometry UVs are in shape units; remap them to 0..1 so the card texture fills the plane.
  const geometry = new THREE.ShapeGeometry(shape, 8);
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) - x) / width, (position.getY(i) - y) / height);
  }
  return geometry;
}

/** The project carousel. It shows whichever project the works section makes active and asks it for changes. */
export const mount: MountView = (element, { reducedMotion }) => {
  const section = element.closest('section') ?? document.body;
  const getEnter = reducedMotion ? () => 1 : progressOf(section, 'top 85%', 'top 25%');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const geometry = roundedPlane(CARD_W, CARD_H, 0.12);
  // Hover is tested against a static, slightly larger plane so the scale-up animation cannot
  // move the hit boundary under the cursor and cause flicker. Raycasting ignores visibility, so it is never drawn.
  const hitGeometry = new THREE.PlaneGeometry(CARD_W * 1.04, CARD_H * 1.04);
  const hitIndex = new Map<THREE.Object3D, number>();

  const cards = projects.map((project, index) => {
    const group = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      map: cardTexture(project, index, projects.length),
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const hit = new THREE.Mesh(hitGeometry);
    hit.visible = false;
    hitIndex.set(hit, index);
    group.add(mesh, hit);
    scene.add(group);
    return { group, mesh, material, scale: 1 };
  });
  const hitTargets = [...hitIndex.keys()];

  const last = projects.length - 1;
  const clampIndex = (value: number) => Math.min(last, Math.max(0, value));
  const rubberBand = (value: number) =>
    value < 0 ? value * 0.35 : value > last ? last + (value - last) * 0.35 : value;
  let width = element.clientWidth;
  let height = element.clientHeight;
  const cardPixels = () => Math.max(120, width * 0.22);

  let active = 0;
  let target = 0;
  let current = 0;
  let dragFrom = 0;
  let velocity = 0;
  let wheelTimer: number | undefined;
  let edge = -1;

  const raycaster = new THREE.Raycaster();
  const cardBottom = new THREE.Vector3();
  const tick = createClock();

  const select = (index: number) => {
    target = clampIndex(index);
    emit('works:select', target);
  };

  function pick(): number {
    raycaster.setFromCamera(input.ndc, camera);
    const hit = raycaster.intersectObjects(hitTargets, false)[0];
    return hit ? (hitIndex.get(hit.object) ?? -1) : -1;
  }

  function open(index: number) {
    const url = projects[index]?.url;
    if (url) window.open(url, '_blank', 'noopener');
  }

  const input = viewInput(element, {
    claim: (dx, dy) => Math.abs(dx) > Math.abs(dy),
    onDragStart: () => {
      dragFrom = target;
      velocity = 0;
    },
    onDrag: ({ dx, stepX, stepMs }) => {
      velocity = stepX / stepMs;
      target = rubberBand(dragFrom - dx / cardPixels());
    },
    onDragEnd: () => select(Math.round(target - (velocity * FLING) / cardPixels())),
    onTap: () => {
      const index = pick();
      if (index < 0) return;
      if (index === active) open(index);
      else select(index);
    },
  });

  on('works:active', (index) => {
    active = index;
    if (!input.dragging) target = index;
  });

  element.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      // Stop horizontal swipes reaching Lenis, which would otherwise nudge the page vertically.
      event.preventDefault();
      event.stopPropagation();
      target = rubberBand(target + event.deltaX / cardPixels());
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => select(Math.round(target)), 140);
    },
    { passive: false },
  );

  element.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') select(active + 1);
    else if (event.key === 'ArrowLeft') select(active - 1);
    else if (event.key === 'Enter') open(active);
    else return;
    event.preventDefault();
    event.stopPropagation();
  });

  // Reports the centred card's bottom edge in pixels from the top of the view, so the page can hang its link there.
  function reportEdge(cardY: number) {
    cardBottom.set(0, cardY - CARD_H / 2, 0).project(camera);
    const y = Math.round(((1 - cardBottom.y) / 2) * height + EDGE_GAP);
    if (y === edge) return;
    edge = y;
    emit('works:card-edge', y);
  }

  function update(time: number, rect: DOMRect) {
    input.setRect(rect);
    width = rect.width;
    height = rect.height;
    const follow = reducedMotion ? 1 : damp(tick(time), 9);
    current += (target - current) * follow;

    const hovered = input.hovering && !input.dragging ? pick() : -1;
    element.classList.toggle('is-hovering', hovered >= 0);

    const enter = getEnter();
    const spread = 0.55 + 0.45 * enter;
    const drop = (1 - enter) * -ENTER_DROP;
    reportEdge(drop);

    cards.forEach((card, index) => {
      const angle = (index - current) * STEP * spread;
      card.group.position.set(Math.sin(angle) * RADIUS, drop, RADIUS - Math.cos(angle) * RADIUS);
      card.group.rotation.y = -angle;

      card.scale += ((index === hovered ? 1.05 : 1) - card.scale) * follow;
      card.mesh.scale.setScalar(card.scale);

      const distance = Math.abs(index - current);
      card.material.opacity = Math.max(0, 1 - Math.max(0, distance - 2.2) * 0.6) * (0.2 + 0.8 * enter);
      card.group.visible = card.material.opacity > 0.01;
    });
  }

  function onAspect(aspect: number) {
    camera.position.z = aspect < 1.1 ? 10 + (1.1 - aspect) * 7 : 10;
  }

  return { element, scene, camera, update, onAspect };
};
