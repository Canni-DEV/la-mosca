import { Texture } from "pixi.js";
import type { Card, CardId } from "@la-mosca/game-protocol";
import { parseCardId } from "@la-mosca/game-core";
import { drawCardBack, drawCardFace } from "./card-art.ts";

let backTexture: Texture | null = null;
const faces = new Map<CardId, Texture>();

function canvasTexture(canvas: HTMLCanvasElement): Texture {
  return Texture.from(canvas);
}

export function getBackTexture(): Texture {
  if (!backTexture) {
    backTexture = canvasTexture(drawCardBack());
  }
  return backTexture;
}

export function getFaceTexture(cardId: CardId): Texture {
  const existing = faces.get(cardId);
  if (existing) {
    return existing;
  }
  const texture = canvasTexture(drawCardFace(parseCardId(cardId)));
  faces.set(cardId, texture);
  return texture;
}

export function getFaceTextureForCard(card: Card): Texture {
  return getFaceTexture(card.id);
}

export function preloadCardTextures(ids: readonly CardId[]): void {
  getBackTexture();
  for (const id of ids) {
    getFaceTexture(id);
  }
}
