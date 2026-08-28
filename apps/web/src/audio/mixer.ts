import shuffleUrl from "../assets/audio/foley/shuffle.wav";
import cutUrl from "../assets/audio/foley/cut.wav";
import contact1Url from "../assets/audio/foley/card-contact-1.wav";
import contact2Url from "../assets/audio/foley/card-contact-2.wav";

const STORAGE_KEY = "la-mosca.audio";

export interface AudioSettings {
  muted: boolean;
  masterVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
}

function loadSettings(): AudioSettings {
  try {
    return parseAudioSettings(localStorage.getItem(STORAGE_KEY));
  } catch {
    return defaultAudioSettings();
  }
}

export function parseAudioSettings(raw: string | null): AudioSettings {
  if (!raw) return defaultAudioSettings();
  try {
    const parsed = JSON.parse(raw) as Partial<AudioSettings> & { volume?: number };
    const legacy = typeof parsed.volume === "number" ? clampVolume(parsed.volume) : null;
    return {
      muted: Boolean(parsed.muted),
      masterVolume: clampVolume(parsed.masterVolume ?? legacy ?? 0.75),
      sfxVolume: clampVolume(parsed.sfxVolume ?? 0.9),
      ambienceVolume: clampVolume(parsed.ambienceVolume ?? 0.45),
    };
  } catch {
    return defaultAudioSettings();
  }
}

function defaultAudioSettings(): AudioSettings {
  return { muted: false, masterVolume: 0.75, sfxVolume: 0.9, ambienceVolume: 0.45 };
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
    duration: 0.42,
    sample: (t) => {
      const thump = Math.sin(2 * Math.PI * 64 * t) * Math.exp(-t * 8);
      const wood = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 16) * 0.45;
      const slap = noise(t) * Math.exp(-t * 12);
      return (thump * 0.85 + wood + slap * 0.5) * 0.95;
    },
  },
  trump: {
    duration: 0.32,
    sample: (t) =>
      (Math.sin(2 * Math.PI * 392 * t) + 0.35 * Math.sin(2 * Math.PI * 588 * t) + 0.15 * Math.sin(2 * Math.PI * 784 * t)) *
      Math.exp(-t * 5.5) *
      0.24,
  },
  mosca: {
    duration: 0.7,
    sample: (t) => {
      const f = t < 0.18 ? 392 : t < 0.38 ? 523 : 784;
      return (Math.sin(2 * Math.PI * f * t) + 0.22 * Math.sin(2 * Math.PI * f * 2 * t)) * Math.exp(-t * 3.4) * 0.3;
    },
  },
  chupado: {
    duration: 0.26,
    sample: (t) => Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 8) * 0.3,
  },
  victory: {
    duration: 0.95,
    sample: (t) => {
      const f = t < 0.2 ? 392 : t < 0.4 ? 523 : t < 0.62 ? 659 : 784;
      return (Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(2 * Math.PI * f * 1.5 * t)) * Math.exp(-t * 2.6) * 0.32;
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
  private sfxBus: GainNode | null = null;
  private ambienceBus: GainNode | null = null;
  private buffers = new Map<CueName, AudioBuffer[]>();
  private foleyReady: Promise<void> | null = null;
  private listeners = new Set<() => void>();
  private variant = 0;
  private ambience: AudioBufferSourceNode | null = null;
  private ambienceRequested = false;
  private activeSources = new Set<AudioBufferSourceNode>();
  private timers = new Set<number>();

  get muted(): boolean {
    return this.settings.muted;
  }

  get volume(): number {
    return this.settings.masterVolume;
  }

  get masterVolume(): number {
    return this.settings.masterVolume;
  }

  get sfxVolume(): number {
    return this.settings.sfxVolume;
  }

  get ambienceVolume(): number {
    return this.settings.ambienceVolume;
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
    if (!muted && this.ambienceRequested) this.startAmbience();
  }

  setVolume(volume: number): void {
    this.setMasterVolume(volume);
  }

  setMasterVolume(volume: number): void {
    this.settings = { ...this.settings, masterVolume: clampVolume(volume) };
    if (this.settings.masterVolume === 0) {
      this.settings = { ...this.settings, muted: true };
    }
    this.persist();
    this.applyGain();
    this.emit();
  }

  setSfxVolume(volume: number): void {
    this.settings = { ...this.settings, sfxVolume: clampVolume(volume) };
    this.persist();
    this.applyGain();
    this.emit();
  }

  setAmbienceVolume(volume: number): void {
    this.settings = { ...this.settings, ambienceVolume: clampVolume(volume) };
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
    await this.ensureBuffers();
  }

  play(cue: CueName): void {
    if (this.settings.muted || this.settings.masterVolume <= 0 || this.settings.sfxVolume <= 0) {
      return;
    }
    void this.unlock().then(() => {
      const ctx = this.ctx;
      const sfxBus = this.sfxBus;
      if (!ctx || !sfxBus) {
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
      source.connect(sfxBus);
      this.activeSources.add(source);
      source.addEventListener("ended", () => this.activeSources.delete(source), { once: true });
      source.start();
    });
  }

  playPass(): void {
    this.play("knock");
    const timer = window.setTimeout(() => {
      this.timers.delete(timer);
      this.play("knock");
    }, 120);
    this.timers.add(timer);
  }

  startAmbience(): void {
    this.ambienceRequested = true;
    if (this.settings.muted || this.ambience) {
      return;
    }
    void this.unlock().then(() => {
      const ctx = this.ctx;
      const ambienceBus = this.ambienceBus;
      if (!ctx || !ambienceBus || this.ambience) {
        return;
      }
      const source = ctx.createBufferSource();
      source.buffer = renderAmbience(ctx);
      source.loop = true;
      source.connect(ambienceBus);
      source.start();
      this.ambience = source;
    });
  }

  stopAmbience(): void {
    this.ambienceRequested = false;
    try {
      this.ambience?.stop();
    } catch {
      // already stopped
    }
    this.ambience = null;
  }

  stopAll(): void {
    this.stopAmbience();
    for (const source of this.activeSources) {
      try { source.stop(); } catch { /* already stopped */ }
    }
    this.activeSources.clear();
    for (const timer of this.timers) window.clearTimeout(timer);
    this.timers.clear();
  }

  destroy(): void {
    this.stopAll();
    this.listeners.clear();
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      const sfxBus = ctx.createGain();
      const ambienceBus = ctx.createGain();
      sfxBus.connect(master);
      ambienceBus.connect(master);
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      this.sfxBus = sfxBus;
      this.ambienceBus = ambienceBus;
      this.applyGain();
    }
    return this.ctx;
  }

  private async ensureBuffers(): Promise<void> {
    const ctx = this.ensureContext();
    if (this.buffers.size > 0) {
      await this.foleyReady;
      return;
    }
    (Object.keys(CUES) as CueName[]).forEach((name) => {
      const spec = CUES[name];
      const variants = name === "deal" || name === "place" || name === "shuffle" || name === "collect" ? 4 : 1;
      const list: AudioBuffer[] = [];
      for (let v = 0; v < variants; v += 1) {
        list.push(renderCue(ctx, spec, v));
      }
      this.buffers.set(name, list);
    });
    this.foleyReady = this.loadFoley(ctx);
    await this.foleyReady;
  }

  private async loadFoley(ctx: AudioContext): Promise<void> {
    try {
      const [shuffle, cut, contact1, contact2] = await Promise.all([
        decode(ctx, shuffleUrl), decode(ctx, cutUrl), decode(ctx, contact1Url), decode(ctx, contact2Url),
      ]);
      this.buffers.set("shuffle", [shuffle]);
      this.buffers.set("cut", [cut]);
      this.buffers.set("deal", [contact1, contact2]);
      this.buffers.set("place", [contact1, contact2]);
      this.buffers.set("throw", [contact2]);
      this.buffers.set("collect", [shuffle, contact2]);
    } catch {
      // The synthesized buffers above remain a complete offline-safe fallback.
    }
  }

  private applyGain(): void {
    if (!this.master) {
      return;
    }
    this.master.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;
    if (this.sfxBus) this.sfxBus.gain.value = this.settings.sfxVolume;
    if (this.ambienceBus) this.ambienceBus.gain.value = this.settings.ambienceVolume * 0.1;
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

async function decode(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load audio: ${url}`);
  return ctx.decodeAudioData(await response.arrayBuffer());
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

function renderAmbience(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * 4);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    brown = (brown + noise(t + 2) * 0.02) * 0.985;
    const clink = i % Math.floor(sampleRate * 1.7) < 220 ? Math.sin(2 * Math.PI * 980 * t) * Math.exp(-(i % 8000) / 900) * 0.04 : 0;
    data[i] = Math.max(-1, Math.min(1, brown * 0.7 + clink));
  }
  return buffer;
}

export const audioMixer = new AudioMixer();
