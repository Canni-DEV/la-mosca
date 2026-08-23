export const SUITS = ["OROS", "COPAS", "ESPADAS", "BASTOS"] as const;
export type Suit = (typeof SUITS)[number];

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type DeckConfiguration = "TRADITIONAL_40" | "FULL_48";

export type PlayerId = string;

export type CardId = `${Suit}_${Rank}`;

export type GamePhase =
  | "LOBBY"
  | "GAME_INITIALIZING"
  | "HAND_SHUFFLE"
  | "HAND_CUT"
  | "HAND_DEAL"
  | "TRUMP_REVEALED"
  | "PLAYER_DECISIONS"
  | "HAND_CANCELLED"
  | "MOSCA_CHECK"
  | "TRICK_PLAY"
  | "HAND_END_SCORING"
  | "HAND_COMPLETE"
  | "GAME_OVER";

export type ScoreType = "TRICK_WON" | "MOSCA" | "CHUPADO" | "PALITO";

export interface Card {
  readonly id: CardId;
  readonly suit: Suit;
  readonly rank: Rank;
}

export interface PlayerSetup {
  readonly id: PlayerId;
  readonly name: string;
}
