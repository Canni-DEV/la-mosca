<script lang="ts">
  import type { Suit } from "@la-mosca/game-protocol";
  import { suitTitle } from "../scene/card-art.ts";

  let {
    kicker,
    ariaName,
    suit,
  }: {
    kicker: string;
    ariaName: string;
    suit: Suit | null;
  } = $props();

  const suitLabel = $derived(suit ? suitTitle(suit) : "—");
  const ariaLabel = $derived(suit ? `${ariaName} ${suitTitle(suit)}` : `${ariaName} pendiente`);
</script>

<aside class="suit-plaque" aria-label={ariaLabel}>
  <p class="suit-plaque-kicker">{kicker}</p>
  <p class="suit-plaque-suit">{suitLabel}</p>
</aside>
