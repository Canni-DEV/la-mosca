import { describe, expect, it } from "vitest";
import { dealerRightVector, layoutTable } from "./table-layout.ts";

const three = [
  { id: "p1", name: "Vos" },
  { id: "p2", name: "Nora" },
  { id: "p3", name: "Tito" },
];
const four = [...three, { id: "p4", name: "Mabel" }];
const five = [...four, { id: "p5", name: "Rulo" }];

describe("layoutTable", () => {
  it("sits the human at the bottom and spaces 3, 4 and 5 players evenly", () => {
    for (const players of [three, four, five]) {
      const layout = layoutTable(1280, 800, players, "p1", "p1");
      expect(layout.seats).toHaveLength(players.length);
      const human = layout.seats[0]!;
      expect(human.id).toBe("p1");
      expect(human.angle).toBeCloseTo(Math.PI / 2, 8);
      expect(human.origin.y).toBeGreaterThan(layout.center.y);
      const step = (2 * Math.PI) / players.length;
      layout.seats.forEach((seat, index) => {
        expect(seat.angle).toBeCloseTo(Math.PI / 2 - index * step, 8);
      });
    }
  });

  it("puts stock and public trump to the dealer right, not in the trick center", () => {
    const layout = layoutTable(1280, 800, four, "p1", "p1");
    const dealer = layout.seats[0]!;
    const right = dealerRightVector(dealer.angle);
    expect(right.x).toBeGreaterThan(0.9);
    expect(layout.deck.x).toBeGreaterThan(dealer.origin.x + 40);
    expect(layout.trump.x).toBeGreaterThan(layout.deck.x);
    const deckFromCenter = Math.hypot(layout.deck.x - layout.center.x, layout.deck.y - layout.center.y);
    expect(deckFromCenter).toBeGreaterThan(90);
    const trumpFromTrick = Math.hypot(layout.trump.x - layout.trick.x, layout.trump.y - layout.trick.y);
    expect(trumpFromTrick).toBeGreaterThan(80);
  });

  it("keeps the human at the bottom even if they are not first in the array", () => {
    const layout = layoutTable(
      1280,
      800,
      [
        { id: "p2", name: "Nora" },
        { id: "p3", name: "Tito" },
        { id: "p1", name: "Vos" },
      ],
      "p1",
      "p2",
    );
    expect(layout.seats[0]!.id).toBe("p1");
    expect(layout.seats[0]!.angle).toBeCloseTo(Math.PI / 2, 8);
    expect(layout.seats.map((seat) => seat.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("keeps the trick at the table center", () => {
    const layout = layoutTable(1100, 720, five, "p1", "p3");
    expect(layout.trick.x).toBeCloseTo(layout.center.x, 5);
    expect(layout.trick.y).toBeCloseTo(layout.center.y, 5);
  });

  it("keeps the human hand fully inside the canvas", () => {
    for (const [width, height] of [
      [1280, 800],
      [1100, 640],
      [900, 560],
      [390, 720],
    ] as const) {
      const layout = layoutTable(width, height, four, "p1", "p1");
      const human = layout.seats[0]!;
      expect(human.hand.y + layout.humanCardHeight * 0.52).toBeLessThanOrEqual(height - 4);
      expect(human.hand.y).toBeGreaterThan(layout.center.y);
      expect(human.origin.y).toBeLessThan(human.hand.y);
    }
  });

  it("sizes the human cards large enough to read without covering the table", () => {
    const layout = layoutTable(1280, 800, five, "p1", "p1");
    expect(layout.humanCardWidth).toBeCloseTo(layout.cardWidth * 0.85, 5);
    expect(layout.humanCardWidth).toBeGreaterThanOrEqual(125);
    expect(layout.humanCardWidth).toBeLessThanOrEqual(170);
    expect(layout.humanCardHeight).toBeGreaterThanOrEqual(185);
    expect(layout.humanCardHeight).toBeLessThan(800 * 0.32);
    const fanWidth = layout.humanCardWidth * (1 + layout.fanSpacing * 4);
    expect(fanWidth).toBeLessThan(1280 * 0.78);
    expect(fanWidth).toBeGreaterThan(1280 * 0.32);
  });

  it("keeps a readable hand on a 1920 desktop without stacking over the table", () => {
    const layout = layoutTable(1920, 940, five, "p1", "p1");
    expect(layout.humanCardWidth).toBeGreaterThanOrEqual(140);
    expect(layout.humanCardWidth).toBeLessThanOrEqual(170);
    expect(layout.humanCardHeight).toBeLessThan(940 * 0.3);
    const human = layout.seats[0]!;
    const cardTop = human.hand.y - layout.humanCardHeight * 0.5;
    const tableBottom = layout.center.y + layout.tableRadiusY;
    expect(tableBottom).toBeLessThan(cardTop - 8);
    expect(human.label.y).toBeLessThan(cardTop - 24);
  });

  it("keeps stock and trump on the canvas when the human deals", () => {
    const layout = layoutTable(1280, 800, five, "p1", "p1");
    expect(layout.deck.x).toBeGreaterThan(layout.cardWidth * 0.4);
    expect(layout.deck.x).toBeLessThan(1280 - layout.cardWidth * 0.4);
    expect(layout.trump.x).toBeLessThan(1280 - layout.cardWidth * 0.4);
    expect(layout.deck.y).toBeGreaterThan(layout.cardHeight * 0.3);
    expect(layout.deck.y).toBeLessThan(800 - layout.cardHeight * 0.3);
  });

  it("sits the next player to the human's visual right so deal order travels rightward", () => {
    for (const players of [three, four, five]) {
      const layout = layoutTable(1280, 800, players, "p1", "p1");
      const human = layout.seats[0]!;
      const next = layout.seats[1]!;
      expect(next.origin.x).toBeGreaterThan(human.origin.x + 40);
    }
  });

  it("places a small dealer stock beside the dealer plaque without covering the right-hand opponent", () => {
    for (const players of [three, four, five]) {
      const layout = layoutTable(1920, 940, players, "p1", "p1");
      const dealer = layout.seats[0]!;
      const rightSeat = layout.seats[1]!;
      expect(layout.stockWidth).toBeLessThan(layout.cardWidth * 0.42);
      expect(distance(layout.deck, dealer.label)).toBeLessThan(160);
      expect(distance(layout.trump, rightSeat.label)).toBeGreaterThan(130);
      expect(distance(layout.deck, rightSeat.hand)).toBeGreaterThan(110);
    }
  });

  it("keeps stock attached to a bot dealer instead of drifting into another seat", () => {
    const layout = layoutTable(1920, 940, five, "p1", "p5");
    const dealer = layout.seats.find((seat) => seat.id === "p5")!;
    expect(distance(layout.deck, dealer.label)).toBeLessThan(170);
    for (const seat of layout.seats.filter((item) => item.id !== "p5")) {
      expect(distance(layout.trump, seat.label)).toBeGreaterThan(90);
    }
  });

  it("keeps the five-player stock beside every dealer instead of drifting toward the next seat", () => {
    for (const dealerId of ["p1", "p2", "p3", "p4", "p5"] as const) {
      const layout = layoutTable(1920, 940, five, "p1", dealerId);
      const dealer = layout.seats.find((seat) => seat.id === dealerId)!;
      const toDealer = distance(layout.deck, dealer.label);
      expect(toDealer).toBeLessThan(145);
      for (const seat of layout.seats.filter((item) => item.id !== dealerId)) {
        expect(distance(layout.deck, seat.label)).toBeGreaterThan(toDealer + 40);
      }
    }
  });
});

function distance(left: { x: number; y: number }, right: { x: number; y: number }): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}
