import type { Card, Rank, Suit } from "@la-mosca/game-protocol";
import pipOrosUrl from "../assets/cards/pip-oros.png";
import pipCopasUrl from "../assets/cards/pip-copas.png";
import pipEspadasUrl from "../assets/cards/pip-espadas.png";
import pipBastosUrl from "../assets/cards/pip-bastos.png";
import backUrl from "../assets/cards/card-back.png";
import courtOrosSotaUrl from "../assets/cards/court-oros-sota.png";
import courtOrosCaballoUrl from "../assets/cards/court-oros-caballo.png";
import courtOrosReyUrl from "../assets/cards/court-oros-rey.png";
import courtCopasSotaUrl from "../assets/cards/court-copas-sota.png";
import courtCopasCaballoUrl from "../assets/cards/court-copas-caballo.png";
import courtCopasReyUrl from "../assets/cards/court-copas-rey.png";
import courtEspadasSotaUrl from "../assets/cards/court-espadas-sota.png";
import courtEspadasCaballoUrl from "../assets/cards/court-espadas-caballo.png";
import courtEspadasReyUrl from "../assets/cards/court-espadas-rey.png";
import courtBastosSotaUrl from "../assets/cards/court-bastos-sota.png";
import courtBastosCaballoUrl from "../assets/cards/court-bastos-caballo.png";
import courtBastosReyUrl from "../assets/cards/court-bastos-rey.png";

export const CARD_ASPECT = 1.54;
export const CARD_TEX_W = 320;
export const CARD_TEX_H = Math.round(CARD_TEX_W * CARD_ASPECT);

const IVORY = "#f4ead2";
const INK = "#1c140e";
const BORDER = "#6a261c";
const GOLD = "#c9a24b";

const SUIT_COLOR: Record<Suit, string> = {
  OROS: "#b8860b",
  COPAS: "#a31b14",
  ESPADAS: "#1a2430",
  BASTOS: "#2a5a28",
};

const COURT_NAME: Record<10 | 11 | 12, string> = {
  10: "SOTA",
  11: "CABALLO",
  12: "REY",
};

const PIP_URL: Record<Suit, string> = {
  OROS: pipOrosUrl,
  COPAS: pipCopasUrl,
  ESPADAS: pipEspadasUrl,
  BASTOS: pipBastosUrl,
};

const COURT_URL: Record<Suit, Record<10 | 11 | 12, string>> = {
  OROS: { 10: courtOrosSotaUrl, 11: courtOrosCaballoUrl, 12: courtOrosReyUrl },
  COPAS: { 10: courtCopasSotaUrl, 11: courtCopasCaballoUrl, 12: courtCopasReyUrl },
  ESPADAS: { 10: courtEspadasSotaUrl, 11: courtEspadasCaballoUrl, 12: courtEspadasReyUrl },
  BASTOS: { 10: courtBastosSotaUrl, 11: courtBastosCaballoUrl, 12: courtBastosReyUrl },
};

const images = new Map<string, HTMLImageElement>();
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
    const urls = [
      backUrl,
      ...Object.values(PIP_URL),
      ...Object.values(COURT_URL).flatMap((entry) => Object.values(entry)),
    ];
    artReady = Promise.all(urls.map(loadImage)).then(() => undefined);
  }
  await artReady;
}

export function paintCardFace(card: Card): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_TEX_W;
  canvas.height = CARD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context unavailable");
  }
  paintCardFrame(ctx);
  const color = SUIT_COLOR[card.suit];
  paintIndex(ctx, card, color, 22, 26, false);
  paintIndex(ctx, card, color, CARD_TEX_W - 22, CARD_TEX_H - 26, true);
  if (card.rank <= 9) {
    paintPips(ctx, card);
  } else {
    paintCourt(ctx, card);
  }
  return canvas;
}

export function paintCardBack(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_TEX_W;
  canvas.height = CARD_TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context unavailable");
  }
  roundedRect(ctx, 0, 0, CARD_TEX_W, CARD_TEX_H, 22);
  ctx.fillStyle = "#5a1d24";
  ctx.fill();
  const back = images.get(backUrl);
  if (back) {
    ctx.save();
    roundedRect(ctx, 6, 6, CARD_TEX_W - 12, CARD_TEX_H - 12, 16);
    ctx.clip();
    ctx.drawImage(back, 6, 6, CARD_TEX_W - 12, CARD_TEX_H - 12);
    ctx.restore();
  }
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#3a1014";
  roundedRect(ctx, 0, 0, CARD_TEX_W, CARD_TEX_H, 22);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = GOLD;
  roundedRect(ctx, 14, 14, CARD_TEX_W - 28, CARD_TEX_H - 28, 14);
  ctx.stroke();
  return canvas;
}

function paintCardFrame(ctx: CanvasRenderingContext2D): void {
  roundedRect(ctx, 0, 0, CARD_TEX_W, CARD_TEX_H, 22);
  ctx.fillStyle = IVORY;
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = BORDER;
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = GOLD;
  roundedRect(ctx, 13, 13, CARD_TEX_W - 26, CARD_TEX_H - 26, 14);
  ctx.stroke();
}

function paintIndex(
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
  ctx.font = "bold 42px 'Source Serif 4', Palatino, Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(String(card.rank), 0, 0);
  const pip = images.get(PIP_URL[card.suit]);
  if (pip) {
    ctx.drawImage(pip, 2, 44, 28, 28);
  }
  ctx.restore();
}

function paintPips(ctx: CanvasRenderingContext2D, card: Card): void {
  const pip = images.get(PIP_URL[card.suit]);
  const cx = CARD_TEX_W / 2;
  const cy = CARD_TEX_H / 2;
  const size = card.rank === 1 ? 118 : 58;
  for (const [col, row] of pipLayout(card.rank)) {
    const x = cx + (col - 1) * 72;
    const y = cy + (row - 2) * 68;
    ctx.save();
    ctx.translate(x, y);
    if (y > cy + 24) {
      ctx.rotate(Math.PI);
    }
    if (pip) {
      ctx.drawImage(pip, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = SUIT_COLOR[card.suit];
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function paintCourt(ctx: CanvasRenderingContext2D, card: Card): void {
  const rank = card.rank as 10 | 11 | 12;
  const url = COURT_URL[card.suit][rank];
  const image = images.get(url);
  const x = 48;
  const y = 78;
  const w = CARD_TEX_W - 96;
  const h = CARD_TEX_H - 168;
  ctx.save();
  roundedRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = "#efe3c4";
  ctx.fill();
  ctx.strokeStyle = SUIT_COLOR[card.suit];
  ctx.lineWidth = 3;
  ctx.stroke();
  if (image) {
    ctx.save();
    roundedRect(ctx, x + 6, y + 6, w - 12, h - 36, 10);
    ctx.clip();
    coverImage(ctx, image, x + 6, y + 6, w - 12, h - 36);
    ctx.restore();
  }
  ctx.fillStyle = SUIT_COLOR[card.suit];
  ctx.font = "bold 22px 'Source Serif 4', Palatino, Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(COURT_NAME[rank], CARD_TEX_W / 2, y + h - 16);
  ctx.restore();
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
        [1, 0.55],
        [1, 2],
        [1, 3.45],
      ];
    case 4:
      return [
        [0.32, 0.75],
        [1.68, 0.75],
        [0.32, 3.25],
        [1.68, 3.25],
      ];
    case 5:
      return [
        [0.32, 0.75],
        [1.68, 0.75],
        [1, 2],
        [0.32, 3.25],
        [1.68, 3.25],
      ];
    case 6:
      return [
        [0.32, 0.65],
        [1.68, 0.65],
        [0.32, 2],
        [1.68, 2],
        [0.32, 3.35],
        [1.68, 3.35],
      ];
    case 7:
      return [
        [0.32, 0.5],
        [1.68, 0.5],
        [1, 1.25],
        [0.32, 2.15],
        [1.68, 2.15],
        [0.32, 3.45],
        [1.68, 3.45],
      ];
    case 8:
      return [
        [0.32, 0.45],
        [1.68, 0.45],
        [0.32, 1.45],
        [1.68, 1.45],
        [0.32, 2.55],
        [1.68, 2.55],
        [0.32, 3.55],
        [1.68, 3.55],
      ];
    case 9:
      return [
        [0.32, 0.4],
        [1.68, 0.4],
        [0.32, 1.35],
        [1.68, 1.35],
        [1, 2],
        [0.32, 2.65],
        [1.68, 2.65],
        [0.32, 3.55],
        [1.68, 3.55],
      ];
    default:
      return [[1, 2]];
  }
}

function coverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const scale = Math.max(w / image.width, h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  const existing = images.get(url);
  if (existing) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      images.set(url, image);
      resolve(image);
    };
    image.onerror = () => reject(new Error(`Could not load ${url}`));
    image.src = url;
  });
}

function roundedRect(
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
