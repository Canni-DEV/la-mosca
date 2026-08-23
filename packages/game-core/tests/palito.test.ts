import { describe, expect, it } from "vitest";
import { buildDeck } from "../src/deck/deck.ts";
import { GameEngine } from "../src/engine/game-engine.ts";
import { engineFromState, playerFixture } from "../src/testing/index.ts";
import { createEmptyState } from "../src/model/state.ts";

describe("palito and scoring order", () => {
  it("applies palito before awarding the trick", () => {
    const used: string[] = ["COPAS_4", "ESPADAS_7", "OROS_2", "COPAS_12"];
    const state = createEmptyState();
    state.phase = "TRICK_PLAY";
    state.handNumber = 1;
    state.deckConfiguration = "TRADITIONAL_40";
    state.trumpSuit = "OROS";
    state.dealerPlayerId = "p1";
    state.currentActorId = "p2";
    state.undealtPile = buildDeck("TRADITIONAL_40").filter((id) => !used.includes(id));
    state.players = [
      playerFixture("p1", 0, { hand: ["COPAS_4"], isActiveInHand: true }),
      playerFixture("p2", 1, { hand: ["ESPADAS_7", "OROS_2"], isActiveInHand: true, score: 20 }),
    ];
    state.currentTrick = {
      number: 1,
      leaderPlayerId: "p1",
      leadSuit: "COPAS",
      plays: [
        {
          playerId: "p1",
          cardId: "COPAS_12",
          playOrder: 1,
          wasLegal: true,
          legalCardIdsAtMomentOfPlay: ["COPAS_12"],
        },
      ],
      winnerPlayerId: null,
      status: "IN_PROGRESS",
    };
    const engine = engineFromState(state);
    const result = engine.dispatch({ type: "PLAY_CARD", actorId: "p2", cardId: "ESPADAS_7" });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const types = result.events.map((event) => event.type);
    expect(types).toContain("PalitoDetected");
    const palitoIndex = types.indexOf("PalitoDetected");
    const scoreIndexes = result.events
      .map((event, index) => (event.type === "ScoreChanged" ? index : -1))
      .filter((index) => index >= 0);
    expect(palitoIndex).toBeGreaterThan(-1);
    const palitoScore = result.events.find(
      (event) => event.type === "ScoreChanged" && event.scoreType === "PALITO",
    );
    expect(palitoScore).toBeDefined();
    const palitoEventIndex = result.events.findIndex(
      (event) => event.type === "ScoreChanged" && event.scoreType === "PALITO",
    );
    const trickScoreIndex = result.events.findIndex(
      (event) => event.type === "ScoreChanged" && event.scoreType === "TRICK_WON",
    );
    expect(palitoEventIndex).toBeGreaterThan(-1);
    expect(trickScoreIndex).toBeGreaterThan(palitoEventIndex);
    expect(engine.getState().players[1]?.score).toBe(70);
  });
});
