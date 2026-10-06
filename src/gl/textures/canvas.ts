import * as THREE from 'three';

export const SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
export const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

type Painter = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

/** Painters always draw in width × height units; `scale` sets how many texels each unit gets. */
export function canvasTexture(width: number, height: number, paint: Painter, scale = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context is not available');
  ctx.scale(scale, scale);
  paint(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
  weight: number,
  family: string,
): void {
  let current = size;
  do {
    ctx.font = `${weight} ${current}px ${family}`;
    current -= 2;
  } while (ctx.measureText(text).width > maxWidth && current > 12);
}

export function grain(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number, alpha: number) {
  for (let i = 0; i < amount; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * alpha})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
  }
}

export function pill(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.beginPath();
  // roundRect is missing in Safari < 16.
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, width, height, height / 2);
  else ctx.rect(x, y, width, height);
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
