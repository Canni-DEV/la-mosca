import { describe, expect, it } from "vitest";
import { isMoscaHand } from "../src/rules/mosca.ts";
import { card } from "../src/testing/index.ts";

describe("Mosca", () => {
  it("detects 1-3-12-11-10 of trump", () => {
    const hand = [card("OROS", 1), card("OROS", 3), card("OROS", 12), card("OROS", 11), card("OROS", 10)];
    expect(isMoscaHand(hand, "OROS")).toBe(true);
  });

  it("rejects any other combination", () => {
    const hand = [card("OROS", 1), card("OROS", 3), card("OROS", 12), card("OROS", 11), card("OROS", 7)];
    expect(isMoscaHand(hand, "OROS")).toBe(false);
  });
});
