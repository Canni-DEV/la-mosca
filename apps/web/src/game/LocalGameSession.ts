import type {
  CommandResult,
  DebugViewState,
  DeckConfiguration,
  GameCommand,
  GameEvent,
  PlayerId,
  PlayerSetup,
  PlayerViewState,
} from "@la-mosca/game-protocol";
import { GameEngine, SeededRng } from "@la-mosca/game-core";
import { StandardBot } from "@la-mosca/game-ai";
import { botName } from "./bot-names.ts";
import { chooseAdvance } from "./session-advance.ts";
import type { AdvanceResult, GameSession, Unsubscribe } from "./session.ts";

export const HUMAN_PLAYER_ID: PlayerId = "p1";

export interface SessionConfig {
  seed: number;
  playerCount: 3 | 4 | 5;
  deckConfiguration: DeckConfiguration;
  /** `null` runs an all-bot session (playground). Default is a human at `p1`. */
  humanPlayerId?: PlayerId | null;
  humanName?: string;
}

export class LocalGameSession implements GameSession {
  readonly humanPlayerId: PlayerId | null;
  private readonly engine: GameEngine;
  private readonly bot = new StandardBot();
  private readonly rng: SeededRng;
  private readonly listeners = new Set<() => void>();
  readonly startupEvents: readonly GameEvent[];

  constructor(config: SessionConfig) {
    this.engine = GameEngine.create();
    this.rng = new SeededRng(config.seed + 17);
    this.humanPlayerId = config.humanPlayerId === undefined ? HUMAN_PLAYER_ID : config.humanPlayerId;
    const players = createPlayers(config);
    const started = this.engine.dispatch({
      type: "START_GAME",
      seed: config.seed,
      deckConfiguration: config.deckConfiguration,
      firstDealerPlayerId: players[0]?.id,
      players,
    });
    if (!started.ok) {
      throw new Error(started.error.message);
    }
    this.startupEvents = started.events;
  }

  getViewState(): PlayerViewState {
    const viewerId = this.humanPlayerId ?? this.engine.getState().players[0]?.id;
    if (!viewerId) {
      throw new Error("Session has no players");
    }
    return this.engine.getPlayerViewState(viewerId);
  }

  getDebugViewState(): DebugViewState {
    return this.engine.getDebugViewState();
  }

  getEventLog(): readonly GameEvent[] {
    return this.engine.getEventLog();
  }

  currentActorId(): PlayerId | null {
    return this.engine.getCurrentActorId();
  }

  peekAdvance() {
    return chooseAdvance(this.engine, this.bot, this.rng.clone(), this.humanPlayerId);
  }

  subscribe(listener: () => void): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispatch(command: GameCommand): CommandResult {
    if (this.humanPlayerId && isActorCommand(command) && command.actorId !== this.humanPlayerId) {
      return {
        ok: false,
        error: { kind: "INVALID_COMMAND", message: "Only the human player may dispatch this command" },
      };
    }
    const result = this.engine.dispatch(command);
    if (result.ok) {
      this.notify();
    }
    return result;
  }

  advanceAutomated(): AdvanceResult {
    const choice = chooseAdvance(this.engine, this.bot, this.rng, this.humanPlayerId);
    if (choice.kind === "idle") {
      return { status: "idle" };
    }
    if (choice.kind === "human") {
      return { status: "wait-human" };
    }
    if (!choice.command) {
      return { status: "idle" };
    }
    const result = this.engine.dispatch(choice.command);
    if (!result.ok) {
      return { status: "idle" };
    }
    this.notify();
    return { status: "advanced", events: result.events };
  }

  step(): GameEvent[] {
    const result = this.advanceAutomated();
    return result.status === "advanced" ? [...result.events] : [];
  }

  runAuto(maxSteps = 80): GameEvent[] {
    return this.runSteps(maxSteps);
  }

  runUntilEnd(maxSteps = 8000): GameEvent[] {
    return this.runSteps(maxSteps);
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
    const result = this.engine.dispatch({ type: "PLAY_CARD", actorId, cardId: illegal.id });
    this.notify();
    return result.ok ? [...result.events] : [];
  }

  private runSteps(maxSteps: number): GameEvent[] {
    const events: GameEvent[] = [];
    for (let i = 0; i < maxSteps; i += 1) {
      if (this.engine.getState().phase === "GAME_OVER") {
        break;
      }
      const stepEvents = this.step();
      if (stepEvents.length === 0) {
        break;
      }
      events.push(...stepEvents);
    }
    this.notify();
    return events;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

function createPlayers(config: SessionConfig): PlayerSetup[] {
  const humanId = config.humanPlayerId === undefined ? HUMAN_PLAYER_ID : config.humanPlayerId;
  return Array.from({ length: config.playerCount }, (_, index) => {
    const id = `p${index + 1}`;
    if (humanId === id) {
      return { id, name: config.humanName ?? "Vos" };
    }
    return { id, name: humanId === null ? `Bot ${index + 1}` : botName(index - 1) };
  });
}

function isActorCommand(
  command: GameCommand,
): command is Extract<GameCommand, { actorId: PlayerId }> {
  return (
    command.type === "CUT_DECK" ||
    command.type === "PASS" ||
    command.type === "STAY" ||
    command.type === "EXCHANGE_CARDS" ||
    command.type === "PLAY_CARD"
  );
}
