import { Container, Sprite } from "pixi.js";
import type { CardId } from "@la-mosca/game-protocol";
import { getBackTexture, getFaceTexture } from "./card-textures.ts";

export class CardSprite extends Container {
  readonly face: Sprite;
  readonly back: Sprite;
  cardId: CardId | null;
  faceUp: boolean;

  constructor(width: number, height: number, cardId: CardId | null, faceUp: boolean) {
    super();
    this.cardId = cardId;
    this.faceUp = faceUp;
    this.back = new Sprite(getBackTexture());
    this.face = new Sprite(cardId ? getFaceTexture(cardId) : getBackTexture());
    for (const sprite of [this.back, this.face]) {
      sprite.anchor.set(0.5);
      sprite.width = width;
      sprite.height = height;
    }
    this.addChild(this.back);
    this.addChild(this.face);
    this.eventMode = "static";
    this.cursor = "pointer";
    this.applyFace();
  }

  setCardSize(width: number, height: number): void {
    this.back.width = width;
    this.back.height = height;
    this.face.width = width;
    this.face.height = height;
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

  private applyFace(): void {
    this.face.visible = this.faceUp;
    this.back.visible = !this.faceUp;
  }
}
