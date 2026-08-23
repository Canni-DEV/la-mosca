import type { CommandResult, GameCommand, GameEvent, PlayerId, PlayerViewState } from "@la-mosca/game-protocol";

export type Unsubscribe = () => void;

export interface GameSession {
  readonly humanPlayerId: PlayerId | null;
  getViewState(): PlayerViewState;
  dispatch(command: GameCommand): CommandResult;
  subscribe(listener: () => void): Unsubscribe;
}

export type AdvanceResult =
  | { readonly status: "advanced"; readonly events: readonly GameEvent[] }
  | { readonly status: "wait-human" }
  | { readonly status: "idle" };
