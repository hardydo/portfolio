import { withAlpha } from '@/lib/color';
import type { Palette } from '../engine/palette';
import { canvasTexture, fitFont, grain, SANS, SERIF } from './canvas';

export function coverTexture(title: string, subtitle: string, palette: Palette) {
  return canvasTexture(512, 692, (ctx, w, h) => {
    const leather = ctx.createLinearGradient(0, 0, w, h);
    leather.addColorStop(0, palette.leatherLight);
    leather.addColorStop(1, palette.leatherDeep);
    ctx.fillStyle = leather;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, 5000, 0.035);

    ctx.strokeStyle = withAlpha(palette.accent, 0.6);
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, w - 56, h - 56);
    ctx.strokeRect(38, 38, w - 76, h - 76);

    const cx = w / 2;
    const cy = h * 0.36;
    for (const radius of [62, 44, 26]) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = palette.ink;
    fitFont(ctx, title, w - 130, 66, 600, SERIF);
    ctx.fillText(title, cx, h * 0.63);
    ctx.fillStyle = withAlpha(palette.ink, 0.6);
    fitFont(ctx, subtitle.toUpperCase(), w - 130, 20, 500, SANS);
    ctx.fillText(subtitle.toUpperCase(), cx, h * 0.69);
  });
}

export function insideCoverTexture(years: string) {
  return canvasTexture(512, 692, (ctx, w, h) => {
    ctx.fillStyle = '#e9dfcd';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2b2118';
    ctx.textAlign = 'center';
    ctx.font = `italic 500 40px ${SERIF}`;
    ctx.fillText('Selected work', w / 2, h * 0.46);
    ctx.fillStyle = 'rgba(43, 33, 24, 0.55)';
    ctx.font = `500 18px ${SANS}`;
    ctx.fillText(years, w / 2, h * 0.52);
  });
}

/** Odd numbers are right-hand pages, even numbers the left-hand back of the same sheet. */
export function pageTexture(page: number, scale: number) {
  const recto = page % 2 === 1;
  return canvasTexture(
    512,
    692,
    (ctx, w, h) => {
      ctx.fillStyle = '#f2e9d8';
      ctx.fillRect(0, 0, w, h);
      const gutter = recto ? ctx.createLinearGradient(0, 0, 60, 0) : ctx.createLinearGradient(w, 0, w - 60, 0);
      gutter.addColorStop(0, 'rgba(60, 40, 20, 0.18)');
      gutter.addColorStop(1, 'rgba(60, 40, 20, 0)');
      ctx.fillStyle = gutter;
      ctx.fillRect(recto ? 0 : w - 60, 0, 60, h);

      let top = 70;
      if (recto) {
        ctx.fillStyle = 'rgba(43, 33, 24, 0.75)';
        ctx.font = `600 30px ${SERIF}`;
        ctx.fillText(`Chapter ${(page + 1) / 2}`, 70, 110);
        top = 160;
      }
      ctx.fillStyle = 'rgba(43, 33, 24, 0.16)';
      const lines = Math.floor((h - 90 - top) / 26);
      for (let line = 0; line < lines; line++) {
        const width = line % 6 === 5 ? 180 + ((page * 37 + line * 13) % 120) : w - 140;
        ctx.fillRect(70, top + line * 26, width, 9);
      }
      ctx.fillStyle = 'rgba(43, 33, 24, 0.45)';
      ctx.font = `500 16px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.fillText(String(page), w / 2, h - 40);
    },
    scale,
  );
}

export function edgeTexture(vertical: boolean) {
  return canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#eadfca';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(90, 70, 45, ${0.05 + Math.random() * 0.12})`;
      const position = Math.random() * (vertical ? w : h);
      if (vertical) ctx.fillRect(position, 0, 1, h);
      else ctx.fillRect(0, position, w, 1);
    }
  });
}

export function shadowTexture() {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const shade = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    shade.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    shade.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
  });
}
