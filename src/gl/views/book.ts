import * as THREE from 'three';
import { profile } from '@/content';
import { gsap } from '@/core/gsap';
import { clamp01, createClock, damp, easeInOutCubic } from '../engine/math';
import { progressOf } from '../engine/progress';
import type { MountView } from '../engine/types';
import { coverTexture, edgeTexture, insideCoverTexture, pageTexture, shadowTexture } from '../textures/book';

const WIDTH = 1.7;
const HEIGHT = 2.3;
const COVER = 0.05;
const BLOCK = 0.26;
const PAGES = 8;
const PAGE_GAP = 0.0016;
// Smallest angle (radians) a sheet trails the one above it, so nothing passes through the cover.
const TRAIL = 0.04;

// Pages are seen small and at an angle on phones, where texture memory is also tightest.
const SMALL_SCREEN_PAGE_SCALE = 0.75;

export const mount: MountView = (element, { pointer, reducedMotion, small, palette, whenBooted }) => {
  const getProgress = progressOf(element.closest('section') ?? element, 'top top', 'bottom top');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0.15, 7.5);

  scene.add(new THREE.HemisphereLight(palette.ink, palette.bg, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(palette.accent, 14, 12);
  rim.position.set(-2.6, 1.4, 1.8);
  scene.add(rim);

  const leather = new THREE.MeshStandardMaterial({ color: palette.leather, roughness: 0.72 });
  const paper = new THREE.MeshStandardMaterial({ color: '#efe6d6', roughness: 0.95 });
  const edgeSide = new THREE.MeshStandardMaterial({ map: edgeTexture(true), roughness: 0.95 });
  const edgeTop = new THREE.MeshStandardMaterial({ map: edgeTexture(false), roughness: 0.95 });
  const front = new THREE.MeshStandardMaterial({
    map: coverTexture(element.dataset.title ?? 'Portfolio', element.dataset.subtitle ?? '', palette),
    roughness: 0.6,
  });
  const inside = new THREE.MeshStandardMaterial({
    map: insideCoverTexture(`${profile.since} — ${new Date().getFullYear()}`),
    roughness: 0.9,
  });

  const root = new THREE.Group();
  const book = new THREE.Group();
  root.add(book);
  scene.add(root);

  const back = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, HEIGHT, COVER), leather);
  back.position.z = -(BLOCK / 2 + COVER / 2);
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z.
  const block = new THREE.Mesh(new THREE.BoxGeometry(WIDTH - 0.08, HEIGHT - 0.1, BLOCK), [
    edgeSide,
    paper,
    edgeTop,
    edgeTop,
    paper,
    paper,
  ]);
  block.position.x = -0.04;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(COVER, HEIGHT, BLOCK + COVER * 2), leather);
  spine.position.x = -WIDTH / 2 - COVER / 2;
  book.add(back, block, spine);

  const stackTop = BLOCK / 2 + PAGE_GAP * (PAGES + 1);
  const coverPivot = new THREE.Group();
  coverPivot.position.set(-WIDTH / 2, 0, stackTop + COVER / 2);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(WIDTH, HEIGHT, COVER), [
    leather,
    leather,
    leather,
    leather,
    front,
    inside,
  ]);
  cover.position.x = WIDTH / 2;
  coverPivot.add(cover);
  book.add(coverPivot);

  const pageWidth = WIDTH - 0.12;
  const rectoGeometry = new THREE.PlaneGeometry(pageWidth, HEIGHT - 0.14);
  // The back face is turned around the page's own centre so its text reads correctly once the sheet is turned.
  const versoGeometry = rectoGeometry.clone().rotateY(Math.PI);
  rectoGeometry.translate(pageWidth / 2, 0, 0);
  versoGeometry.translate(pageWidth / 2, 0, 0);
  const pages = Array.from({ length: PAGES }, (_, i) => {
    const pivot = new THREE.Group();
    pivot.position.set(-WIDTH / 2 + 0.02, 0, stackTop - PAGE_GAP * i);
    for (const [geometry, page] of [
      [rectoGeometry, i * 2 + 1],
      [versoGeometry, i * 2 + 2],
    ] as const) {
      const material = new THREE.MeshStandardMaterial({
        map: pageTexture(page, small ? SMALL_SCREEN_PAGE_SCALE : 1),
        roughness: 0.95,
      });
      pivot.add(new THREE.Mesh(geometry, material));
    }
    book.add(pivot);
    return pivot;
  });

  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.4), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.75;
  scene.add(shadow);

  const intro = { value: reducedMotion ? 1 : 0 };
  const playIntro = () => gsap.to(intro, { value: 1, duration: 2.2, delay: 0.15, ease: 'power3.out' });
  // Fly in as the boot screen lifts rather than finishing unseen behind it.
  if (!reducedMotion) whenBooted(playIntro);

  root.rotation.set(0.5, -1.1, 0);
  const tick = createClock();

  function update(time: number) {
    const follow = reducedMotion ? 1 : damp(tick(time), 5);
    const scroll = getProgress();
    const open = clamp01(intro.value * 0.12 + scroll * 1.25);
    const coverOpen = easeInOutCubic(open / 0.5);

    let above = Math.PI * 0.95 * coverOpen;
    coverPivot.rotation.y = -above;
    pages.forEach((pivot, i) => {
      const turn = Math.PI * (0.93 - i * 0.012) * easeInOutCubic((open - 0.36 - i * 0.065) / 0.2);
      above = Math.max(0, Math.min(turn, above - TRAIL));
      pivot.rotation.y = -above;
    });
    book.position.x = (WIDTH / 2) * coverOpen;

    const tilt = pointer.active && !reducedMotion;
    const targetX = 0.34 - scroll * 0.26 + (tilt ? pointer.ny * 0.12 : 0) + (1 - intro.value) * 0.4;
    const targetY = -0.55 + coverOpen * 0.48 + (tilt ? pointer.nx * 0.22 : 0) - (1 - intro.value) * 0.9;
    root.rotation.x += (targetX - root.rotation.x) * follow;
    root.rotation.y += (targetY - root.rotation.y) * follow;

    const float = reducedMotion ? 0 : Math.sin(time * 0.9) * 0.06;
    root.position.y = float - (1 - intro.value) * 1.4;
    root.scale.setScalar(0.82 + 0.18 * intro.value);

    shadowMaterial.opacity = 0.75 * intro.value - float * 1.5;
    shadow.scale.x = 1 + coverOpen * 0.7;
  }

  function onAspect(aspect: number) {
    camera.position.z = aspect < 0.95 ? (7.5 * 0.95) / aspect : 7.5;
  }

  return { element, scene, camera, update, onAspect };
};
