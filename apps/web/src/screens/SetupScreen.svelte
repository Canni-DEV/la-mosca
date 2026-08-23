<script lang="ts">
  import { untrack } from "svelte";
  import type { DeckConfiguration } from "@la-mosca/game-protocol";
  import type { MatchSetup } from "../app/navigation.ts";

  let {
    initial,
    onStart,
    onBack,
  }: {
    initial?: MatchSetup;
    onStart: (setup: MatchSetup) => void;
    onBack: () => void;
  } = $props();

  let playerCount = $state<3 | 4 | 5>(untrack(() => initial?.playerCount ?? 4));
  let deckConfiguration = $state<DeckConfiguration>(untrack(() => initial?.deckConfiguration ?? "TRADITIONAL_40"));

  function start(): void {
    onStart({
      playerCount,
      deckConfiguration,
      seed: Date.now() % 1_000_000_000,
    });
  }

  function onPlayerCount(event: Event): void {
    const value = Number((event.currentTarget as HTMLSelectElement).value);
    if (value === 3 || value === 4 || value === 5) {
      playerCount = value;
    }
  }

  function onDeck(event: Event): void {
    const value = (event.currentTarget as HTMLSelectElement).value;
    if (value === "TRADITIONAL_40" || value === "FULL_48") {
      deckConfiguration = value;
    }
  }
</script>

<main class="screen">
  <div class="screen-card stack">
    <h1 class="brand" style="font-size: 42px;">Nueva partida</h1>
    <p class="hint">Un humano contra bots. El mazo de 40 es el tradicional; el de 48 agrega 8 y 9.</p>
    <label class="field">
      Jugadores
      <select value={playerCount} onchange={onPlayerCount}>
        <option value="3">3 — vos y 2 bots</option>
        <option value="4">4 — vos y 3 bots</option>
        <option value="5">5 — vos y 4 bots</option>
      </select>
    </label>
    <label class="field">
      Mazo
      <select value={deckConfiguration} onchange={onDeck}>
        <option value="TRADITIONAL_40">40 cartas (tradicional)</option>
        <option value="FULL_48">48 cartas (con 8 y 9)</option>
      </select>
    </label>
    <button class="btn btn-primary" type="button" onclick={start}>Sentarse a la mesa</button>
    <button class="btn btn-ghost" type="button" onclick={onBack}>Volver</button>
  </div>
</main>
