import type { Card, Suit } from "@la-mosca/game-protocol";
import { MOSCA_RANKS } from "../model/state.ts";

export function isMoscaHand(hand: readonly Card[], trumpSuit: Suit): boolean {
  if (hand.length !== 5) {
    return false;
  }
  if (!hand.every((card) => card.suit === trumpSuit)) {
    return false;
  }
  const ranks = new Set(hand.map((card) => card.rank));
  return MOSCA_RANKS.every((rank) => ranks.has(rank));
}
