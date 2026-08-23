import type { CardId, GameCommand, PlayerViewState } from "@la-mosca/game-protocol";
import { parseCardId, rankStrength, type RandomSource } from "@la-mosca/game-core";

const SUIT_ORDER = ["OROS", "COPAS", "ESPADAS", "BASTOS"] as const;
const STRONG_RANKS = new Set([1, 3, 12]);

export class StandardBot {
  choose(view: PlayerViewState, rng: RandomSource): GameCommand | null {
    if (view.phase === "HAND_COMPLETE") {
      return { type: "START_NEXT_HAND" };
    }
    const isActor = view.currentActorId === view.viewerId;
    const cut = view.availableActions.find((action) => action.type === "CUT_DECK");
    if (cut && (isActor || view.cutterPlayerId === view.viewerId)) {
      const min = cut.minCutIndex ?? 1;
      const max = cut.maxCutIndex ?? min;
      const cutIndex = min + rng.nextInt(Math.max(1, max - min + 1));
      return { type: "CUT_DECK", actorId: view.viewerId, cutIndex };
    }
    if (!isActor) {
      return null;
    }
    if (view.availableActions.some((action) => action.type === "PASS") && shouldPass(view)) {
      return { type: "PASS", actorId: view.viewerId };
    }
    const exchange = view.availableActions.find((action) => action.type === "EXCHANGE_CARDS");
    if (exchange) {
      const discards = chooseDiscards(view, exchange.blockedCardIds ?? [], exchange.maxExchangeCards ?? 3);
      if (discards.length > 0) {
        return { type: "EXCHANGE_CARDS", actorId: view.viewerId, cardIds: discards };
      }
    }
    if (view.availableActions.some((action) => action.type === "STAY")) {
      return { type: "STAY", actorId: view.viewerId };
    }
    if (view.availableActions.some((action) => action.type === "PLAY_CARD")) {
      const cardId = choosePlay(view);
      if (cardId) {
        return { type: "PLAY_CARD", actorId: view.viewerId, cardId };
      }
    }
    return null;
  }
}

function shouldPass(view: PlayerViewState): boolean {
  if (!view.trumpSuit) {
    return true;
  }
  const hasTrump = view.hand.some((card) => card.suit === view.trumpSuit);
  const strongCount = view.hand.filter((card) => STRONG_RANKS.has(card.rank)).length;
  return !hasTrump && strongCount < 2;
}

function chooseDiscards(view: PlayerViewState, blocked: readonly string[], maxCards: number): CardId[] {
  const rest = view.hand.filter((card) => {
    if (blocked.includes(card.id)) {
      return false;
    }
    return card.suit !== view.trumpSuit && !STRONG_RANKS.has(card.rank);
  });
  rest.sort((left, right) => compareWeakestFirst(left.id, right.id, view.deckConfiguration, view.trumpSuit));
  return rest.slice(0, maxCards).map((card) => card.id);
}

function choosePlay(view: PlayerViewState): CardId | null {
  const legal = view.hand.filter((card) => view.legalCardIds.includes(card.id));
  if (legal.length === 0) {
    return view.hand[0]?.id ?? null;
  }
  const isLeader = view.currentTrick === null || view.currentTrick.plays.length === 0;
  if (isLeader) {
    const nonTrump = legal.filter((card) => card.suit !== view.trumpSuit);
    const pool = nonTrump.length > 0 ? nonTrump : legal;
    pool.sort((left, right) =>
      nonTrump.length > 0
        ? compareStrongestFirst(left.id, right.id, view.deckConfiguration)
        : compareWeakestFirst(left.id, right.id, view.deckConfiguration, view.trumpSuit),
    );
    return pool[0]?.id ?? null;
  }
  legal.sort((left, right) => compareWeakestFirst(left.id, right.id, view.deckConfiguration, view.trumpSuit));
  return legal[0]?.id ?? null;
}

function compareStrongestFirst(
  leftId: string,
  rightId: string,
  deck: PlayerViewState["deckConfiguration"],
): number {
  const left = parseCardId(leftId as CardId);
  const right = parseCardId(rightId as CardId);
  const byRank = rankStrength(right.rank, deck) - rankStrength(left.rank, deck);
  if (byRank !== 0) {
    return byRank;
  }
  return suitIndex(left.suit) - suitIndex(right.suit);
}

function compareWeakestFirst(
  leftId: string,
  rightId: string,
  deck: PlayerViewState["deckConfiguration"],
  trumpSuit: PlayerViewState["trumpSuit"],
): number {
  const left = parseCardId(leftId as CardId);
  const right = parseCardId(rightId as CardId);
  const leftTrump = left.suit === trumpSuit ? 1 : 0;
  const rightTrump = right.suit === trumpSuit ? 1 : 0;
  if (leftTrump !== rightTrump) {
    return leftTrump - rightTrump;
  }
  const byRank = rankStrength(left.rank, deck) - rankStrength(right.rank, deck);
  if (byRank !== 0) {
    return byRank;
  }
  return suitIndex(left.suit) - suitIndex(right.suit);
}

function suitIndex(suit: string): number {
  const index = SUIT_ORDER.indexOf(suit as (typeof SUIT_ORDER)[number]);
  return index < 0 ? 0 : index;
}

export function createStandardBot(): StandardBot {
  return new StandardBot();
}
