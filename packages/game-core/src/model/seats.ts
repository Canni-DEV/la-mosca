import type { PlayerId } from "@la-mosca/game-protocol";
import type { GameState, PlayerState } from "./state.ts";

export function playerById(state: GameState, id: PlayerId): PlayerState {
  const player = state.players.find((item) => item.id === id);
  if (!player) {
    throw new Error(`Unknown player: ${id}`);
  }
  return player;
}

export function playerBySeat(state: GameState, seatIndex: number): PlayerState {
  const player = state.players.find((item) => item.seatIndex === seatIndex);
  if (!player) {
    throw new Error(`Unknown seat: ${seatIndex}`);
  }
  return player;
}

export function seatToRight(seatIndex: number, playerCount: number): number {
  return (seatIndex + 1) % playerCount;
}

export function seatToLeft(seatIndex: number, playerCount: number): number {
  return (seatIndex - 1 + playerCount) % playerCount;
}

export function playerToRight(state: GameState, playerId: PlayerId): PlayerState {
  const player = playerById(state, playerId);
  return playerBySeat(state, seatToRight(player.seatIndex, state.players.length));
}

export function playerToLeft(state: GameState, playerId: PlayerId): PlayerState {
  const player = playerById(state, playerId);
  return playerBySeat(state, seatToLeft(player.seatIndex, state.players.length));
}

export function activePlayers(state: GameState): PlayerState[] {
  return state.players.filter((player) => player.isActiveInHand);
}

export function firstActiveToRight(state: GameState, fromPlayerId: PlayerId): PlayerState {
  let current = playerToRight(state, fromPlayerId);
  for (let i = 0; i < state.players.length; i += 1) {
    if (current.isActiveInHand) {
      return current;
    }
    current = playerToRight(state, current.id);
  }
  throw new Error("No active player found to the right");
}

export function decisionOrder(state: GameState): PlayerId[] {
  if (!state.dealerPlayerId) {
    throw new Error("Dealer is required to compute decision order");
  }
  const dealerSeat = playerById(state, state.dealerPlayerId).seatIndex;
  const order: PlayerId[] = [];
  for (let offset = 1; offset <= state.players.length; offset += 1) {
    const seat = (dealerSeat + offset) % state.players.length;
    order.push(playerBySeat(state, seat).id);
  }
  return order;
}

export function trickPlayOrder(state: GameState, leaderId: PlayerId): PlayerId[] {
  const order: PlayerId[] = [];
  let currentId = leaderId;
  for (let i = 0; i < state.players.length; i += 1) {
    const player = playerById(state, currentId);
    if (player.isActiveInHand) {
      order.push(player.id);
    }
    currentId = playerToRight(state, currentId).id;
  }
  return order;
}
