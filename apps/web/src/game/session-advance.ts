import type { GameCommand, PlayerId } from "@la-mosca/game-protocol";
import { type GameEngine, type RandomSource } from "@la-mosca/game-core";
import type { StandardBot } from "@la-mosca/game-ai";

export type AdvanceKind = "cut" | "next-hand" | "bot" | "human" | "idle";

export interface AdvanceChoice {
  readonly kind: AdvanceKind;
  readonly command?: GameCommand;
}

export function chooseAdvance(
  engine: GameEngine,
  bot: StandardBot,
  rng: RandomSource,
  humanPlayerId: PlayerId | null,
): AdvanceChoice {
  const state = engine.getState();
  if (state.phase === "GAME_OVER" || state.phase === "LOBBY") {
    return { kind: "idle" };
  }
  if (state.phase === "HAND_COMPLETE") {
    return { kind: "next-hand", command: { type: "START_NEXT_HAND" } };
  }
  if (state.phase === "HAND_CUT") {
    const cutterId = state.cutterPlayerId;
    if (!cutterId) {
      return { kind: "idle" };
    }
    const view = engine.getPlayerViewState(cutterId);
    const command = bot.choose(view, rng);
    if (!command) {
      return { kind: "idle" };
    }
    return { kind: "cut", command };
  }
  const actorId = engine.getCurrentActorId();
  if (!actorId) {
    return { kind: "idle" };
  }
  const automated = humanPlayerId === null || actorId !== humanPlayerId;
  if (!automated) {
    return { kind: "human" };
  }
  const view = engine.getPlayerViewState(actorId);
  const command = bot.choose(view, rng);
  if (!command) {
    return { kind: "idle" };
  }
  return { kind: "bot", command };
}
