import { el, qs } from '@/core/dom';

const BAR_WIDTH = 24;
const PARTIAL_BLOCKS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];
const SEEN_KEY = 'hardydo:booted';
// Timings below are paired with ./boot.css; the quick set is for visitors who have seen the full boot before.
const TIMINGS = {
  full: { printDelay: 1250, lineInterval: 110, minDuration: 3000 },
  quick: { printDelay: 350, lineInterval: 40, minDuration: 900 },
};
const MAX_DURATION = 6500;
const SETTLE = 450; // let the meter reach 100% before lifting
const FADE_DURATION = 600; // .boot opacity transition

export type BootTone = 'ok' | 'info';

/** Terminal-style start screen that prints real boot steps as they happen. */
export interface Boot {
  readonly active: boolean;
  expect(steps: number): void;
  step(name: string, detail?: string, tone?: BootTone): void;
  /** All work has been reported; the screen closes once the log has finished printing. */
  finish(): void;
  /** Runs once the screen starts lifting, or straight away if it already has. */
  whenDone(callback: () => void): void;
}

/** Renders progress (0..1) as a fixed-width bar, using eighth blocks so it moves smoothly. */
export function meterText(progress: number): string {
  const clamped = Math.min(1, Math.max(0, progress));
  const cells = clamped * BAR_WIDTH;
  const full = Math.floor(cells);
  const rest = BAR_WIDTH - full;
  const partial = rest > 0 ? PARTIAL_BLOCKS[Math.floor((cells - full) * 8)] || ' ' : '';
  const bar = '█'.repeat(full) + partial + ' '.repeat(Math.max(0, rest - 1));
  return `[${bar}] ${String(Math.round(clamped * 100)).padStart(3)}%`;
}

function inactiveBoot(onDone: () => void): Boot {
  let done = false;
  return {
    active: false,
    expect() {},
    step() {},
    finish() {
      if (done) return;
      done = true;
      onDone();
    },
    whenDone(callback) {
      callback();
    },
  };
}

function remember(key: string): boolean {
  try {
    const seen = localStorage.getItem(key) !== null;
    localStorage.setItem(key, '1');
    return seen;
  } catch {
    return false;
  }
}

export function createBoot(onDone: () => void): Boot {
  const root = document.documentElement;
  const logNode = qs('[data-boot-log]');
  const meterNode = qs('[data-boot-meter]');
  if (!root.classList.contains('is-booting') || !logNode || !meterNode) {
    root.classList.remove('is-booting');
    return inactiveBoot(onDone);
  }
  const log: HTMLElement = logNode;
  const meter: HTMLElement = meterNode;
  const quick = remember(SEEN_KEY);
  if (quick) root.classList.add('is-boot-quick');
  const { printDelay, lineInterval, minDuration } = quick ? TIMINGS.quick : TIMINGS.full;

  const started = performance.now();
  const queue: [string, string, BootTone][] = [];
  const cursor = el('span', 'boot__cursor');
  log.append(cursor);
  let expected = 1;
  let printed = 0;
  let workDone = false;
  let closing = false;
  let target = 0;
  let shown = 0;
  let lifted = false;
  const waiting: (() => void)[] = [];

  // Painted synchronously too, because requestAnimationFrame does not run while the tab is hidden.
  meter.textContent = meterText(0);
  let frame = requestAnimationFrame(function animateMeter() {
    shown += (target - shown) * 0.14;
    if (Math.abs(target - shown) < 0.002) shown = target;
    const text = meterText(shown);
    if (meter.textContent !== text) meter.textContent = text;
    frame = requestAnimationFrame(animateMeter);
  });

  function print(name: string, detail: string, tone: BootTone) {
    const line = el('span', 'boot__line');
    line.append(
      el('span', tone === 'ok' ? 'boot__ok' : 'boot__dim', tone === 'ok' ? '✓ ' : '› '),
      el('span', 'boot__name', name),
      el('span', 'boot__dim', detail),
    );
    log.insertBefore(line, cursor);
    // A fixed-height log that scrolls, so a longer boot never resizes and re-centres the window.
    log.scrollTop = log.scrollHeight;
  }

  const printer = window.setInterval(() => {
    const elapsed = performance.now() - started;
    if (elapsed < printDelay) return;
    const next = queue.shift();
    if (next) {
      print(...next);
      printed += 1;
      target = Math.min(0.96, printed / expected);
    } else if (workDone && elapsed >= minDuration) {
      close();
    }
  }, lineInterval);
  // Slow devices or a failed WebGL load must never hold the page hostage.
  const failsafe = window.setTimeout(() => close(), MAX_DURATION);

  const skip = () => close();
  window.addEventListener('keydown', skip);
  window.addEventListener('pointerdown', skip);
  window.addEventListener('wheel', skip, { passive: true });

  function close() {
    if (closing) return;
    closing = true;
    window.clearInterval(printer);
    window.clearTimeout(failsafe);
    window.removeEventListener('keydown', skip);
    window.removeEventListener('pointerdown', skip);
    window.removeEventListener('wheel', skip);

    for (const next of queue.splice(0)) print(...next);
    print('ready', `in ${((performance.now() - started) / 1000).toFixed(2)}s`, 'ok');
    target = 1;
    shown = Math.max(shown, 0.96);
    meter.textContent = meterText(shown);

    window.setTimeout(() => {
      root.classList.add('is-boot-leaving');
      lifted = true;
      for (const callback of waiting.splice(0)) callback();
      window.setTimeout(() => {
        cancelAnimationFrame(frame);
        root.classList.remove('is-booting', 'is-boot-leaving', 'is-boot-quick');
        onDone();
      }, FADE_DURATION);
    }, SETTLE);
  }

  return {
    active: true,
    expect(steps) {
      expected = Math.max(1, steps);
    },
    step(name, detail = 'ready', tone = 'ok') {
      if (!closing) queue.push([name, detail, tone]);
    },
    finish() {
      workDone = true;
    },
    whenDone(callback) {
      if (lifted) callback();
      else waiting.push(callback);
    },
  };
}
