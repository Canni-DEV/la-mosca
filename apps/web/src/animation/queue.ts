import { wait } from "./tween.ts";

export type PresentationClip = (signal: AbortSignal) => Promise<void>;

export function sequence(...clips: readonly PresentationClip[]): PresentationClip {
  return async (signal) => {
    for (const clip of clips) {
      if (signal.aborted) return;
      await clip(signal);
    }
  };
}

export function parallel(...clips: readonly PresentationClip[]): PresentationClip {
  return async (signal) => {
    if (signal.aborted) return;
    await Promise.all(clips.map((clip) => clip(signal)));
  };
}

export function stagger(delayMs: number, ...clips: readonly PresentationClip[]): PresentationClip {
  return parallel(...clips.map((clip, index) => sequence(waitClip(delayMs * index), clip)));
}

export function waitClip(ms: number): PresentationClip {
  return async (signal) => wait(ms, signal);
}

/** Owns one presentation run. Starting a new run safely cancels the previous one. */
export class PresentationTimeline {
  private controller: AbortController | null = null;

  get isCancelled(): boolean {
    return this.controller?.signal.aborted ?? false;
  }

  cancel(): void {
    this.controller?.abort();
  }

  reset(): void {
    this.cancel();
    this.controller = null;
  }

  async run(clips: readonly PresentationClip[], parentSignal?: AbortSignal): Promise<void> {
    this.cancel();
    const controller = new AbortController();
    this.controller = controller;
    const abort = (): void => controller.abort();
    parentSignal?.addEventListener("abort", abort, { once: true });
    try {
      await sequence(...clips)(controller.signal);
    } finally {
      parentSignal?.removeEventListener("abort", abort);
      if (this.controller === controller) this.controller = null;
    }
  }
}

export { PresentationTimeline as PresentationDirector };
