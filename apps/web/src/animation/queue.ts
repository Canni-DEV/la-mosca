export type PresentationClip = () => Promise<void>;

export class PresentationDirector {
  private cancelled = false;

  get isCancelled(): boolean {
    return this.cancelled;
  }

  cancel(): void {
    this.cancelled = true;
  }

  reset(): void {
    this.cancelled = false;
  }

  async run(clips: readonly PresentationClip[]): Promise<void> {
    for (const clip of clips) {
      if (this.cancelled) {
        return;
      }
      await clip();
    }
  }
}
