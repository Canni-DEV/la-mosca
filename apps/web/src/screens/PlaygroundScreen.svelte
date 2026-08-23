<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { DebugViewState, DeckConfiguration, GameEvent } from "@la-mosca/game-protocol";
  import { LocalGameSession } from "../game/LocalGameSession.ts";
  import { PixiTable } from "../scene/pixi-table.ts";

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
    const nextDebug = current.engine.getDebugViewState();
    const log = current.engine.getEventLog();
    debug = nextDebug;
    eventCount = log.length;
    events = log.slice(-EVENT_LOG_LIMIT).reverse();
    table.render({
      phase: nextDebug.phase,
      trumpSuit: nextDebug.trumpSuit,
      seed: nextDebug.seed,
      scores: nextDebug.players.map((player) => ({ name: player.name, score: player.score })),
    });
  }

  function start(): void {
    unsubscribe?.();
    session = new LocalGameSession({ seed, playerCount, deckConfiguration });
    unsubscribe = session.subscribe(refresh);
    refresh();
  }

  onMount(async () => {
    if (host) {
      await table.mount(host);
      refresh();
    }
  });

  onDestroy(() => {
    unsubscribe?.();
    table.destroy();
  });

  const finished = $derived(debug?.phase === "GAME_OVER");
  const canAct = $derived(session !== null && !finished);
</script>

<main class="layout">
  <header>
    <h1>La Mosca — playground</h1>
    <p>Fase 1: motor, bots y mesa Pixi mínima. Sin arte final. No jugás vos: los cuatro (o más) son bots.</p>
  </header>

  <p class="hint">
    <strong>Nueva partida</strong> solo arranca el motor (corte, scores en 20).
    <strong>Paso</strong> ejecuta un comando de bot.
    <strong>Auto (80)</strong> avanza 80 comandos; una partida completa suele necesitar varios clics.
    <strong>Hasta el final</strong> deja que los bots terminen. El panel Estado y el log tienen que coincidir con la mesa.
  </p>

  <section class="controls">
    <label>
      Seed
      <input type="number" bind:value={seed} />
    </label>
    <label>
      Jugadores
      <select bind:value={playerCount}>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
      </select>
    </label>
    <label>
      Mazo
      <select bind:value={deckConfiguration}>
        <option value="TRADITIONAL_40">40 cartas</option>
        <option value="FULL_48">48 cartas</option>
      </select>
    </label>
    <button onclick={start}>Nueva partida</button>
    <button disabled={!canAct} onclick={() => session?.step()}>Paso</button>
    <button disabled={!canAct} onclick={() => session?.runAuto()}>Auto (80)</button>
    <button disabled={!canAct} onclick={() => session?.runUntilEnd()}>Hasta el final</button>
    <button disabled={!canAct} onclick={() => session?.forcePalito()}>Forzar palito</button>
  </section>

  <section class="grid">
    <div class="canvas" bind:this={host}></div>
    {#if debug}
      <aside>
        <h2>Estado</h2>
        {#if finished}
          <p class="banner">Partida terminada · ganador: {debug.winnerPlayerId ?? "—"}</p>
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
