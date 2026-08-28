import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import type { TableLayout } from "./table-layout.ts";
import woodUrl from "../assets/table/wood.jpg";
import roomUrl from "../assets/table/bodegon-editorial.webp";

let roomTexture: Texture | null = null;
let woodTexture: Texture | null = null;

export async function preloadTableArt(): Promise<void> {
  const [room, wood] = await Promise.all([Assets.load<Texture>(roomUrl), Assets.load<Texture>(woodUrl)]);
  roomTexture = room;
  woodTexture = wood;
}

export function createTableBackground(width: number, height: number, layout: TableLayout | null): Container {
  const root = new Container();
  const center = layout?.center ?? { x: width / 2, y: height * 0.44 };
  const tableRadiusX = layout?.tableRadiusX ?? Math.min(width * 0.36, height * 0.36);
  const tableRadiusY = layout?.tableRadiusY ?? Math.min(height * 0.28, width * 0.3);

  const room = new Sprite(roomTexture ?? Texture.WHITE);
  room.anchor.set(0.5);
  room.position.set(width / 2, height / 2);
  if (roomTexture && layout?.props.roomVisible !== false) {
    const scale = Math.max(width / roomTexture.width, height / roomTexture.height);
    room.width = roomTexture.width * scale;
    room.height = roomTexture.height * scale;
  } else {
    room.width = width;
    room.height = height;
  }
  room.tint = roomTexture ? 0xffffff : 0x1a100b;
  room.visible = layout?.props.roomVisible !== false;
  root.addChild(room);

  const wash = new Graphics();
  wash.rect(0, 0, width, height);
  wash.fill({ color: 0x120b08, alpha: layout?.props.roomVisible === false ? 0.92 : 0.42 });
  root.addChild(wash);

  const table = new Sprite(woodTexture ?? Texture.WHITE);
  table.anchor.set(0.5);
  table.width = tableRadiusX * 2.04;
  table.height = tableRadiusY * 2.06;
  table.position.set(center.x, center.y);
  table.tint = woodTexture ? 0xffffff : 0x4a2f1b;
  root.addChild(table);

  const mask = new Graphics();
  mask.ellipse(center.x, center.y, tableRadiusX, tableRadiusY);
  mask.fill({ color: 0xffffff });
  table.mask = mask;
  root.addChild(mask);

  const rim = new Graphics();
  rim.ellipse(center.x, center.y, tableRadiusX, tableRadiusY);
  rim.stroke({ width: Math.max(10, Math.min(18, tableRadiusY * 0.055)), color: 0x21160f, alpha: 0.96 });
  rim.ellipse(center.x, center.y, tableRadiusX - 11, tableRadiusY - 11);
  rim.stroke({ width: 3, color: 0xc6a46a, alpha: 0.34 });
  root.addChild(rim);

  const lamp = new Graphics();
  lamp.ellipse(center.x, center.y - tableRadiusY * 0.12, tableRadiusX * 0.55, tableRadiusY * 0.42);
  lamp.fill({ color: 0xf0d9a0, alpha: 0.08 });
  root.addChild(lamp);

  return root;
}
