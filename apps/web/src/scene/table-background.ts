import { Container, Graphics, Sprite, Texture } from "pixi.js";

function woodTexture(width: number, height: number): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(64, Math.min(1600, Math.round(width)));
  canvas.height = Math.max(64, Math.min(1000, Math.round(height)));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context unavailable");
  }
  const w = canvas.width;
  const h = canvas.height;
  const gradient = ctx.createRadialGradient(w * 0.5, h * 0.35, 40, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
  gradient.addColorStop(0, "#5a3a22");
  gradient.addColorStop(0.55, "#3a2414");
  gradient.addColorStop(1, "#1a100b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i += 1) {
    ctx.strokeStyle = `rgba(20, 10, 4, ${0.04 + (i % 5) * 0.015})`;
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    const y = (h / 70) * i + Math.sin(i) * 4;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + 8, w * 0.6, y - 6, w, y + 3);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(90, 50, 24, 0.18)";
  ctx.beginPath();
  ctx.ellipse(w * 0.28, h * 0.32, 48, 20, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.7, h * 0.26, 36, 16, 0.2, 0, Math.PI * 2);
  ctx.fill();
  return Texture.from(canvas);
}

export function createTableBackground(width: number, height: number): Container {
  const root = new Container();
  const wood = new Sprite(woodTexture(width, height));
  wood.width = width;
  wood.height = height;
  root.addChild(wood);

  const table = new Graphics();
  const inset = Math.min(width, height) * 0.06;
  table.roundRect(inset, inset * 0.7, width - inset * 2, height - inset * 1.55, 80);
  table.fill({ color: 0x4a2f1b });
  table.stroke({ width: 10, color: 0x2a1810 });
  root.addChild(table);

  const rim = new Graphics();
  rim.roundRect(inset + 10, inset * 0.7 + 10, width - inset * 2 - 20, height - inset * 1.55 - 20, 70);
  rim.stroke({ width: 3, color: 0xc4a574, alpha: 0.35 });
  root.addChild(rim);

  root.addChild(drawGlass(width * 0.16, height * 0.22));
  root.addChild(drawNotepad(width * 0.82, height * 0.2));
  return root;
}

function drawGlass(x: number, y: number): Graphics {
  const g = new Graphics();
  g.roundRect(x - 14, y - 28, 28, 52, 6);
  g.fill({ color: 0x2a1812, alpha: 0.55 });
  g.roundRect(x - 12, y - 8, 24, 28, 4);
  g.fill({ color: 0x4a2818, alpha: 0.85 });
  g.ellipse(x, y - 28, 14, 5);
  g.fill({ color: 0xd7c4a0, alpha: 0.28 });
  g.roundRect(x + 22, y + 8, 22, 16, 4);
  g.fill({ color: 0xcbb38a, alpha: 0.55 });
  return g;
}

function drawNotepad(x: number, y: number): Graphics {
  const g = new Graphics();
  g.roundRect(x - 34, y - 22, 68, 52, 6);
  g.fill({ color: 0xe8d9b6 });
  g.stroke({ width: 2, color: 0x8a6a3b });
  for (let i = 0; i < 4; i += 1) {
    g.moveTo(x - 24, y - 10 + i * 8);
    g.lineTo(x + 24, y - 10 + i * 8);
    g.stroke({ width: 1, color: 0xb89a6a, alpha: 0.8 });
  }
  return g;
}
