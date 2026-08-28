<script lang="ts">
  import type { Card, CardId } from "@la-mosca/game-protocol";
  import { suitTitle } from "../scene/card-art.ts";

  let {
    hand,
    selectedIds,
    disabled,
    onActivate,
    onFocus,
  }: {
    hand: readonly Card[];
    selectedIds: readonly CardId[];
    disabled: boolean;
    onActivate: (cardId: CardId) => void;
    onFocus: (cardId: CardId | null) => void;
  } = $props();

  let group: HTMLDivElement;

  function label(card: Card): string {
    const ranks: Record<number, string> = { 1: "as", 10: "sota", 11: "caballo", 12: "rey" };
    return `${ranks[card.rank] ?? card.rank} de ${suitTitle(card.suit)}`;
  }

  function moveFocus(event: KeyboardEvent, index: number): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const buttons = [...group.querySelectorAll<HTMLButtonElement>("button")];
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }
</script>

<div class="accessible-hand" role="group" aria-label="Tu mano" bind:this={group}>
  {#each hand as card, index (card.id)}
    <button
      type="button"
      disabled={disabled}
      aria-label={`Carta ${index + 1} de ${hand.length}: ${label(card)}`}
      aria-pressed={selectedIds.includes(card.id)}
      tabindex={index === 0 ? 0 : -1}
      onfocus={() => onFocus(card.id)}
      onblur={(event) => {
        if (!group.contains(event.relatedTarget as Node | null)) onFocus(null);
      }}
      onkeydown={(event) => moveFocus(event, index)}
      onclick={() => onActivate(card.id)}
    >{label(card)}</button>
  {/each}
</div>
