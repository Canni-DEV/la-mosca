import type { PlayerId } from "@la-mosca/game-protocol";

export interface Point {
  x: number;
  y: number;
}

export interface SeatLayout {
  id: PlayerId;
  name: string;
  isHuman: boolean;
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
  humanZone: { x: number; y: number; width: number; height: number };
  seats: SeatLayout[];
  cardWidth: number;
  cardHeight: number;
}

interface SeatSlot {
  nx: number;
  ny: number;
  rotation: number;
  handNx: number;
  handNy: number;
}

function slotsForCount(count: number): SeatSlot[] {
  if (count === 3) {
    return [
      { nx: 0.5, ny: 0.68, rotation: 0, handNx: 0.5, handNy: 0.86 },
      { nx: 0.86, ny: 0.38, rotation: -Math.PI / 2, handNx: 0.88, handNy: 0.36 },
      { nx: 0.14, ny: 0.38, rotation: Math.PI / 2, handNx: 0.12, handNy: 0.36 },
    ];
  }
  if (count === 4) {
    return [
      { nx: 0.5, ny: 0.68, rotation: 0, handNx: 0.5, handNy: 0.86 },
      { nx: 0.88, ny: 0.48, rotation: -Math.PI / 2, handNx: 0.9, handNy: 0.46 },
      { nx: 0.5, ny: 0.13, rotation: Math.PI, handNx: 0.5, handNy: 0.12 },
      { nx: 0.12, ny: 0.48, rotation: Math.PI / 2, handNx: 0.1, handNy: 0.46 },
    ];
  }
  return [
    { nx: 0.5, ny: 0.68, rotation: 0, handNx: 0.5, handNy: 0.86 },
    { nx: 0.88, ny: 0.58, rotation: -Math.PI / 2, handNx: 0.9, handNy: 0.56 },
    { nx: 0.72, ny: 0.14, rotation: Math.PI, handNx: 0.72, handNy: 0.13 },
    { nx: 0.28, ny: 0.14, rotation: Math.PI, handNx: 0.28, handNy: 0.13 },
    { nx: 0.12, ny: 0.58, rotation: Math.PI / 2, handNx: 0.1, handNy: 0.56 },
  ];
}

export function layoutTable(
  width: number,
  height: number,
  players: readonly { id: PlayerId; name: string }[],
  humanPlayerId: PlayerId,
): TableLayout {
  const cardWidth = Math.max(52, Math.min(92, width * 0.085));
  const cardHeight = cardWidth * 1.54;
  const slots = slotsForCount(players.length);
  const seats: SeatLayout[] = players.map((player, index) => {
    const slot = slots[index] ?? slots[0]!;
    const isHuman = player.id === humanPlayerId;
    return {
      id: player.id,
      name: player.name,
      isHuman,
      origin: { x: slot.nx * width, y: slot.ny * height },
      hand: { x: slot.handNx * width, y: slot.handNy * height },
      pile: {
        x: slot.nx * width + (isHuman ? 170 : Math.cos(slot.rotation + Math.PI / 2) * 70),
        y: slot.ny * height + (isHuman ? 8 : Math.sin(slot.rotation + Math.PI / 2) * 54),
      },
      label: {
        x: slot.nx * width,
        y: isHuman ? slot.ny * height : slot.ny * height + 52,
      },
      rotation: isHuman ? 0 : slot.rotation,
    };
  });
  return {
    width,
    height,
    center: { x: width / 2, y: height * 0.46 },
    deck: { x: width / 2 + 78, y: height * 0.42 },
    trump: { x: width / 2 + 138, y: height * 0.42 },
    trick: { x: width / 2, y: height * 0.44 },
    humanZone: {
      x: width * 0.18,
      y: height * 0.72,
      width: width * 0.64,
      height: height * 0.26,
    },
    seats,
    cardWidth,
    cardHeight,
  };
}

export function fanOffset(index: number, count: number, spacing: number): { x: number; y: number; rotation: number } {
  if (count <= 1) {
    return { x: 0, y: 0, rotation: 0 };
  }
  const centered = index - (count - 1) / 2;
  return {
    x: centered * spacing,
    y: Math.abs(centered) * 2.4,
    rotation: centered * 0.045,
  };
}
