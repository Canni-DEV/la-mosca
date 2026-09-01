import {
  Application,
  Container,
  Text,
} from "pixi.js";
import type {
  CardId,
  GameEvent,
  PlayerId,
  PlayerViewState,
} from "@la-mosca/game-protocol";
import { ranksFor } from "@la-mosca/game-core";
import { SUITS } from "@la-mosca/game-protocol";
import { PresentationDirector } from "../animation/queue.ts";
import { tween, wait } from "../animation/tween.ts";
import { easeOutBack, easeOutCubic } from "../animation/easing.ts";
import { allowShake } from "../animation/motion.ts";
import { audioMixer } from "../audio/mixer.ts";
import { CardSprite } from "./card-sprite.ts";
import { preloadCardTextures } from "./card-textures.ts";
import { createTableBackground, preloadTableArt } from "./table-background.ts";
import { computeTableLayout, fanOffset, type SeatLayout, type TableLayout } from "./table-layout.ts";

export interface TableSyncOptions {
  selectedIds?: readonly CardId[];
  inputLocked?: boolean;
}

export interface PresentationVisualState {
  selectedIds: readonly CardId[];
  focusedCardId: CardId | null;
  inputLocked: boolean;
}

export interface TableHandlers {
  onCardClick?: (cardId: CardId) => void;
  onHumanZoneDoubleTap?: () => void;
  onAnnounce?: (message: string) => void;
}

type CardDealtEvent = Extract<GameEvent, { type: "CardDealt" }>;

export class PixiTable {
  private app: Application | null = null;
  private host: HTMLElement | null = null;
  private root = new Container();
  private world = new Container();
  private cardLayer = new Container();
  private overlayLayer = new Container();
  private cards = new Map<string, CardSprite>();
  private layout: TableLayout | null = null;
  private view: PlayerViewState | null = null;
  private selectedIds: readonly CardId[] = [];
  private inputLocked = false;
  private focusedCardId: CardId | null = null;
  private animationAbort = new AbortController();
  private presenting = false;
  private lastTap = 0;
  private banner: Text | null = null;
  private trickSprites: CardSprite[] = [];
  private director = new PresentationDirector();
  private destroyed = false;
  private chromeKey = "";
  handlers: TableHandlers = {};

  async mount(host: HTMLElement): Promise<void> {
    this.host = host;
    this.destroyed = false;
    this.director.reset();
    this.animationAbort = new AbortController();
    this.presenting = false;
    this.chromeKey = "";
    this.root = new Container();
    this.world = new Container();
    this.cardLayer = new Container();
    this.overlayLayer = new Container();
    await Promise.all([preloadTableArt(), preloadAllFaces()]);
    if (this.destroyed) {
      return;
    }
    const app = new Application();
    const bounds = host.getBoundingClientRect();
    await app.init({
      background: 0x140c08,
      width: Math.max(1, Math.round(bounds.width)),
      height: Math.max(1, Math.round(bounds.height)),
      antialias: true,
      autoDensity: true,
      resolution: Math.min(2, window.devicePixelRatio || 1),
    });
    host.appendChild(app.canvas);
    app.canvas.style.display = "block";
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
    this.app = app;
    app.stage.addChild(this.root);
    this.root.eventMode = "static";
    this.root.on("pointertap", (event) => this.handleTableTap(event.global.x, event.global.y));
    audioMixer.startAmbience();
  }

  resize(width: number, height: number): void {
    if (!this.app) return;
    this.app.renderer.resize(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
  }

  applyLayout(layout: TableLayout): void {
    if (!this.app) return;
    if (this.app.screen.width !== layout.width || this.app.screen.height !== layout.height) {
      this.resize(layout.width, layout.height);
    }
    this.layout = layout;
    if (this.presenting) return;
    const key = `${layout.width}x${layout.height}x${layout.mode}x${layout.seats.length}`;
    if (key !== this.chromeKey) {
      this.chromeKey = key;
      this.rebuildChrome();
    }
    if (this.view) {
      this.reconcileCards(this.view);
      this.layoutCards(this.view);
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.director.cancel();
    this.animationAbort.abort();
    audioMixer.stopAll();
    this.root.removeAllListeners();
    this.app?.destroy(true, { children: true, texture: false });
    this.app = null;
    this.host = null;
    this.cards.clear();
    this.trickSprites = [];
    this.banner = null;
  }

  sync(view: PlayerViewState, options: TableSyncOptions = {}): void {
    this.view = view;
    this.selectedIds = options.selectedIds ?? this.selectedIds;
    this.inputLocked = options.inputLocked ?? this.inputLocked;
    if (!this.app) {
      return;
    }
    this.ensureLayout(view);
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

  setVisualState(state: PresentationVisualState): void {
    this.selectedIds = state.selectedIds;
    this.focusedCardId = state.focusedCardId;
    this.inputLocked = state.inputLocked;
    if (this.view) this.layoutCards(this.view);
  }

  async presentEvents(events: readonly GameEvent[], view: PlayerViewState): Promise<void> {
    this.view = view;
    this.ensureLayout(view);
    const clips: Array<() => Promise<void>> = [];
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
        clips.push(async () => {
          await this.animateDeal(batch, view);
        });
        continue;
      }
      const current = event;
      clips.push(async () => {
        await this.presentOne(current, view);
      });
      index += 1;
    }
    this.presenting = true;
    try {
      await this.director.run(clips, this.animationAbort.signal);
    } finally {
      this.presenting = false;
    }
    if (this.destroyed) {
      return;
    }
    if (this.layout) this.applyLayout(this.layout);
    this.sync(view, { selectedIds: this.selectedIds, inputLocked: this.inputLocked });
  }

  async flashBanner(text: string, tint = 0xf3e6c8, hold = 900): Promise<void> {
    this.showBanner(text, tint);
    await wait(hold, this.animationAbort.signal);
    this.hideBanner();
  }

  private async presentOne(event: GameEvent, view: PlayerViewState): Promise<void> {
    switch (event.type) {
      case "DeckShuffled":
        audioMixer.play("shuffle");
        await this.jiggleDeck(650);
        return;
      case "DeckCut":
        audioMixer.play("cut");
        await this.jiggleDeck(380);
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
        this.handlers.onAnnounce?.("¡Saltaste el palito! La jugada suma 50 puntos.");
        audioMixer.play("palito");
        await this.shake();
        await this.flashBanner("¡SALTASTE EL PALITO!", 0xf2d08a, 520);
        return;
      case "ScoreChanged":
        this.handlers.onAnnounce?.(`${event.delta > 0 ? "+" : ""}${event.delta} puntos.`);
        await this.floatScore(event.playerId, event.delta, event.scoreType);
        return;
      case "TrickCompleted":
        await wait(280, this.animationAbort.signal);
        audioMixer.play("collect");
        await this.collectTrick(event.winnerPlayerId, view);
        return;
      case "MoscaDetected":
      case "MoscaRevealed":
        if (event.type === "MoscaRevealed") {
          this.handlers.onAnnounce?.("Mosca. Se revelan las cinco cartas.");
          audioMixer.play("mosca");
          this.showBanner("MOSCA", 0xf6e2a2);
          await this.showMosca(event.playerId, event.cardIds, view);
          await wait(260, this.animationAbort.signal);
          this.hideBanner();
        }
        return;
      case "PlayerChupado":
        this.handlers.onAnnounce?.("Chupado. Suma 5 puntos.");
        audioMixer.play("chupado");
        await this.flashBanner("CHUPADO +5", 0xe7b7a0, 560);
        return;
      case "GameWon":
        this.handlers.onAnnounce?.("Partida terminada.");
        audioMixer.play("victory");
        await wait(520, this.animationAbort.signal);
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
    this.banner = null;
    this.cardLayer.removeChildren();
    this.overlayLayer.removeChildren();
    const bg = createTableBackground(app.screen.width, app.screen.height, this.layout);
    this.world.addChild(bg);
    this.world.addChild(this.cardLayer);
    this.root.addChild(this.world);
    this.root.addChild(this.overlayLayer);
  }

  private ensureLayout(view: PlayerViewState): void {
    const app = this.app;
    if (!app) {
      return;
    }
    if (!this.layout) {
      this.applyLayout(computeTableLayout({
        width: app.screen.width,
        height: app.screen.height,
        players: view.players,
        humanPlayerId: view.viewerId,
        dealerPlayerId: view.dealerPlayerId,
      }));
    }
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
      this.ensureCard(key, layout.humanCardWidth, layout.humanCardHeight, card.id, true);
    }
    for (const player of view.players) {
      if (player.id === view.viewerId) {
        continue;
      }
      for (let i = 0; i < player.cardCount; i += 1) {
        const key = hiddenKey(player.id, i);
        keep.add(key);
        this.ensureCard(key, layout.cardWidth * 0.48, layout.cardHeight * 0.48, null, false);
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
      this.ensureCard(key, layout.stockWidth, layout.stockHeight, view.revealedTrumpCard.id, true);
    }
    const deckCount = Math.min(6, Math.max(2, Math.ceil(view.undealtCount / 8)));
    for (let i = 0; i < deckCount; i += 1) {
      const key = deckKey(i);
      keep.add(key);
      this.ensureCard(key, layout.stockWidth, layout.stockHeight, null, false);
    }
    for (const player of view.players) {
      if (player.tricksWonInCurrentHand <= 0) {
        continue;
      }
      const existing = [...this.cards.keys()].filter((key) => key.startsWith(`pile:${player.id}:`));
      if (existing.length > 0) {
        for (const key of existing) {
          keep.add(key);
        }
      } else {
        const n = Math.min(6, player.tricksWonInCurrentHand * 2);
        for (let i = 0; i < n; i += 1) {
          const key = pileKey(player.id, i);
          keep.add(key);
          this.ensureCard(key, layout.cardWidth * 0.6, layout.cardHeight * 0.6, null, false);
        }
      }
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
        const fan = fanOffset(index, view.hand.length, layout.humanCardWidth * layout.fanSpacing);
        const selected = this.selectedIds.includes(card.id);
        const legal = view.legalCardIds.length === 0 || view.legalCardIds.includes(card.id);
        const blocked = view.availableActions
          .find((action) => action.type === "EXCHANGE_CARDS")
          ?.blockedCardIds?.includes(card.id);
        const focused = this.focusedCardId === card.id;
        const recommended = view.legalCardIds.includes(card.id);
        const hoverLift = selected || focused ? -layout.humanCardHeight * 0.12 : recommended ? -layout.humanCardHeight * 0.035 : 0;
        sprite.position.set(humanSeat.hand.x + fan.x, humanSeat.hand.y + fan.y + hoverLift);
        sprite.rotation = fan.rotation;
        sprite.zIndex = 100 + index;
        sprite.alpha = blocked ? 0.55 : legal ? 1 : 0.82;
        sprite.setCardSize(layout.humanCardWidth, layout.humanCardHeight);
        sprite.setFaceUp(true);
        sprite.setEmphasis({ selected, focused, recommended });
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
        const fan = fanOffset(i, player.cardCount, layout.cardWidth * 0.18);
        const localX = fan.x;
        const localY = fan.y;
        const cos = Math.cos(seat.rotation);
        const sin = Math.sin(seat.rotation);
        sprite.position.set(seat.hand.x + localX * cos - localY * sin, seat.hand.y + localX * sin + localY * cos);
        sprite.rotation = seat.rotation;
        sprite.zIndex = 20 + i;
        sprite.alpha = player.hasPassed ? 0.35 : 1;
        sprite.eventMode = "none";
        sprite.setCardSize(layout.cardWidth * 0.48, layout.cardHeight * 0.48);
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
      sprite.setCardSize(layout.cardWidth * 0.72, layout.cardHeight * 0.72);
    });
    if (view.revealedTrumpCard) {
      const sprite = this.cards.get(trumpKey());
      if (sprite) {
        sprite.position.set(layout.trump.x, layout.trump.y);
        sprite.rotation = layout.stockRotation * 0.18 - 0.1;
        sprite.zIndex = 40;
        sprite.eventMode = "none";
        sprite.setCardSize(layout.stockWidth, layout.stockHeight);
      }
    }
    const deckCount = Math.min(6, Math.max(2, Math.ceil(view.undealtCount / 8)));
    for (let i = 0; i < deckCount; i += 1) {
      const sprite = this.cards.get(deckKey(i));
      if (!sprite) {
        continue;
      }
      sprite.position.set(layout.deck.x + i * 0.8, layout.deck.y - i * 0.9);
      sprite.rotation = layout.stockRotation * 0.18 + 0.015 * i;
      sprite.zIndex = 8 + i;
      sprite.eventMode = "none";
      sprite.setCardSize(layout.stockWidth, layout.stockHeight);
    }
    for (const player of view.players) {
      const seat = layout.seats.find((item) => item.id === player.id);
      if (!seat) {
        continue;
      }
      const pileSprites = [...this.cards.entries()].filter(([key]) => key.startsWith(`pile:${player.id}:`));
      pileSprites.forEach(([, sprite], index) => {
        sprite.position.set(seat.pile.x + index * 1.5, seat.pile.y - index * 1.7);
        sprite.rotation = seat.rotation * 0.08 + index * 0.025;
        sprite.zIndex = 14 + index;
        sprite.alpha = 1;
        sprite.setFaceUp(false);
        sprite.eventMode = "none";
        sprite.setCardSize(layout.cardWidth * 0.6, layout.cardHeight * 0.6);
      });
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
    const prepared = batch.map((event, dealIndex) => {
      const seat = layout.seats.find((item) => item.id === event.playerId);
      if (!seat) return null;
      const already = counts.get(event.playerId) ?? 0;
      counts.set(event.playerId, already + 1);
      const faceUp = event.playerId === view.viewerId;
      const key = faceUp ? cardKey(event.cardId) : hiddenKey(event.playerId, already);
      const fan = fanOffset(already, 5, faceUp ? layout.humanCardWidth * layout.fanSpacing : layout.cardWidth * 0.2);
      const target = {
        x: seat.hand.x + fan.x,
        y: seat.hand.y + fan.y,
        rotation: faceUp ? fan.rotation : seat.rotation,
      };
      return { event, dealIndex, faceUp, key, target };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
    await Promise.all(prepared.map(async ({ event, dealIndex, faceUp, key, target }) => {
      await wait(dealIndex * 95, this.animationAbort.signal);
      if (this.animationAbort.signal.aborted) return;
      const sprite = this.ensureCard(
        key,
        faceUp ? layout.humanCardWidth : layout.cardWidth * 0.48,
        faceUp ? layout.humanCardHeight : layout.cardHeight * 0.48,
        faceUp ? event.cardId : null,
        false,
      );
      sprite.position.set(layout.deck.x, layout.deck.y);
      sprite.rotation = 0;
      sprite.alpha = 1;
      sprite.zIndex = 80;
      audioMixer.play("deal");
      await this.moveSprite(sprite, target, 240);
      if (faceUp && this.canTouch(sprite)) sprite.reveal(event.cardId);
    }));
  }

  private async revealTrump(cardId: CardId, view: PlayerViewState): Promise<void> {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    const sprite = this.ensureCard(trumpKey(), layout.stockWidth, layout.stockHeight, cardId, false);
    sprite.position.set(layout.deck.x, layout.deck.y);
    sprite.setFaceUp(false);
    await this.moveSprite(sprite, { x: layout.trump.x, y: layout.trump.y, rotation: layout.stockRotation * 0.18 - 0.1 }, 280);
    if (!this.canTouch(sprite)) return;
    await this.flipReveal(sprite, cardId);
  }

  private async flipReveal(sprite: CardSprite, cardId: CardId): Promise<void> {
    if (!this.canTouch(sprite)) return;
    await tween({
      duration: 140,
      handle: this.animationAbort.signal,
      onUpdate: (t) => {
        sprite.scale.x = Math.max(0.02, 1 - t);
      },
    });
    if (!this.canTouch(sprite)) return;
    sprite.reveal(cardId);
    await tween({
      duration: 160,
      handle: this.animationAbort.signal,
      easing: easeOutCubic,
      onUpdate: (t) => {
        sprite.scale.x = Math.max(0.02, t);
      },
    });
    if (!this.canTouch(sprite)) return;
    sprite.scale.x = 1;
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
          handle: this.animationAbort.signal,
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
      if (!this.canTouch(sprite)) return;
      sprite.alpha = 0;
    }
    for (let i = 0; i < drawn.length; i += 1) {
      const faceUp = playerId === view.viewerId;
      const key = faceUp ? cardKey(drawn[i]!) : hiddenKey(playerId, 20 + i);
      const sprite = this.ensureCard(
        key,
        faceUp ? layout.humanCardWidth : layout.cardWidth * 0.48,
        faceUp ? layout.humanCardHeight : layout.cardHeight * 0.48,
        faceUp ? drawn[i]! : null,
        false,
      );
      sprite.alpha = 1;
      sprite.position.set(layout.deck.x, layout.deck.y);
      await this.moveSprite(sprite, { x: seat.hand.x, y: seat.hand.y, rotation: seat.rotation }, 220);
      if (faceUp && drawn[i] && this.canTouch(sprite)) {
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
    if (this.destroyed || this.animationAbort.signal.aborted) return;
    const existing = [...this.cards.keys()].filter((key) => key.startsWith(`pile:${winnerId}:`)).length;
    for (const [index, sprite] of sprites.entries()) {
      const oldKey = [...this.cards.entries()].find(([, item]) => item === sprite)?.[0];
      if (oldKey) {
        this.cards.delete(oldKey);
      }
      const key = pileKey(winnerId, existing + index);
      this.cards.set(key, sprite);
      sprite.setFaceUp(false);
      sprite.alpha = 1;
      sprite.eventMode = "none";
      sprite.zIndex = 14 + existing + index;
      sprite.position.set(seat.pile.x + (existing + index) * 1.5, seat.pile.y - (existing + index) * 1.7);
    }
  }

  private async showMosca(playerId: PlayerId, cardIds: readonly CardId[], _view: PlayerViewState): Promise<void> {
    const layout = this.layout;
    if (!layout) {
      return;
    }
    await Promise.all(cardIds.map(async (id, index) => {
      const sprite = this.ensureCard(cardKey(id), layout.cardWidth, layout.cardHeight, id, true);
      const fan = fanOffset(index, cardIds.length, layout.cardWidth * 0.7);
      sprite.alpha = 1;
      sprite.zIndex = 120 + index;
      await wait(index * 60, this.animationAbort.signal);
      await this.moveSprite(
        sprite,
        { x: layout.center.x + fan.x, y: layout.center.y + fan.y - 20, rotation: fan.rotation },
        240,
      );
    }));
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
        fontFamily: "Fraunces, Georgia, serif",
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
      handle: this.animationAbort.signal,
      easing: easeOutCubic,
      onUpdate: (t) => {
        text.y = startY - 40 * t;
        text.alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      },
    });
    if (!text.destroyed) text.destroy();
  }

  private async jiggleDeck(duration: number): Promise<void> {
    const sprites = [...this.cards.entries()].filter(([key]) => key.startsWith("deck:")).map(([, sprite]) => sprite);
    await Promise.all(
      sprites.map((sprite, index) => {
        const startX = sprite.x;
        const startY = sprite.y;
        return tween({
          duration,
          handle: this.animationAbort.signal,
          onUpdate: (t) => {
            sprite.x = startX + Math.sin(t * Math.PI * 4 + index) * 6;
            sprite.y = startY + Math.cos(t * Math.PI * 3) * 3;
          },
        }).then(() => {
          if (this.canTouch(sprite)) {
            sprite.x = startX;
            sprite.y = startY;
          }
        });
      }),
    );
  }

  private async shake(): Promise<void> {
    if (!allowShake()) {
      await wait(180, this.animationAbort.signal);
      return;
    }
    const startX = this.world.x;
    await tween({
      duration: 280,
      handle: this.animationAbort.signal,
      onUpdate: (t) => {
        this.world.x = startX + Math.sin(t * Math.PI * 8) * 10 * (1 - t);
      },
    });
    if (this.canTouch(this.world)) this.world.x = startX;
  }

  private async moveSprite(
    sprite: CardSprite,
    target: { x: number; y: number; rotation: number },
    duration: number,
  ): Promise<void> {
    if (!this.canTouch(sprite)) return;
    const x0 = sprite.x;
    const y0 = sprite.y;
    const r0 = sprite.rotation;
    await tween({
      duration,
      handle: this.animationAbort.signal,
      easing: easeOutBack,
      onUpdate: (t) => {
        sprite.x = x0 + (target.x - x0) * t;
        sprite.y = y0 + (target.y - y0) * t;
        sprite.rotation = r0 + (target.rotation - r0) * t;
      },
    });
    if (!this.canTouch(sprite)) return;
    sprite.position.set(target.x, target.y);
    sprite.rotation = target.rotation;
  }

  private canTouch(display: Container): boolean {
    return !this.destroyed && !this.animationAbort.signal.aborted && !display.destroyed;
  }

  private showBanner(text: string, tint: number): void {
    this.hideBanner();
    const banner = new Text({
      text,
      style: {
        fill: tint,
        fontSize: this.layout?.mode === "mobilePortrait" ? 27 : 42,
        fontFamily: "Fraunces, Georgia, serif",
        fontWeight: "bold",
        stroke: { color: 0x1a100b, width: 6 },
        align: "center",
      },
    });
    banner.anchor.set(0.5);
    const app = this.app;
    banner.position.set((app?.screen.width ?? 800) / 2, (app?.screen.height ?? 600) * 0.42);
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

function cardKey(cardId: CardId): string {
  return `card:${cardId}`;
}

function hiddenKey(playerId: PlayerId, index: number): string {
  return `hidden:${playerId}:${index}`;
}

function trumpKey(): string {
  return "trump:card";
}

function pileKey(playerId: PlayerId, index: number): string {
  return `pile:${playerId}:${index}`;
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

async function preloadAllFaces(): Promise<void> {
  const ids = SUITS.flatMap((suit) => ranksFor("FULL_48").map((rank) => `${suit}_${rank}` as CardId));
  await preloadCardTextures(ids);
}

export { suitTitle } from "./card-art.ts";
