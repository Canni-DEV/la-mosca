import { Application, Graphics, Text } from "pixi.js";

export interface TableSnapshot {
  phase: string;
  trumpSuit: string | null;
  seed: number;
  scores: Array<{ name: string; score: number }>;
}

export class PixiTable {
  private app: Application | null = null;

  async mount(host: HTMLElement): Promise<void> {
    const app = new Application();
    await app.init({
      background: "#2c1810",
      resizeTo: host,
      antialias: true,
    });
    host.appendChild(app.canvas);
    this.app = app;
    this.render({
      phase: "LOBBY",
      trumpSuit: null,
      seed: 0,
      scores: [],
    });
  }

  render(snapshot: TableSnapshot): void {
    const app = this.app;
    if (!app) {
      return;
    }
    app.stage.removeChildren();
    const felt = new Graphics();
    felt.roundRect(24, 24, app.renderer.width - 48, app.renderer.height - 48, 28);
    felt.fill({ color: 0x3d2914 });
    felt.stroke({ width: 6, color: 0xc4a574 });
    app.stage.addChild(felt);

    const title = new Text({
      text: "La Mosca — mesa Pixi",
      style: { fill: 0xf3e6c8, fontSize: 22, fontFamily: "Georgia" },
    });
    title.x = 48;
    title.y = 48;
    app.stage.addChild(title);

    const body = new Text({
      text: [
        `Fase: ${snapshot.phase}`,
        `Triunfo: ${snapshot.trumpSuit ?? "—"}`,
        `Seed: ${snapshot.seed}`,
        ...snapshot.scores.map((score) => `${score.name}: ${score.score}`),
      ].join("\n"),
      style: { fill: 0xead9b2, fontSize: 16, fontFamily: "Segoe UI" },
    });
    body.x = 48;
    body.y = 92;
    app.stage.addChild(body);
  }

  destroy(): void {
    this.app?.destroy(true, { children: true });
    this.app = null;
  }
}
