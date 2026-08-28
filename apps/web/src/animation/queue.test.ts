import { afterEach, describe, expect, it, vi } from "vitest";
import { parallel, PresentationTimeline, sequence, stagger, waitClip, type PresentationClip } from "./queue.ts";

afterEach(() => {
  vi.useRealTimers();
});

describe("PresentationTimeline", () => {
  it("runs sequence in order and parallel together", async () => {
    vi.useFakeTimers();
    const order: string[] = [];
    const mark = (name: string, delay = 0): PresentationClip => async (signal) => {
      await waitClip(delay)(signal);
      if (!signal.aborted) order.push(name);
    };
    const timeline = new PresentationTimeline();
    const run = timeline.run([sequence(mark("a"), parallel(mark("b", 20), mark("c", 10)), mark("d"))]);
    await vi.runAllTimersAsync();
    await run;
    expect(order).toEqual(["a", "c", "b", "d"]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stagger offsets clips and leaves no pending timers", async () => {
    vi.useFakeTimers();
    const starts: number[] = [];
    const clips = [0, 1, 2].map((): PresentationClip => async () => { starts.push(Date.now()); });
    const timeline = new PresentationTimeline();
    const run = timeline.run([stagger(95, ...clips)]);
    await vi.runAllTimersAsync();
    await run;
    expect(starts[1]! - starts[0]!).toBe(95);
    expect(starts[2]! - starts[0]!).toBe(190);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels waits immediately and suppresses later callbacks", async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const timeline = new PresentationTimeline();
    const run = timeline.run([sequence(waitClip(500), async () => callback())]);
    await vi.advanceTimersByTimeAsync(40);
    timeline.cancel();
    await run;
    expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
