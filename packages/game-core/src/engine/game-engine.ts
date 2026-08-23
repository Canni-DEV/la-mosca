import type {
  CardId,
  CommandResult,
  DebugViewState,
  GameCommand,
  GameEvent,
  GameViewState,
  PlayerId,
  PlayerViewState,
} from "@la-mosca/game-protocol";
import { buildDeck, cutDeck, shuffleInPlace } from "../deck/deck.ts";
import { parseCardId } from "../model/card.ts";
import {
  activePlayers,
  decisionOrder,
  firstActiveToRight,
  playerById,
  playerToLeft,
  playerToRight,
  trickPlayOrder,
} from "../model/seats.ts";
import {
  CARDS_PER_PLAYER,
  createEmptyState,
  INITIAL_SCORE,
  TRICKS_PER_HAND,
  type GameState,
  type PlayerState,
} from "../model/state.ts";
import { getDecisionOptions, getLegalCardIdsForPlayer } from "../rules/decision-options.ts";
import { isMoscaHand } from "../rules/mosca.ts";
import { getCurrentWinningPlay } from "../rules/trick-winner.ts";
import { SeededRng, type RandomSource } from "../rng/seeded-rng.ts";
import { applyScoreChange, checkVictoryAfterScore } from "../scoring/score.ts";
import { assertCardInvariant } from "./invariants.ts";
import {
  buildDebugViewState,
  buildGameViewState,
  buildPlayerViewState,
  getAvailableActions,
} from "./view.ts";

export class InvalidCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCommandError";
  }
}

export class GameEngine {
  private state: GameState;
  private rng: RandomSource;

  constructor(state = createEmptyState(), rng: RandomSource = new SeededRng(1)) {
    this.state = state;
    this.rng = rng;
  }

  static create(): GameEngine {
    return new GameEngine();
  }

  static fromState(state: GameState, rng: RandomSource = new SeededRng(1)): GameEngine {
    return new GameEngine(cloneState(state), rng);
  }

  getState(): GameState {
    return cloneState(this.state);
  }

  getEventLog(): readonly GameEvent[] {
    return this.state.eventLog;
  }

  getViewState(): GameViewState {
    return buildGameViewState(this.state);
  }

  getPlayerViewState(viewerId: PlayerId): PlayerViewState {
    return buildPlayerViewState(this.state, viewerId);
  }

  getDebugViewState(): DebugViewState {
    return buildDebugViewState(this.state);
  }

  getLegalCardIds(playerId: PlayerId): CardId[] {
    return getLegalCardIdsForPlayer(this.state, playerId);
  }

  getCurrentActorId(): PlayerId | null {
    return this.state.currentActorId;
  }

  getAvailableActions(playerId: PlayerId) {
    return getAvailableActions(this.state, playerId);
  }

  dispatch(command: GameCommand): CommandResult {
    const rng = this.rng.clone();
    const next = cloneState(this.state);
    const events: GameEvent[] = [];
    try {
      applyCommand(next, command, events, rng);
      assertCardInvariant(next);
    } catch (error) {
      if (error instanceof InvalidCommandError) {
        return { ok: false, error: { kind: "INVALID_COMMAND", message: error.message } };
      }
      throw error;
    }
    next.eventLog.push(...events);
    this.state = next;
    this.rng = rng;
    return { ok: true, events };
  }
}

function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState;
}

function applyCommand(
  state: GameState,
  command: GameCommand,
  events: GameEvent[],
  rng: RandomSource,
): void {
  switch (command.type) {
    case "START_GAME":
      startGame(state, command, events, rng);
      return;
    case "CUT_DECK":
      cutAndDeal(state, command.actorId, command.cutIndex, events);
      return;
    case "PASS":
      pass(state, command.actorId, events);
      return;
    case "STAY":
      stay(state, command.actorId, events);
      return;
    case "EXCHANGE_CARDS":
      exchange(state, command.actorId, command.cardIds, events);
      return;
    case "PLAY_CARD":
      playCard(state, command.actorId, command.cardId, events);
      return;
    case "START_NEXT_HAND":
      startNextHand(state, events, rng);
      return;
    default: {
      const impossible: never = command;
      throw new InvalidCommandError(`Unsupported command: ${(impossible as GameCommand).type}`);
    }
  }
}

function startGame(
  state: GameState,
  command: Extract<GameCommand, { type: "START_GAME" }>,
  events: GameEvent[],
  rng: RandomSource,
): void {
  if (state.phase !== "LOBBY") {
    throw new InvalidCommandError("The game has already started");
  }
  const setups = command.players;
  if (setups.length < 3 || setups.length > 6) {
    throw new InvalidCommandError("A game requires between 3 and 6 players");
  }
  if (command.deckConfiguration === "TRADITIONAL_40" && setups.length === 6) {
    throw new InvalidCommandError("6 players require the 48-card deck");
  }
  const ids = new Set(setups.map((player) => player.id));
  if (ids.size !== setups.length) {
    throw new InvalidCommandError("Player ids must be unique");
  }
  const firstDealerPlayerId = command.firstDealerPlayerId ?? setups[0]?.id;
  if (!firstDealerPlayerId || !ids.has(firstDealerPlayerId)) {
    throw new InvalidCommandError("The first dealer must be one of the players");
  }

  state.phase = "GAME_INITIALIZING";
  state.seed = command.seed;
  state.deckConfiguration = command.deckConfiguration;
  state.winnerPlayerId = null;
  state.players = setups.map((player, seatIndex) => createPlayer(player.id, player.name, seatIndex));
  state.dealerPlayerId = firstDealerPlayerId;
  events.push({
    type: "GameStarted",
    seed: command.seed,
    deckConfiguration: command.deckConfiguration,
    playerIds: setups.map((player) => player.id),
    firstDealerPlayerId,
  });
  beginHand(state, events, rng, false);
}

function createPlayer(id: PlayerId, name: string, seatIndex: number): PlayerState {
  return {
    id,
    name,
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
  };
}

function startNextHand(state: GameState, events: GameEvent[], rng: RandomSource): void {
  if (state.phase !== "HAND_COMPLETE") {
    throw new InvalidCommandError("Cannot start the next hand from the current phase");
  }
  if (!state.dealerPlayerId) {
    throw new InvalidCommandError("A dealer is required to rotate");
  }
  const nextDealer = playerToRight(state, state.dealerPlayerId);
  state.dealerPlayerId = nextDealer.id;
  events.push({
    type: "DealerRotated",
    dealerPlayerId: nextDealer.id,
    cutterPlayerId: playerToLeft(state, nextDealer.id).id,
  });
  beginHand(state, events, rng, true);
}

function beginHand(
  state: GameState,
  events: GameEvent[],
  rng: RandomSource,
  gatherExistingCards: boolean,
): void {
  const cards = gatherExistingCards
    ? collectCardsForNewHand(state)
    : buildDeck(state.deckConfiguration);
  state.handNumber += 1;
  state.currentTrick = null;
  state.completedTricks = [];
  state.exchangeDiscardPile = [];
  state.trumpSuit = null;
  state.revealedTrumpCardId = null;
  resetPlayersForHand(state);
  state.undealtPile = cards;
  shuffleInPlace(state.undealtPile, rng);
  if (!state.dealerPlayerId) {
    throw new InvalidCommandError("Dealer missing at hand start");
  }
  state.cutterPlayerId = playerToLeft(state, state.dealerPlayerId).id;
  state.currentActorId = state.cutterPlayerId;
  state.phase = "HAND_CUT";
  events.push({
    type: "HandStarted",
    handNumber: state.handNumber,
    dealerPlayerId: state.dealerPlayerId,
    cutterPlayerId: state.cutterPlayerId,
  });
  events.push({ type: "DeckShuffled", handNumber: state.handNumber });
  events.push({ type: "TurnChanged", playerId: state.currentActorId, phase: state.phase });
}

function resetPlayersForHand(state: GameState): void {
  for (const player of state.players) {
    player.isActiveInHand = true;
    player.hasPassed = false;
    player.hasDecided = false;
    player.hand = [];
    player.passedCards = [];
    player.wonCards = [];
    player.tricksWonInCurrentHand = 0;
    player.exchangeCount = 0;
  }
}

function collectCardsForNewHand(state: GameState): CardId[] {
  const ids = [
    ...state.undealtPile,
    ...state.exchangeDiscardPile,
    ...(state.currentTrick?.plays.map((play) => play.cardId) ?? []),
  ];
  for (const player of state.players) {
    ids.push(...player.hand, ...player.passedCards, ...player.wonCards);
  }
  return ids;
}

function cutAndDeal(
  state: GameState,
  actorId: PlayerId,
  cutIndex: number,
  events: GameEvent[],
): void {
  if (state.phase !== "HAND_CUT") {
    throw new InvalidCommandError("The deck can only be cut before the deal");
  }
  if (actorId !== state.cutterPlayerId) {
    throw new InvalidCommandError("Only the cutter may cut the deck");
  }
  if (cutIndex <= 0 || cutIndex >= state.undealtPile.length) {
    throw new InvalidCommandError("The cut must leave two non-empty groups");
  }
  state.undealtPile = cutDeck(state.undealtPile, cutIndex);
  events.push({ type: "DeckCut", cutterPlayerId: actorId, cutIndex });
  dealHands(state, events);
}

function dealHands(state: GameState, events: GameEvent[]): void {
  if (!state.dealerPlayerId) {
    throw new InvalidCommandError("Dealer missing during deal");
  }
  state.phase = "HAND_DEAL";
  let current = playerToRight(state, state.dealerPlayerId);
  for (let round = 1; round <= CARDS_PER_PLAYER; round += 1) {
    for (let i = 0; i < state.players.length; i += 1) {
      const cardId = state.undealtPile.shift();
      if (!cardId) {
        throw new InvalidCommandError("The deck ran out of cards during the deal");
      }
      current.hand.push(cardId);
      events.push({ type: "CardDealt", playerId: current.id, cardId, round });
      current = playerToRight(state, current.id);
    }
  }
  const dealer = playerById(state, state.dealerPlayerId);
  const trumpCardId = dealer.hand[dealer.hand.length - 1];
  if (!trumpCardId) {
    throw new InvalidCommandError("The dealer has no trump card after the deal");
  }
  const trumpCard = parseCardId(trumpCardId);
  state.revealedTrumpCardId = trumpCardId;
  state.trumpSuit = trumpCard.suit;
  state.phase = "TRUMP_REVEALED";
  events.push({ type: "TrumpRevealed", cardId: trumpCardId, trumpSuit: trumpCard.suit });
  state.phase = "PLAYER_DECISIONS";
  state.currentActorId = decisionOrder(state)[0] ?? null;
  events.push({ type: "TurnChanged", playerId: state.currentActorId, phase: state.phase });
}

function requireCurrentDecider(state: GameState, actorId: PlayerId): PlayerState {
  if (state.phase !== "PLAYER_DECISIONS") {
    throw new InvalidCommandError("It is not the decision phase");
  }
  if (state.currentActorId !== actorId) {
    throw new InvalidCommandError("It is not this player's turn to decide");
  }
  return playerById(state, actorId);
}

function pass(state: GameState, actorId: PlayerId, events: GameEvent[]): void {
  const player = requireCurrentDecider(state, actorId);
  if (!getDecisionOptions(state, actorId).canPass) {
    throw new InvalidCommandError("This player cannot pass");
  }
  player.hasPassed = true;
  player.isActiveInHand = false;
  player.hasDecided = true;
  player.passedCards = [...player.hand];
  player.hand = [];
  events.push({ type: "PlayerPassed", playerId: actorId });
  advanceAfterDecision(state, events);
}

function stay(state: GameState, actorId: PlayerId, events: GameEvent[]): void {
  const player = requireCurrentDecider(state, actorId);
  if (!getDecisionOptions(state, actorId).canStay) {
    throw new InvalidCommandError("This player cannot stay");
  }
  player.hasDecided = true;
  player.exchangeCount = 0;
  events.push({ type: "PlayerStayed", playerId: actorId });
  advanceAfterDecision(state, events);
}

function exchange(
  state: GameState,
  actorId: PlayerId,
  cardIds: readonly CardId[],
  events: GameEvent[],
): void {
  if (cardIds.length === 0) {
    stay(state, actorId, events);
    return;
  }
  const player = requireCurrentDecider(state, actorId);
  const options = getDecisionOptions(state, actorId);
  if (!options.canExchange) {
    throw new InvalidCommandError("Exchange is not allowed in this hand");
  }
  if (cardIds.length > options.maxExchangeCards) {
    throw new InvalidCommandError("A player may exchange at most 3 cards");
  }
  if (new Set(cardIds).size !== cardIds.length) {
    throw new InvalidCommandError("Exchange cards must be unique");
  }
  for (const cardId of cardIds) {
    if (!player.hand.includes(cardId)) {
      throw new InvalidCommandError("A player can only exchange cards from their hand");
    }
    if (options.blockedCardIds.includes(cardId)) {
      throw new InvalidCommandError("The dealer cannot exchange the revealed trump card");
    }
  }
  if (state.undealtPile.length < cardIds.length) {
    throw new InvalidCommandError("There are not enough cards left to exchange");
  }
  player.hand = player.hand.filter((cardId) => !cardIds.includes(cardId));
  state.exchangeDiscardPile.push(...cardIds);
  const drawn: CardId[] = [];
  for (let i = 0; i < cardIds.length; i += 1) {
    const drawnCard = state.undealtPile.shift();
    if (!drawnCard) {
      throw new InvalidCommandError("The undealt pile ran out during exchange");
    }
    drawn.push(drawnCard);
    player.hand.push(drawnCard);
  }
  player.hasDecided = true;
  player.exchangeCount = cardIds.length;
  events.push({
    type: "CardsExchanged",
    playerId: actorId,
    discardedCardIds: [...cardIds],
    drawnCardIds: drawn,
  });
  advanceAfterDecision(state, events);
}

function advanceAfterDecision(state: GameState, events: GameEvent[]): void {
  const next = decisionOrder(state).find((playerId) => !playerById(state, playerId).hasDecided);
  if (next) {
    state.currentActorId = next;
    events.push({ type: "TurnChanged", playerId: next, phase: state.phase });
    return;
  }
  finishDecisions(state, events);
}

function finishDecisions(state: GameState, events: GameEvent[]): void {
  const active = activePlayers(state);
  if (active.length < 2) {
    state.phase = "HAND_CANCELLED";
    events.push({
      type: "HandCancelled",
      reason: "INSUFFICIENT_ACTIVE_PLAYERS",
      activePlayerIds: active.map((player) => player.id),
    });
    completeHand(state, events, true);
    return;
  }
  state.phase = "MOSCA_CHECK";
  resolveMoscaOrStartTricks(state, events);
}

function resolveMoscaOrStartTricks(state: GameState, events: GameEvent[]): void {
  if (!state.trumpSuit || !state.dealerPlayerId) {
    throw new InvalidCommandError("Trump suit missing during Mosca check");
  }
  const moscaPlayer = activePlayers(state).find((player) =>
    isMoscaHand(player.hand.map(parseCardId), state.trumpSuit!),
  );
  if (moscaPlayer) {
    const cardIds = [...moscaPlayer.hand];
    events.push({ type: "MoscaDetected", playerId: moscaPlayer.id, cardIds });
    events.push({ type: "MoscaRevealed", playerId: moscaPlayer.id, cardIds });
    applyScoreChange(state, events, moscaPlayer.id, "MOSCA", state.handNumber);
    if (checkVictoryAfterScore(state, events, moscaPlayer.id)) {
      return;
    }
    for (const player of activePlayers(state)) {
      if (player.id !== moscaPlayer.id) {
        applyScoreChange(state, events, player.id, "CHUPADO", state.handNumber);
        events.push({ type: "PlayerChupado", playerId: player.id });
      }
    }
    completeHand(state, events, false);
    return;
  }
  startTrick(state, events, 1, firstActiveToRight(state, state.dealerPlayerId).id);
}

function startTrick(
  state: GameState,
  events: GameEvent[],
  trickNumber: number,
  leaderPlayerId: PlayerId,
): void {
  state.phase = "TRICK_PLAY";
  state.currentTrick = {
    number: trickNumber,
    leaderPlayerId,
    leadSuit: null,
    plays: [],
    winnerPlayerId: null,
    status: "IN_PROGRESS",
  };
  state.currentActorId = leaderPlayerId;
  events.push({ type: "TrickStarted", trickNumber, leaderPlayerId });
  events.push({ type: "TurnChanged", playerId: leaderPlayerId, phase: state.phase });
}

function playCard(state: GameState, actorId: PlayerId, cardId: CardId, events: GameEvent[]): void {
  if (state.phase !== "TRICK_PLAY" || !state.currentTrick || !state.trumpSuit) {
    throw new InvalidCommandError("A card can only be played during a trick");
  }
  if (state.currentActorId !== actorId) {
    throw new InvalidCommandError("It is not this player's turn to play");
  }
  const player = playerById(state, actorId);
  if (!player.isActiveInHand) {
    throw new InvalidCommandError("A passed player cannot play a card");
  }
  if (!player.hand.includes(cardId)) {
    throw new InvalidCommandError("The selected card is not in the player's hand");
  }
  const legalCardIds = getLegalCardIdsForPlayer(state, actorId);
  const wasLegal = legalCardIds.includes(cardId);
  player.hand = player.hand.filter((id) => id !== cardId);
  const playOrder = state.currentTrick.plays.length + 1;
  if (playOrder === 1) {
    state.currentTrick.leadSuit = parseCardId(cardId).suit;
  }
  const infractionId = wasLegal
    ? undefined
    : `palito-H${state.handNumber}-T${state.currentTrick.number}-O${playOrder}`;
  state.currentTrick.plays.push({
    playerId: actorId,
    cardId,
    playOrder,
    wasLegal,
    legalCardIdsAtMomentOfPlay: legalCardIds,
    infractionId,
  });
  events.push({
    type: "CardPlayed",
    playerId: actorId,
    cardId,
    wasLegal,
    trickNumber: state.currentTrick.number,
    playOrder,
  });
  if (!wasLegal && infractionId) {
    events.push({
      type: "PalitoDetected",
      playerId: actorId,
      cardId,
      infractionId,
      legalCardIds,
    });
    applyScoreChange(
      state,
      events,
      actorId,
      "PALITO",
      state.handNumber,
      state.currentTrick.number,
      infractionId,
    );
  }
  const order = trickPlayOrder(state, state.currentTrick.leaderPlayerId);
  if (state.currentTrick.plays.length < order.length) {
    state.currentActorId = order[state.currentTrick.plays.length] ?? null;
    events.push({ type: "TurnChanged", playerId: state.currentActorId, phase: state.phase });
    return;
  }
  completeTrick(state, events);
}

function completeTrick(state: GameState, events: GameEvent[]): void {
  const trick = state.currentTrick;
  if (!trick || !trick.leadSuit || !state.trumpSuit) {
    throw new InvalidCommandError("Cannot complete an unfinished trick");
  }
  const winning = getCurrentWinningPlay(
    trick.plays.map((play) => ({ card: parseCardId(play.cardId) })),
    trick.leadSuit,
    state.trumpSuit,
    state.deckConfiguration,
  );
  const winningPlay = trick.plays.find((play) => play.cardId === winning.card.id);
  if (!winningPlay) {
    throw new InvalidCommandError("Trick winner could not be identified");
  }
  const winner = playerById(state, winningPlay.playerId);
  trick.winnerPlayerId = winner.id;
  trick.status = "COMPLETE";
  winner.tricksWonInCurrentHand += 1;
  winner.wonCards.push(...trick.plays.map((play) => play.cardId));
  state.completedTricks.push(trick);
  state.currentTrick = null;
  events.push({ type: "TrickCompleted", trickNumber: trick.number, winnerPlayerId: winner.id });
  applyScoreChange(state, events, winner.id, "TRICK_WON", state.handNumber, trick.number);
  if (checkVictoryAfterScore(state, events, winner.id)) {
    return;
  }
  if (trick.number >= TRICKS_PER_HAND) {
    applyChupado(state, events);
    if (state.phase === "GAME_OVER") {
      return;
    }
    completeHand(state, events, false);
    return;
  }
  startTrick(state, events, trick.number + 1, winner.id);
}

function applyChupado(state: GameState, events: GameEvent[]): void {
  state.phase = "HAND_END_SCORING";
  for (const player of activePlayers(state)) {
    if (player.tricksWonInCurrentHand === 0) {
      applyScoreChange(state, events, player.id, "CHUPADO", state.handNumber);
      events.push({ type: "PlayerChupado", playerId: player.id });
    }
  }
}

function completeHand(state: GameState, events: GameEvent[], cancelled: boolean): void {
  if (state.phase === "GAME_OVER") {
    return;
  }
  state.phase = "HAND_COMPLETE";
  state.currentActorId = null;
  events.push({ type: "HandCompleted", handNumber: state.handNumber, cancelled });
  events.push({ type: "TurnChanged", playerId: null, phase: state.phase });
}
