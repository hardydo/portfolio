import type { SimpleIcon } from 'simple-icons';
import { withAlpha } from '@/lib/color';
import type { Palette } from '../engine/palette';
import { canvasTexture } from './canvas';

export function logoTexture(icon: SimpleIcon, color: string, palette: Palette, scale: number) {
  return canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      const disc = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, 126);
      disc.addColorStop(0, withAlpha(palette.leather, 0.96));
      disc.addColorStop(1, withAlpha(palette.bg, 0.92));
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 118, 0, Math.PI * 2);
      ctx.fillStyle = disc;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = withAlpha(color, 0.55);
      ctx.stroke();

      const size = 116;
      ctx.save();
      ctx.translate((w - size) / 2, (h - size) / 2);
      ctx.scale(size / 24, size / 24);
      ctx.fillStyle = color;
      ctx.fill(new Path2D(icon.path));
      ctx.restore();
    },
    scale,
  );
}
