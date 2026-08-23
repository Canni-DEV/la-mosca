# Roadmap de implementación

El trabajo se organiza en **fases grandes**. Cada fase debe cerrar una capacidad completa y terminar en un punto verificable manualmente por el usuario.

El agente no debe avanzar automáticamente a la siguiente fase.

## Fase 1 — Foundation & Rules Engine

Documento: [`phases/PHASE_01_FOUNDATION_ENGINE.md`](phases/PHASE_01_FOUNDATION_ENGINE.md)

Resultado:

- monorepo pnpm inicializado;
- packages `game-core`, `game-protocol`, `game-ai`;
- shell Svelte/Vite/Pixi mínimo;
- motor completo según especificación funcional;
- RNG determinístico;
- bot base;
- playground/desarrollo que permita ejecutar y observar partidas;
- tests de reglas críticas.

La Fase 1 no busca arte final.

## Fase 2 — Playable MVP

Documento: [`phases/PHASE_02_PLAYABLE_MVP.md`](phases/PHASE_02_PLAYABLE_MVP.md)

Resultado:

- partida completa humano vs 2–4 bots;
- menú y configuración;
- mesa funcional en Pixi;
- todas las decisiones jugables;
- feedback funcional de eventos;
- audio base;
- UX suficiente para probar una partida completa sin herramientas de desarrollo.

## Fase 3 — Professional Presentation

Documento: [`phases/PHASE_03_PRESENTATION.md`](phases/PHASE_03_PRESENTATION.md)

Resultado:

- dirección artística bodegón argentino aplicada;
- cartas tradicionales definitivas o de calidad casi final;
- animaciones y audio refinados;
- responsive sólido;
- tutorial/cómo jugar;
- game feel profesional.

## Fase 4 — Release Candidate

Documento: [`phases/PHASE_04_RELEASE.md`](phases/PHASE_04_RELEASE.md)

Resultado:

- hardening funcional;
- performance;
- accesibilidad razonable;
- browsers modernos validados;
- build estático confiable;
- deploy GitHub Pages documentado/configurado;
- documentación sincronizada;
- cero issues bloqueantes conocidos para el MVP.

## Fases futuras

No implementar durante el roadmap MVP:

- multiplayer;
- rooms;
- backend;
- móvil como mano/controlador;
- perfiles/ranking;
- persistencia de cuentas.

Los documentos en `docs/future/` solo condicionan arquitectura.

## Gate entre fases

Una fase se considera candidata a cierre cuando:

1. cumple su checklist de aceptación;
2. pasa los tests automáticos relevantes;
3. build/typecheck/lint aplicable está limpio;
4. el agente entrega checklist manual;
5. el usuario prueba y decide continuar.
