<script lang="ts">
  import type { VictoryInfo } from "../app/navigation.ts";
  import Wordmark from "../components/Wordmark.svelte";

  let {
    info,
    onRematch,
    onNewGame,
    onMenu,
  }: {
    info: VictoryInfo;
    onRematch: () => void;
    onNewGame: () => void;
    onMenu: () => void;
  } = $props();
</script>

<main class="screen">
  <div class="screen-card stack">
    <Wordmark compact />
    <h1 class="brand">{info.humanWon ? "¡Ganaste!" : "Partida terminada"}</h1>
    <p class="tagline">{info.humanWon ? "Llegaste a 0." : `Ganó ${info.winnerName}.`}</p>
    <ul>
      {#each info.scores as player}
        <li>{player.name}: {player.score}{player.id === info.winnerPlayerId ? " · ganador" : ""}</li>
      {/each}
    </ul>
    <button class="btn btn-primary" type="button" onclick={onRematch}>Revancha</button>
    <button class="btn" type="button" onclick={onNewGame}>Nueva partida</button>
    <button class="btn btn-ghost" type="button" onclick={onMenu}>Menú principal</button>
  </div>
</main>
