import type { Card, DeckConfiguration, Suit } from "@la-mosca/game-protocol";
import { compareSameSuit } from "./strength.ts";

export interface TrickPlay {
  readonly card: Card;
}

export function betterPlay(
  current: TrickPlay,
  candidate: TrickPlay,
  leadSuit: Suit,
  trumpSuit: Suit,
  deck: DeckConfiguration,
): TrickPlay {
  const currentIsTrump = current.card.suit === trumpSuit;
  const candidateIsTrump = candidate.card.suit === trumpSuit;

  if (candidateIsTrump && !currentIsTrump) {
    return candidate;
  }
  if (currentIsTrump && !candidateIsTrump) {
    return current;
  }
  if (candidateIsTrump && currentIsTrump) {
    return compareSameSuit(candidate.card.rank, current.card.rank, deck) > 0
      ? candidate
      : current;
  }

  const currentIsLead = current.card.suit === leadSuit;
  const candidateIsLead = candidate.card.suit === leadSuit;

  if (candidateIsLead && !currentIsLead) {
    return candidate;
  }
  if (currentIsLead && !candidateIsLead) {
    return current;
  }
  if (candidateIsLead && currentIsLead) {
    return compareSameSuit(candidate.card.rank, current.card.rank, deck) > 0
      ? candidate
      : current;
  }

  return current;
}

export function getCurrentWinningPlay(
  plays: readonly TrickPlay[],
  leadSuit: Suit,
  trumpSuit: Suit,
  deck: DeckConfiguration,
): TrickPlay {
  const first = plays[0];
  if (!first) {
    throw new Error("Cannot resolve a winner without plays");
  }
  let winner = first;
  for (let i = 1; i < plays.length; i += 1) {
    const candidate = plays[i];
    if (!candidate) {
      continue;
    }
    winner = betterPlay(winner, candidate, leadSuit, trumpSuit, deck);
  }
  return winner;
}

export function resolveTrickWinner(
  plays: readonly TrickPlay[],
  leadSuit: Suit,
  trumpSuit: Suit,
  deck: DeckConfiguration,
): TrickPlay {
  return getCurrentWinningPlay(plays, leadSuit, trumpSuit, deck);
}
