import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tween } from "./tween.ts";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 16));
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("tween cancellation", () => {
  it("does not run another update after its AbortSignal is cancelled", async () => {
    const abort = new AbortController();
    const updates: number[] = [];
    const run = tween({ duration: 240, handle: abort.signal, onUpdate: (value) => updates.push(value) });
    await vi.advanceTimersByTimeAsync(48);
    abort.abort();
    const countAtAbort = updates.length;
    await run;
    await vi.runAllTimersAsync();
    expect(updates).toHaveLength(countAtAbort);
    expect(vi.getTimerCount()).toBe(0);
  });
});
