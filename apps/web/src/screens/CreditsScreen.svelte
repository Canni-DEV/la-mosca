<script lang="ts">
  import Wordmark from "../components/Wordmark.svelte";
  let { onBack }: { onBack: () => void } = $props();
</script>

<main class="screen">
  <article class="screen-card credits stack">
    <Wordmark compact />
    <p class="eyebrow">Créditos y acerca de</p>
    <h1>Una partida de bodegón</h1>
    <p>La Mosca recrea la variante argentina <strong>Las Parejas</strong> para una persona contra bots.</p>
    <dl>
      <div><dt>Diseño y desarrollo</dt><dd>Proyecto La Mosca</dd></div>
      <div><dt>Baraja española</dt><dd>Atlas derivado de SVG-cards 2.0, CC BY-SA 3.0</dd></div>
      <div><dt>Tipografías</dt><dd>Fraunces y Archivo, SIL Open Font License 1.1</dd></div>
      <div><dt>Arte de mesa</dt><dd>Composición y retoque originales para el proyecto</dd></div>
      <div><dt>Sonido</dt><dd>Foley de cartas CC0 por Brian MacIntosh, editado y mezclado con ambiente sintetizado; sin música continua</dd></div>
    </dl>
    <p class="fine-print">Las marcas y objetos del bodegón son genéricos. No existe afiliación con marcas comerciales.</p>
    <button class="btn btn-primary" type="button" onclick={onBack}>Volver</button>
  </article>
</main>
