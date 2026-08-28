export type HintId = "trump" | "exchange" | "follow" | "overtake" | "palito";

export interface Hint {
  id: HintId;
  title: string;
  body: string;
}

const STORAGE_KEY = "la-mosca.hints.v1";
const ONBOARDING_KEY = "la-mosca.hints.first-match-started";

const HINTS: Record<HintId, Hint> = {
  trump: {
    id: "trump",
    title: "Triunfo",
    body: "La carta junto al mazo, a la derecha de quien reparte, marca el palo. El dealer también la tiene en la mano.",
  },
  exchange: {
    id: "exchange",
    title: "Cambio",
    body: "Podés cambiar hasta 3 cartas. Tocá las que salen y confirmá. El dealer no cambia la carta revelada.",
  },
  follow: {
    id: "follow",
    title: "Seguir palo",
    body: "Si podés, tenés que jugar del palo de salida (el recuadro Salida, a la izquierda del triunfo). Las cartas recomendadas se marcan suave; las otras siguen jugables.",
  },
  overtake: {
    id: "overtake",
    title: "Superar",
    body: "Si podés ganar la baza con el palo pedido (o con triunfo si no tenés palo), el reglamento te obliga a hacerlo.",
  },
  palito: {
    id: "palito",
    title: "Palito",
    body: "Jugar una carta ilegal no está bloqueado: es saltar el palito y suma +50 al toque, sin modal.",
  },
};

function loadSeen(): Set<HintId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as HintId[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<HintId>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  } catch {
    // ignore
  }
}

export function nextHint(input: {
  hasTrump: boolean;
  canExchange: boolean;
  isTrickPlay: boolean;
  trickHasLead: boolean;
}): Hint | null {
  const seen = loadSeen();
  const order: Array<[HintId, boolean]> = [
    ["trump", input.hasTrump],
    ["exchange", input.canExchange],
    ["follow", input.isTrickPlay && input.trickHasLead],
    ["overtake", input.isTrickPlay],
    ["palito", input.isTrickPlay],
  ];
  for (const [id, visible] of order) {
    if (visible && !seen.has(id)) {
      return HINTS[id];
    }
  }
  return null;
}

export function dismissHint(id: HintId): void {
  const seen = loadSeen();
  seen.add(id);
  saveSeen(seen);
}

export function beginHintSession(): boolean {
  try {
    if (localStorage.getItem(ONBOARDING_KEY) === "true") return false;
    localStorage.setItem(ONBOARDING_KEY, "true");
    return true;
  } catch {
    return true;
  }
}
