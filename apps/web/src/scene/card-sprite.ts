import { Container, Graphics, Sprite } from "pixi.js";
import type { CardId } from "@la-mosca/game-protocol";
import { getBackTexture, getFaceTexture } from "./card-textures.ts";

export class CardSprite extends Container {
  readonly face: Sprite;
  readonly back: Sprite;
  readonly shadow: Graphics;
  cardId: CardId | null;
  faceUp: boolean;

  constructor(width: number, height: number, cardId: CardId | null, faceUp: boolean) {
    super();
    this.cardId = cardId;
    this.faceUp = faceUp;
    this.shadow = new Graphics();
    this.back = new Sprite(getBackTexture());
    this.face = new Sprite(cardId ? getFaceTexture(cardId) : getBackTexture());
    for (const sprite of [this.back, this.face]) {
      sprite.anchor.set(0.5);
      sprite.width = width;
      sprite.height = height;
    }
    this.drawShadow(width, height);
    this.addChild(this.shadow, this.back, this.face);
    this.eventMode = "static";
    this.cursor = "pointer";
    this.applyFace();
  }

  setCardSize(width: number, height: number): void {
    this.back.width = width;
    this.back.height = height;
    this.face.width = width;
    this.face.height = height;
    this.drawShadow(width, height);
  }

  reveal(cardId: CardId): void {
    this.cardId = cardId;
    this.face.texture = getFaceTexture(cardId);
    this.faceUp = true;
    this.applyFace();
  }

  setFaceUp(faceUp: boolean): void {
    this.faceUp = faceUp;
    this.applyFace();
  }

  private drawShadow(width: number, height: number): void {
    this.shadow.clear();
    this.shadow.ellipse(6, 10, width * 0.42, height * 0.16);
    this.shadow.fill({ color: 0x000000, alpha: 0.28 });
  }

  private applyFace(): void {
    this.face.visible = this.faceUp;
    this.back.visible = !this.faceUp;
  }
}
