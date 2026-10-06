import type { Project } from '@/content';
import { mixHex } from '@/lib/color';
import { canvasTexture, pad2, pill, SANS, SERIF, wrapText } from './canvas';

function drawPattern(ctx: CanvasRenderingContext2D, w: number, h: number, variant: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.13)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.13)';
  ctx.lineWidth = 2;
  const cx = w * 0.66;
  const cy = h * 0.3;

  if (variant === 0) {
    for (let r = 30; r < 300; r += 26) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (variant === 1) {
    for (let x = 0; x < 12; x++) {
      for (let y = 0; y < 9; y++) {
        ctx.beginPath();
        ctx.arc(80 + x * 46, 70 + y * 40, 2 + 4 * Math.abs(Math.sin(x * 0.7 + y * 0.5)), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (variant === 2) {
    for (let i = -h; i < w; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h * 0.55, h * 0.55);
      ctx.stroke();
    }
  } else {
    for (let r = 40; r < 420; r += 34) {
      ctx.beginPath();
      ctx.arc(w, 0, r, Math.PI * 0.5, Math.PI);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function cardTexture(project: Project, index: number, total: number) {
  return canvasTexture(640, 832, (ctx, w, h) => {
    const background = ctx.createLinearGradient(0, 0, w * 0.4, h);
    background.addColorStop(0, mixHex(project.color, '#ffffff', 0.08));
    background.addColorStop(1, mixHex(project.color, '#000000', 0.62));
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
    drawPattern(ctx, w, h, index % 4);

    const pad = 46;
    ctx.textBaseline = 'alphabetic';
    ctx.font = `500 22px ${SANS}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.textAlign = 'left';
    ctx.fillText(`${pad2(index + 1)} / ${pad2(total)}`, pad, pad + 20);
    ctx.textAlign = 'right';
    ctx.fillText(project.type.toUpperCase(), w - pad, pad + 20);
    ctx.textAlign = 'left';

    // Layout is built bottom-up so long titles push upwards instead of overflowing the card.
    const tagHeight = 38;
    let y = h - pad - tagHeight;
    let x = pad;
    ctx.font = `500 19px ${SANS}`;
    ctx.lineWidth = 1.5;
    for (const tag of project.tags) {
      const tagWidth = ctx.measureText(tag).width + 30;
      if (x + tagWidth > w - pad) break;
      pill(ctx, x, y, tagWidth, tagHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.fillText(tag, x + 15, y + 26);
      x += tagWidth + 10;
    }

    y -= 34;
    ctx.font = `400 23px ${SANS}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const description = wrapText(ctx, project.description, w - pad * 2).slice(0, 3);
    for (const line of description.reverse()) {
      ctx.fillText(line, pad, y);
      y -= 33;
    }

    y -= 22;
    ctx.font = `600 54px ${SERIF}`;
    ctx.fillStyle = '#ffffff';
    const title = wrapText(ctx, project.title, w - pad * 2).slice(0, 3);
    for (const line of title.reverse()) {
      ctx.fillText(line, pad, y);
      y -= 62;
    }

    ctx.font = `500 22px ${SANS}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(project.year, pad, y);
  });
}
