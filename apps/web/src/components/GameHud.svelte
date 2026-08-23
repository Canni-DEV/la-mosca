<script lang="ts">
  import type { PlayerViewState } from "@la-mosca/game-protocol";
  import { audioMixer } from "../audio/mixer.ts";

  let {
    view,
    onMenu,
  }: {
    view: PlayerViewState | null;
    onMenu: () => void;
  } = $props();

  let muted = $state(audioMixer.muted);

  const trump = $derived(
    view?.trumpSuit
      ? `Triunfo: ${view.trumpSuit === "OROS" ? "Oros" : view.trumpSuit === "COPAS" ? "Copas" : view.trumpSuit === "ESPADAS" ? "Espadas" : "Bastos"}`
      : "Triunfo: —",
  );
  const turnName = $derived(view?.players.find((player) => player.id === view.currentActorId)?.name ?? "—");
  const yourTurn = $derived(Boolean(view && view.currentActorId === view.viewerId));

  function toggleMute(): void {
    audioMixer.toggleMuted();
    muted = audioMixer.muted;
  }
</script>

<header class="game-hud">
  <div class="hud-cluster">
    <button class="btn btn-ghost" type="button" onclick={onMenu}>Salir</button>
    <span class="hud-chip">Mano {view?.handNumber ?? "—"}</span>
    <span class="hud-chip">{trump}</span>
  </div>
  <div class="hud-cluster">
    <span class="hud-chip" class:turn={yourTurn}>Turno: {turnName}</span>
    <button class="btn" type="button" onclick={toggleMute}>{muted ? "Audio off" : "Audio on"}</button>
  </div>
</header>
