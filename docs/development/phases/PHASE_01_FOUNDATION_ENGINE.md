# Fase 1 — Foundation & Rules Engine

## Objetivo

Crear la base técnica real del proyecto y demostrar que el reglamento completo puede ejecutarse de forma determinística, independiente de la UI final.

Esta fase debe dejar una **base ejecutable y verificable**, no solo interfaces vacías.

## Alcance obligatorio

### Monorepo

Inicializar pnpm workspaces con:

- `apps/web`;
- `packages/game-core`;
- `packages/game-protocol`;
- `packages/game-ai`.

Configurar:

- TypeScript strict;
- scripts raíz coherentes;
- typecheck;
- tests;
- build;
- lint/format solo si se mantienen simples y rápidos.

### `game-protocol`

Definir contratos iniciales de:

- commands;
- events;
- view states;
- IDs/tipos serializables necesarios.

No sobrecerrar tipos de multiplayer futuro.

### `game-core`

Implementar **todas las reglas** de `docs/game/FUNCTIONAL_SPEC.md`.

Debe existir una API suficientemente limpia para:

- iniciar partida;
- obtener estado/vista;
- procesar decisiones de fase;
- jugar carta;
- resolver bazas;
- resolver puntuación;
- detectar game over.

Implementar RNG seeded.

### Tests

Implementar tests para los casos normativos de `FUNCTIONAL_SPEC.md`, con foco en:

- legalidad/obligación de superar;
- Palito;
- scoring y orden temporal;
- Mosca;
- paso/cambio;
- mazo/reparto;
- victoria.

No crear tests visuales.

### `game-ai`

Implementar bot base según `docs/ai/BOT_SPECIFICATION.md`.

Debe poder completar partidas sin intervención humana.

### Simulación

Agregar una forma de ejecutar múltiples partidas bot-vs-bot en desarrollo/tests para detectar deadlocks/invariantes.

No necesita ser una herramienta de producto.

### `apps/web`

Crear shell mínimo Svelte/Vite y una inicialización PixiJS mínima.

La UI de esta fase puede ser deliberadamente de desarrollo, pero debe permitir **testing manual del motor**.

Crear una pantalla/playground de desarrollo que muestre al menos:

- estado de fase;
- dealer;
- triunfo;
- scores;
- manos visibles en modo debug;
- log de events;
- posibilidad de iniciar una partida bot-vs-bot paso a paso o automática;
- seed visible/configurable.

No invertir tiempo en arte final.

## No incluir

- mesa final;
- assets definitivos;
- animaciones profesionales;
- tutorial;
- multiplayer;
- backend;
- routing complejo;
- persistencia de partidas.

## Criterios de aceptación automáticos

- [ ] `pnpm install` desde raíz funciona.
- [ ] `pnpm test` pasa.
- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm build` pasa.
- [ ] `game-core` puede ejecutarse sin browser.
- [ ] Misma seed produce mismo reparto.
- [ ] Simulación de múltiples partidas termina sin deadlock.
- [ ] Casos normativos críticos están cubiertos.

## Criterios de testing manual

El usuario debe poder:

1. iniciar `apps/web`;
2. abrir el playground;
3. iniciar una partida con seed visible;
4. observar reparto y triunfo;
5. dejar que bots completen una partida;
6. comprobar que score llega a 0 o menos y termina;
7. repetir seed y observar mismo reparto/flujo determinístico cuando las decisiones también sean determinísticas;
8. inspeccionar event log en un caso de Palito simulado/forzado desde herramientas de desarrollo si se incluye esa capacidad.

## Entrega de fase

Al finalizar:

- actualizar `PROJECT_STATUS.md` a `PHASE_1_WAITING_FOR_MANUAL_ACCEPTANCE`;
- no empezar Fase 2;
- entregar instrucciones de testing manual;
- no hacer commit.
