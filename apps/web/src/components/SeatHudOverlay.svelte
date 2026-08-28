<script lang="ts">
  import type { PlayerViewState } from "@la-mosca/game-protocol";
  import type { TableLayout } from "../scene/table-layout.ts";

  let { view, layout }: { view: PlayerViewState; layout: TableLayout } = $props();
</script>

<div class="seat-hud-layer" aria-label="Jugadores">
  {#each layout.seats as seat (seat.id)}
    {@const player = view.players.find((item) => item.id === seat.id)}
    {@const isTurn = view.currentActorId === seat.id && !player?.hasPassed}
    <section
      class="seat-ticket"
      class:is-turn={isTurn}
      class:is-passed={player?.hasPassed}
      class:is-human={seat.isHuman}
      style:left={`${seat.hud.x}px`}
      style:top={`${seat.hud.y}px`}
      style:max-width={`${seat.hud.maxWidth}px`}
      aria-label={`${seat.name}, ${player?.score ?? 0} puntos${isTurn ? ", en turno" : ""}`}
    >
      <span class="seat-turn-light" aria-hidden="true"></span>
      <span class="seat-name">{seat.name}</span>
      <strong class="seat-score">{player?.score ?? 0}</strong>
      <span class="seat-meta">
        {#if isTurn}<b>En turno</b>{/if}
        {#if player?.isDealer}<span>Reparte</span>{/if}
        {#if player?.hasPassed}<span>Pasó</span>{/if}
        {#if player && player.tricksWonInCurrentHand > 0}<span>{player.tricksWonInCurrentHand} bazas</span>{/if}
        {#if player && !seat.isHuman}<span>{player.cardCount} cartas</span>{/if}
      </span>
    </section>
  {/each}
</div>
