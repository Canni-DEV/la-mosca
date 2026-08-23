import type { DeckConfiguration, GameEvent, PlayerId } from "@la-mosca/game-protocol";
import { GameEngine, SeededRng, assertCardInvariant } from "@la-mosca/game-core";
import { StandardBot } from "../bot/standard-bot.ts";

export interface SimulationOptions {
  seed: number;
  playerCount: number;
  deckConfiguration?: DeckConfiguration;
  maxCommands?: number;
}

export interface SimulationResult {
  winnerPlayerId: PlayerId | null;
  commandCount: number;
  handCount: number;
  eventCount: number;
  finished: boolean;
  lastPhase: string;
}

export function simulateGame(options: SimulationOptions): SimulationResult {
  const deckConfiguration = options.deckConfiguration ?? "TRADITIONAL_40";
  const maxCommands = options.maxCommands ?? 5000;
  const engine = GameEngine.create();
  const bot = new StandardBot();
  const rng = new SeededRng(options.seed + 99);
  const players = Array.from({ length: options.playerCount }, (_, index) => ({
    id: `p${index + 1}`,
    name: `Bot ${index + 1}`,
  }));
  const started = engine.dispatch({
    type: "START_GAME",
    seed: options.seed,
    deckConfiguration,
    firstDealerPlayerId: "p1",
    players,
  });
  if (!started.ok) {
    throw new Error(started.error.message);
  }
  let commandCount = 1;
  while (engine.getState().phase !== "GAME_OVER" && commandCount < maxCommands) {
    const state = engine.getState();
    if (state.phase === "HAND_COMPLETE") {
      const next = engine.dispatch({ type: "START_NEXT_HAND" });
      if (!next.ok) {
        throw new Error(next.error.message);
      }
      commandCount += 1;
      continue;
    }
    const actorId = engine.getCurrentActorId();
    if (!actorId) {
      break;
    }
    const view = engine.getPlayerViewState(actorId);
    const command = bot.choose(view, rng);
    if (!command) {
      break;
    }
    const result = engine.dispatch(command);
    if (!result.ok) {
      throw new Error(result.error.message);
    }
    commandCount += 1;
    assertCardInvariant(engine.getState());
  }
  const state = engine.getState();
  return {
    winnerPlayerId: state.winnerPlayerId,
    commandCount,
    handCount: state.handNumber,
    eventCount: engine.getEventLog().length,
    finished: state.phase === "GAME_OVER",
    lastPhase: state.phase,
  };
}

export function simulateMany(count: number, baseSeed: number, playerCount: number): SimulationResult[] {
  return Array.from({ length: count }, (_, index) =>
    simulateGame({ seed: baseSeed + index, playerCount }),
  );
}

export function collectEventTypes(events: readonly GameEvent[]): string[] {
  return events.map((event) => event.type);
}
