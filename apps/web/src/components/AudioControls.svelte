<script lang="ts">
  import { onDestroy } from "svelte";
  import { audioMixer } from "../audio/mixer.ts";

  let muted = $state(audioMixer.muted);
  let master = $state(audioMixer.masterVolume);
  let sfx = $state(audioMixer.sfxVolume);
  let ambience = $state(audioMixer.ambienceVolume);

  const unsubscribe = audioMixer.subscribe(refresh);
  onDestroy(unsubscribe);

  function refresh(): void {
    muted = audioMixer.muted;
    master = audioMixer.masterVolume;
    sfx = audioMixer.sfxVolume;
    ambience = audioMixer.ambienceVolume;
  }

  function value(event: Event): number {
    return Number((event.currentTarget as HTMLInputElement).value);
  }
</script>

<div class="audio-settings">
  <button class="btn" type="button" onclick={() => audioMixer.toggleMuted()} aria-pressed={muted}>
    {muted ? "Activar sonido" : "Silenciar todo"}
  </button>
  <label class="field audio-slider">
    <span>General <output>{Math.round(master * 100)}%</output></span>
    <input aria-label="Volumen general" type="range" min="0" max="1" step="0.05" value={master} oninput={(event) => audioMixer.setMasterVolume(value(event))} />
  </label>
  <label class="field audio-slider">
    <span>Efectos <output>{Math.round(sfx * 100)}%</output></span>
    <input aria-label="Volumen de efectos" type="range" min="0" max="1" step="0.05" value={sfx} oninput={(event) => audioMixer.setSfxVolume(value(event))} />
  </label>
  <label class="field audio-slider">
    <span>Ambiente <output>{Math.round(ambience * 100)}%</output></span>
    <input aria-label="Volumen de ambiente" type="range" min="0" max="1" step="0.05" value={ambience} oninput={(event) => audioMixer.setAmbienceVolume(value(event))} />
  </label>
</div>
