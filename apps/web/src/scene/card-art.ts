import type { Card, Rank, Suit } from "@la-mosca/game-protocol";

export const CARD_ASPECT = 1.54;
export const CARD_TEX_W = 300;
export const CARD_TEX_H = Math.round(CARD_TEX_W * CARD_ASPECT);

const IVORY = "#f6edd8";
const INK = "#22170f";
const BORDER = "#6b2a22";
const GOLD = "#c9a24b";

const SUIT_COLOR: Record<Suit, string> = {
  OROS: "#c3921f",
  COPAS: "#b42318",
  ESPADAS: "#1b2430",
  BASTOS: "#2c5c2a",
};

const RANK_LABEL: Record<Rank, string> = {
  1: "AS",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "SOTA",
  11: "CABALLO",
  12: "REY",
};

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

export function drawCardFace(card: Card): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_TEX_W;
  canvas.height = CARD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context unavailable");
  }
  const color = SUIT_COLOR[card.suit];
  roundRect(ctx, 0, 0, CARD_TEX_W, CARD_TEX_H, 22);
  ctx.fillStyle = IVORY;
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = BORDER;
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = GOLD;
  roundRect(ctx, 14, 14, CARD_TEX_W - 28, CARD_TEX_H - 28, 14);
  ctx.stroke();

  drawCorner(ctx, card, color, 24, 28, false);
  drawCorner(ctx, card, color, CARD_TEX_W - 24, CARD_TEX_H - 28, true);

  if (card.rank <= 9) {
    drawPips(ctx, card, color);
  } else {
    drawCourt(ctx, card, color);
  }
  return canvas;
}

export function drawCardBack(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_TEX_W;
  canvas.height = CARD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context unavailable");
  }
  roundRect(ctx, 0, 0, CARD_TEX_W, CARD_TEX_H, 22);
  ctx.fillStyle = "#5a1d24";
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#3a1014";
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = GOLD;
  roundRect(ctx, 16, 16, CARD_TEX_W - 32, CARD_TEX_H - 32, 14);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, 28, 28, CARD_TEX_W - 56, CARD_TEX_H - 56, 10);
  ctx.clip();
  ctx.fillStyle = "#6d2730";
  for (let y = 20; y < CARD_TEX_H; y += 28) {
    for (let x = 10; x < CARD_TEX_W; x += 28) {
      ctx.save();
      ctx.translate(x + ((y / 28) % 2) * 14, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-7, -7, 14, 14);
      ctx.restore();
    }
  }
  ctx.restore();

  ctx.save();
  ctx.translate(CARD_TEX_W / 2, CARD_TEX_H / 2);
  drawFly(ctx);
  ctx.restore();
  return canvas;
}

function drawCorner(
  ctx: CanvasRenderingContext2D,
  card: Card,
  color: string,
  x: number,
  y: number,
  invert: boolean,
): void {
  ctx.save();
  ctx.translate(x, y);
  if (invert) {
    ctx.rotate(Math.PI);
  }
  ctx.fillStyle = color;
  ctx.font = card.rank >= 10 ? "bold 18px Georgia, serif" : "bold 36px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(card.rank >= 10 ? String(card.rank) : RANK_LABEL[card.rank], 0, 0);
  ctx.translate(18, card.rank >= 10 ? 28 : 42);
  ctx.scale(0.55, 0.55);
  drawSuit(ctx, card.suit, color);
  ctx.restore();
}

function drawPips(ctx: CanvasRenderingContext2D, card: Card, color: string): void {
  const cx = CARD_TEX_W / 2;
  const cy = CARD_TEX_H / 2;
  const col = (n: number): number => cx + (n - 1) * 58;
  const row = (n: number): number => cy + (n - 2) * 62;
  const positions: Array<[number, number]> = pipLayout(card.rank).map(([c, r]) => [col(c), row(r)]);
  for (const [x, y] of positions) {
    ctx.save();
    ctx.translate(x, y);
    if (y > cy + 20) {
      ctx.rotate(Math.PI);
    }
    drawSuit(ctx, card.suit, color);
    ctx.restore();
  }
}

function pipLayout(rank: Rank): Array<[number, number]> {
  switch (rank) {
    case 1:
      return [[1, 2]];
    case 2:
      return [
        [1, 0.7],
        [1, 3.3],
      ];
    case 3:
      return [
        [1, 0.6],
        [1, 2],
        [1, 3.4],
      ];
    case 4:
      return [
        [0.35, 0.8],
        [1.65, 0.8],
        [0.35, 3.2],
        [1.65, 3.2],
      ];
    case 5:
      return [
        [0.35, 0.8],
        [1.65, 0.8],
        [1, 2],
        [0.35, 3.2],
        [1.65, 3.2],
      ];
    case 6:
      return [
        [0.35, 0.7],
        [1.65, 0.7],
        [0.35, 2],
        [1.65, 2],
        [0.35, 3.3],
        [1.65, 3.3],
      ];
    case 7:
      return [
        [0.35, 0.55],
        [1.65, 0.55],
        [1, 1.35],
        [0.35, 2.15],
        [1.65, 2.15],
        [0.35, 3.4],
        [1.65, 3.4],
      ];
    case 8:
      return [
        [0.35, 0.5],
        [1.65, 0.5],
        [0.35, 1.5],
        [1.65, 1.5],
        [0.35, 2.5],
        [1.65, 2.5],
        [0.35, 3.5],
        [1.65, 3.5],
      ];
    case 9:
      return [
        [0.35, 0.5],
        [1.65, 0.5],
        [0.35, 1.4],
        [1.65, 1.4],
        [1, 2],
        [0.35, 2.6],
        [1.65, 2.6],
        [0.35, 3.5],
        [1.65, 3.5],
      ];
    default:
      return [[1, 2]];
  }
}

function drawCourt(ctx: CanvasRenderingContext2D, card: Card, color: string): void {
  const x = 54;
  const y = 92;
  const w = CARD_TEX_W - 108;
  const h = CARD_TEX_H - 184;
  ctx.save();
  roundRect(ctx, x, y, w, h, 16);
  ctx.fillStyle = "#efe3c4";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.translate(x + w / 2, y + h / 2);
  ctx.fillStyle = color;
  if (card.rank === 10) {
    drawSota(ctx, color);
  } else if (card.rank === 11) {
    drawCaballo(ctx, color);
  } else {
    drawRey(ctx, color);
  }
  ctx.restore();

  ctx.fillStyle = color;
  ctx.font = "bold 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(RANK_LABEL[card.rank], CARD_TEX_W / 2, CARD_TEX_H / 2 + 148);
}

function drawSota(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -38, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-28, 8);
  ctx.quadraticCurveTo(0, -8, 28, 8);
  ctx.lineTo(22, 70);
  ctx.lineTo(-22, 70);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, 10);
  ctx.lineTo(58, -18);
  ctx.stroke();
}

function drawCaballo(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-40, 48);
  ctx.quadraticCurveTo(-30, -10, 8, -20);
  ctx.quadraticCurveTo(38, -28, 48, -6);
  ctx.quadraticCurveTo(36, 8, 18, 10);
  ctx.quadraticCurveTo(8, 36, 22, 62);
  ctx.moveTo(-18, 16);
  ctx.lineTo(-8, 62);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(30, -14, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawRey(ctx: CanvasRenderingContext2D, color: string): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-34, -18);
  ctx.lineTo(-20, -52);
  ctx.lineTo(-6, -22);
  ctx.lineTo(0, -58);
  ctx.lineTo(8, -22);
  ctx.lineTo(22, -52);
  ctx.lineTo(34, -18);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -6, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-30, 22);
  ctx.lineTo(30, 22);
  ctx.lineTo(24, 68);
  ctx.lineTo(-24, 68);
  ctx.closePath();
  ctx.stroke();
}

export function drawSuit(ctx: CanvasRenderingContext2D, suit: Suit, color: string): void {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  switch (suit) {
    case "OROS":
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f8e7b0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "COPAS": {
      ctx.beginPath();
      ctx.moveTo(0, 24);
      ctx.quadraticCurveTo(-28, 8, -22, -8);
      ctx.quadraticCurveTo(-16, -26, 0, -14);
      ctx.quadraticCurveTo(16, -26, 22, -8);
      ctx.quadraticCurveTo(28, 8, 0, 24);
      ctx.fill();
      ctx.fillRect(-3, 18, 6, 12);
      ctx.fillRect(-12, 28, 24, 5);
      break;
    }
    case "ESPADAS": {
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(12, 6);
      ctx.lineTo(4, 6);
      ctx.lineTo(4, 22);
      ctx.lineTo(-4, 22);
      ctx.lineTo(-4, 6);
      ctx.lineTo(-12, 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-14, 22, 28, 5);
      break;
    }
    case "BASTOS": {
      ctx.beginPath();
      ctx.moveTo(-4, 26);
      ctx.quadraticCurveTo(-8, 4, -2, -22);
      ctx.quadraticCurveTo(0, -30, 6, -24);
      ctx.quadraticCurveTo(10, 0, 5, 26);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-10, -6, 8, 5, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(12, 4, 8, 5, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

function drawFly(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#e8d5a3";
  ctx.beginPath();
  ctx.ellipse(-16, -6, 18, 10, -0.4, 0, Math.PI * 2);
  ctx.ellipse(16, -6, 18, 10, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1810";
  ctx.beginPath();
  ctx.ellipse(0, 4, 8, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -8);
  ctx.lineTo(-10, -22);
  ctx.moveTo(4, -8);
  ctx.lineTo(10, -22);
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
