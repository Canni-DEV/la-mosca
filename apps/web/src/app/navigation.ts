import type { DeckConfiguration } from "@la-mosca/game-protocol";

export type AppScreen = "menu" | "setup" | "howto" | "options" | "table" | "victory" | "playground";

export interface MatchSetup {
  playerCount: 3 | 4 | 5;
  deckConfiguration: DeckConfiguration;
  seed: number;
  humanName: string;
}

export interface VictoryInfo {
  winnerPlayerId: string;
  winnerName: string;
  humanWon: boolean;
  scores: Array<{ id: string; name: string; score: number }>;
  setup: MatchSetup;
}
