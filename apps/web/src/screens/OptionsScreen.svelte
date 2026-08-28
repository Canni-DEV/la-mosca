<script lang="ts">
  import AudioControls from "../components/AudioControls.svelte";
  import Wordmark from "../components/Wordmark.svelte";

  let { onBack }: { onBack: () => void } = $props();
</script>

<main class="screen">
  <div class="screen-card stack">
    <Wordmark compact />
    <p class="eyebrow">Opciones</p>
    <p class="hint">El volumen se guarda en este navegador. Nada de la partida depende solo del sonido.</p>
    <AudioControls />
    <button class="btn btn-primary" type="button" onclick={onBack}>Volver</button>
  </div>
</main>
