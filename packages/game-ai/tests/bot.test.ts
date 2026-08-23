import { describe, expect, it } from "vitest";
import { GameEngine, SeededRng } from "@la-mosca/game-core";
import { StandardBot } from "../src/bot/standard-bot.ts";

function startedEngine(): GameEngine {
  const engine = GameEngine.create();
  const result = engine.dispatch({
    type: "START_GAME",
    seed: 11,
    deckConfiguration: "TRADITIONAL_40",
    players: [
      { id: "p1", name: "A" },
      { id: "p2", name: "B" },
      { id: "p3", name: "C" },
    ],
  });
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return engine;
}

describe("standard bot", () => {
  it("never plays an illegal card", () => {
    const engine = startedEngine();
    const bot = new StandardBot();
    const rng = new SeededRng(3);
    for (let i = 0; i < 80; i += 1) {
      const state = engine.getState();
      if (state.phase === "GAME_OVER") {
        break;
      }
      if (state.phase === "HAND_COMPLETE") {
        engine.dispatch({ type: "START_NEXT_HAND" });
        continue;
      }
      const actorId = engine.getCurrentActorId();
      if (!actorId) {
        break;
      }
      const view = engine.getPlayerViewState(actorId);
      const command = bot.choose(view, rng);
      expect(command).not.toBeNull();
      if (!command) {
        break;
      }
      if (command.type === "PLAY_CARD") {
        expect(view.legalCardIds).toContain(command.cardId);
      }
      if (command.type === "PASS") {
        expect(view.availableActions.some((action) => action.type === "PASS")).toBe(true);
      }
      if (command.type === "EXCHANGE_CARDS") {
        expect(command.cardIds.length).toBeLessThanOrEqual(3);
      }
      const result = engine.dispatch(command);
      expect(result.ok).toBe(true);
    }
  });

  it("is deterministic for the same view and seed", () => {
    const engine = startedEngine();
    const actorId = engine.getCurrentActorId() ?? "p1";
    const view = engine.getPlayerViewState(actorId);
    const bot = new StandardBot();
    const first = bot.choose(view, new SeededRng(21));
    const second = bot.choose(view, new SeededRng(21));
    expect(first).toEqual(second);
  });
});
