import type {
  CardId,
  DeckConfiguration,
  GamePhase,
  PlayerId,
  ScoreType,
  Suit,
} from "../ids.ts";

export type GameEvent =
  | GameStartedEvent
  | HandStartedEvent
  | DeckShuffledEvent
  | DeckCutEvent
  | CardDealtEvent
  | TrumpRevealedEvent
  | PlayerPassedEvent
  | PlayerStayedEvent
  | CardsExchangedEvent
  | HandCancelledEvent
  | MoscaDetectedEvent
  | MoscaRevealedEvent
  | TrickStartedEvent
  | CardPlayedEvent
  | PalitoDetectedEvent
  | ScoreChangedEvent
  | TrickCompletedEvent
  | PlayerChupadoEvent
  | HandCompletedEvent
  | DealerRotatedEvent
  | TurnChangedEvent
  | GameWonEvent
  | GameEndedEvent;

export interface GameStartedEvent {
  readonly type: "GameStarted";
  readonly seed: number;
  readonly deckConfiguration: DeckConfiguration;
  readonly playerIds: readonly PlayerId[];
  readonly firstDealerPlayerId: PlayerId;
}

export interface HandStartedEvent {
  readonly type: "HandStarted";
  readonly handNumber: number;
  readonly dealerPlayerId: PlayerId;
  readonly cutterPlayerId: PlayerId;
}

export interface DeckShuffledEvent {
  readonly type: "DeckShuffled";
  readonly handNumber: number;
}

export interface DeckCutEvent {
  readonly type: "DeckCut";
  readonly cutterPlayerId: PlayerId;
  readonly cutIndex: number;
}

export interface CardDealtEvent {
  readonly type: "CardDealt";
  readonly playerId: PlayerId;
  readonly cardId: CardId;
  readonly round: number;
}

export interface TrumpRevealedEvent {
  readonly type: "TrumpRevealed";
  readonly cardId: CardId;
  readonly trumpSuit: Suit;
}

export interface PlayerPassedEvent {
  readonly type: "PlayerPassed";
  readonly playerId: PlayerId;
}

export interface PlayerStayedEvent {
  readonly type: "PlayerStayed";
  readonly playerId: PlayerId;
}

export interface CardsExchangedEvent {
  readonly type: "CardsExchanged";
  readonly playerId: PlayerId;
  readonly discardedCardIds: readonly CardId[];
  readonly drawnCardIds: readonly CardId[];
}

export interface HandCancelledEvent {
  readonly type: "HandCancelled";
  readonly reason: "INSUFFICIENT_ACTIVE_PLAYERS";
  readonly activePlayerIds: readonly PlayerId[];
}

export interface MoscaDetectedEvent {
  readonly type: "MoscaDetected";
  readonly playerId: PlayerId;
  readonly cardIds: readonly CardId[];
}

export interface MoscaRevealedEvent {
  readonly type: "MoscaRevealed";
  readonly playerId: PlayerId;
  readonly cardIds: readonly CardId[];
}

export interface TrickStartedEvent {
  readonly type: "TrickStarted";
  readonly trickNumber: number;
  readonly leaderPlayerId: PlayerId;
}

export interface CardPlayedEvent {
  readonly type: "CardPlayed";
  readonly playerId: PlayerId;
  readonly cardId: CardId;
  readonly wasLegal: boolean;
  readonly trickNumber: number;
  readonly playOrder: number;
}

export interface PalitoDetectedEvent {
  readonly type: "PalitoDetected";
  readonly playerId: PlayerId;
  readonly cardId: CardId;
  readonly infractionId: string;
  readonly legalCardIds: readonly CardId[];
}

export interface ScoreChangedEvent {
  readonly type: "ScoreChanged";
  readonly playerId: PlayerId;
  readonly scoreType: ScoreType;
  readonly delta: number;
  readonly scoreBefore: number;
  readonly scoreAfter: number;
  readonly handNumber: number;
  readonly trickNumber?: number;
  readonly sourceId?: string;
}

export interface TrickCompletedEvent {
  readonly type: "TrickCompleted";
  readonly trickNumber: number;
  readonly winnerPlayerId: PlayerId;
}

export interface PlayerChupadoEvent {
  readonly type: "PlayerChupado";
  readonly playerId: PlayerId;
}

export interface HandCompletedEvent {
  readonly type: "HandCompleted";
  readonly handNumber: number;
  readonly cancelled: boolean;
}

export interface DealerRotatedEvent {
  readonly type: "DealerRotated";
  readonly dealerPlayerId: PlayerId;
  readonly cutterPlayerId: PlayerId;
}

export interface TurnChangedEvent {
  readonly type: "TurnChanged";
  readonly playerId: PlayerId | null;
  readonly phase: GamePhase;
}

export interface GameWonEvent {
  readonly type: "GameWon";
  readonly playerId: PlayerId;
  readonly score: number;
}

export interface GameEndedEvent {
  readonly type: "GameEnded";
  readonly winnerPlayerId: PlayerId;
}

export interface CommandError {
  readonly kind: "INVALID_COMMAND";
  readonly message: string;
}

export type CommandResult =
  | { readonly ok: true; readonly events: readonly GameEvent[] }
  | { readonly ok: false; readonly error: CommandError };
