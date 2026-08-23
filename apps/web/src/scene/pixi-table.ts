import {
  Application,
  Container,
  Graphics,
  Text,
} from "pixi.js";
import type {
  CardId,
  GameEvent,
  PlayerId,
  PlayerViewState,
  Suit,
} from "@la-mosca/game-protocol";
import { ranksFor } from "@la-mosca/game-core";
import { SUITS } from "@la-mosca/game-protocol";
import { tween, wait, type TweenHandle } from "../animation/tween.ts";
import { easeOutBack, easeOutCubic } from "../animation/easing.ts";
import { allowShake } from "../animation/motion.ts";
import { audioMixer } from "../audio/mixer.ts";
import { CardSprite } from "./card-sprite.ts";
import { preloadCardTextures } from "./card-textures.ts";
import { createTableBackground } from "./table-background.ts";
import { fanOffset, layoutTable, type SeatLayout, type TableLayout } from "./table-layout.ts";

export interface TableSyncOptions {
  selectedIds?: readonly CardId[];
  inputLocked?: boolean;
}

export interface TableHandlers {
  onCardClick?: (cardId: CardId) => void;
  onHumanZoneDoubleTap?: () => void;
}

const SUIT_LABEL: Record<Suit, string> = {
  OROS: "Oros",
  COPAS: "Copas",
  ESPADAS: "Espadas",
  BASTOS: "Bastos",
};

type CardDealtEvent = Extract<GameEvent, { type: "CardDealt" }>;

export class PixiTable {
  private app: Application | null = null;
  private host: HTMLElement | null = null;
  private root = new Container();
  private world = new Container();
  private cardLayer = new Container();
  private hudLayer = new Container();
  private overlayLayer = new Container();
  private cards = new Map<string, CardSprite>();
  private seatHud = new Map<PlayerId, SeatHud>();
  private layout: TableLayout | null = null;
  private view: PlayerViewState | null = null;
  private selectedIds: readonly CardId[] = [];
  private inputLocked = false;
  private tweenHandle: TweenHandle = { cancelled: false };
  private lastTap = 0;
  private banner: Text | null = null;
  private trumpLabel: Text | null = null;
  private trickSprites: CardSprite[] = [];
  handlers: TableHandlers = {};

  async mount(host: HTMLElement): Promise<void> {
    this.host = host;
    const app = new Application();
    await app.init({
      background: 0x1a100b,
      resizeTo: host,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
    });
    host.appendChild(app.canvas);
    app.canvas.style.display = "block";
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
    this.app = app;
    preloadAllFaces();
    app.stage.addChild(this.root);
    this.root.eventMode = "static";
    this.root.on("pointertap", (event) => this.handleTableTap(event.global.x, event.global.y));
    this.rebuildChrome();
  }

  resize(): void {
    if (!this.app || !this.view) {
      return;
    }
    this.rebuildChrome();
    this.sync(this.view, { selectedIds: this.selectedIds, inputLocked: this.inputLocked });
  }

  destroy(): void {
    this.tweenHandle.cancelled = true;
    this.app?.destroy(true, { children: true, texture: false });
    this.app = null;
    this.host = null;
    this.cards.clear();
    this.seatHud.clear();
  }

  sync(view: PlayerViewState, options: TableSyncOptions = {}): void {
    this.view = view;
    this.selectedIds = options.selectedIds ?? this.selectedIds;
    this.inputLocked = options.inputLocked ?? this.inputLocked;
    if (!this.app) {
      return;
    }
    this.ensureLayout(view);
    this.layoutSeats(view);
    this.reconcileCards(view);
    this.layoutCards(view);
  }

  setInputLocked(locked: boolean): void {
    this.inputLocked = locked;
    if (this.view) {
      this.layoutCards(this.view);
    }
  }

  setSelected(ids: readonly CardId[]): void {
    this.selectedIds = ids;
    if (this.view) {
      this.layoutCards(this.view);
    }
  }

  async presentEvents(events: readonly GameEvent[], view: PlayerViewState): Promise<void> {
    this.view = view;
    this.ensureLayout(view);
    let index = 0;
    while (index < events.length) {
      const event = events[index];
      if (!event) {
        break;
      }
      if (event.type === "CardDealt") {
        const batch: CardDealtEvent[] = [];
        while (events[index]?.type === "CardDealt") {
          batch.push(events[index] as CardDealtEvent);
          index += 1;
        }
        await this.animateDeal(batch, view);
        continue;
      }
      await this.presentOne(event, view);
      index += 1;
    }
    this.sync(view, { selectedIds: this.selectedIds, inputLocked: this.inputLocked });
  }

  async flashBanner(text: string, tint = 0xf3e6c8, hold = 900): Promise<void> {
    this.showBanner(text, tint);
    await wait(hold, this.tweenHandle);
    this.hideBanner();
  }

  private async presentOne(event: GameEvent, view: PlayerViewState): Promise<void> {
    switch (event.type) {
      case "DeckShuffled":
        audioMixer.play("shuffle");
        await this.jiggleDeck();
        return;
      case "DeckCut":
        audioMixer.play("cut");
        await this.jiggleDeck();
        return;
      case "TrumpRevealed":
        audioMixer.play("trump");
        await this.revealTrump(event.cardId, view);
        return;
      case "PlayerPassed":
        audioMixer.playPass();
        await this.animatePass(event.playerId, view);
        await this.flashBanner("PASO", 0xf3e6c8, 520);
        return;
      case "CardsExchanged":
        audioMixer.play("exchange");
        await this.animateExchange(event.playerId, event.discardedCardIds, event.drawnCardIds, view);
        return;
      case "CardPlayed":
        audioMixer.play(event.wasLegal ? "place" : "throw");
        await this.animatePlay(event.playerId, event.cardId, view);
        return;
      case "PalitoDetected":
        audioMixer.play("palito");
        await this.shake();
        await this.flashBanner("¡SALTASTE EL PALITO!", 0xf2d08a, 1100);
        return;
      case "ScoreChanged":
        await this.floatScore(event.playerId, event.delta, event.scoreType);
        return;
      case "TrickCompleted":
        await wait(280, this.tweenHandle);
        audioMixer.play("collect");
        await this.collectTrick(event.winnerPlayerId, view);
        return;
      case "MoscaDetected":
      case "MoscaRevealed":
        if (event.type === "MoscaRevealed") {
          audioMixer.play("mosca");
          await this.showMosca(event.playerId, event.cardIds, view);
          await this.flashBanner("MOSCA", 0xf6e2a2, 1200);
        }
        return;
      case "PlayerChupado":
        audioMixer.play("chupado");
        await this.flashBanner("CHUPADO +5", 0xe7b7a0, 700);
        return;
      case "GameWon":
        audioMixer.play("victory");
        await wait(520, this.tweenHandle);
        return;
      default:
        return;
    }
  }

  private rebuildChrome(): void {
    const app = this.app;
    if (!app) {
      return;
    }
    this.root.removeChildren();
    this.world.removeChildren();
    for (const sprite of this.cards.values()) {
      sprite.destroy();
    }
    this.cards.clear();
    this.trickSprites = [];
    this.trumpLabel = null;
    this.banner = null;
    this.seatHud.clear();
    this.cardLayer.removeChildren();
    this.hudLayer.removeChildren();
    this.overlayLayer.removeChildren();
    const bg = createTableBackground(app.renderer.width, app.renderer.height);
    this.world.addChild(bg);
    this.world.addChild(this.cardLayer);
    this.world.addChild(this.hudLayer);
    this.root.addChild(this.world);
    this.root.addChild(this.overlayLayer);
  }

  private ensureLayout(view: PlayerViewState): void {
    const app = this.app;
    if (!app) {
      return;
    }
    this.layout = layoutTable(
      app.renderer.width,
      app.renderer.height,
      view.players,
      view.viewerId,
    );
  }

  private layoutSeats(view: PlayerViewState): void {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    for (const seat of layout.seats) {
      let hud = this.seatHud.get(seat.id);
      if (!hud) {
        hud = createSeatHud();
        this.seatHud.set(seat.id, hud);
        this.hudLayer.addChild(hud.root);
      }
      const player = view.players.find((item) => item.id === seat.id);
      hud.root.position.set(seat.label.x, seat.label.y);
      const turn = view.currentActorId === seat.id;
      const passed = player?.hasPassed ?? false;
      hud.name.text = seat.name;
      hud.score.text = `${player?.score ?? 0}`;
      hud.meta.text = [
        player?.isDealer ? "Reparte" : "",
        passed ? "Pasó" : "",
        player && player.tricksWonInCurrentHand > 0 ? `Bazas ${player.tricksWonInCurrentHand}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      hud.turn.visible = turn && !passed;
      hud.root.alpha = passed ? 0.55 : 1;
    }
    this.drawTrumpLabel(view);
  }

  private drawTrumpLabel(view: PlayerViewState): void {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    this.trumpLabel?.destroy();
    const text = new Text({
      text: view.trumpSuit ? `Triunfo: ${SUIT_LABEL[view.trumpSuit]}` : "",
      style: {
        fill: 0xf3e6c8,
        fontSize: 16,
        fontFamily: "Georgia, serif",
        fontWeight: "bold",
      },
    });
    text.anchor.set(0.5, 0);
    text.position.set(layout.trump.x, layout.trump.y + layout.cardHeight * 0.58);
    this.hudLayer.addChild(text);
    this.trumpLabel = text;
  }

  private reconcileCards(view: PlayerViewState): void {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    const keep = new Set<string>();
    for (const card of view.hand) {
      const key = cardKey(card.id);
      keep.add(key);
      this.ensureCard(key, layout.cardWidth, layout.cardHeight, card.id, true);
    }
    for (const player of view.players) {
      if (player.id === view.viewerId) {
        continue;
      }
      for (let i = 0; i < player.cardCount; i += 1) {
        const key = hiddenKey(player.id, i);
        keep.add(key);
        this.ensureCard(key, layout.cardWidth * 0.72, layout.cardHeight * 0.72, null, false);
      }
    }
    if (view.currentTrick) {
      for (const play of view.currentTrick.plays) {
        const key = cardKey(play.card.id);
        keep.add(key);
        this.ensureCard(key, layout.cardWidth * 0.82, layout.cardHeight * 0.82, play.card.id, true);
      }
    }
    if (view.revealedTrumpCard) {
      const key = trumpKey();
      keep.add(key);
      this.ensureCard(key, layout.cardWidth * 0.84, layout.cardHeight * 0.84, view.revealedTrumpCard.id, true);
    }
    const deckCount = Math.min(6, Math.max(2, Math.ceil(view.undealtCount / 8)));
    for (let i = 0; i < deckCount; i += 1) {
      const key = deckKey(i);
      keep.add(key);
      this.ensureCard(key, layout.cardWidth * 0.7, layout.cardHeight * 0.7, null, false);
    }
    for (const [key, sprite] of this.cards) {
      if (!keep.has(key)) {
        sprite.destroy();
        this.cards.delete(key);
      }
    }
  }

  private layoutCards(view: PlayerViewState): void {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    const humanSeat = layout.seats.find((seat) => seat.isHuman);
    if (humanSeat) {
      view.hand.forEach((card, index) => {
        const sprite = this.cards.get(cardKey(card.id));
        if (!sprite) {
          return;
        }
        const fan = fanOffset(index, view.hand.length, layout.cardWidth * 0.62);
        const selected = this.selectedIds.includes(card.id);
        const legal = view.legalCardIds.length === 0 || view.legalCardIds.includes(card.id);
        const blocked = view.availableActions
          .find((action) => action.type === "EXCHANGE_CARDS")
          ?.blockedCardIds?.includes(card.id);
        const hoverLift = selected ? -22 : 0;
        sprite.position.set(humanSeat.hand.x + fan.x, humanSeat.hand.y + fan.y + hoverLift);
        sprite.rotation = fan.rotation;
        sprite.zIndex = 100 + index;
        sprite.alpha = blocked ? 0.55 : legal ? 1 : 0.82;
        sprite.setCardSize(layout.cardWidth, layout.cardHeight);
        sprite.setFaceUp(true);
        this.bindHumanCard(sprite, card.id);
      });
    }
    for (const player of view.players) {
      if (player.id === view.viewerId) {
        continue;
      }
      const seat = layout.seats.find((item) => item.id === player.id);
      if (!seat) {
        continue;
      }
      for (let i = 0; i < player.cardCount; i += 1) {
        const sprite = this.cards.get(hiddenKey(player.id, i));
        if (!sprite) {
          continue;
        }
        const fan = fanOffset(i, player.cardCount, layout.cardWidth * 0.22);
        const localX = fan.x;
        const localY = fan.y;
        const cos = Math.cos(seat.rotation);
        const sin = Math.sin(seat.rotation);
        sprite.position.set(seat.hand.x + localX * cos - localY * sin, seat.hand.y + localX * sin + localY * cos);
        sprite.rotation = seat.rotation;
        sprite.zIndex = 20 + i;
        sprite.alpha = player.hasPassed ? 0.35 : 1;
        sprite.eventMode = "none";
      }
    }
    view.currentTrick?.plays.forEach((play) => {
      const sprite = this.cards.get(cardKey(play.card.id));
      const seat = layout.seats.find((item) => item.id === play.playerId);
      if (!sprite || !seat) {
        return;
      }
      const pos = trickPosition(layout, seat);
      sprite.position.set(pos.x, pos.y);
      sprite.rotation = seat.rotation * 0.12;
      sprite.zIndex = 60 + play.playOrder;
      sprite.eventMode = "none";
      sprite.setFaceUp(true);
    });
    if (view.revealedTrumpCard) {
      const sprite = this.cards.get(trumpKey());
      if (sprite) {
        sprite.position.set(layout.trump.x, layout.trump.y);
        sprite.rotation = -0.12;
        sprite.zIndex = 40;
        sprite.eventMode = "none";
      }
    }
    const deckCount = Math.min(6, Math.max(2, Math.ceil(view.undealtCount / 8)));
    for (let i = 0; i < deckCount; i += 1) {
      const sprite = this.cards.get(deckKey(i));
      if (!sprite) {
        continue;
      }
      sprite.position.set(layout.deck.x + i * 1.2, layout.deck.y - i * 1.4);
      sprite.rotation = 0.02 * i;
      sprite.zIndex = 8 + i;
      sprite.eventMode = "none";
    }
    this.cardLayer.sortableChildren = true;
  }

  private bindHumanCard(sprite: CardSprite, cardId: CardId): void {
    sprite.eventMode = this.inputLocked ? "none" : "static";
    sprite.cursor = this.inputLocked ? "default" : "pointer";
    sprite.removeAllListeners();
    sprite.on("pointerover", () => {
      if (this.inputLocked) {
        return;
      }
      sprite.y -= 12;
    });
    sprite.on("pointerout", () => {
      if (this.view) {
        this.layoutCards(this.view);
      }
    });
    sprite.on("pointertap", (event) => {
      event.stopPropagation();
      if (this.inputLocked) {
        return;
      }
      this.handlers.onCardClick?.(cardId);
    });
  }

  private ensureCard(
    key: string,
    width: number,
    height: number,
    cardId: CardId | null,
    faceUp: boolean,
  ): CardSprite {
    const existing = this.cards.get(key);
    if (existing) {
      existing.setCardSize(width, height);
      if (cardId && existing.cardId !== cardId) {
        existing.reveal(cardId);
      } else {
        existing.setFaceUp(faceUp);
      }
      if (!existing.parent) {
        this.cardLayer.addChild(existing);
      }
      return existing;
    }
    const sprite = new CardSprite(width, height, cardId, faceUp);
    this.cards.set(key, sprite);
    this.cardLayer.addChild(sprite);
    return sprite;
  }

  private async animateDeal(batch: readonly CardDealtEvent[], view: PlayerViewState): Promise<void> {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    const counts = new Map<PlayerId, number>();
    for (const event of batch) {
      const seat = layout.seats.find((item) => item.id === event.playerId);
      if (!seat) {
        continue;
      }
      const already = counts.get(event.playerId) ?? 0;
      counts.set(event.playerId, already + 1);
      const faceUp = event.playerId === view.viewerId;
      const key = faceUp ? cardKey(event.cardId) : hiddenKey(event.playerId, already);
      const sprite = this.ensureCard(
        key,
        faceUp ? layout.cardWidth : layout.cardWidth * 0.72,
        faceUp ? layout.cardHeight : layout.cardHeight * 0.72,
        faceUp ? event.cardId : null,
        false,
      );
      sprite.position.set(layout.deck.x, layout.deck.y);
      sprite.rotation = 0;
      sprite.alpha = 1;
      sprite.zIndex = 80;
      const fan = fanOffset(already, 5, faceUp ? layout.cardWidth * 0.62 : layout.cardWidth * 0.22);
      const target = {
        x: seat.hand.x + fan.x,
        y: seat.hand.y + fan.y,
        rotation: faceUp ? fan.rotation : seat.rotation,
      };
      audioMixer.play("deal");
      await this.moveSprite(sprite, target, 220);
      if (faceUp) {
        sprite.reveal(event.cardId);
      }
      await wait(70, this.tweenHandle);
    }
  }

  private async revealTrump(cardId: CardId, view: PlayerViewState): Promise<void> {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    const sprite = this.ensureCard(trumpKey(), layout.cardWidth * 0.84, layout.cardHeight * 0.84, cardId, false);
    sprite.position.set(layout.deck.x, layout.deck.y);
    await this.moveSprite(sprite, { x: layout.trump.x, y: layout.trump.y, rotation: -0.12 }, 280);
    sprite.reveal(cardId);
    this.drawTrumpLabel(view);
  }

  private async animatePass(playerId: PlayerId, view: PlayerViewState): Promise<void> {
    const layout = this.layout;
    const seat = layout?.seats.find((item) => item.id === playerId);
    if (!layout || !seat) {
      return;
    }
    const sprites =
      playerId === view.viewerId
        ? view.hand.map((card) => this.cards.get(cardKey(card.id))).filter(isSprite)
        : [...this.cards.entries()]
            .filter(([key]) => key.startsWith(`hidden:${playerId}:`))
            .map(([, sprite]) => sprite);
    await Promise.all(
      sprites.map((sprite) =>
        tween({
          duration: 280,
          handle: this.tweenHandle,
          onUpdate: (t) => {
            sprite.alpha = 1 - t * 0.7;
            sprite.scale.set(1 - t * 0.15);
          },
        }),
      ),
    );
  }

  private async animateExchange(
    playerId: PlayerId,
    discarded: readonly CardId[],
    drawn: readonly CardId[],
    view: PlayerViewState,
  ): Promise<void> {
    const layout = this.layout;
    const seat = layout?.seats.find((item) => item.id === playerId);
    if (!layout || !seat) {
      return;
    }
    const count = discarded.length;
    for (let i = 0; i < count; i += 1) {
      const key = playerId === view.viewerId ? cardKey(discarded[i]!) : hiddenKey(playerId, i);
      const sprite = this.cards.get(key) ?? this.ensureCard(key, layout.cardWidth * 0.7, layout.cardHeight * 0.7, discarded[i] ?? null, playerId === view.viewerId);
      await this.moveSprite(sprite, { x: layout.deck.x, y: layout.deck.y, rotation: 0 }, 200);
      sprite.alpha = 0;
    }
    for (let i = 0; i < drawn.length; i += 1) {
      const faceUp = playerId === view.viewerId;
      const key = faceUp ? cardKey(drawn[i]!) : hiddenKey(playerId, 20 + i);
      const sprite = this.ensureCard(
        key,
        faceUp ? layout.cardWidth : layout.cardWidth * 0.72,
        faceUp ? layout.cardHeight : layout.cardHeight * 0.72,
        faceUp ? drawn[i]! : null,
        false,
      );
      sprite.alpha = 1;
      sprite.position.set(layout.deck.x, layout.deck.y);
      await this.moveSprite(sprite, { x: seat.hand.x, y: seat.hand.y, rotation: seat.rotation }, 220);
      if (faceUp && drawn[i]) {
        sprite.reveal(drawn[i]!);
      }
    }
  }

  private async animatePlay(playerId: PlayerId, cardId: CardId, view: PlayerViewState): Promise<void> {
    const layout = this.layout;
    const seat = layout?.seats.find((item) => item.id === playerId);
    if (!layout || !seat) {
      return;
    }
    let sprite = this.cards.get(cardKey(cardId));
    if (!sprite && playerId !== view.viewerId) {
      const hidden = [...this.cards.entries()].find(([key, item]) => key.startsWith(`hidden:${playerId}:`) && item.parent);
      if (hidden) {
        this.cards.delete(hidden[0]);
        sprite = hidden[1];
        this.cards.set(cardKey(cardId), sprite);
        sprite.reveal(cardId);
      }
    }
    if (!sprite) {
      sprite = this.ensureCard(cardKey(cardId), layout.cardWidth * 0.82, layout.cardHeight * 0.82, cardId, true);
      sprite.position.set(seat.hand.x, seat.hand.y);
    }
    sprite.setCardSize(layout.cardWidth * 0.82, layout.cardHeight * 0.82);
    sprite.zIndex = 90;
    this.trickSprites.push(sprite);
    const target = trickPosition(layout, seat);
    await this.moveSprite(sprite, { ...target, rotation: seat.rotation * 0.12 }, 260);
  }

  private async collectTrick(winnerId: PlayerId, _view: PlayerViewState): Promise<void> {
    const layout = this.layout;
    const seat = layout?.seats.find((item) => item.id === winnerId);
    if (!layout || !seat) {
      return;
    }
    const sprites = this.trickSprites.length > 0 ? [...this.trickSprites] : [...this.cards.values()].filter((sprite) => sprite.zIndex >= 60);
    this.trickSprites = [];
    await Promise.all(
      sprites.map((sprite) => this.moveSprite(sprite, { x: seat.pile.x, y: seat.pile.y, rotation: seat.rotation }, 320)),
    );
    for (const sprite of sprites) {
      sprite.alpha = 0;
    }
  }

  private async showMosca(playerId: PlayerId, cardIds: readonly CardId[], _view: PlayerViewState): Promise<void> {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    for (const [index, id] of cardIds.entries()) {
      const sprite = this.ensureCard(cardKey(id), layout.cardWidth, layout.cardHeight, id, true);
      const fan = fanOffset(index, cardIds.length, layout.cardWidth * 0.7);
      sprite.alpha = 1;
      sprite.zIndex = 120 + index;
      await this.moveSprite(
        sprite,
        { x: layout.center.x + fan.x, y: layout.center.y + fan.y - 20, rotation: fan.rotation },
        240,
      );
    }
    await wait(500, this.tweenHandle);
  }

  private async floatScore(playerId: PlayerId, delta: number, scoreType: string): Promise<void> {
    const layout = this.layout;
    const seat = layout?.seats.find((item) => item.id === playerId);
    if (!layout || !seat) {
      return;
    }
    const signed = delta > 0 ? `+${delta}` : `${delta}`;
    const text = new Text({
      text: signed,
      style: {
        fill: scoreType === "PALITO" ? 0xffd27a : delta < 0 ? 0xd6f0c2 : 0xf0c2c2,
        fontSize: scoreType === "PALITO" ? 42 : 28,
        fontFamily: "Georgia, serif",
        fontWeight: "bold",
        stroke: { color: 0x1a100b, width: 4 },
      },
    });
    text.anchor.set(0.5);
    text.position.set(seat.origin.x, seat.origin.y - 30);
    this.overlayLayer.addChild(text);
    const startY = text.y;
    await tween({
      duration: 700,
      handle: this.tweenHandle,
      easing: easeOutCubic,
      onUpdate: (t) => {
        text.y = startY - 40 * t;
        text.alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      },
    });
    text.destroy();
  }

  private async jiggleDeck(): Promise<void> {
    const sprites = [...this.cards.entries()].filter(([key]) => key.startsWith("deck:")).map(([, sprite]) => sprite);
    await Promise.all(
      sprites.map((sprite, index) => {
        const startX = sprite.x;
        const startY = sprite.y;
        return tween({
          duration: 360,
          handle: this.tweenHandle,
          onUpdate: (t) => {
            sprite.x = startX + Math.sin(t * Math.PI * 4 + index) * 6;
            sprite.y = startY + Math.cos(t * Math.PI * 3) * 3;
          },
        }).then(() => {
          sprite.x = startX;
          sprite.y = startY;
        });
      }),
    );
  }

  private async shake(): Promise<void> {
    if (!allowShake()) {
      await wait(180, this.tweenHandle);
      return;
    }
    const startX = this.world.x;
    await tween({
      duration: 280,
      handle: this.tweenHandle,
      onUpdate: (t) => {
        this.world.x = startX + Math.sin(t * Math.PI * 8) * 10 * (1 - t);
      },
    });
    this.world.x = startX;
  }

  private async moveSprite(
    sprite: CardSprite,
    target: { x: number; y: number; rotation: number },
    duration: number,
  ): Promise<void> {
    const x0 = sprite.x;
    const y0 = sprite.y;
    const r0 = sprite.rotation;
    await tween({
      duration,
      handle: this.tweenHandle,
      easing: easeOutBack,
      onUpdate: (t) => {
        sprite.x = x0 + (target.x - x0) * t;
        sprite.y = y0 + (target.y - y0) * t;
        sprite.rotation = r0 + (target.rotation - r0) * t;
      },
    });
    sprite.position.set(target.x, target.y);
    sprite.rotation = target.rotation;
  }

  private showBanner(text: string, tint: number): void {
    this.hideBanner();
    const banner = new Text({
      text,
      style: {
        fill: tint,
        fontSize: 46,
        fontFamily: "Georgia, serif",
        fontWeight: "bold",
        stroke: { color: 0x1a100b, width: 6 },
        align: "center",
      },
    });
    banner.anchor.set(0.5);
    const app = this.app;
    banner.position.set((app?.renderer.width ?? 800) / 2, (app?.renderer.height ?? 600) * 0.36);
    this.overlayLayer.addChild(banner);
    this.banner = banner;
  }

  private hideBanner(): void {
    this.banner?.destroy();
    this.banner = null;
  }

  private handleTableTap(x: number, y: number): void {
    const layout = this.layout;
    if (!layout || this.inputLocked) {
      return;
    }
    const zone = layout.humanZone;
    if (x < zone.x || x > zone.x + zone.width || y < zone.y || y > zone.y + zone.height) {
      return;
    }
    const now = performance.now();
    if (now - this.lastTap < 420) {
      this.handlers.onHumanZoneDoubleTap?.();
      this.lastTap = 0;
      return;
    }
    this.lastTap = now;
  }
}

interface SeatHud {
  root: Container;
  name: Text;
  score: Text;
  meta: Text;
  turn: Graphics;
}

function createSeatHud(): SeatHud {
  const root = new Container();
  const turn = new Graphics();
  turn.roundRect(-78, -28, 156, 74, 12);
  turn.stroke({ width: 3, color: 0xe8c37a, alpha: 0.95 });
  turn.fill({ color: 0x000000, alpha: 0 });
  const name = new Text({
    text: "",
    style: { fill: 0xf3e6c8, fontSize: 16, fontFamily: "Georgia, serif", fontWeight: "bold" },
  });
  name.anchor.set(0.5, 0);
  name.y = -18;
  const score = new Text({
    text: "20",
    style: { fill: 0xffe7b0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: "bold" },
  });
  score.anchor.set(0.5, 0);
  score.y = 2;
  const meta = new Text({
    text: "",
    style: { fill: 0xd9c4a0, fontSize: 12, fontFamily: "Segoe UI, sans-serif" },
  });
  meta.anchor.set(0.5, 0);
  meta.y = 28;
  root.addChild(turn, name, score, meta);
  return { root, name, score, meta, turn };
}

function cardKey(cardId: CardId): string {
  return `card:${cardId}`;
}

function hiddenKey(playerId: PlayerId, index: number): string {
  return `hidden:${playerId}:${index}`;
}

function trumpKey(): string {
  return "trump:card";
}

function deckKey(index: number): string {
  return `deck:${index}`;
}

function trickPosition(layout: TableLayout, seat: SeatLayout): { x: number; y: number } {
  return {
    x: layout.trick.x + (seat.origin.x - layout.center.x) * 0.16,
    y: layout.trick.y + (seat.origin.y - layout.center.y) * 0.18,
  };
}

function isSprite(value: CardSprite | undefined): value is CardSprite {
  return Boolean(value);
}

function preloadAllFaces(): void {
  const ids = SUITS.flatMap((suit) => ranksFor("FULL_48").map((rank) => `${suit}_${rank}` as CardId));
  preloadCardTextures(ids);
}

export { suitTitle } from "./card-art.ts";
