import { easeOutCubic } from "./easing.ts";
import { motionDuration } from "./motion.ts";

export interface TweenHandle {
  cancelled: boolean;
}

export function createTweenHandle(): TweenHandle {
  return { cancelled: false };
}

export function tween(options: {
  duration: number;
  onUpdate: (t: number) => void;
  easing?: (t: number) => number;
  handle?: TweenHandle;
}): Promise<void> {
  const duration = Math.max(16, motionDuration(options.duration));
  const easing = options.easing ?? easeOutCubic;
  const handle = options.handle;
  return new Promise((resolve) => {
    const started = performance.now();
    const tick = (now: number): void => {
      if (handle?.cancelled) {
        resolve();
        return;
      }
      const t = Math.min(1, (now - started) / duration);
      options.onUpdate(easing(t));
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

export function wait(ms: number, handle?: TweenHandle): Promise<void> {
  const duration = motionDuration(ms);
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(), duration);
    if (handle) {
      const poll = (): void => {
        if (handle.cancelled) {
          window.clearTimeout(timer);
          resolve();
          return;
        }
        requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    }
  });
}
