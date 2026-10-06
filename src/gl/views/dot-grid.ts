import * as THREE from 'three';
import fragmentShader from '../shaders/dot-grid.frag.glsl?raw';
import vertexShader from '../shaders/dot-grid.vert.glsl?raw';
import type { GLBackground, ViewEnv } from '../engine/types';

const OFFSCREEN = -9999;

export function createDotGrid({ pointer, reducedMotion, small, palette }: ViewEnv): GLBackground {
  const spacing = small ? 30 : 34;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(OFFSCREEN, OFFSCREEN) },
    uScroll: { value: 0 },
    uSpan: { value: 1 },
    uSpacing: { value: spacing },
    uPixelRatio: { value: 1 },
    uColor: { value: new THREE.Color(palette.ink) },
    uAccent: { value: new THREE.Color(palette.accent) },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
  });

  const points = new THREE.Points(new THREE.BufferGeometry(), material);
  points.frustumCulled = false;
  scene.add(points);

  const mouse = new THREE.Vector2(OFFSCREEN, OFFSCREEN);
  let viewportHeight = 1;

  function resize(width: number, height: number, pixelRatio: number) {
    viewportHeight = height;
    uniforms.uPixelRatio.value = pixelRatio;
    camera.right = width;
    camera.top = height;
    camera.updateProjectionMatrix();

    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 3;
    const positions = new Float32Array(cols * rows * 3);
    const offsetX = (width - (cols - 1) * spacing) / 2;
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        positions[i++] = offsetX + x * spacing;
        positions[i++] = y * spacing;
        positions[i++] = 0;
      }
    }
    points.geometry.dispose();
    points.geometry = new THREE.BufferGeometry();
    points.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    uniforms.uSpan.value = rows * spacing;
  }

  function update(time: number) {
    if (!reducedMotion) uniforms.uTime.value = time;
    uniforms.uScroll.value = window.scrollY;

    if (pointer.active) {
      const tx = pointer.x;
      const ty = viewportHeight - pointer.y;
      if (mouse.x <= OFFSCREEN) mouse.set(tx, ty);
      mouse.x += (tx - mouse.x) * 0.12;
      mouse.y += (ty - mouse.y) * 0.12;
    } else {
      mouse.set(OFFSCREEN, OFFSCREEN);
    }
    uniforms.uMouse.value.copy(mouse);
  }

  return { scene, camera, resize, update };
}
