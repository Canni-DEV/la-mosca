<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { CardId, PlayerViewState } from "@la-mosca/game-protocol";
  import type { MatchSetup, VictoryInfo } from "../app/navigation.ts";
  import AccessibleHand from "../components/AccessibleHand.svelte";
  import ActionBar from "../components/ActionBar.svelte";
  import ContextualHints from "../components/ContextualHints.svelte";
  import GameHud from "../components/GameHud.svelte";
  import SeatHudOverlay from "../components/SeatHudOverlay.svelte";
  import SuitPlaque from "../components/SuitPlaque.svelte";
  import VictoryScreen from "./VictoryScreen.svelte";
  import { MatchController, unlockAudio } from "../game/match-controller.ts";
  import { HUMAN_PLAYER_ID } from "../game/LocalGameSession.ts";
  import { PixiTable } from "../scene/pixi-table.ts";
  import { computeTableLayout, type SafeInsets, type TableLayout } from "../scene/table-layout.ts";

  let { setup, onMenu, onNewGame, onRematch }: {
    setup: MatchSetup;
    onMenu: () => void;
    onNewGame: () => void;
    onRematch: () => void;
  } = $props();

  let stage = $state<HTMLDivElement | null>(null);
  let host = $state<HTMLDivElement | null>(null);
  let hudShell = $state<HTMLDivElement | null>(null);
  let actionShell = $state<HTMLDivElement | null>(null);
  let view = $state<PlayerViewState | null>(null);
  let layout = $state<TableLayout | null>(null);
  let locked = $state(true);
  let selectedIds = $state<CardId[]>([]);
  let victory = $state<VictoryInfo | null>(null);
  let leaving = $state(false);
  let eventAnnouncement = $state("");
  let resizeFrame = 0;
  const table = new PixiTable();
  let controller: MatchController | null = null;
  let observer: ResizeObserver | null = null;

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

  function applyMeasuredLayout(nextView: PlayerViewState | null = view): void {
    if (!stage || !nextView) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const safeInsets: Partial<SafeInsets> = {};
    if (hudShell) {
      const hudRect = hudShell.getBoundingClientRect();
      safeInsets.top = Math.max(8, Math.ceil(hudRect.bottom - rect.top + 6));
    }
    if (actionShell) {
      const actionRect = actionShell.getBoundingClientRect();
      safeInsets.bottom = Math.max(8, Math.ceil(rect.bottom - actionRect.top + 6));
    }
    const next = computeTableLayout({
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      players: nextView.players,
      humanPlayerId: nextView.viewerId,
      dealerPlayerId: nextView.dealerPlayerId,
      safeInsets,
    });
    layout = next;
    table.applyLayout(next);
  }

  function scheduleLayout(): void {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => applyMeasuredLayout());
  }

  onMount(() => {
    observer = new ResizeObserver(scheduleLayout);
    if (stage) observer.observe(stage);
    if (hudShell) observer.observe(hudShell);
    if (actionShell) observer.observe(actionShell);
    void (async () => {
      await unlockAudio();
      if (!host) return;
      await table.mount(host);
      const match = new MatchController(setup, table, {
        onView: (next) => {
          view = next;
          locked = match.inputLocked;
          selectedIds = [...match.selectedIds];
          applyMeasuredLayout(next);
        },
        onEnded: (next) => {
          victory = toVictory(next);
          view = next;
        },
        onAnnouncement: (message) => {
          eventAnnouncement = message;
        },
      });
      controller = match;
      await match.start();
    })();
  });

  onDestroy(() => {
    cancelAnimationFrame(resizeFrame);
    observer?.disconnect();
    controller?.destroy();
    table.destroy();
  });

  const leadSuit = $derived(view?.currentTrick?.leadSuit ?? null);
  const showLeadPlaque = $derived(view?.phase === "TRICK_PLAY");
  const turnName = $derived(view?.players.find((player) => player.id === view?.currentActorId)?.name ?? "la mesa");
  const liveMessage = $derived(view
    ? `Mano ${view.handNumber}. Turno de ${turnName}. ${view.trumpSuit ? `Triunfo ${view.trumpSuit.toLowerCase()}.` : ""} ${view.players.map((player) => `${player.name}: ${player.score}`).join(", ")}`
    : "Preparando la mesa");
</script>

<section class="table-screen">
  <div class="table-stage" bind:this={stage} data-viewport-mode={layout?.mode ?? "pending"}>
    <div class="table-host" bind:this={host}></div>
    {#if view && layout}
      <SeatHudOverlay {view} {layout} />
      <div class="suit-reminders" style:left={`${layout.suitAnchor.x}px`} style:top={`${layout.suitAnchor.y}px`}>
        {#if showLeadPlaque}
          <SuitPlaque kicker="Salida" ariaName="Palo de salida" suit={leadSuit} />
        {/if}
        {#if view.trumpSuit}
          <SuitPlaque kicker="Triunfo" ariaName="Triunfo" suit={view.trumpSuit} />
        {/if}
      </div>
      <ContextualHints {view} {layout} />
      <AccessibleHand
        hand={view.hand}
        {selectedIds}
        disabled={locked}
        onActivate={(cardId) => controller?.activateCard(cardId)}
        onFocus={(cardId) => controller?.focusCard(cardId)}
      />
    {/if}
  </div>
  <div class="game-hud-shell" bind:this={hudShell}>
    <GameHud {view} onMenu={() => (leaving = true)} />
  </div>
  <div class="action-bar-shell" bind:this={actionShell}>
    <ActionBar
      {view}
      {locked}
      {selectedIds}
      onPass={() => controller?.pass()}
      onConfirm={() => controller?.confirmDecision()}
    />
  </div>
  <p class="sr-only" aria-live="polite" aria-atomic="true">{liveMessage} {eventAnnouncement}</p>
</section>

{#if leaving}
  <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="leave-title">
    <div class="screen-card stack">
      <h2 id="leave-title">¿Salir de la partida?</h2>
      <p class="hint">La partida actual no se guarda.</p>
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
