import type { GameEvent, PlayerId, ScoreType } from "@la-mosca/game-protocol";
import type { GameState } from "../model/state.ts";
import { playerById } from "../model/seats.ts";

const SCORE_DELTA: Record<ScoreType, number> = {
  TRICK_WON: -1,
  MOSCA: -5,
  CHUPADO: 5,
  PALITO: 50,
};

export function applyScoreChange(
  state: GameState,
  events: GameEvent[],
  playerId: PlayerId,
  scoreType: ScoreType,
  handNumber: number,
  trickNumber?: number,
  sourceId?: string,
): void {
  const player = playerById(state, playerId);
  const delta = SCORE_DELTA[scoreType];
  const scoreBefore = player.score;
  player.score += delta;
  events.push({
    type: "ScoreChanged",
    playerId,
    scoreType,
    delta,
    scoreBefore,
    scoreAfter: player.score,
    handNumber,
    trickNumber,
    sourceId,
  });
}

export function checkVictoryAfterScore(
  state: GameState,
  events: GameEvent[],
  playerId: PlayerId,
): boolean {
  const player = playerById(state, playerId);
  if (player.score > 0) {
    return false;
  }
  state.phase = "GAME_OVER";
  state.winnerPlayerId = playerId;
  state.currentActorId = null;
  events.push({ type: "GameWon", playerId, score: player.score });
  events.push({ type: "GameEnded", winnerPlayerId: playerId });
  return true;
}
