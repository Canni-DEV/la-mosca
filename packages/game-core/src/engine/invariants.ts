import type { CardId } from "@la-mosca/game-protocol";
import { deckSize } from "../model/card.ts";
import type { GameState } from "../model/state.ts";

export class InvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvariantError";
  }
}

/** Physical card locations only. Completed tricks are audit history of the same cards. */
export function collectPhysicalCardIds(state: GameState): CardId[] {
  const ids: CardId[] = [...state.undealtPile, ...state.exchangeDiscardPile];
  if (state.currentTrick) {
    ids.push(...state.currentTrick.plays.map((play) => play.cardId));
  }
  for (const player of state.players) {
    ids.push(...player.hand, ...player.passedCards, ...player.wonCards);
  }
  return ids;
}

export function assertCardInvariant(state: GameState): void {
  if (state.phase === "LOBBY") {
    return;
  }
  const ids = collectPhysicalCardIds(state);
  const expected = deckSize(state.deckConfiguration);
  if (ids.length !== expected) {
    throw new InvariantError(
      `Card count mismatch: found ${ids.length}, expected ${expected} in phase ${state.phase}`,
    );
  }
  if (new Set(ids).size !== ids.length) {
    throw new InvariantError("Duplicate card identity detected");
  }
}
