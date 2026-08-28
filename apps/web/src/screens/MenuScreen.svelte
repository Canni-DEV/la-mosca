<script lang="ts">
  import Wordmark from "../components/Wordmark.svelte";
  let {
    onPlay,
    onHowTo,
    onOptions,
    onPlayground,
    onCredits,
  }: {
    onPlay: () => void;
    onHowTo: () => void;
    onOptions: () => void;
    onPlayground: () => void;
    onCredits: () => void;
  } = $props();
</script>

<main class="screen">
  <div class="screen-card">
    <Wordmark />
    <p class="tagline">Cartas en un bodegón. Variante Las Parejas.</p>
    <div class="stack">
      <button class="btn btn-primary" type="button" onclick={onPlay}>Jugar</button>
      <button class="btn" type="button" onclick={onHowTo}>Cómo jugar</button>
      <button class="btn" type="button" onclick={onOptions}>Opciones</button>
      <button class="btn btn-ghost" type="button" onclick={onCredits}>Créditos</button>
      <button class="btn btn-ghost" type="button" onclick={onPlayground}>Mesa de prueba</button>
    </div>
  </div>
</main>
