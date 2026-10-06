import * as THREE from 'three';
import type { StackItem } from '@/content';
import { stack, stackGroups } from '@/content';
import { qs } from '@/core/dom';
import { emit, on } from '@/core/events';
import { displayColor, techIcon } from '@/lib/tech-icons';
import { createClock, damp } from '../engine/math';
import type { MountView } from '../engine/types';
import { viewInput } from '../engine/view-input';
import { logoTexture } from '../textures/logo';

const RADIUS = 2.2;
const LOGO_SIZE = 0.6;
const FRONT = new THREE.Vector3(0, 0, 1);
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
// Logos show at a fraction of their texture size on phones, where texture memory is also tightest.
const SMALL_SCREEN_LOGO_SCALE = 0.5;
// Radians of turn per pixel dragged.
const DRAG_TURN = 0.006;

interface Logo {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  tech: StackItem;
  title: string;
  direction: THREE.Vector3;
  size: number;
}

export const mount: MountView = (element, { reducedMotion, small, palette }) => {
  const label = qs('[data-globe-label]', element.closest('section') ?? document.body);
  const groupLabels = new Map(stackGroups.map((group) => [group.id, group.label]));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 8.4);

  const globe = new THREE.Group();
  globe.rotation.set(0.35, -0.4, 0);
  scene.add(globe);
  globe.add(
    new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(RADIUS * 0.93, 2)),
      new THREE.LineBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.07 }),
    ),
  );

  const placed = stack.flatMap((tech) => {
    const icon = techIcon(tech.slug);
    return icon ? [{ tech, icon }] : [];
  });
  // Fibonacci sphere: spreads any number of points evenly over the surface.
  const logos: Logo[] = placed.map(({ tech, icon }, i) => {
    const y = 1 - (i / Math.max(1, placed.length - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    const direction = new THREE.Vector3(Math.cos(theta) * ring, y, Math.sin(theta) * ring);

    const material = new THREE.SpriteMaterial({
      map: logoTexture(icon, displayColor(icon, palette.ink), palette, small ? SMALL_SCREEN_LOGO_SCALE : 1),
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(direction).multiplyScalar(RADIUS);
    sprite.scale.setScalar(LOGO_SIZE);
    globe.add(sprite);
    return { sprite, material, tech, title: icon.title, direction, size: LOGO_SIZE };
  });
  const bySlug = new Map(logos.map((logo) => [logo.tech.slug, logo]));
  const bySprite = new Map<THREE.Object3D, Logo>(logos.map((logo) => [logo.sprite, logo]));
  const sprites = logos.map((logo) => logo.sprite);

  let focusSlug: string | null = null;
  let pinnedSlug: string | null = null;
  let hoverSlug: string | null = null;
  let shownSlug: string | null | undefined;
  let velocityX = 0;
  let velocityY = 0;

  const raycaster = new THREE.Raycaster();
  const step = new THREE.Quaternion();
  const target = new THREE.Quaternion();
  const world = new THREE.Vector3();
  const tick = createClock();

  on('stack:hover', (slug) => {
    focusSlug = slug;
  });

  function rotateBy(yaw: number, pitch: number) {
    step.setFromAxisAngle(AXIS_Y, yaw);
    globe.quaternion.premultiply(step);
    step.setFromAxisAngle(AXIS_X, pitch);
    globe.quaternion.premultiply(step);
  }

  function pick(): string | null {
    raycaster.setFromCamera(input.ndc, camera);
    for (const hit of raycaster.intersectObjects(sprites, false)) {
      const logo = bySprite.get(hit.object);
      if (!logo) continue;
      // Ignore logos on the far side of the globe that the ray passes through.
      world.copy(logo.direction).applyQuaternion(globe.quaternion);
      if (world.z > -0.1) return logo.tech.slug;
    }
    return null;
  }

  const input = viewInput(element, {
    // On touch, a mostly vertical gesture is a page scroll, not a globe drag.
    claim: (dx, dy, event) => event.pointerType === 'mouse' || Math.abs(dx) >= Math.abs(dy),
    onDragStart: () => {
      pinnedSlug = null;
    },
    onDrag: ({ stepX, stepY, stepMs }, event) => {
      const yaw = stepX * DRAG_TURN;
      const pitch = event.pointerType === 'mouse' ? stepY * DRAG_TURN : 0;
      rotateBy(yaw, pitch);
      velocityY = Math.max(-4, Math.min(4, yaw / (stepMs / 1000)));
      velocityX = Math.max(-4, Math.min(4, pitch / (stepMs / 1000)));
    },
    onTap: () => {
      const slug = pick();
      pinnedSlug = slug === pinnedSlug ? null : slug;
    },
  });

  function showLabel(slug: string | null) {
    if (slug === shownSlug) return;
    shownSlug = slug;
    emit('globe:highlight', slug);
    if (!label) return;
    const logo = slug ? bySlug.get(slug) : undefined;
    if (logo)
      label.textContent = `${logo.title} · ${groupLabels.get(logo.tech.group) ?? logo.tech.group} · ${logo.tech.level}`;
    label.classList.toggle('is-visible', Boolean(logo));
  }

  function update(time: number, rect: DOMRect) {
    input.setRect(rect);
    const dt = tick(time);
    const follow = reducedMotion ? 1 : damp(dt, 6);
    const dragging = input.dragging;

    hoverSlug = input.hovering && !dragging ? pick() : null;
    element.classList.toggle('is-hovering', Boolean(hoverSlug));

    const steer = bySlug.get(focusSlug ?? pinnedSlug ?? '');
    if (steer && !dragging) {
      target.setFromUnitVectors(steer.direction, FRONT);
      globe.quaternion.slerp(target, damp(dt, 5));
      velocityX = 0;
      velocityY = 0;
    } else if (!dragging) {
      const friction = Math.exp(-dt * 2.5);
      velocityX *= friction;
      velocityY *= friction;
      const idleSpin = reducedMotion || hoverSlug ? 0 : 0.14;
      rotateBy((idleSpin + velocityY) * dt, velocityX * dt);
    }

    const lit = hoverSlug ?? focusSlug ?? pinnedSlug;
    showLabel(lit);

    for (const logo of logos) {
      world.copy(logo.direction).applyQuaternion(globe.quaternion);
      const depth = (world.z + 1) / 2;
      const opacity = 0.15 + 0.85 * depth;
      logo.material.opacity += (opacity - logo.material.opacity) * follow;
      const size = LOGO_SIZE * (logo.tech.slug === lit ? 1.5 : 1);
      logo.size += (size - logo.size) * follow;
      logo.sprite.scale.setScalar(logo.size);
    }
  }

  function onAspect(aspect: number) {
    camera.position.z = aspect < 1 ? 8.4 / aspect : 8.4;
  }

  return { element, scene, camera, update, onAspect };
};
