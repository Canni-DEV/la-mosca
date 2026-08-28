<script lang="ts">
  import mark from "../assets/brand/mosca-mark.svg";
  let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="wordmark" class:compact aria-label="La Mosca">
  <span>La</span>
  <strong>Mosca</strong>
  <img src={mark} alt="" aria-hidden="true" />
</div>
