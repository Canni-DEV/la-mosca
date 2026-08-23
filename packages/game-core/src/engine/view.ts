import type {
  AvailableAction,
  Card,
  CardId,
  DebugViewState,
  GameViewState,
  PlayerId,
  PlayerPublicView,
  PlayerViewState,
  TrickView,
} from "@la-mosca/game-protocol";
import { parseCardId } from "../model/card.ts";
import { playerById } from "../model/seats.ts";
import type { GameState, TrickState } from "../model/state.ts";
import { getDecisionOptions, getLegalCardIdsForPlayer } from "../rules/decision-options.ts";

function toCard(id: CardId): Card {
  return parseCardId(id);
}

function toTrickView(trick: TrickState): TrickView {
  return {
    number: trick.number,
    leaderPlayerId: trick.leaderPlayerId,
    leadSuit: trick.leadSuit,
    plays: trick.plays.map((play) => ({
      playerId: play.playerId,
      card: toCard(play.cardId),
      playOrder: play.playOrder,
      wasLegal: play.wasLegal,
    })),
    winnerPlayerId: trick.winnerPlayerId,
    status: trick.status,
  };
}

function toPublicPlayers(state: GameState): PlayerPublicView[] {
  return state.players.map((player) => ({
    id: player.id,
    name: player.name,
    seatIndex: player.seatIndex,
    score: player.score,
    isDealer: player.id === state.dealerPlayerId,
    isActiveInHand: player.isActiveInHand,
    hasPassed: player.hasPassed,
    cardCount: player.hand.length,
    tricksWonInCurrentHand: player.tricksWonInCurrentHand,
    exchangeCount: player.exchangeCount,
  }));
}

export function getAvailableActions(state: GameState, playerId: PlayerId): AvailableAction[] {
  if (state.phase === "HAND_CUT" && playerId === state.cutterPlayerId) {
    return [
      {
        type: "CUT_DECK",
        minCutIndex: 1,
        maxCutIndex: Math.max(1, state.undealtPile.length - 1),
      },
    ];
  }
  if (state.phase === "PLAYER_DECISIONS" && playerId === state.currentActorId) {
    const options = getDecisionOptions(state, playerId);
    const actions: AvailableAction[] = [];
    if (options.canPass) {
      actions.push({ type: "PASS" });
    }
    if (options.canStay) {
      actions.push({ type: "STAY" });
    }
    if (options.canExchange) {
      actions.push({
        type: "EXCHANGE_CARDS",
        maxExchangeCards: options.maxExchangeCards,
        blockedCardIds: options.blockedCardIds,
      });
    }
    return actions;
  }
  if (state.phase === "TRICK_PLAY" && playerId === state.currentActorId) {
    return [{ type: "PLAY_CARD" }];
  }
  if (state.phase === "HAND_COMPLETE") {
    return [{ type: "START_NEXT_HAND" }];
  }
  return [];
}

export function buildGameViewState(state: GameState): GameViewState {
  return {
    phase: state.phase,
    handNumber: state.handNumber,
    seed: state.seed,
    deckConfiguration: state.deckConfiguration,
    trumpSuit: state.trumpSuit,
    revealedTrumpCard: state.revealedTrumpCardId ? toCard(state.revealedTrumpCardId) : null,
    dealerPlayerId: state.dealerPlayerId,
    cutterPlayerId: state.cutterPlayerId,
    currentActorId: state.currentActorId,
    winnerPlayerId: state.winnerPlayerId,
    players: toPublicPlayers(state),
    currentTrick: state.currentTrick ? toTrickView(state.currentTrick) : null,
    completedTricks: state.completedTricks.map(toTrickView),
  };
}

export function buildPlayerViewState(state: GameState, viewerId: PlayerId): PlayerViewState {
  const viewer = playerById(state, viewerId);
  const legalCardIds =
    state.phase === "TRICK_PLAY" && viewerId === state.currentActorId
      ? getLegalCardIdsForPlayer(state, viewerId)
      : [];
  const gameView = buildGameViewState(state);
  return {
    viewerId,
    phase: gameView.phase,
    handNumber: gameView.handNumber,
    seed: gameView.seed,
    deckConfiguration: gameView.deckConfiguration,
    deckSize: collectPhysicalCardCount(state),
    undealtCount: state.undealtPile.length,
    trumpSuit: gameView.trumpSuit,
    revealedTrumpCard: gameView.revealedTrumpCard,
    dealerPlayerId: gameView.dealerPlayerId,
    cutterPlayerId: gameView.cutterPlayerId,
    currentActorId: gameView.currentActorId,
    winnerPlayerId: gameView.winnerPlayerId,
    hand: viewer.hand.map(toCard),
    players: gameView.players,
    currentTrick: gameView.currentTrick,
    completedTricks: gameView.completedTricks,
    availableActions: getAvailableActions(state, viewerId),
    legalCardIds,
  };
}

export function buildDebugViewState(state: GameState): DebugViewState {
  const hands: Record<string, Card[]> = {};
  const passedCards: Record<string, Card[]> = {};
  const wonCards: Record<string, Card[]> = {};
  for (const player of state.players) {
    hands[player.id] = player.hand.map(toCard);
    passedCards[player.id] = player.passedCards.map(toCard);
    wonCards[player.id] = player.wonCards.map(toCard);
  }
  return {
    ...buildGameViewState(state),
    deckSize: collectPhysicalCardCount(state),
    undealtCount: state.undealtPile.length,
    undealtPile: state.undealtPile.map(toCard),
    exchangeDiscardPile: state.exchangeDiscardPile.map(toCard),
    hands,
    passedCards,
    wonCards,
  };
}

function collectPhysicalCardCount(state: GameState): number {
  let count = state.undealtPile.length + state.exchangeDiscardPile.length;
  if (state.currentTrick) {
    count += state.currentTrick.plays.length;
  }
  for (const player of state.players) {
    count += player.hand.length + player.passedCards.length + player.wonCards.length;
  }
  return count;
}
