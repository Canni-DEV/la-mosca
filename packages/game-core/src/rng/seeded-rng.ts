export interface RandomSource {
  next(): number;
  nextInt(maxExclusive: number): number;
  clone(): RandomSource;
}

/**
 * Mulberry32 — small deterministic PRNG. Same seed always yields the same sequence.
 */
export class SeededRng implements RandomSource {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
    if (this.state === 0) {
      this.state = 0x9e3779b9;
    }
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(maxExclusive: number): number {
    if (maxExclusive <= 0) {
      throw new Error(`nextInt requires maxExclusive > 0, got ${maxExclusive}`);
    }
    return Math.floor(this.next() * maxExclusive);
  }

  clone(): SeededRng {
    const copy = new SeededRng(1);
    copy.state = this.state;
    return copy;
  }
}
