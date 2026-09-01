import type { GameEvent, PlayerViewState } from "@la-mosca/game-protocol";
import { afterEach, describe, expect, it, vi } from "vitest";
import { audioMixer } from "../audio/mixer.ts";
import { PixiTable } from "./pixi-table.ts";
import { computeTableLayout, type TableLayout } from "./table-layout.ts";

type CardDealtEvent = Extract<GameEvent, { type: "CardDealt" }>;

interface DealHarness {
  layout: TableLayout | null;
  ensureCard: (...args: unknown[]) => unknown;
  moveSprite: (...args: unknown[]) => Promise<void>;
  animateDeal: (events: readonly CardDealtEvent[], view: PlayerViewState) => Promise<void>;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PixiTable deal presentation", () => {
  it("creates each card only when its staggered flight begins", async () => {
    vi.useFakeTimers();
    vi.spyOn(audioMixer, "play").mockImplementation(() => undefined);
    const table = new PixiTable();
    const harness = table as unknown as DealHarness;
    harness.layout = computeTableLayout({
      width: 1280,
      height: 720,
      players: [
        { id: "p1", name: "Vos" },
        { id: "p2", name: "Nora" },
        { id: "p3", name: "Tito" },
      ],
      humanPlayerId: "p1",
      dealerPlayerId: "p1",
    });

    const sprite = {
      alpha: 0,
      destroyed: false,
      position: { set: vi.fn() },
      rotation: 0,
      zIndex: 0,
    };
    harness.ensureCard = vi.fn(() => sprite);
    harness.moveSprite = vi.fn(async () => undefined);

    const events: CardDealtEvent[] = [
      { type: "CardDealt", playerId: "p2", cardId: "OROS_4", round: 1 },
      { type: "CardDealt", playerId: "p3", cardId: "COPAS_5", round: 1 },
    ];
    const run = harness.animateDeal(events, { viewerId: "p1" } as PlayerViewState);

    expect(harness.ensureCard).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(0);
    expect(harness.ensureCard).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(94);
    expect(harness.ensureCard).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(harness.ensureCard).toHaveBeenCalledTimes(2);
    await run;
  });
});
