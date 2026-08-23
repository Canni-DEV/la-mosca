<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { CardId, PlayerViewState } from "@la-mosca/game-protocol";
  import type { MatchSetup, VictoryInfo } from "../app/navigation.ts";
  import ActionBar from "../components/ActionBar.svelte";
  import ContextualHints from "../components/ContextualHints.svelte";
  import GameHud from "../components/GameHud.svelte";
  import TrumpReminder from "../components/TrumpReminder.svelte";
  import VictoryScreen from "./VictoryScreen.svelte";
  import { MatchController, unlockAudio } from "../game/match-controller.ts";
  import { HUMAN_PLAYER_ID } from "../game/LocalGameSession.ts";
  import { PixiTable } from "../scene/pixi-table.ts";

  let {
    setup,
    onMenu,
    onNewGame,
    onRematch,
  }: {
    setup: MatchSetup;
    onMenu: () => void;
    onNewGame: () => void;
    onRematch: () => void;
  } = $props();

  let host = $state<HTMLDivElement | null>(null);
  let view = $state<PlayerViewState | null>(null);
  let locked = $state(true);
  let selectedIds = $state<CardId[]>([]);
  let victory = $state<VictoryInfo | null>(null);
  let leaving = $state(false);
  const table = new PixiTable();
  let controller: MatchController | null = null;

  function toVictory(next: PlayerViewState): VictoryInfo {
    const winner = next.players.find((player) => player.id === next.winnerPlayerId);
    return {
      winnerPlayerId: next.winnerPlayerId ?? "",
      winnerName: winner?.name ?? "Alguien",
      humanWon: next.winnerPlayerId === HUMAN_PLAYER_ID,
      scores: next.players.map((player) => ({ id: player.id, name: player.name, score: player.score })),
      setup,
    };
  }

  onMount(() => {
    const onResize = (): void => table.resize();
    window.addEventListener("resize", onResize);
    void (async () => {
      await unlockAudio();
      if (!host) {
        return;
      }
      await table.mount(host);
      const match = new MatchController(setup, table, {
        onView: (next) => {
          view = next;
          if (controller) {
            locked = controller.inputLocked;
            selectedIds = [...controller.selectedIds];
          }
        },
        onEnded: (next) => {
          victory = toVictory(next);
          view = next;
        },
      });
      controller = match;
      await match.start();
    })();
    return () => window.removeEventListener("resize", onResize);
  });

  onDestroy(() => {
    controller?.destroy();
    table.destroy();
  });

  function requestLeave(): void {
    leaving = true;
  }
</script>

<section class="table-screen">
  <GameHud {view} onMenu={requestLeave} />
  <div class="table-host" bind:this={host}></div>
  <TrumpReminder suit={view?.trumpSuit ?? null} card={view?.revealedTrumpCard ?? null} />
  <ActionBar
    {view}
    {locked}
    {selectedIds}
    onPass={() => controller?.pass()}
    onConfirm={() => controller?.confirmDecision()}
  />
  <ContextualHints {view} />
</section>

{#if leaving}
  <div class="overlay">
    <div class="screen-card stack">
      <p class="hint">¿Salir de la partida?</p>
      <button class="btn btn-primary" type="button" onclick={onMenu}>Salir al menú</button>
      <button class="btn btn-ghost" type="button" onclick={() => (leaving = false)}>Seguir jugando</button>
    </div>
  </div>
{/if}

{#if victory}
  <div class="overlay">
    <VictoryScreen info={victory} onRematch={onRematch} onNewGame={onNewGame} {onMenu} />
  </div>
{/if}
