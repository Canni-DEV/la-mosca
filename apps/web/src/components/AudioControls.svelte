<script lang="ts">
  import { audioMixer } from "../audio/mixer.ts";

  let muted = $state(audioMixer.muted);
  let volume = $state(audioMixer.volume);

  function refresh(): void {
    muted = audioMixer.muted;
    volume = audioMixer.volume;
  }

  function toggle(): void {
    audioMixer.toggleMuted();
    refresh();
  }

  function onVolume(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    audioMixer.setVolume(Number(target.value));
    refresh();
  }
</script>

<div class="audio-row">
  <button class="btn" type="button" onclick={toggle}>{muted ? "Sonido: off" : "Sonido: on"}</button>
  <label class="field">
    Volumen
    <input type="range" min="0" max="1" step="0.05" value={volume} oninput={onVolume} />
  </label>
</div>
