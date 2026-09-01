import { afterEach, describe, expect, it, vi } from "vitest";
import { allowShake, motionDuration, prefersReducedMotion } from "./motion.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reduced motion", () => {
  it("caps presentation flights at 80 ms and disables shake", () => {
    vi.stubGlobal("window", {
      matchMedia: (query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" }),
    });

    expect(prefersReducedMotion()).toBe(true);
    expect(motionDuration(240)).toBe(29);
    expect(motionDuration(700)).toBe(80);
    expect(allowShake()).toBe(false);
  });

  it("preserves configured timing when reduced motion is not requested", () => {
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: false }),
    });

    expect(prefersReducedMotion()).toBe(false);
    expect(motionDuration(240)).toBe(240);
    expect(allowShake()).toBe(true);
  });
});
