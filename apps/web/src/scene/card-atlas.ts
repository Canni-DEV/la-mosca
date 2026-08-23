import type { Rank, Suit } from "@la-mosca/game-protocol";

/** Native cell size of the Wikimedia Spanish-deck atlas (12 columns × 5 rows). */
export const CARD_TEX_W = 208;
export const CARD_TEX_H = 319;
export const CARD_ASPECT = CARD_TEX_H / CARD_TEX_W;

const SUIT_ROW: Record<Suit, number> = {
  OROS: 0,
  COPAS: 1,
  ESPADAS: 2,
  BASTOS: 3,
};

const BACK_COL = 1;
const BACK_ROW = 4;

export function atlasFaceRect(suit: Suit, rank: Rank): { x: number; y: number; w: number; h: number } {
  return {
    x: (rank - 1) * CARD_TEX_W,
    y: SUIT_ROW[suit] * CARD_TEX_H,
    w: CARD_TEX_W,
    h: CARD_TEX_H,
  };
}

export function atlasBackRect(): { x: number; y: number; w: number; h: number } {
  return {
    x: BACK_COL * CARD_TEX_W,
    y: BACK_ROW * CARD_TEX_H,
    w: CARD_TEX_W,
    h: CARD_TEX_H,
  };
}
