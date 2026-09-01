import type { PlayerId } from "@la-mosca/game-protocol";

export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }

export type TableViewportMode = "desktopWide" | "desktopCompact" | "tablet" | "mobileLandscape" | "mobilePortrait";

export interface SafeInsets { top: number; right: number; bottom: number; left: number }

export interface HudAnchor extends Point {
  align: "start" | "center" | "end";
  placement: "top" | "right" | "bottom" | "left";
  maxWidth: number;
}

export interface SeatAnchor {
  id: PlayerId;
  name: string;
  isHuman: boolean;
  angle: number;
  origin: Point;
  hand: Point;
  pile: Point;
  /** Compatibility alias while Pixi presenters migrate. */
  label: Point;
  hud: HudAnchor;
  rotation: number;
}

export type SeatLayout = SeatAnchor;

export interface TableLayout {
  width: number;
  height: number;
  mode: TableViewportMode;
  safeInsets: SafeInsets;
  safeArea: Rect;
  table: Rect;
  center: Point;
  deck: Point;
  trump: Point;
  trick: Point;
  tableRadiusX: number;
  tableRadiusY: number;
  humanZone: Rect;
  hintAnchor: HudAnchor;
  suitAnchor: HudAnchor;
  seats: SeatAnchor[];
  cardWidth: number;
  cardHeight: number;
  humanCardWidth: number;
  humanCardHeight: number;
  fanSpacing: number;
  stockWidth: number;
  stockHeight: number;
  stockRotation: number;
  props: { roomVisible: boolean; tabletopProps: boolean; maximumCount: number };
}

export interface TableLayoutInput {
  width: number;
  height: number;
  players: readonly { id: PlayerId; name: string }[];
  humanPlayerId: PlayerId;
  dealerPlayerId?: PlayerId | null;
  safeInsets?: Partial<SafeInsets>;
}

const CARD_ASPECT = 319 / 208;
const HUMAN_CARD_SCALE = 0.85;
const MIN_FAN_SPACING = 0.58;
const MAX_FAN_SPACING = 0.76;
const STOCK_SCALE = 0.34;

export function dealerRightVector(angle: number): Point {
  return { x: Math.sin(angle), y: -Math.cos(angle) };
}

export function tableViewportMode(width: number, height: number): TableViewportMode {
  if (width <= 560 && height > width) return "mobilePortrait";
  if (height <= 520 && width > height) return "mobileLandscape";
  if (width < 980) return "tablet";
  if (width < 1440) return "desktopCompact";
  return "desktopWide";
}

export function computeTableLayout(input: TableLayoutInput): TableLayout {
  const width = Math.max(1, input.width);
  const height = Math.max(1, input.height);
  const mode = tableViewportMode(width, height);
  const baseInset = mode === "mobilePortrait" ? 8 : mode === "mobileLandscape" ? 10 : 16;
  const safeInsets: SafeInsets = {
    top: input.safeInsets?.top ?? baseInset,
    right: input.safeInsets?.right ?? baseInset,
    bottom: input.safeInsets?.bottom ?? baseInset,
    left: input.safeInsets?.left ?? baseInset,
  };
  const safeArea: Rect = {
    x: safeInsets.left,
    y: safeInsets.top,
    width: Math.max(1, width - safeInsets.left - safeInsets.right),
    height: Math.max(1, height - safeInsets.top - safeInsets.bottom),
  };
  const portrait = mode === "mobilePortrait";
  const landscape = mode === "mobileLandscape";
  const maxFanRatio = portrait ? 0.9 : landscape ? 0.58 : 0.7;
  const handHeightRatio = portrait ? 0.29 : landscape ? 0.34 : 0.3;
  const minCardWidth = portrait ? 64 : landscape ? 70 : 76;
  const maxCardWidth = mode === "desktopWide" ? 200 : 176;
  const maxFanWidth = safeArea.width * maxFanRatio;
  const widthForFive = maxFanWidth / (1 + MIN_FAN_SPACING * 4);
  const heightForHand = (safeArea.height * handHeightRatio) / CARD_ASPECT;
  const cardWidth = clamp(Math.min(widthForFive, heightForHand), minCardWidth, maxCardWidth);
  const cardHeight = cardWidth * CARD_ASPECT;
  const humanCardWidth = cardWidth * HUMAN_CARD_SCALE;
  const humanCardHeight = cardHeight * HUMAN_CARD_SCALE;
  const fanSpacing = clamp((maxFanWidth / humanCardWidth - 1) / 4, MIN_FAN_SPACING, MAX_FAN_SPACING);
  const humanHandY = safeArea.y + safeArea.height - humanCardHeight * 0.52 - (portrait ? 2 : 6);
  const handTop = humanHandY - humanCardHeight * 0.5;
  const tableTop = safeArea.y + (portrait ? 32 : landscape ? 8 : 16);
  const tableBottom = handTop - (portrait ? 18 : 14);
  const tableRadiusY = Math.max(portrait ? 126 : 92, Math.max(150, tableBottom - tableTop) / 2);
  const tableRadiusX = portrait
    ? Math.min(safeArea.width * 0.47, tableRadiusY * 0.78)
    : Math.min(safeArea.width * 0.46, tableRadiusY * (landscape ? 2.05 : 1.82));
  const center = { x: safeArea.x + safeArea.width * 0.5, y: tableTop + tableRadiusY };
  const table: Rect = { x: center.x - tableRadiusX, y: center.y - tableRadiusY, width: tableRadiusX * 2, height: tableRadiusY * 2 };

  const humanIndex = Math.max(0, input.players.findIndex((player) => player.id === input.humanPlayerId));
  const ordered = [...input.players.slice(humanIndex), ...input.players.slice(0, humanIndex)];
  const seats: SeatAnchor[] = ordered.map((player, index) => {
    // Canvas Y grows downward: subtracting the step puts seat +1 on screen-right.
    const angle = Math.PI / 2 - (index * 2 * Math.PI) / ordered.length;
    const isHuman = player.id === input.humanPlayerId;
    const radial = { x: Math.cos(angle), y: Math.sin(angle) };
    const right = dealerRightVector(angle);
    const rim = ellipsePoint(center, tableRadiusX, tableRadiusY, angle);
    const origin = isHuman ? rim : {
      x: center.x + (rim.x - center.x) * (portrait ? 0.72 : 1),
      y: center.y + (rim.y - center.y) * (portrait ? 0.86 : 1),
    };
    const handDist = cardHeight * (portrait ? 0.08 : 0.15);
    const hudInset = portrait ? 4 : cardWidth * 0.28;
    const label = isHuman
      ? { x: center.x, y: handTop - (portrait ? 24 : 38) }
      : clampPoint({
          x: origin.x - radial.x * hudInset,
          y: origin.y - radial.y * (portrait ? 4 : 18) + 4,
        }, portrait ? 52 : 76, portrait ? 34 : 44, width, height);
    return {
      id: player.id,
      name: player.name,
      isHuman,
      angle,
      origin,
      hand: isHuman ? { x: center.x, y: humanHandY } : {
        x: origin.x + radial.x * handDist,
        y: origin.y + radial.y * handDist * 0.3,
      },
      pile: {
        x: origin.x - right.x * cardWidth * (portrait ? 0.48 : 0.78) - radial.x * cardWidth * 0.08,
        y: origin.y - right.y * cardHeight * (portrait ? 0.14 : 0.2) - radial.y * cardWidth * 0.06,
      },
      label,
      hud: {
        ...label,
        align: "center",
        placement: isHuman ? "bottom" : Math.abs(radial.x) > 0.55 ? (radial.x > 0 ? "right" : "left") : "top",
        maxWidth: portrait ? 104 : 152,
      },
      rotation: isHuman ? 0 : angle - Math.PI / 2,
    };
  });

  const dealer = seats.find((seat) => seat.id === (input.dealerPlayerId ?? input.humanPlayerId)) ?? seats[0]!;
  const stockWidth = cardWidth * STOCK_SCALE;
  const stockHeight = cardHeight * STOCK_SCALE;
  const stock = placeDealerStock(dealer, center, tableRadiusX, tableRadiusY, stockWidth, stockHeight, width, height);
  return {
    width, height, mode, safeInsets, safeArea, table, center,
    deck: stock.deck, trump: stock.trump, trick: { ...center }, tableRadiusX, tableRadiusY,
    humanZone: { x: safeArea.x, y: handTop - humanCardHeight * 0.2, width: safeArea.width, height: safeArea.y + safeArea.height - (handTop - humanCardHeight * 0.2) },
    hintAnchor: { x: portrait ? center.x : safeArea.x + safeArea.width - 12, y: portrait ? table.y + table.height * 0.6 : safeArea.y + safeArea.height * 0.72, align: portrait ? "center" : "end", placement: portrait ? "top" : "right", maxWidth: portrait ? Math.min(300, safeArea.width - 24) : 280 },
    suitAnchor: { x: safeArea.x + safeArea.width - 8, y: safeArea.y + 8, align: "end", placement: "top", maxWidth: portrait ? 176 : 260 },
    seats, cardWidth, cardHeight, humanCardWidth, humanCardHeight, fanSpacing, stockWidth, stockHeight, stockRotation: dealer.rotation,
    props: { roomVisible: !portrait && !landscape, tabletopProps: mode === "desktopWide" || mode === "desktopCompact", maximumCount: mode === "desktopWide" ? 4 : mode === "desktopCompact" ? 2 : 0 },
  };
}

export function layoutTable(width: number, height: number, players: readonly { id: PlayerId; name: string }[], humanPlayerId: PlayerId, dealerPlayerId?: PlayerId | null): TableLayout {
  return computeTableLayout({ width, height, players, humanPlayerId, dealerPlayerId });
}

export function fanOffset(index: number, count: number, spacing: number): { x: number; y: number; rotation: number } {
  if (count <= 1) return { x: 0, y: 0, rotation: 0 };
  const centered = index - (count - 1) / 2;
  return { x: centered * spacing, y: Math.abs(centered) * 2.2, rotation: centered * 0.04 };
}

function ellipsePoint(center: Point, radiusX: number, radiusY: number, angle: number): Point {
  return { x: center.x + Math.cos(angle) * radiusX, y: center.y + Math.sin(angle) * radiusY };
}
function clamp(value: number, min: number, max: number): number { return Math.min(max, Math.max(min, value)); }
function clampPoint(point: Point, padX: number, padY: number, width: number, height: number): Point {
  return { x: clamp(point.x, padX, width - padX), y: clamp(point.y, padY, height - padY) };
}

function placeDealerStock(dealer: SeatAnchor, center: Point, tableRadiusX: number, tableRadiusY: number, stockWidth: number, stockHeight: number, width: number, height: number): { deck: Point; trump: Point } {
  const right = dealerRightVector(dealer.angle);
  const inward = { x: -Math.cos(dealer.angle), y: -Math.sin(dealer.angle) };
  const side = Math.abs(Math.cos(dealer.angle));
  const along = (34 + stockWidth * 0.28) * (1 - 0.62 * side);
  const ontoTable = 44 + stockHeight * 0.42 + side * 18;
  const rawDeck = pullInsideEllipse({ x: dealer.label.x + right.x * along + inward.x * ontoTable, y: dealer.label.y + right.y * along + inward.y * ontoTable }, center, tableRadiusX * 0.86, tableRadiusY * 0.86);
  const deck = clampPoint(ensureMinDistance(rawDeck, center, stockWidth * 1.3, dealer.origin), stockWidth * 0.7, stockHeight * 0.7, width, height);
  const trump = clampPoint(pullInsideEllipse({ x: deck.x + right.x * stockWidth * 0.6 + inward.x * stockWidth * 0.2, y: deck.y + right.y * stockWidth * 0.6 + inward.y * stockWidth * 0.2 }, center, tableRadiusX * 0.86, tableRadiusY * 0.86), stockWidth * 0.7, stockHeight * 0.7, width, height);
  return { deck, trump };
}

function ensureMinDistance(point: Point, center: Point, minimum: number, fallback: Point): Point {
  let dx = point.x - center.x;
  let dy = point.y - center.y;
  let distance = Math.hypot(dx, dy);
  if (distance >= minimum) return point;
  if (distance < 0.001) {
    dx = fallback.x - center.x;
    dy = fallback.y - center.y;
    distance = Math.max(0.001, Math.hypot(dx, dy));
  }
  return { x: center.x + dx / distance * minimum, y: center.y + dy / distance * minimum };
}

function pullInsideEllipse(point: Point, center: Point, radiusX: number, radiusY: number): Point {
  const nx = (point.x - center.x) / radiusX;
  const ny = (point.y - center.y) / radiusY;
  const dist = Math.hypot(nx, ny);
  if (dist <= 1 || dist === 0) return point;
  return { x: center.x + (nx / dist) * radiusX, y: center.y + (ny / dist) * radiusY };
}
