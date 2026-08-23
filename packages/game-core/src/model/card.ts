import type { Card, CardId, DeckConfiguration, Rank, Suit } from "@la-mosca/game-protocol";
import { SUITS } from "@la-mosca/game-protocol";

export const RANKS_40: readonly Rank[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
export const RANKS_48: readonly Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function ranksFor(deck: DeckConfiguration): readonly Rank[] {
  return deck === "FULL_48" ? RANKS_48 : RANKS_40;
}

export function toCardId(suit: Suit, rank: Rank): CardId {
  return `${suit}_${rank}`;
}

export function parseCardId(id: CardId): Card {
  const separator = id.lastIndexOf("_");
  const suit = id.slice(0, separator) as Suit;
  const rank = Number(id.slice(separator + 1)) as Rank;
  return { id, suit, rank };
}

export function cardsFromIds(ids: readonly CardId[]): Card[] {
  return ids.map(parseCardId);
}

export function isSuit(value: string): value is Suit {
  return (SUITS as readonly string[]).includes(value);
}

export function deckSize(deck: DeckConfiguration): number {
  return ranksFor(deck).length * SUITS.length;
}
