<script lang="ts">
  import type { Card, Suit } from "@la-mosca/game-protocol";
  import { paintCardFace, preloadCardArt, suitTitle } from "../scene/card-art.ts";

  let {
    suit,
    card,
  }: {
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
</script>

{#if suit}
  <aside class="trump-reminder" aria-label="Triunfo {suitTitle(suit)}">
    <p class="trump-reminder-kicker">Triunfo</p>
    <p class="trump-reminder-suit">{suitTitle(suit)}</p>
    {#if faceSrc}
      <img class="trump-reminder-card" src={faceSrc} alt="Carta de triunfo" />
    {/if}
  </aside>
{/if}
