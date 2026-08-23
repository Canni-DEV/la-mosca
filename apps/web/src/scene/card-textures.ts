import { Texture } from "pixi.js";
import type { Card, CardId } from "@la-mosca/game-protocol";
import { parseCardId } from "@la-mosca/game-core";
import { paintCardBack, paintCardFace, preloadCardArt } from "./card-art.ts";

let backTexture: Texture | null = null;
const faces = new Map<CardId, Texture>();
let ready: Promise<void> | null = null;

function canvasTexture(canvas: HTMLCanvasElement): Texture {
  return Texture.from(canvas);
}

export async function ensureCardTextures(): Promise<void> {
  if (!ready) {
    ready = preloadCardArt().then(() => {
      backTexture = canvasTexture(paintCardBack());
    });
  }
  await ready;
}

export function getBackTexture(): Texture {
  if (!backTexture) {
    backTexture = canvasTexture(paintCardBack());
  }
  return backTexture;
}

export function getFaceTexture(cardId: CardId): Texture {
  const existing = faces.get(cardId);
  if (existing) {
    return existing;
  }
  const texture = canvasTexture(paintCardFace(parseCardId(cardId)));
  faces.set(cardId, texture);
  return texture;
}

export function getFaceTextureForCard(card: Card): Texture {
  return getFaceTexture(card.id);
}

export async function preloadCardTextures(ids: readonly CardId[]): Promise<void> {
  await ensureCardTextures();
  getBackTexture();
  for (const id of ids) {
    getFaceTexture(id);
  }
}
