import type { Card, CardId, DeckConfiguration, GamePhase, PlayerId, Suit } from "../ids.ts";

export type DecisionAction = "PASS" | "STAY" | "EXCHANGE_CARDS";

export interface AvailableAction {
  readonly type: DecisionAction | "CUT_DECK" | "PLAY_CARD" | "START_NEXT_HAND";
  readonly blockedCardIds?: readonly CardId[];
  readonly maxExchangeCards?: number;
  readonly minCutIndex?: number;
  readonly maxCutIndex?: number;
}

export interface PlayerPublicView {
  readonly id: PlayerId;
  readonly name: string;
  readonly seatIndex: number;
  readonly score: number;
  readonly isDealer: boolean;
  readonly isActiveInHand: boolean;
  readonly hasPassed: boolean;
  readonly cardCount: number;
  readonly tricksWonInCurrentHand: number;
  readonly exchangeCount: number;
}

export interface TrickPlayView {
  readonly playerId: PlayerId;
  readonly card: Card;
  readonly playOrder: number;
  readonly wasLegal: boolean;
}

export interface TrickView {
  readonly number: number;
  readonly leaderPlayerId: PlayerId;
  readonly leadSuit: Suit | null;
  readonly plays: readonly TrickPlayView[];
  readonly winnerPlayerId: PlayerId | null;
  readonly status: "IN_PROGRESS" | "COMPLETE";
}

export interface PlayerViewState {
  readonly viewerId: PlayerId;
  readonly phase: GamePhase;
  readonly handNumber: number;
  readonly seed: number;
  readonly deckConfiguration: DeckConfiguration;
  readonly deckSize: number;
  readonly undealtCount: number;
  readonly trumpSuit: Suit | null;
  readonly revealedTrumpCard: Card | null;
  readonly dealerPlayerId: PlayerId | null;
  readonly cutterPlayerId: PlayerId | null;
  readonly currentActorId: PlayerId | null;
  readonly winnerPlayerId: PlayerId | null;
  readonly hand: readonly Card[];
  readonly players: readonly PlayerPublicView[];
  readonly currentTrick: TrickView | null;
  readonly completedTricks: readonly TrickView[];
  readonly availableActions: readonly AvailableAction[];
  readonly legalCardIds: readonly CardId[];
}

export interface GameViewState {
  readonly phase: GamePhase;
  readonly handNumber: number;
  readonly seed: number;
  readonly deckConfiguration: DeckConfiguration;
  readonly trumpSuit: Suit | null;
  readonly revealedTrumpCard: Card | null;
  readonly dealerPlayerId: PlayerId | null;
  readonly cutterPlayerId: PlayerId | null;
  readonly currentActorId: PlayerId | null;
  readonly winnerPlayerId: PlayerId | null;
  readonly players: readonly PlayerPublicView[];
  readonly currentTrick: TrickView | null;
  readonly completedTricks: readonly TrickView[];
}

export interface DebugViewState extends GameViewState {
  readonly deckSize: number;
  readonly undealtCount: number;
  readonly undealtPile: readonly Card[];
  readonly exchangeDiscardPile: readonly Card[];
  readonly hands: Readonly<Record<PlayerId, readonly Card[]>>;
  readonly passedCards: Readonly<Record<PlayerId, readonly Card[]>>;
  readonly wonCards: Readonly<Record<PlayerId, readonly Card[]>>;
}
