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
  const canvas = document.createElement("canvas");
  canvas.width = CARD_TEX_W;
  canvas.height = CARD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.fillStyle = "#f4ead2";
  ctx.fillRect(0, 0, CARD_TEX_W, CARD_TEX_H);
  ctx.fillStyle = "#243b2c";
  roundRect(ctx, 7, 7, CARD_TEX_W - 14, CARD_TEX_H - 14, 8);
  ctx.fill();
  ctx.strokeStyle = "#c6a46a";
  ctx.lineWidth = 2;
  roundRect(ctx, 12, 12, CARD_TEX_W - 24, CARD_TEX_H - 24, 5);
  ctx.stroke();
  ctx.save();
  roundRect(ctx, 15, 15, CARD_TEX_W - 30, CARD_TEX_H - 30, 3);
  ctx.clip();
  ctx.strokeStyle = "rgba(242,228,199,.52)";
  ctx.lineWidth = 1;
  for (let y = -CARD_TEX_W; y < CARD_TEX_H + CARD_TEX_W; y += 14) {
    for (let x = -CARD_TEX_H; x < CARD_TEX_W + CARD_TEX_H; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, y + 7);
      ctx.lineTo(x + 7, y);
      ctx.lineTo(x + 14, y + 7);
      ctx.lineTo(x + 7, y + 14);
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
  drawFly(ctx, CARD_TEX_W / 2, CARD_TEX_H / 2);
  return canvas;
}

function drawFly(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(198,164,106,.9)";
  ctx.strokeStyle = "rgba(198,164,106,.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-8, -5, 8, 5, -0.45, 0, Math.PI * 2);
  ctx.ellipse(8, -5, 8, 5, 0.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
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
