import type { DeckConfiguration, GameCommand, GameEvent, PlayerId } from "@la-mosca/game-protocol";
import { GameEngine, SeededRng } from "@la-mosca/game-core";
import { StandardBot } from "@la-mosca/game-ai";

export interface SessionConfig {
  seed: number;
  playerCount: 3 | 4 | 5 | 6;
  deckConfiguration: DeckConfiguration;
}

export class LocalGameSession {
  readonly engine: GameEngine;
  private readonly bot = new StandardBot();
  private readonly rng: SeededRng;
  private listeners = new Set<() => void>;

  constructor(config: SessionConfig) {
    this.engine = GameEngine.create();
    this.rng = new SeededRng(config.seed + 17);
    const players = Array.from({ length: config.playerCount }, (_, index) => ({
      id: `p${index + 1}`,
      name: `Bot ${index + 1}`,
    }));
    const started = this.engine.dispatch({
      type: "START_GAME",
      seed: config.seed,
      deckConfiguration: config.deckConfiguration,
      firstDealerPlayerId: "p1",
      players,
    });
    if (!started.ok) {
      throw new Error(started.error.message);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private advanceOnce(): GameEvent[] {
    const state = this.engine.getState();
    if (state.phase === "GAME_OVER") {
      return [];
    }
    if (state.phase === "HAND_COMPLETE") {
      const result = this.engine.dispatch({ type: "START_NEXT_HAND" });
      return result.ok ? [...result.events] : [];
    }
    const actorId = this.engine.getCurrentActorId();
    if (!actorId) {
      return [];
    }
    const view = this.engine.getPlayerViewState(actorId);
    const command = this.bot.choose(view, this.rng);
    if (!command) {
      return [];
    }
    const result = this.engine.dispatch(command);
    return result.ok ? [...result.events] : [];
  }

  step(): GameEvent[] {
    const events = this.advanceOnce();
    this.notify();
    return events;
  }

  runAuto(maxSteps = 80): GameEvent[] {
    return this.runSteps(maxSteps);
  }

  runUntilEnd(maxSteps = 8000): GameEvent[] {
    return this.runSteps(maxSteps);
  }

  private runSteps(maxSteps: number): GameEvent[] {
    const events: GameEvent[] = [];
    for (let i = 0; i < maxSteps; i += 1) {
      if (this.engine.getState().phase === "GAME_OVER") {
        break;
      }
      const stepEvents = this.advanceOnce();
      if (stepEvents.length === 0) {
        break;
      }
      events.push(...stepEvents);
    }
    this.notify();
    return events;
  }

  forcePalito(): GameEvent[] {
    const actorId = this.engine.getCurrentActorId();
    if (!actorId || this.engine.getState().phase !== "TRICK_PLAY") {
      return [];
    }
    const view = this.engine.getPlayerViewState(actorId);
    const illegal = view.hand.find((card) => !view.legalCardIds.includes(card.id));
    if (!illegal) {
      return [];
    }
    const command: GameCommand = { type: "PLAY_CARD", actorId, cardId: illegal.id };
    const result = this.engine.dispatch(command);
    this.notify();
    return result.ok ? [...result.events] : [];
  }

  currentActorId(): PlayerId | null {
    return this.engine.getCurrentActorId();
  }
}
