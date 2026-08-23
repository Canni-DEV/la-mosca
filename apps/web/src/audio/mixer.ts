const STORAGE_KEY = "la-mosca.audio";

export interface AudioSettings {
  muted: boolean;
  volume: number;
}

function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { muted: false, volume: 0.7 };
    }
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      muted: Boolean(parsed.muted),
      volume: clampVolume(typeof parsed.volume === "number" ? parsed.volume : 0.7),
    };
  } catch {
    return { muted: false, volume: 0.7 };
  }
}

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

type CueName =
  | "shuffle"
  | "cut"
  | "deal"
  | "place"
  | "throw"
  | "collect"
  | "exchange"
  | "knock"
  | "palito"
  | "trump"
  | "mosca"
  | "chupado"
  | "victory";

interface CueSpec {
  duration: number;
  sample: (t: number, variant: number) => number;
}

const CUES: Record<CueName, CueSpec> = {
  shuffle: {
    duration: 0.28,
    sample: (t, variant) => noise(t) * Math.exp(-t * 8) * (0.35 + 0.08 * variant) * (t < 0.04 ? t / 0.04 : 1),
  },
  cut: {
    duration: 0.16,
    sample: (t) => (Math.sin(2 * Math.PI * 190 * t) * 0.35 + noise(t) * 0.2) * Math.exp(-t * 18),
  },
  deal: {
    duration: 0.12,
    sample: (t, variant) =>
      (noise(t) * 0.45 + Math.sin(2 * Math.PI * (420 + variant * 40) * t) * 0.12) * Math.exp(-t * 22),
  },
  place: {
    duration: 0.1,
    sample: (t) => (Math.sin(2 * Math.PI * 220 * t) * 0.4 + noise(t) * 0.15) * Math.exp(-t * 26),
  },
  throw: {
    duration: 0.14,
    sample: (t) => (Math.sin(2 * Math.PI * 140 * t) * 0.5 + noise(t) * 0.25) * Math.exp(-t * 16),
  },
  collect: {
    duration: 0.22,
    sample: (t, variant) => noise(t) * Math.exp(-t * 10) * 0.32 * (1 + 0.2 * Math.sin(t * 40 + variant)),
  },
  exchange: {
    duration: 0.16,
    sample: (t) => (noise(t) * 0.3 + Math.sin(2 * Math.PI * 330 * t) * 0.1) * Math.exp(-t * 14),
  },
  knock: {
    duration: 0.09,
    sample: (t) => {
      const body = Math.sin(2 * Math.PI * 168 * t) * Math.exp(-t * 28);
      const click = Math.sin(2 * Math.PI * 620 * t) * Math.exp(-t * 55) * 0.4;
      return (body + click) * 0.7;
    },
  },
  palito: {
    duration: 0.38,
    sample: (t) => {
      const thump = Math.sin(2 * Math.PI * 72 * t) * Math.exp(-t * 10);
      const slap = noise(t) * Math.exp(-t * 14);
      return (thump * 0.7 + slap * 0.45) * 0.9;
    },
  },
  trump: {
    duration: 0.28,
    sample: (t) =>
      (Math.sin(2 * Math.PI * 392 * t) + 0.4 * Math.sin(2 * Math.PI * 588 * t)) * Math.exp(-t * 6) * 0.22,
  },
  mosca: {
    duration: 0.55,
    sample: (t) => {
      const f = t < 0.22 ? 523 : 784;
      return (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2 * t)) * Math.exp(-t * 4) * 0.28;
    },
  },
  chupado: {
    duration: 0.22,
    sample: (t) => Math.sin(2 * Math.PI * 196 * t) * Math.exp(-t * 9) * 0.28,
  },
  victory: {
    duration: 0.7,
    sample: (t) => {
      const f = t < 0.22 ? 392 : t < 0.44 ? 523 : 659;
      return (Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(2 * Math.PI * f * 1.5 * t)) * Math.exp(-t * 3.2) * 0.3;
    },
  },
};

function noise(t: number): number {
  const x = Math.sin(t * 9337.13) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export class AudioMixer {
  private settings: AudioSettings = loadSettings();
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<CueName, AudioBuffer[]>();
  private listeners = new Set<() => void>();
  private variant = 0;

  get muted(): boolean {
    return this.settings.muted;
  }

  get volume(): number {
    return this.settings.volume;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setMuted(muted: boolean): void {
    this.settings = { ...this.settings, muted };
    this.persist();
    this.applyGain();
    this.emit();
  }

  setVolume(volume: number): void {
    this.settings = { ...this.settings, volume: clampVolume(volume) };
    if (this.settings.volume === 0) {
      this.settings = { ...this.settings, muted: true };
    }
    this.persist();
    this.applyGain();
    this.emit();
  }

  toggleMuted(): void {
    this.setMuted(!this.settings.muted);
  }

  async unlock(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    this.ensureBuffers();
  }

  play(cue: CueName): void {
    if (this.settings.muted || this.settings.volume <= 0) {
      return;
    }
    void this.unlock().then(() => {
      const ctx = this.ctx;
      const master = this.master;
      if (!ctx || !master) {
        return;
      }
      const variants = this.buffers.get(cue);
      const buffer = variants?.[this.variant % variants.length];
      this.variant += 1;
      if (!buffer) {
        return;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(master);
      source.start();
    });
  }

  playPass(): void {
    this.play("knock");
    window.setTimeout(() => this.play("knock"), 120);
  }

  destroy(): void {
    this.listeners.clear();
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      this.applyGain();
    }
    return this.ctx;
  }

  private ensureBuffers(): void {
    const ctx = this.ensureContext();
    if (this.buffers.size > 0) {
      return;
    }
    (Object.keys(CUES) as CueName[]).forEach((name) => {
      const spec = CUES[name];
      const variants = name === "deal" || name === "place" || name === "shuffle" ? 3 : 1;
      const list: AudioBuffer[] = [];
      for (let v = 0; v < variants; v += 1) {
        list.push(renderCue(ctx, spec, v));
      }
      this.buffers.set(name, list);
    });
  }

  private applyGain(): void {
    if (!this.master) {
      return;
    }
    this.master.gain.value = this.settings.muted ? 0 : this.settings.volume;
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore quota / private mode
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

function renderCue(ctx: AudioContext, spec: CueSpec, variant: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(spec.duration * sampleRate));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    data[i] = Math.max(-1, Math.min(1, spec.sample(t, variant)));
  }
  return buffer;
}

export const audioMixer = new AudioMixer();
