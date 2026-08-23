import { describe, expect, it } from "vitest";
import { getLegalCards } from "../src/rules/legal-cards.ts";
import { card } from "../src/testing/index.ts";

describe("legal cards", () => {
  it("lets the leader play any card", () => {
    const hand = [card("OROS", 2), card("COPAS", 1), card("ESPADAS", 12)];
    expect(getLegalCards(hand, [], "BASTOS", "TRADITIONAL_40").map((item) => item.id)).toEqual(
      hand.map((item) => item.id),
    );
  });

  it("requires following lead when possible", () => {
    const hand = [card("OROS", 4), card("COPAS", 3), card("ESPADAS", 7)];
    const legal = getLegalCards(
      hand,
      [{ card: card("COPAS", 2) }],
      "BASTOS",
      "TRADITIONAL_40",
    );
    expect(legal.map((item) => item.id)).toEqual(["COPAS_3"]);
  });

  it("requires beating the current winner in the lead suit when possible", () => {
    const hand = [card("OROS", 4), card("OROS", 12), card("OROS", 2)];
    const legal = getLegalCards(
      hand,
      [{ card: card("OROS", 7) }],
      "BASTOS",
      "TRADITIONAL_40",
    );
    expect(legal.map((item) => item.id)).toEqual(["OROS_12"]);
  });

  it("allows any lead-suit card when none can beat", () => {
    const hand = [card("OROS", 4), card("OROS", 2)];
    const legal = getLegalCards(
      hand,
      [{ card: card("OROS", 1) }],
      "BASTOS",
      "TRADITIONAL_40",
    );
    expect(legal.map((item) => item.id).sort()).toEqual(["OROS_2", "OROS_4"]);
  });

  it("requires trump when the player cannot follow lead", () => {
    const hand = [card("BASTOS", 2), card("ESPADAS", 7)];
    const legal = getLegalCards(
      hand,
      [{ card: card("COPAS", 1) }],
      "BASTOS",
      "TRADITIONAL_40",
    );
    expect(legal.map((item) => item.id)).toEqual(["BASTOS_2"]);
  });

  it("requires a winning trump when a trump is already winning", () => {
    const hand = [card("BASTOS", 1), card("BASTOS", 2)];
    const legal = getLegalCards(
      hand,
      [{ card: card("COPAS", 12) }, { card: card("BASTOS", 7) }],
      "BASTOS",
      "TRADITIONAL_40",
    );
    expect(legal.map((item) => item.id)).toEqual(["BASTOS_1"]);
  });

  it("allows any card when the player has neither lead nor trump", () => {
    const hand = [card("ESPADAS", 4), card("OROS", 2)];
    const legal = getLegalCards(
      hand,
      [{ card: card("COPAS", 1) }],
      "BASTOS",
      "TRADITIONAL_40",
    );
    expect(legal.map((item) => item.id).sort()).toEqual(["ESPADAS_4", "OROS_2"]);
  });
});
