<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { DebugViewState, DeckConfiguration, GameEvent } from "@la-mosca/game-protocol";
  import { LocalGameSession } from "../game/LocalGameSession.ts";
  import { PixiTable } from "../scene/pixi-table.ts";
  import { computeTableLayout } from "../scene/table-layout.ts";

  let { onBack }: { onBack: () => void } = $props();

  const EVENT_LOG_LIMIT = 80;

  let seed = $state(2026);
  let playerCount = $state<3 | 4 | 5>(4);
  let deckConfiguration = $state<DeckConfiguration>("TRADITIONAL_40");
  let session = $state<LocalGameSession | null>(null);
  let host = $state<HTMLDivElement | null>(null);
  let debug = $state<DebugViewState | null>(null);
  let events = $state<GameEvent[]>([]);
  let eventCount = $state(0);
  let unsubscribe: (() => void) | null = null;
  let observer: ResizeObserver | null = null;
  let resizeFrame = 0;
  const table = new PixiTable();

  function formatEvent(event: GameEvent): string {
    const { type, ...rest } = event;
    return `${type}  ${JSON.stringify(rest)}`;
  }

  function refresh(): void {
    const current = session;
    if (!current) {
      debug = null;
      events = [];
      eventCount = 0;
      return;
    }
    const nextDebug = current.getDebugViewState();
    const log = current.getEventLog();
    debug = nextDebug;
    eventCount = log.length;
    events = log.slice(-EVENT_LOG_LIMIT).reverse();
    const view = current.getViewState();
    if (host) {
      const rect = host.getBoundingClientRect();
      table.applyLayout(computeTableLayout({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
        players: view.players,
        humanPlayerId: view.viewerId,
        dealerPlayerId: view.dealerPlayerId,
      }));
    }
    table.sync(view, { inputLocked: true });
  }

  function start(): void {
    unsubscribe?.();
    session = new LocalGameSession({
      seed,
      playerCount,
      deckConfiguration,
      humanPlayerId: null,
    });
    unsubscribe = session.subscribe(refresh);
    refresh();
  }

  onMount(async () => {
    if (host) {
      await table.mount(host);
      observer = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(refresh);
      });
      observer.observe(host);
      refresh();
    }
  });

  onDestroy(() => {
    unsubscribe?.();
    cancelAnimationFrame(resizeFrame);
    observer?.disconnect();
    table.destroy();
  });

  const finished = $derived(debug?.phase === "GAME_OVER");
  const canAct = $derived(session !== null && !finished);

</script>

<main class="playground-layout">
  <header>
    <h1>La Mosca — mesa de prueba</h1>
    <p>Herramienta de desarrollo: todos son bots. El juego real está en el menú.</p>
    <button class="btn btn-ghost" type="button" onclick={onBack}>Volver al menú</button>
  </header>

  <p class="hint">
    <strong>Nueva partida</strong> solo arranca el motor.
    <strong>Paso</strong> ejecuta un comando de bot.
    <strong>Hasta el final</strong> deja que los bots terminen.
  </p>

  <section class="controls">
    <label class="field">
      Seed
      <input type="number" bind:value={seed} />
    </label>
    <label class="field">
      Jugadores
      <select bind:value={playerCount}>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
      </select>
    </label>
    <label class="field">
      Mazo
      <select bind:value={deckConfiguration}>
        <option value="TRADITIONAL_40">40 cartas</option>
        <option value="FULL_48">48 cartas</option>
      </select>
    </label>
    <button class="btn" type="button" onclick={start}>Nueva partida</button>
    <button class="btn" type="button" disabled={!canAct} onclick={() => session?.step()}>Paso</button>
    <button class="btn" type="button" disabled={!canAct} onclick={() => session?.runAuto()}>Auto (80)</button>
    <button class="btn" type="button" disabled={!canAct} onclick={() => session?.runUntilEnd()}>Hasta el final</button>
    <button class="btn" type="button" disabled={!canAct} onclick={() => session?.forcePalito()}>Forzar palito</button>
  </section>

  <section class="grid">
    <div class="canvas" bind:this={host}></div>
    {#if debug}
      <aside>
        <h2>Estado</h2>
        {#if finished}
          <p class="hud-chip">Partida terminada · ganador: {debug.winnerPlayerId ?? "—"}</p>
        {/if}
        <p>Fase: {debug.phase}</p>
        <p>Mano: {debug.handNumber}</p>
        <p>Dealer: {debug.dealerPlayerId}</p>
        <p>Corta: {debug.cutterPlayerId}</p>
        <p>Turno: {debug.currentActorId ?? "—"}</p>
        <p>Triunfo: {debug.trumpSuit ?? "—"} {debug.revealedTrumpCard?.id ?? ""}</p>
        <p>Ganador: {debug.winnerPlayerId ?? "—"}</p>
        <h3>Puntos</h3>
        <ul>
          {#each debug.players as player}
            <li>{player.name}: {player.score} · cartas {player.cardCount} · bazas {player.tricksWonInCurrentHand}</li>
          {/each}
        </ul>
        <h3>Manos (debug)</h3>
        <ul>
          {#each debug.players as player}
            <li>
              {player.id}: {(debug.hands[player.id] ?? []).map((card) => card.id).join(", ") || "—"}
            </li>
          {/each}
        </ul>
      </aside>
    {/if}
  </section>

  {#if session && debug}
    <section class="log">
      <h2>Eventos</h2>
      <p class="hint">
        {eventCount} eventos en total. Mostrando los {events.length} más recientes (arriba el último).
      </p>
      <ol>
        {#each events as event, index (eventCount - index)}
          <li>{formatEvent(event)}</li>
        {/each}
      </ol>
    </section>
  {/if}
</main>
