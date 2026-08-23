import type { CardId, DeckConfiguration } from "@la-mosca/game-protocol";
import { SUITS } from "@la-mosca/game-protocol";
import { ranksFor, toCardId } from "../model/card.ts";
import type { RandomSource } from "../rng/seeded-rng.ts";

export function buildDeck(deck: DeckConfiguration): CardId[] {
  const cards: CardId[] = [];
  for (const suit of SUITS) {
    for (const rank of ranksFor(deck)) {
      cards.push(toCardId(suit, rank));
    }
  }
  return cards;
}

export function shuffleInPlace(cards: CardId[], rng: RandomSource): void {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = rng.nextInt(i + 1);
    const current = cards[i];
    const swapped = cards[j];
    if (current === undefined || swapped === undefined) {
      throw new Error("Shuffle index out of range");
    }
    cards[i] = swapped;
    cards[j] = current;
  }
}

/** Cut at `cutIndex`: cards [0, cutIndex) are the upper group; the lower group goes in front. */
export function cutDeck(cards: readonly CardId[], cutIndex: number): CardId[] {
  if (cutIndex <= 0 || cutIndex >= cards.length) {
    throw new Error(`Invalid cut index ${cutIndex} for deck of ${cards.length}`);
  }
  const upper = cards.slice(0, cutIndex);
  const lower = cards.slice(cutIndex);
  return [...lower, ...upper];
}
