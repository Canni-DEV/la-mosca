# La Mosca

Repositorio base de documentación y reglas de agente para desarrollar **La Mosca — variante Las Parejas** como videojuego web.

La Fase 3R está implementada y espera aceptación manual. La partida single-player contra bots sigue siendo el camino principal; la Fase 4 no debe comenzar hasta la aprobación explícita del gate.

## Cómo correr la app

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```

La app queda en `http://localhost:5173`.

Los derivados de arte se regeneran sin tocar los originales con `apps/web/scripts/prepare-assets.py` (requiere Pillow).

Desde el menú: **Jugar** abre una partida humano vs bots. **Mesa de prueba** conserva el playground de la Fase 1 (todos bots).


## Visión rápida

- Juego web 2D con aspecto de videojuego, no de aplicación web convencional.
- Single-player inicial contra bots heurísticos.
- Svelte + Vite + TypeScript para la aplicación.
- PixiJS 8 para la mesa, cartas, efectos y animaciones.
- `game-core` en TypeScript puro, independiente de UI, red e IA.
- Arquitectura basada en sesiones, comandos y eventos.
- Deploy inicial 100 % estático en GitHub Pages.
- Preparado para multiplayer autoritativo y para usar un celular como mano/controlador en una etapa futura.
- Dirección artística inspirada en un **bar/bodegón argentino**, con mesa de madera, luz cálida, baraja española tradicional y pequeños detalles de sobremesa.

## Por dónde empezar

1. Leer [`PROJECT_STATUS.md`](PROJECT_STATUS.md).
2. Leer [`AGENTS.md`](AGENTS.md).
3. Consultar [`docs/INDEX.md`](docs/INDEX.md) para el mapa completo de documentación.
4. Para implementar, seguir [`docs/development/ROADMAP.md`](docs/development/ROADMAP.md).
5. La primera entrega está definida en [`docs/development/phases/PHASE_01_FOUNDATION_ENGINE.md`](docs/development/phases/PHASE_01_FOUNDATION_ENGINE.md).

## Fuente de verdad de las reglas

Las reglas del juego no deben inferirse ni reinterpretarse.

- Reglamento para personas: [`docs/game/RULES.md`](docs/game/RULES.md)
- Especificación normativa para implementación: [`docs/game/FUNCTIONAL_SPEC.md`](docs/game/FUNCTIONAL_SPEC.md)

Ante cualquier contradicción sobre lógica de juego, **`FUNCTIONAL_SPEC.md` tiene prioridad**.

## Primer prompt recomendado en Cursor

Podés copiar el contenido de [`START_PROMPT.md`](START_PROMPT.md) o simplemente indicar:

> Implementá la Fase 1 siguiendo toda la documentación y las reglas del repositorio. No avances a la Fase 2. Al terminar, dejá la fase lista para mi testing manual y presentame un resumen verificable de lo implementado.

## Git

El agente **no debe crear commits, hacer push, crear ramas ni modificar el historial Git**. El propietario del repositorio controla esas acciones manualmente.
