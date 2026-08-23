<script lang="ts">
  let {
    onPlay,
    onHowTo,
    onOptions,
    onPlayground,
  }: {
    onPlay: () => void;
    onHowTo: () => void;
    onOptions: () => void;
    onPlayground: () => void;
  } = $props();
</script>

<main class="screen">
  <div class="screen-card">
    <h1 class="brand">La Mosca</h1>
    <p class="tagline">Variante Las Parejas</p>
    <div class="stack">
      <button class="btn btn-primary" type="button" onclick={onPlay}>Jugar</button>
      <button class="btn" type="button" onclick={onHowTo}>Cómo jugar</button>
      <button class="btn" type="button" onclick={onOptions}>Opciones</button>
      <button class="btn btn-ghost" type="button" onclick={onPlayground}>Mesa de prueba</button>
    </div>
  </div>
</main>
