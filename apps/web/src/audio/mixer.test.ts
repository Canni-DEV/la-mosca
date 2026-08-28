import { describe, expect, it } from "vitest";
import { parseAudioSettings } from "./mixer.ts";

describe("audio settings migration", () => {
  it("migrates the legacy volume into master without losing muted", () => {
    expect(parseAudioSettings(JSON.stringify({ muted: true, volume: 0.35 }))).toEqual({
      muted: true,
      masterVolume: 0.35,
      sfxVolume: 0.9,
      ambienceVolume: 0.45,
    });
  });

  it("clamps and preserves the three-channel format", () => {
    expect(parseAudioSettings(JSON.stringify({ muted: false, masterVolume: 2, sfxVolume: -1, ambienceVolume: 0.2 }))).toEqual({
      muted: false,
      masterVolume: 1,
      sfxVolume: 0,
      ambienceVolume: 0.2,
    });
  });

  it("falls back safely for invalid storage", () => {
    expect(parseAudioSettings("not-json")).toEqual({ muted: false, masterVolume: 0.75, sfxVolume: 0.9, ambienceVolume: 0.45 });
  });
});
