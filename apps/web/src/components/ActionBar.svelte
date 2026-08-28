<script lang="ts">
  import type { CardId, PlayerViewState } from "@la-mosca/game-protocol";

  let {
    view,
    locked,
    selectedIds,
    onPass,
    onConfirm,
  }: {
    view: PlayerViewState | null;
    locked: boolean;
    selectedIds: readonly CardId[];
    onPass: () => void;
    onConfirm: () => void;
  } = $props();

  const canPass = $derived(Boolean(view?.availableActions.some((action) => action.type === "PASS")));
  const canExchange = $derived(Boolean(view?.availableActions.some((action) => action.type === "EXCHANGE_CARDS")));
  const canStay = $derived(Boolean(view?.availableActions.some((action) => action.type === "STAY")));
  const isHumanTurn = $derived(Boolean(view && view.currentActorId === view.viewerId && !locked));
  const isPlay = $derived(view?.phase === "TRICK_PLAY" && isHumanTurn);
  const confirmLabel = $derived(
    canExchange && selectedIds.length > 0 ? `Cambiar ${selectedIds.length}` : "Quedarme",
  );
  const prompt = $derived.by(() => {
    if (!view) {
      return "Preparando la mesa…";
    }
    if (locked && view.phase !== "GAME_OVER") {
      return view.currentActorId === view.viewerId ? "Resolviendo…" : "Esperá…";
    }
    if (view.phase === "GAME_OVER") {
      return "Partida terminada";
    }
    if (isPlay) {
      return "Jugá una carta. Las recomendadas se marcan sutilmente; todavía podés saltar el palito.";
    }
    if (canPass || canExchange || canStay) {
      if (!view.availableActions.some((action) => action.type === "PASS") && !canExchange) {
        return "Triunfo 2: no se puede pasar ni cambiar.";
      }
      if (!view.availableActions.some((action) => action.type === "PASS")) {
        return "No se puede pasar. Elegí hasta 3 cartas y confirmá, o quedate.";
      }
      return "Pasá, quedate o cambiá hasta 3 cartas.";
    }
    return "Esperá tu turno.";
  });
</script>

<div class="action-bar">
  <p class="hint">{prompt}</p>
  {#if canPass}
    <button class="btn" type="button" disabled={locked} onclick={onPass}>Paso</button>
  {/if}
  {#if canStay || canExchange}
    <button class="btn btn-primary" type="button" disabled={locked} onclick={onConfirm}>{confirmLabel}</button>
  {/if}
</div>
