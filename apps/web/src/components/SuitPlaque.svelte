<script lang="ts">
  import type { Card, Suit } from "@la-mosca/game-protocol";
  import { paintCardFace, preloadCardArt, suitTitle } from "../scene/card-art.ts";

  let {
    kicker,
    ariaName,
    suit,
    card,
  }: {
    kicker: string;
    ariaName: string;
    suit: Suit | null;
    card: Card | null;
  } = $props();

  let faceSrc = $state("");

  $effect(() => {
    const current = card;
    if (!current) {
      faceSrc = "";
      return;
    }
    void preloadCardArt().then(() => {
      faceSrc = paintCardFace(current).toDataURL("image/png");
    });
  });

  const suitLabel = $derived(suit ? suitTitle(suit) : "—");
  const ariaLabel = $derived(suit ? `${ariaName} ${suitTitle(suit)}` : `${ariaName} pendiente`);
</script>

<aside class="suit-plaque" aria-label={ariaLabel}>
  <p class="suit-plaque-kicker">{kicker}</p>
  <p class="suit-plaque-suit">{suitLabel}</p>
  <div class="suit-plaque-slot">
    {#if faceSrc}
      <img class="suit-plaque-card" src={faceSrc} alt="Carta de {ariaName}" />
    {/if}
  </div>
</aside>
