import type { CardId, DeckConfiguration, PlayerId, PlayerSetup } from "../ids.ts";

export type GameCommand =
  | StartGameCommand
  | CutDeckCommand
  | PassCommand
  | StayCommand
  | ExchangeCardsCommand
  | PlayCardCommand
  | StartNextHandCommand;

export interface StartGameCommand {
  readonly type: "START_GAME";
  readonly players: readonly PlayerSetup[];
  readonly deckConfiguration: DeckConfiguration;
  readonly seed: number;
  readonly firstDealerPlayerId?: PlayerId;
}

export interface CutDeckCommand {
  readonly type: "CUT_DECK";
  readonly actorId: PlayerId;
  readonly cutIndex: number;
}

export interface PassCommand {
  readonly type: "PASS";
  readonly actorId: PlayerId;
}

export interface StayCommand {
  readonly type: "STAY";
  readonly actorId: PlayerId;
}

export interface ExchangeCardsCommand {
  readonly type: "EXCHANGE_CARDS";
  readonly actorId: PlayerId;
  readonly cardIds: readonly CardId[];
}

export interface PlayCardCommand {
  readonly type: "PLAY_CARD";
  readonly actorId: PlayerId;
  readonly cardId: CardId;
}

export interface StartNextHandCommand {
  readonly type: "START_NEXT_HAND";
}
