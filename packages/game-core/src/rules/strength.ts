import type { DeckConfiguration, Rank } from "@la-mosca/game-protocol";

const STRENGTH_48: readonly Rank[] = [1, 3, 12, 11, 10, 9, 8, 7, 6, 5, 4, 2];
const STRENGTH_40: readonly Rank[] = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2];

export function rankStrength(rank: Rank, deck: DeckConfiguration): number {
  const order = deck === "FULL_48" ? STRENGTH_48 : STRENGTH_40;
  const index = order.indexOf(rank);
  if (index < 0) {
    throw new Error(`Rank ${rank} is not part of ${deck}`);
  }
  return order.length - index;
}

export function compareSameSuit(
  leftRank: Rank,
  rightRank: Rank,
  deck: DeckConfiguration,
): number {
  return rankStrength(leftRank, deck) - rankStrength(rightRank, deck);
}
