import { easeOutCubic } from "./easing.ts";
import { motionDuration } from "./motion.ts";

export interface TweenHandle {
  cancelled: boolean;
}

type Cancellation = TweenHandle | AbortSignal;

export function createTweenHandle(): TweenHandle {
  return { cancelled: false };
}

export function tween(options: {
  duration: number;
  onUpdate: (t: number) => void;
  easing?: (t: number) => number;
  handle?: Cancellation;
}): Promise<void> {
  const duration = Math.max(16, motionDuration(options.duration));
  const easing = options.easing ?? easeOutCubic;
  const handle = options.handle;
  return new Promise((resolve) => {
    const started = performance.now();
    let frame = 0;
    const abort = (): void => {
      cancelAnimationFrame(frame);
      resolve();
    };
    if (isAbortSignal(handle)) handle.addEventListener("abort", abort, { once: true });
    const tick = (now: number): void => {
      if (isCancelled(handle)) {
        if (isAbortSignal(handle)) handle.removeEventListener("abort", abort);
        resolve();
        return;
      }
      const t = Math.min(1, (now - started) / duration);
      options.onUpdate(easing(t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        if (isAbortSignal(handle)) handle.removeEventListener("abort", abort);
        resolve();
      }
    };
    frame = requestAnimationFrame(tick);
  });
}

export function wait(ms: number, handle?: Cancellation): Promise<void> {
  const duration = motionDuration(ms);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (isAbortSignal(handle)) handle.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, duration);
    if (isCancelled(handle)) {
      finish();
    } else if (isAbortSignal(handle)) {
      handle.addEventListener("abort", finish, { once: true });
    }
  });
}

function isAbortSignal(value: Cancellation | undefined): value is AbortSignal {
  return Boolean(value && "aborted" in value && typeof value.addEventListener === "function");
}

function isCancelled(value: Cancellation | undefined): boolean {
  return isAbortSignal(value) ? value.aborted : value?.cancelled ?? false;
}
