import { wait } from "./tween.ts";

export type PresentationClip = () => Promise<void>;

export class AnimationQueue {
  private clips: PresentationClip[] = [];
  private running = false;
  private cancelled = false;

  get isRunning(): boolean {
    return this.running;
  }

  enqueue(clip: PresentationClip): void {
    if (this.cancelled) {
      return;
    }
    this.clips.push(clip);
  }

  async drain(): Promise<void> {
    if (this.running) {
      while (this.running && !this.cancelled) {
        await wait(16);
      }
      return;
    }
    this.running = true;
    try {
      while (this.clips.length > 0 && !this.cancelled) {
        const clip = this.clips.shift();
        if (clip) {
          await clip();
        }
      }
    } finally {
      this.running = false;
    }
  }

  cancel(): void {
    this.cancelled = true;
    this.clips = [];
  }

  reset(): void {
    this.cancelled = false;
    this.clips = [];
    this.running = false;
  }
}
