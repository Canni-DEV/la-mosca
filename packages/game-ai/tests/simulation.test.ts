import { describe, expect, it } from "vitest";
import { simulateGame, simulateMany } from "../src/simulation/simulate-game.ts";

describe("bot simulation", () => {
  it("completes a 4-player game without deadlock", () => {
    const result = simulateGame({ seed: 2026, playerCount: 4 });
    expect(result.finished).toBe(true);
    expect(result.winnerPlayerId).toBeTruthy();
  });

  it("completes several games from different seeds", () => {
    const results = simulateMany(8, 100, 3);
    expect(results.every((result) => result.finished)).toBe(true);
  });
});
