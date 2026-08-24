<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { prefersReducedMotion } from "../animation/motion.ts";
  import page0 from "../assets/guia-ilustrada/0_Mosca.png";
  import page1 from "../assets/guia-ilustrada/1_Mosca.png";
  import page2 from "../assets/guia-ilustrada/2_Mosca.png";
  import page3 from "../assets/guia-ilustrada/3_Mosca.png";
  import manualPdf from "../assets/guia-ilustrada/La_Mosca_Guia_Ilustrada.pdf";

  let { onBack }: { onBack: () => void } = $props();

  const PAGES = [
    { src: page0, label: "Portada" },
    { src: page1, label: "Preparación de la mano" },
    { src: page2, label: "Cómo se juega cada vuelta" },
    { src: page3, label: "Puntos, Mosca y faltas" },
  ] as const;

  const FLIP_MS = 720;

  let index = $state(0);
  let turning = $state<"next" | "prev" | null>(null);
  let pointerStartX: number | null = null;
  let flipTimer: ReturnType<typeof setTimeout> | null = null;

  const page = $derived(PAGES[index]!);
  const canPrev = $derived(index > 0 && turning === null);
  const canNext = $derived(index < PAGES.length - 1 && turning === null);

  function clearFlipTimer(): void {
    if (flipTimer !== null) {
      clearTimeout(flipTimer);
      flipTimer = null;
    }
  }

  function finishTurn(): void {
    turning = null;
    flipTimer = null;
  }

  function go(dir: "next" | "prev"): void {
    if (turning) {
      return;
    }
    const nextIndex = dir === "next" ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= PAGES.length) {
      return;
    }
    if (prefersReducedMotion()) {
      index = nextIndex;
      return;
    }
    turning = dir;
    index = nextIndex;
    clearFlipTimer();
    flipTimer = setTimeout(finishTurn, FLIP_MS);
  }

  function jumpTo(target: number): void {
    if (turning || target === index || target < 0 || target >= PAGES.length) {
      return;
    }
    if (Math.abs(target - index) === 1) {
      go(target > index ? "next" : "prev");
      return;
    }
    clearFlipTimer();
    turning = null;
    index = target;
  }

  function leafZ(i: number): number {
    if (turning === "next" && i === index - 1) {
      return 40;
    }
    if (turning === "prev" && i === index) {
      return 40;
    }
    if (i < index) {
      return 2 + i;
    }
    return 10 + (PAGES.length - i);
  }

  function onKey(event: KeyboardEvent): void {
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      go("next");
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      go("prev");
    } else if (event.key === "Escape") {
      onBack();
    }
  }

  function onPointerDown(event: PointerEvent): void {
    pointerStartX = event.clientX;
  }

  function onPointerUp(event: PointerEvent): void {
    if (pointerStartX === null) {
      return;
    }
    const dx = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(dx) < 48) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / rect.width;
      if (ratio > 0.62) {
        go("next");
      } else if (ratio < 0.38) {
        go("prev");
      }
      return;
    }
    go(dx < 0 ? "next" : "prev");
  }

  onMount(() => {
    window.addEventListener("keydown", onKey);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", onKey);
    clearFlipTimer();
  });
</script>

<main class="screen guide-screen">
  <div class="guide">
    <header class="guide-head">
      <h1 class="guide-title">Cómo jugar</h1>
      <p class="guide-kicker">Pasá las páginas · el PDF se descarga abajo</p>
    </header>

    <div class="book-frame">
      <div
        class="book"
        class:busy={turning !== null}
        role="img"
        aria-label="Página {index + 1} de {PAGES.length}: {page.label}"
        onpointerdown={onPointerDown}
        onpointerup={onPointerUp}
        onpointercancel={() => (pointerStartX = null)}
      >
        <div class="book-spine" aria-hidden="true"></div>
        {#each PAGES as item, i}
          <div class="leaf" class:flipped={i < index} style="z-index: {leafZ(i)}">
            <div class="leaf-face leaf-front">
              <img src={item.src} alt={item.label} draggable="false" />
            </div>
            <div class="leaf-face leaf-back" aria-hidden="true"></div>
          </div>
        {/each}
      </div>
    </div>

    <nav class="guide-nav" aria-label="Páginas de la guía">
      <button class="btn guide-page-btn" type="button" disabled={!canPrev} onclick={() => go("prev")}>Anterior</button>
      <div class="guide-pager">
        <p class="guide-caption" aria-live="polite">{index + 1} / {PAGES.length} · {page.label}</p>
        <div class="guide-dots">
          {#each PAGES as item, i}
            <button
              class="guide-dot"
              class:current={i === index}
              type="button"
              aria-label="Ir a {item.label}"
              aria-current={i === index ? "page" : undefined}
              onclick={() => jumpTo(i)}
            ></button>
          {/each}
        </div>
      </div>
      <button class="btn guide-page-btn" type="button" disabled={!canNext} onclick={() => go("next")}>Siguiente</button>
    </nav>

    <div class="guide-actions">
      <a class="btn btn-primary guide-btn" href={manualPdf} download="La_Mosca_Guia_Ilustrada.pdf">Descargar PDF</a>
      <button class="btn btn-ghost guide-btn" type="button" onclick={onBack}>Volver</button>
    </div>
  </div>
</main>
