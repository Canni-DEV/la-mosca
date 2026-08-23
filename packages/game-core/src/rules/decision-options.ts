import type { CardId, PlayerId } from "@la-mosca/game-protocol";
import { parseCardId } from "../model/card.ts";
import type { GameState } from "../model/state.ts";
import { playerById } from "../model/seats.ts";
import { getLegalCards } from "./legal-cards.ts";

export interface DecisionOptions {
  canPass: boolean;
  canStay: boolean;
  canExchange: boolean;
  maxExchangeCards: number;
  blockedCardIds: CardId[];
}

export function getDecisionOptions(state: GameState, playerId: PlayerId): DecisionOptions {
  if (!state.revealedTrumpCardId) {
    throw new Error("Decision options require a revealed trump card");
  }
  const trumpRank = parseCardId(state.revealedTrumpCardId).rank;
  const isDealer = playerId === state.dealerPlayerId;
  const blockedCardIds = isDealer ? [state.revealedTrumpCardId] : [];

  if (trumpRank === 1) {
    return {
      canPass: false,
      canStay: true,
      canExchange: true,
      maxExchangeCards: 3,
      blockedCardIds,
    };
  }
  if (trumpRank === 2) {
    return {
      canPass: false,
      canStay: true,
      canExchange: false,
      maxExchangeCards: 0,
      blockedCardIds: [],
    };
  }
  return {
    canPass: !isDealer,
    canStay: true,
    canExchange: true,
    maxExchangeCards: 3,
    blockedCardIds,
  };
}

export function getLegalCardIdsForPlayer(state: GameState, playerId: PlayerId): CardId[] {
  const player = playerById(state, playerId);
  if (state.phase !== "TRICK_PLAY" || !state.currentTrick || !state.trumpSuit) {
    return player.hand.slice();
  }
  const hand = player.hand.map(parseCardId);
  const plays = state.currentTrick.plays.map((play) => ({ card: parseCardId(play.cardId) }));
  return getLegalCards(hand, plays, state.trumpSuit, state.deckConfiguration).map((card) => card.id);
}
