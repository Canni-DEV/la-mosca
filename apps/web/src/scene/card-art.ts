import type { Card, Suit } from "@la-mosca/game-protocol";
import atlasUrl from "../assets/cards/spanish-deck-atlas.png";
import { atlasBackRect, atlasFaceRect, CARD_TEX_H, CARD_TEX_W } from "./card-atlas.ts";

export { CARD_ASPECT, CARD_TEX_H, CARD_TEX_W, atlasBackRect, atlasFaceRect } from "./card-atlas.ts";

let atlas: HTMLImageElement | null = null;
let artReady: Promise<void> | null = null;

export function suitTitle(suit: Suit): string {
  switch (suit) {
    case "OROS":
      return "Oros";
    case "COPAS":
      return "Copas";
    case "ESPADAS":
      return "Espadas";
    case "BASTOS":
      return "Bastos";
  }
}

export async function preloadCardArt(): Promise<void> {
  if (!artReady) {
    artReady = loadImage(atlasUrl).then((image) => {
      atlas = image;
    });
  }
  await artReady;
}

export function paintCardFace(card: Card): HTMLCanvasElement {
  return blit(atlasFaceRect(card.suit, card.rank));
}

export function paintCardBack(): HTMLCanvasElement {
  return blit(atlasBackRect());
}

function blit(rect: { x: number; y: number; w: number; h: number }): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_TEX_W;
  canvas.height = CARD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context unavailable");
  }
  if (atlas) {
    ctx.drawImage(atlas, rect.x, rect.y, rect.w, rect.h, 0, 0, CARD_TEX_W, CARD_TEX_H);
  } else {
    ctx.fillStyle = "#f4ead2";
    ctx.fillRect(0, 0, CARD_TEX_W, CARD_TEX_H);
  }
  return canvas;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${url}`));
    image.src = url;
  });
}
