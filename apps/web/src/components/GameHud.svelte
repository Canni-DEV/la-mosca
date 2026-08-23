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
    <span class="hud-chip plaque">Mano {view?.handNumber ?? "—"}</span>
  </div>
  <div class="hud-cluster">
    <span class="hud-chip" class:turn={yourTurn}>Turno: {turnName}</span>
    <button class="btn" type="button" onclick={toggleMute}>{muted ? "Audio off" : "Audio on"}</button>
  </div>
</header>
