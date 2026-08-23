import { describe, expect, it } from "vitest";
import { assertCardInvariant } from "../src/engine/invariants.ts";
import { GameEngine } from "../src/engine/game-engine.ts";
import { startStandardGame } from "../src/testing/index.ts";

describe("game engine", () => {
  it("starts a game, cuts, and deals five cards to each player", () => {
    const engine = startStandardGame(7, 4);
    const beforeCut = engine.getState();
    expect(beforeCut.phase).toBe("HAND_CUT");
    expect(beforeCut.cutterPlayerId).toBe("p4");
    const cut = engine.dispatch({
      type: "CUT_DECK",
      actorId: "p4",
      cutIndex: 11,
    });
    expect(cut.ok).toBe(true);
    const state = engine.getState();
    expect(state.phase).toBe("PLAYER_DECISIONS");
    expect(state.trumpSuit).not.toBeNull();
    expect(state.revealedTrumpCardId).toBeTruthy();
    for (const player of state.players) {
      expect(player.hand).toHaveLength(5);
    }
    assertCardInvariant(state);
  });

  it("hides other hands in the player view and shows them in debug view", () => {
    const engine = startStandardGame(3, 3);
    engine.dispatch({ type: "CUT_DECK", actorId: "p3", cutIndex: 8 });
    const view = engine.getPlayerViewState("p1");
    const debug = engine.getDebugViewState();
    expect(view.hand).toHaveLength(5);
    expect(view.players.find((player) => player.id === "p2")?.cardCount).toBe(5);
    expect(debug.hands.p1).toHaveLength(5);
    expect(debug.hands.p2).toHaveLength(5);
  });

  it("is deterministic for the same seed", () => {
    const first = startStandardGame(42, 4);
    const second = startStandardGame(42, 4);
    first.dispatch({ type: "CUT_DECK", actorId: "p4", cutIndex: 9 });
    second.dispatch({ type: "CUT_DECK", actorId: "p4", cutIndex: 9 });
    expect(first.getDebugViewState().hands).toEqual(second.getDebugViewState().hands);
    expect(first.getState().trumpSuit).toBe(second.getState().trumpSuit);
  });

  it("rejects 6 players with a 40-card deck", () => {
    const engine = GameEngine.create();
    const result = engine.dispatch({
      type: "START_GAME",
      seed: 1,
      deckConfiguration: "TRADITIONAL_40",
      players: [1, 2, 3, 4, 5, 6].map((n) => ({ id: `p${n}`, name: `P${n}` })),
    });
    expect(result.ok).toBe(false);
  });
});
