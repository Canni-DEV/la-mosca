import { describe, expect, it } from "vitest";
import { compareSameSuit, rankStrength } from "../src/rules/strength.ts";

describe("rank strength", () => {
  it("orders 40-card ranks as 1 > 3 > 12 > 11 > 10 > 7 > 6 > 5 > 4 > 2", () => {
    const order = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2] as const;
    for (let i = 0; i < order.length - 1; i += 1) {
      const current = order[i];
      const next = order[i + 1];
      if (current === undefined || next === undefined) {
        throw new Error("Unexpected rank gap");
      }
      expect(compareSameSuit(current, next, "TRADITIONAL_40")).toBeGreaterThan(0);
    }
  });

  it("orders 48-card ranks as 1 > 3 > 12 > 11 > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 2", () => {
    const order = [1, 3, 12, 11, 10, 9, 8, 7, 6, 5, 4, 2] as const;
    for (let i = 0; i < order.length - 1; i += 1) {
      const current = order[i];
      const next = order[i + 1];
      if (current === undefined || next === undefined) {
        throw new Error("Unexpected rank gap");
      }
      expect(compareSameSuit(current, next, "FULL_48")).toBeGreaterThan(0);
    }
  });

  it("never treats a natural 12 as stronger than a 3", () => {
    expect(rankStrength(3, "TRADITIONAL_40")).toBeGreaterThan(rankStrength(12, "TRADITIONAL_40"));
  });
});
