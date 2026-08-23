import type { PlayerId } from "@la-mosca/game-protocol";

export interface Point {
  x: number;
  y: number;
}

export interface SeatLayout {
  id: PlayerId;
  name: string;
  isHuman: boolean;
  angle: number;
  origin: Point;
  hand: Point;
  pile: Point;
  label: Point;
  rotation: number;
}

export interface TableLayout {
  width: number;
  height: number;
  center: Point;
  deck: Point;
  trump: Point;
  trick: Point;
  tableRadiusX: number;
  tableRadiusY: number;
  humanZone: { x: number; y: number; width: number; height: number };
  seats: SeatLayout[];
  cardWidth: number;
  cardHeight: number;
  fanSpacing: number;
  stockWidth: number;
  stockHeight: number;
  stockRotation: number;
}

const CARD_ASPECT = 1.54;
const HAND_HEIGHT_RATIO = 0.3;
const MAX_FAN_WIDTH_RATIO = 0.66;
const MIN_FAN_SPACING = 0.62;
const MAX_FAN_SPACING = 0.78;
const MIN_CARD_WIDTH = 76;
const MAX_CARD_WIDTH = 200;
const STOCK_SCALE = 0.36;

export function dealerRightVector(angle: number): Point {
  return { x: Math.sin(angle), y: -Math.cos(angle) };
}

export function layoutTable(
  width: number,
  height: number,
  players: readonly { id: PlayerId; name: string }[],
  humanPlayerId: PlayerId,
  dealerPlayerId?: PlayerId | null,
): TableLayout {
  const maxFanWidth = width * MAX_FAN_WIDTH_RATIO;
  const widthForFive = maxFanWidth / (1 + MIN_FAN_SPACING * 4);
  const heightForHand = (height * HAND_HEIGHT_RATIO) / CARD_ASPECT;
  const cardWidth = clamp(Math.min(widthForFive, heightForHand), MIN_CARD_WIDTH, MAX_CARD_WIDTH);
  const cardHeight = cardWidth * CARD_ASPECT;
  const fanSpacing = clamp((maxFanWidth / cardWidth - 1) / 4, MIN_FAN_SPACING, MAX_FAN_SPACING);
  const humanHandY = height - cardHeight * 0.52 - 10;
  const tableBottom = humanHandY - cardHeight * 0.7;
  const tableTop = Math.max(height * 0.06, cardHeight * 0.16);
  const tableRadiusY = Math.max(90, (tableBottom - tableTop) / 2);
  const tableRadiusX = Math.min(width * 0.45, tableRadiusY * 1.72);
  const center = { x: width * 0.5, y: tableTop + tableRadiusY };
  const humanIndex = Math.max(0, players.findIndex((player) => player.id === humanPlayerId));
  const ordered = [...players.slice(humanIndex), ...players.slice(0, humanIndex)];
  const count = ordered.length;
  const seats: SeatLayout[] = ordered.map((player, index) => {
    const angle = Math.PI / 2 + (index * 2 * Math.PI) / count;
    const isHuman = player.id === humanPlayerId;
    const origin = ellipsePoint(center, tableRadiusX, tableRadiusY, angle);
    const radial = { x: Math.cos(angle), y: Math.sin(angle) };
    const right = dealerRightVector(angle);
    const handDist = cardHeight * 0.16;
    return {
      id: player.id,
      name: player.name,
      isHuman,
      angle,
      origin,
      hand: isHuman
        ? { x: center.x, y: humanHandY }
        : {
            x: origin.x + radial.x * handDist,
            y: origin.y + radial.y * handDist * 0.28,
          },
      pile: {
        x: origin.x - right.x * cardWidth * 0.82 - radial.x * cardWidth * 0.08,
        y: origin.y - right.y * cardHeight * 0.22 - radial.y * cardWidth * 0.06,
      },
      label: {
        x: origin.x - radial.x * (isHuman ? 0 : cardWidth * 0.28),
        y: isHuman ? origin.y - 40 : origin.y - radial.y * 18 + 4,
      },
      rotation: isHuman ? 0 : angle - Math.PI / 2,
    };
  });
  const dealerId = dealerPlayerId ?? humanPlayerId;
  const dealer = seats.find((seat) => seat.id === dealerId) ?? seats[0]!;
  const stockWidth = cardWidth * STOCK_SCALE;
  const stockHeight = cardHeight * STOCK_SCALE;
  const stock = placeDealerStock(dealer, center, tableRadiusX, tableRadiusY, stockWidth, stockHeight, width, height);
  return {
    width,
    height,
    center,
    deck: stock.deck,
    trump: stock.trump,
    trick: { ...center },
    tableRadiusX,
    tableRadiusY,
    humanZone: {
      x: width * 0.12,
      y: humanHandY - cardHeight * 0.72,
      width: width * 0.76,
      height: height - (humanHandY - cardHeight * 0.72),
    },
    seats,
    cardWidth,
    cardHeight,
    fanSpacing,
    stockWidth,
    stockHeight,
    stockRotation: dealer.rotation,
  };
}

export function fanOffset(index: number, count: number, spacing: number): { x: number; y: number; rotation: number } {
  if (count <= 1) {
    return { x: 0, y: 0, rotation: 0 };
  }
  const centered = index - (count - 1) / 2;
  return {
    x: centered * spacing,
    y: Math.abs(centered) * 2.2,
    rotation: centered * 0.04,
  };
}

function ellipsePoint(center: Point, radiusX: number, radiusY: number, angle: number): Point {
  return {
    x: center.x + Math.cos(angle) * radiusX,
    y: center.y + Math.sin(angle) * radiusY,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampPoint(point: Point, padX: number, padY: number, width: number, height: number): Point {
  return {
    x: clamp(point.x, padX, width - padX),
    y: clamp(point.y, padY, height - padY),
  };
}

function placeDealerStock(
  dealer: SeatLayout,
  center: Point,
  tableRadiusX: number,
  tableRadiusY: number,
  stockWidth: number,
  stockHeight: number,
  width: number,
  height: number,
): { deck: Point; trump: Point } {
  const right = dealerRightVector(dealer.angle);
  const inward = { x: -Math.cos(dealer.angle), y: -Math.sin(dealer.angle) };
  const along = 78 + stockWidth * 0.7;
  const ontoTable = stockHeight * 0.72;
  const rawDeck = {
    x: dealer.label.x + right.x * along + inward.x * ontoTable,
    y: dealer.label.y + right.y * along + inward.y * ontoTable,
  };
  const deck = clampPoint(
    pullInsideEllipse(rawDeck, center, tableRadiusX * 0.78, tableRadiusY * 0.78),
    stockWidth * 0.7,
    stockHeight * 0.7,
    width,
    height,
  );
  const rawTrump = {
    x: deck.x + right.x * stockWidth * 0.78 + inward.x * stockWidth * 0.16,
    y: deck.y + right.y * stockWidth * 0.78 + inward.y * stockWidth * 0.16,
  };
  const trump = clampPoint(
    pullInsideEllipse(rawTrump, center, tableRadiusX * 0.78, tableRadiusY * 0.78),
    stockWidth * 0.7,
    stockHeight * 0.7,
    width,
    height,
  );
  return { deck, trump };
}

function pullInsideEllipse(point: Point, center: Point, radiusX: number, radiusY: number): Point {
  const nx = (point.x - center.x) / radiusX;
  const ny = (point.y - center.y) / radiusY;
  const dist = Math.hypot(nx, ny);
  if (dist <= 1 || dist === 0) {
    return point;
  }
  return {
    x: center.x + (nx / dist) * radiusX,
    y: center.y + (ny / dist) * radiusY,
  };
}
