import type { Card, CardId, Rank, Suit } from "@la-mosca/game-protocol";
import { GameEngine } from "../engine/game-engine.ts";
import { toCardId } from "../model/card.ts";
import { createEmptyState, INITIAL_SCORE, type GameState, type PlayerState } from "../model/state.ts";
import { SeededRng } from "../rng/seeded-rng.ts";

export function card(suit: Suit, rank: Rank): Card {
  const id = toCardId(suit, rank);
  return { id, suit, rank };
}

export function cardId(suit: Suit, rank: Rank): CardId {
  return toCardId(suit, rank);
}

export function startStandardGame(seed = 1, playerCount = 4): GameEngine {
  const engine = GameEngine.create();
  const result = engine.dispatch({
    type: "START_GAME",
    seed,
    deckConfiguration: "TRADITIONAL_40",
    firstDealerPlayerId: "p1",
    players: Array.from({ length: playerCount }, (_, index) => ({
      id: `p${index + 1}`,
      name: `Jugador ${index + 1}`,
    })),
  });
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return engine;
}

export function playerFixture(
  id: string,
  seatIndex: number,
  overrides: Partial<PlayerState> = {},
): PlayerState {
  return {
    id,
    name: id,
    seatIndex,
    score: INITIAL_SCORE,
    isActiveInHand: true,
    hasPassed: false,
    hasDecided: false,
    hand: [],
    passedCards: [],
    wonCards: [],
    tricksWonInCurrentHand: 0,
    exchangeCount: 0,
    ...overrides,
  };
}

export function engineFromState(state: GameState, seed = 1): GameEngine {
  return GameEngine.fromState(state, new SeededRng(seed));
}

export function emptyStateWithPlayers(playerCount = 4): GameState {
  const state = createEmptyState();
  state.players = Array.from({ length: playerCount }, (_, index) =>
    playerFixture(`p${index + 1}`, index),
  );
  state.dealerPlayerId = "p1";
  state.cutterPlayerId = `p${playerCount}`;
  return state;
}
