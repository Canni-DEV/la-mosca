import { describe, expect, it } from "vitest";
import { StandardBot } from "@la-mosca/game-ai";
import { SeededRng } from "@la-mosca/game-core";
import { LocalGameSession, HUMAN_PLAYER_ID } from "./LocalGameSession.ts";

function playUntilEnd(session: LocalGameSession, seed = 99): void {
  const bot = new StandardBot();
  const rng = new SeededRng(seed);
  for (let i = 0; i < 12000; i += 1) {
    const view = session.getViewState();
    if (view.phase === "GAME_OVER") {
      return;
    }
    const automated = session.advanceAutomated();
    if (automated.status === "advanced") {
      continue;
    }
    if (automated.status === "idle") {
      return;
    }
    const command = bot.choose(session.getViewState(), rng);
    expect(command).toBeTruthy();
    if (!command) {
      return;
    }
    const result = session.dispatch(command);
    expect(result.ok).toBe(true);
  }
}

describe("LocalGameSession", () => {
  it("starts a human vs bots match and hides rival hands", () => {
    const session = new LocalGameSession({
      seed: 21,
      playerCount: 4,
      deckConfiguration: "TRADITIONAL_40",
    });
    expect(session.humanPlayerId).toBe(HUMAN_PLAYER_ID);
    const view = session.getViewState();
    expect(view.viewerId).toBe(HUMAN_PLAYER_ID);
    expect(view.players).toHaveLength(4);
    expect(view.players[0]?.name).toBe("Vos");
    expect(view.players.slice(1).every((player) => player.name !== "Vos")).toBe(true);
    while (session.advanceAutomated().status === "advanced") {
      // cut and deal
    }
    const dealt = session.getViewState();
    expect(dealt.hand.length).toBeGreaterThan(0);
    const debug = session.getDebugViewState();
    const rival = dealt.players.find((player) => player.id === "p2");
    expect(rival?.cardCount).toBe(5);
    expect(debug.hands.p2).toHaveLength(5);
    expect(dealt.hand.map((card) => card.id)).toEqual(debug.hands.p1?.map((card) => card.id));
    expect(dealt.hand.map((card) => card.id).join()).not.toEqual(
      debug.hands.p2?.map((card) => card.id).join(),
    );
  });

  it("uses a custom human name when provided", () => {
    const session = new LocalGameSession({
      seed: 21,
      playerCount: 3,
      deckConfiguration: "TRADITIONAL_40",
      humanName: "  Cacho   ",
    });
    expect(session.getViewState().players[0]?.name).toBe("Cacho");
  });

  it("falls back to Vos when the custom name is blank", () => {
    const session = new LocalGameSession({
      seed: 21,
      playerCount: 3,
      deckConfiguration: "TRADITIONAL_40",
      humanName: "   ",
    });
    expect(session.getViewState().players[0]?.name).toBe("Vos");
  });

  it("waits for the human and rejects bot-impersonating commands", () => {
    const session = new LocalGameSession({
      seed: 8,
      playerCount: 3,
      deckConfiguration: "TRADITIONAL_40",
    });
    let guard = 0;
    let result = session.advanceAutomated();
    while (result.status === "advanced" && guard < 40) {
      result = session.advanceAutomated();
      guard += 1;
    }
    expect(result.status).toBe("wait-human");
    const blocked = session.dispatch({ type: "PASS", actorId: "p2" });
    expect(blocked.ok).toBe(false);
  });

  it("plays a complete 4-player game when the human uses legal commands", () => {
    const session = new LocalGameSession({
      seed: 2026,
      playerCount: 4,
      deckConfiguration: "TRADITIONAL_40",
    });
    playUntilEnd(session);
    const view = session.getViewState();
    expect(view.phase).toBe("GAME_OVER");
    expect(view.winnerPlayerId).toBeTruthy();
    const winner = view.players.find((player) => player.id === view.winnerPlayerId);
    expect(winner).toBeTruthy();
    expect(winner && winner.score <= 0).toBe(true);
    expect(session.advanceAutomated().status).toBe("idle");
  });

  it("plays a complete 3-player game with the 48-card deck", () => {
    const session = new LocalGameSession({
      seed: 44,
      playerCount: 3,
      deckConfiguration: "FULL_48",
    });
    playUntilEnd(session, 3);
    expect(session.getViewState().phase).toBe("GAME_OVER");
  });

  it("lets the human jump Palito on an illegal card", () => {
    const session = new LocalGameSession({
      seed: 15,
      playerCount: 4,
      deckConfiguration: "TRADITIONAL_40",
    });
    const bot = new StandardBot();
    const rng = new SeededRng(4);
    let detected = false;
    for (let i = 0; i < 8000; i += 1) {
      const view = session.getViewState();
      if (view.phase === "GAME_OVER") {
        break;
      }
      const automated = session.advanceAutomated();
      if (automated.status === "advanced") {
        continue;
      }
      if (automated.status === "idle") {
        break;
      }
      const latest = session.getViewState();
      if (latest.phase === "TRICK_PLAY") {
        const illegal = latest.hand.find((card) => !latest.legalCardIds.includes(card.id));
        if (illegal && latest.legalCardIds.length > 0) {
          const played = session.dispatch({
            type: "PLAY_CARD",
            actorId: HUMAN_PLAYER_ID,
            cardId: illegal.id,
          });
          expect(played.ok).toBe(true);
          if (played.ok) {
            expect(played.events.some((event) => event.type === "PalitoDetected")).toBe(true);
            detected = true;
          }
          break;
        }
      }
      const command = bot.choose(latest, rng);
      if (!command) {
        break;
      }
      session.dispatch(command);
    }
    expect(detected).toBe(true);
  });

  it("does not record Palito when the human follows legal bot choices", () => {
    const session = new LocalGameSession({
      seed: 90,
      playerCount: 5,
      deckConfiguration: "TRADITIONAL_40",
    });
    playUntilEnd(session, 11);
    const palito = session.getEventLog().filter((event) => event.type === "PalitoDetected");
    const humanPalito = palito.filter((event) => event.playerId === HUMAN_PLAYER_ID);
    expect(humanPalito).toHaveLength(0);
  });

  it("keeps all-bot playground sessions runnable to completion", () => {
    const session = new LocalGameSession({
      seed: 3,
      playerCount: 4,
      deckConfiguration: "TRADITIONAL_40",
      humanPlayerId: null,
    });
    session.runUntilEnd();
    expect(session.getViewState().phase).toBe("GAME_OVER");
  });
});
