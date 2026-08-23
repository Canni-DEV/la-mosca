import type { Card, DeckConfiguration, Suit } from "@la-mosca/game-protocol";
import { compareSameSuit } from "./strength.ts";
import { getCurrentWinningPlay, type TrickPlay } from "./trick-winner.ts";

/**
 * Functional spec §35 — legal cards for the current trick.
 * The leader may play any card. Followers must follow lead, then trump, then any.
 */
export function getLegalCards(
  hand: readonly Card[],
  trickPlays: readonly TrickPlay[],
  trumpSuit: Suit,
  deck: DeckConfiguration,
): Card[] {
  const firstPlay = trickPlays[0];
  if (!firstPlay) {
    return [...hand];
  }

  const leadSuit = firstPlay.card.suit;
  const currentWinner = getCurrentWinningPlay(trickPlays, leadSuit, trumpSuit, deck);
  const leadCards = hand.filter((card) => card.suit === leadSuit);

  if (leadCards.length > 0) {
    if (currentWinner.card.suit === trumpSuit && trumpSuit !== leadSuit) {
      return leadCards;
    }
    const beatingLeadCards = leadCards.filter(
      (card) => compareSameSuit(card.rank, currentWinner.card.rank, deck) > 0,
    );
    return beatingLeadCards.length > 0 ? beatingLeadCards : leadCards;
  }

  const trumpCards = hand.filter((card) => card.suit === trumpSuit);
  if (trumpCards.length > 0) {
    if (currentWinner.card.suit !== trumpSuit) {
      return trumpCards;
    }
    const beatingTrumpCards = trumpCards.filter(
      (card) => compareSameSuit(card.rank, currentWinner.card.rank, deck) > 0,
    );
    return beatingTrumpCards.length > 0 ? beatingTrumpCards : trumpCards;
  }

  return [...hand];
}
