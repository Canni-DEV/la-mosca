<script lang="ts">
  import type { PlayerViewState } from "@la-mosca/game-protocol";
  import { onMount } from "svelte";
  import { beginHintSession, dismissHint, nextHint, type Hint } from "../game/hints.ts";
  import type { TableLayout } from "../scene/table-layout.ts";

  let { view, layout }: { view: PlayerViewState | null; layout: TableLayout } = $props();

  let hint = $state<Hint | null>(null);
  let enabled = $state(false);

  onMount(() => {
    enabled = beginHintSession();
  });

  $effect(() => {
    if (!view || !enabled) {
      hint = null;
      return;
    }
    hint = nextHint({
      hasTrump: Boolean(view.trumpSuit),
      canExchange: view.availableActions.some((action) => action.type === "EXCHANGE_CARDS"),
      isTrickPlay: view.phase === "TRICK_PLAY",
      trickHasLead: Boolean(view.currentTrick && view.currentTrick.plays.length > 0),
    });
  });

  function dismiss(): void {
    if (!hint) {
      return;
    }
    dismissHint(hint.id);
    hint = null;
  }
</script>

{#if hint}
  <aside
    class="hint-plaque"
    aria-live="polite"
    style:left={`${layout.hintAnchor.x}px`}
    style:top={`${layout.hintAnchor.y}px`}
    style:max-width={`${layout.hintAnchor.maxWidth}px`}
  >
    <strong>{hint.title}</strong>
    <p>{hint.body}</p>
    <button class="btn btn-ghost" type="button" onclick={dismiss}>Entendido</button>
  </aside>
{/if}
