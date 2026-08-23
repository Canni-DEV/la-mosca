import { describe, expect, it } from "vitest";
import { getCurrentWinningPlay } from "../src/rules/trick-winner.ts";
import { card } from "../src/testing/index.ts";

describe("trick winner", () => {
  it("lets a trump beat a higher off-suit card", () => {
    const winner = getCurrentWinningPlay(
      [{ card: card("COPAS", 1) }, { card: card("OROS", 2) }],
      "COPAS",
      "OROS",
      "TRADITIONAL_40",
    );
    expect(winner.card.id).toBe("OROS_2");
  });

  it("keeps the highest lead-suit card when no trump is played", () => {
    const winner = getCurrentWinningPlay(
      [{ card: card("COPAS", 4) }, { card: card("COPAS", 12) }, { card: card("ESPADAS", 1) }],
      "COPAS",
      "OROS",
      "TRADITIONAL_40",
    );
    expect(winner.card.id).toBe("COPAS_12");
  });
});
