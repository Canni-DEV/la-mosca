import type {
  CardId,
  DeckConfiguration,
  GameEvent,
  GamePhase,
  PlayerId,
  Rank,
  Suit,
} from "@la-mosca/game-protocol";

export interface PlayerState {
  id: PlayerId;
  name: string;
  seatIndex: number;
  score: number;
  isActiveInHand: boolean;
  hasPassed: boolean;
  hasDecided: boolean;
  hand: CardId[];
  passedCards: CardId[];
  wonCards: CardId[];
  tricksWonInCurrentHand: number;
  exchangeCount: number;
}

export interface CardPlayState {
  playerId: PlayerId;
  cardId: CardId;
  playOrder: number;
  wasLegal: boolean;
  legalCardIdsAtMomentOfPlay: CardId[];
  infractionId?: string;
}

export interface TrickState {
  number: number;
  leaderPlayerId: PlayerId;
  leadSuit: Suit | null;
  plays: CardPlayState[];
  winnerPlayerId: PlayerId | null;
  status: "IN_PROGRESS" | "COMPLETE";
}

export interface GameState {
  phase: GamePhase;
  seed: number;
  deckConfiguration: DeckConfiguration;
  players: PlayerState[];
  dealerPlayerId: PlayerId | null;
  cutterPlayerId: PlayerId | null;
  currentActorId: PlayerId | null;
  winnerPlayerId: PlayerId | null;
  handNumber: number;
  undealtPile: CardId[];
  exchangeDiscardPile: CardId[];
  trumpSuit: Suit | null;
  revealedTrumpCardId: CardId | null;
  currentTrick: TrickState | null;
  completedTricks: TrickState[];
  eventLog: GameEvent[];
}

export const INITIAL_SCORE = 20;
export const CARDS_PER_PLAYER = 5;
export const TRICKS_PER_HAND = 5;
export const MAX_EXCHANGE_CARDS = 3;
export const MOSCA_RANKS: readonly Rank[] = [1, 3, 12, 11, 10];

export function createEmptyState(): GameState {
  return {
    phase: "LOBBY",
    seed: 0,
    deckConfiguration: "TRADITIONAL_40",
    players: [],
    dealerPlayerId: null,
    cutterPlayerId: null,
    currentActorId: null,
    winnerPlayerId: null,
    handNumber: 0,
    undealtPile: [],
    exchangeDiscardPile: [],
    trumpSuit: null,
    revealedTrumpCardId: null,
    currentTrick: null,
    completedTricks: [],
    eventLog: [],
  };
}
