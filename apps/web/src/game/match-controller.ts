import type { CardId, GameCommand, PlayerViewState } from "@la-mosca/game-protocol";
import { wait } from "../animation/tween.ts";
import { audioMixer } from "../audio/mixer.ts";
import { PixiTable } from "../scene/pixi-table.ts";
import { HUMAN_PLAYER_ID, LocalGameSession, type SessionConfig } from "./LocalGameSession.ts";

export interface MatchControllerCallbacks {
  onView: (view: PlayerViewState) => void;
  onEnded: (view: PlayerViewState) => void;
}

export class MatchController {
  readonly session: LocalGameSession;
  readonly table: PixiTable;
  inputLocked = true;
  selectedIds: CardId[] = [];
  private destroyed = false;
  private busy = false;
  private readonly callbacks: MatchControllerCallbacks;
  private unsubscribe: (() => void) | null = null;

  constructor(config: SessionConfig, table: PixiTable, callbacks: MatchControllerCallbacks) {
    this.session = new LocalGameSession({ ...config, humanPlayerId: HUMAN_PLAYER_ID });
    this.table = table;
    this.callbacks = callbacks;
  }

  async start(): Promise<void> {
    this.table.handlers = {
      onCardClick: (cardId) => {
        void this.handleCardClick(cardId);
      },
      onHumanZoneDoubleTap: () => {
        void this.pass();
      },
    };
    this.unsubscribe = this.session.subscribe(() => this.emitView());
    this.lock(true);
    this.table.sync(this.session.getViewState(), { inputLocked: true, selectedIds: [] });
    this.emitView();
    await this.table.presentEvents(this.session.startupEvents, this.session.getViewState());
    await this.loopAutomated();
  }

  destroy(): void {
    this.destroyed = true;
    this.unsubscribe?.();
    this.table.handlers = {};
  }

  get view(): PlayerViewState {
    return this.session.getViewState();
  }

  async pass(): Promise<void> {
    if (!this.canPass()) {
      return;
    }
    await this.human({ type: "PASS", actorId: HUMAN_PLAYER_ID });
  }

  async confirmDecision(): Promise<void> {
    if (this.busy || this.inputLocked || this.destroyed) {
      return;
    }
    const actions = this.view.availableActions;
    if (actions.some((action) => action.type === "EXCHANGE_CARDS") && this.selectedIds.length > 0) {
      const cardIds = [...this.selectedIds];
      this.selectedIds = [];
      await this.human({ type: "EXCHANGE_CARDS", actorId: HUMAN_PLAYER_ID, cardIds });
      return;
    }
    if (actions.some((action) => action.type === "STAY" || action.type === "EXCHANGE_CARDS")) {
      this.selectedIds = [];
      await this.human({ type: "STAY", actorId: HUMAN_PLAYER_ID });
    }
  }

  private async handleCardClick(cardId: CardId): Promise<void> {
    if (this.busy || this.inputLocked || this.destroyed) {
      return;
    }
    const view = this.view;
    if (view.phase === "TRICK_PLAY" && view.currentActorId === HUMAN_PLAYER_ID) {
      await this.human({ type: "PLAY_CARD", actorId: HUMAN_PLAYER_ID, cardId });
      return;
    }
    const exchange = view.availableActions.find((action) => action.type === "EXCHANGE_CARDS");
    if (!exchange) {
      return;
    }
    if (exchange.blockedCardIds?.includes(cardId)) {
      return;
    }
    const max = exchange.maxExchangeCards ?? 3;
    const selected = new Set(this.selectedIds);
    if (selected.has(cardId)) {
      selected.delete(cardId);
    } else if (selected.size < max) {
      selected.add(cardId);
    }
    this.selectedIds = [...selected];
    this.table.setSelected(this.selectedIds);
    this.emitView();
  }

  private canPass(): boolean {
    return (
      !this.busy &&
      !this.inputLocked &&
      !this.destroyed &&
      this.view.availableActions.some((action) => action.type === "PASS")
    );
  }

  private async human(command: GameCommand): Promise<void> {
    if (this.busy || this.inputLocked || this.destroyed) {
      return;
    }
    this.lock(true);
    this.busy = true;
    const result = this.session.dispatch(command);
    if (!result.ok) {
      this.busy = false;
      this.lock(false);
      this.emitView();
      return;
    }
    await this.table.presentEvents(result.events, this.session.getViewState());
    this.busy = false;
    if (this.destroyed) {
      return;
    }
    await this.loopAutomated();
  }

  private async loopAutomated(): Promise<void> {
    while (!this.destroyed) {
      const view = this.session.getViewState();
      if (view.phase === "GAME_OVER") {
        this.lock(true);
        this.emitView();
        this.callbacks.onEnded(view);
        return;
      }
      const peek = this.session.peekAdvance();
      if (peek.kind === "human") {
        this.lock(false);
        this.emitView();
        return;
      }
      if (peek.kind === "idle") {
        this.lock(true);
        this.emitView();
        return;
      }
      this.lock(true);
      if (peek.kind === "bot") {
        await wait(250 + Math.floor(Math.random() * 450));
      } else {
        await wait(160);
      }
      if (this.destroyed) {
        return;
      }
      const advanced = this.session.advanceAutomated();
      if (advanced.status !== "advanced") {
        if (advanced.status === "wait-human") {
          this.lock(false);
        }
        this.emitView();
        return;
      }
      this.busy = true;
      await this.table.presentEvents(advanced.events, this.session.getViewState());
      this.busy = false;
      if (this.destroyed) {
        return;
      }
    }
  }

  private lock(locked: boolean): void {
    this.inputLocked = locked;
    this.table.setInputLocked(locked);
    if (locked) {
      this.selectedIds = [];
      this.table.setSelected([]);
    }
  }

  private emitView(): void {
    this.callbacks.onView(this.session.getViewState());
  }
}

export async function unlockAudio(): Promise<void> {
  await audioMixer.unlock();
}
