import * as THREE from 'three';
import { progressOf } from '../engine/progress';
import type { MountView } from '../engine/types';

const RADIUS = 1.1;
const SPAN = 5.2;
const TURN = 0.36;

export const mount: MountView = (element, { reducedMotion, small, palette }) => {
  const getProgress = progressOf(element.closest('section') ?? element, 'top top', 'bottom bottom');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 10);
  scene.add(new THREE.HemisphereLight(palette.ink, palette.bg, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(3, 3, 5);
  scene.add(key);

  const pairs = small ? 34 : 52;
  const nodes = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.09, 1),
    new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 }),
    pairs * 2,
  );
  const rungGeometry = new THREE.CylinderGeometry(0.016, 0.016, 1, 6);
  rungGeometry.rotateZ(Math.PI / 2);
  const rungs = new THREE.InstancedMesh(rungGeometry, new THREE.MeshStandardMaterial({ roughness: 0.6 }), pairs);

  const group = new THREE.Group();
  group.rotation.z = 0.18;
  group.add(nodes, rungs);
  scene.add(group);

  const base = new THREE.Color(palette.muted).multiplyScalar(0.33);
  const accent = new THREE.Color(palette.accent);
  const color = new THREE.Color();
  const dummy = new THREE.Object3D();
  const heights: number[] = [];

  for (let i = 0; i < pairs; i++) {
    const y = SPAN / 2 - (i / (pairs - 1)) * SPAN;
    const angle = i * TURN;
    const x = Math.cos(angle) * RADIUS;
    const z = Math.sin(angle) * RADIUS;

    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.position.set(x, y, z);
    dummy.updateMatrix();
    nodes.setMatrixAt(i * 2, dummy.matrix);
    dummy.position.set(-x, y, -z);
    dummy.updateMatrix();
    nodes.setMatrixAt(i * 2 + 1, dummy.matrix);

    dummy.position.set(0, y, 0);
    dummy.rotation.set(0, -angle, 0);
    dummy.scale.set(RADIUS * 2, 1, 1);
    dummy.updateMatrix();
    rungs.setMatrixAt(i, dummy.matrix);

    // Setting a colour before the first render makes three.js compile the instanced-colour shader variant.
    nodes.setColorAt(i * 2, base);
    nodes.setColorAt(i * 2 + 1, base);
    rungs.setColorAt(i, base);
    heights.push(y);
  }

  let lastBand = Number.NaN;

  function paint(band: number) {
    heights.forEach((height, i) => {
      const glow = Math.max(0, 1 - Math.abs(height - band) / 0.85);
      color.copy(base).lerp(accent, glow * glow);
      nodes.setColorAt(i * 2, color);
      nodes.setColorAt(i * 2 + 1, color);
      rungs.setColorAt(i, color);
    });
    if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
    if (rungs.instanceColor) rungs.instanceColor.needsUpdate = true;
  }

  function update(time: number) {
    const progress = getProgress();
    const band = SPAN / 2 - 0.4 - progress * (SPAN - 0.8);
    // The glow only moves with scroll; repainting it otherwise would re-upload every instance colour each frame.
    if (band !== lastBand) {
      lastBand = band;
      paint(band);
    }

    group.rotation.y = (reducedMotion ? 0 : time * 0.18) + progress * Math.PI * 1.5;
  }

  function onAspect(aspect: number) {
    camera.position.z = aspect < 0.7 ? 10 + (0.7 - aspect) * 8 : 10;
  }

  return { element, scene, camera, update, onAspect };
};
