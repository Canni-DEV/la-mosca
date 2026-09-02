import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import type { TableLayout } from "./table-layout.ts";
import woodUrl from "../assets/table/scene-b-wood.webp";
import surroundUrl from "../assets/table/scene-b-surround.webp";

let woodTexture: Texture | null = null;
let surroundTexture: Texture | null = null;

export async function preloadTableArt(): Promise<void> {
  const [wood, surround] = await Promise.all([
    Assets.load<Texture>(woodUrl),
    Assets.load<Texture>(surroundUrl),
  ]);
  woodTexture = wood;
  surroundTexture = surround;
}

export function createTableBackground(width: number, height: number, layout: TableLayout | null): Container {
  const root = new Container();
  const center = layout?.center ?? { x: width / 2, y: height * 0.44 };
  const tableRadiusX = layout?.tableRadiusX ?? Math.min(width * 0.36, height * 0.36);
  const tableRadiusY = layout?.tableRadiusY ?? Math.min(height * 0.28, width * 0.3);

  const environment = coverSprite(surroundTexture, width, height);
  root.addChild(environment);

  const shadow = new Graphics();
  shadow.ellipse(center.x, center.y + Math.max(8, tableRadiusY * 0.035), tableRadiusX + 13, tableRadiusY + 14);
  shadow.fill({ color: 0x080604, alpha: 0.72 });
  root.addChild(shadow);

  const tableBacking = new Graphics();
  tableBacking.ellipse(center.x, center.y, tableRadiusX + 5, tableRadiusY + 5);
  tableBacking.fill({ color: 0x21160f, alpha: 1 });
  root.addChild(tableBacking);

  const table = new Sprite(woodTexture ?? Texture.WHITE);
  table.anchor.set(0.5);
  table.width = tableRadiusX * 2;
  table.height = tableRadiusY * 2;
  table.position.set(center.x, center.y);
  table.tint = woodTexture ? 0xffffff : 0x4a2f1b;
  root.addChild(table);

  const mask = new Graphics();
  mask.ellipse(center.x, center.y, tableRadiusX, tableRadiusY);
  mask.fill({ color: 0xffffff });
  table.mask = mask;
  root.addChild(mask);

  const rim = new Graphics();
  rim.ellipse(center.x, center.y, tableRadiusX + 1, tableRadiusY + 1);
  rim.stroke({ width: Math.max(7, Math.min(12, tableRadiusY * 0.035)), color: 0x6e5131, alpha: 0.82 });
  root.addChild(rim);

  return root;
}

function coverSprite(texture: Texture | null, width: number, height: number): Sprite {
  const sprite = new Sprite(texture ?? Texture.WHITE);
  sprite.anchor.set(0.5);
  sprite.position.set(width / 2, height / 2);
  if (texture) {
    const scale = Math.max(width / texture.width, height / texture.height);
    sprite.width = texture.width * scale;
    sprite.height = texture.height * scale;
  } else {
    sprite.width = width;
    sprite.height = height;
    sprite.tint = 0x120b08;
  }
  return sprite;
}
