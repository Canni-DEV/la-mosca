import { describe, expect, it } from "vitest";
import { atlasBackRect, atlasFaceRect, CARD_TEX_H, CARD_TEX_W } from "./card-atlas.ts";

describe("spanish deck atlas mapping", () => {
  it("places each suit on its own row and ranks 1–12 left to right", () => {
    expect(atlasFaceRect("OROS", 1)).toEqual({ x: 0, y: 0, w: CARD_TEX_W, h: CARD_TEX_H });
    expect(atlasFaceRect("COPAS", 1)).toEqual({ x: 0, y: CARD_TEX_H, w: CARD_TEX_W, h: CARD_TEX_H });
    expect(atlasFaceRect("ESPADAS", 6)).toEqual({
      x: 5 * CARD_TEX_W,
      y: 2 * CARD_TEX_H,
      w: CARD_TEX_W,
      h: CARD_TEX_H,
    });
    expect(atlasFaceRect("BASTOS", 12)).toEqual({
      x: 11 * CARD_TEX_W,
      y: 3 * CARD_TEX_H,
      w: CARD_TEX_W,
      h: CARD_TEX_H,
    });
  });

  it("uses the second cell of the fifth row as the card back and skips the blank", () => {
    expect(atlasBackRect()).toEqual({
      x: CARD_TEX_W,
      y: 4 * CARD_TEX_H,
      w: CARD_TEX_W,
      h: CARD_TEX_H,
    });
  });
});
