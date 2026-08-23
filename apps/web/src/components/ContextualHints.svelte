<script lang="ts">
  import type { PlayerViewState } from "@la-mosca/game-protocol";
  import { dismissHint, nextHint, type Hint } from "../game/hints.ts";

  let { view }: { view: PlayerViewState | null } = $props();

  let hint = $state<Hint | null>(null);

  $effect(() => {
    if (!view) {
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
  <aside class="hint-plaque" aria-live="polite">
    <strong>{hint.title}</strong>
    <p>{hint.body}</p>
    <button class="btn btn-ghost" type="button" onclick={dismiss}>Entendido</button>
  </aside>
{/if}
