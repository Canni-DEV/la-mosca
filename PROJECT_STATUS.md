# Estado del proyecto

**Proyecto:** La Mosca  
**Estado actual:** Fase 3R implementada, pendiente de aceptación manual
**Fase habilitada:** Fase 3R — Refactor profesional de presentación
**Próxima acción:** testing manual de la Fase 3R; no iniciar la Fase 4 hasta aprobación explícita

## Estado por fases

| Fase | Estado | Resultado esperado |
|---|---|---|
| 1. Foundation & Rules Engine | ACCEPTED | Monorepo, motor determinístico, protocolo, bot base y playground verificable |
| 2. Playable MVP | ACCEPTED | Partida completa humano vs bots con mesa funcional |
| 3R. Professional Presentation Refactor | WAITING_FOR_MANUAL_ACCEPTANCE | Dirección artística, responsive, accesibilidad, animación y audio profesional |
| 4. Release Candidate | BLOCKED | Hardening, responsive, accesibilidad, performance y GitHub Pages |
| Multiplayer futuro | NOT IN CURRENT SCOPE | Servidor autoritativo, rooms, view states remotos |
| Mobile hand/controller | NOT IN CURRENT SCOPE | Celular asociado al jugador como mano/controlador |

## Fase 1 — cerrado

Aceptada manualmente el 23 de agosto de 2026.

- Monorepo pnpm: `apps/web`, `packages/game-protocol`, `packages/game-core`, `packages/game-ai`
- Motor completo según `FUNCTIONAL_SPEC.md`, RNG sembrado, vistas filtradas y vista debug
- Bot heurístico `STANDARD` y simulación bot-vs-bot
- Playground Svelte + PixiJS mínimo para inspeccionar partidas (sigue disponible como “Mesa de prueba”)

## Fase 2 — cerrado

Aceptada manualmente el 23 de agosto de 2026. Gameplay y reglas OK; sin errores de reglamento.

- Menú, configuración 3/4/5 jugadores, mazo 40/48, cómo jugar, opciones de audio, victoria y revancha
- `LocalGameSession` como frontera: 1 humano + 2–4 bots, sin que la UI decida legalidad
- Mesa Pixi jugable, bots, animación base y audio con mute/volumen
- Palito, Mosca, Chupado y corte de partida al llegar a 0

## Fase 3R — entregado, espera aceptación manual

Refactor de presentación completado sin modificar `game-core`, commands/events, protocolo ni IA:

- identidad editorial setentista con paleta cerrada, Fraunces + Archivo locales, wordmark y fondo original sin sillas fijas;
- `computeTableLayout()` compartido entre Pixi y Svelte con cinco modos cerrados y mínimo oficial 360×640;
- renderer medido con `ResizeObserver`, coordenadas CSS independientes de DPR y HUD de asientos trasladado a DOM;
- mano accesible por teclado, foco visible sincronizado con sprites, `aria-live`, targets de 44 px y cues no dependientes solo de color/audio;
- timeline cancelable con sequence/parallel/stagger, waits sin polling RAF y cancelación al salir;
- mixer persistente general/efectos/ambiente con migración del formato anterior y foley de cartas CC0 local;
- guía responsive con WebP y PDF derivado de 1,54 MiB, preservando los originales;
- pantalla visible de Créditos y lenguaje visual unificado en menú, setup, opciones, guía, salida y victoria.

Verificación automática al cierre: 64 tests verdes, TypeScript/Svelte sin errores y build productivo verde. La validación visual automatizada local quedó impedida por el controlador de navegador del entorno y se mantiene como parte obligatoria del gate manual.

## Regla de avance

El agente puede trabajar con autonomía dentro de la fase activa y resolver decisiones técnicas menores usando la documentación del repositorio.

Debe detenerse al completar una fase grande y entregar:

- qué se implementó;
- cómo ejecutarlo;
- qué verificaciones automáticas realizó;
- checklist de testing manual;
- limitaciones o deuda técnica real encontrada;
- archivos de documentación que haya actualizado.

**No debe avanzar a la fase siguiente hasta que el usuario lo indique explícitamente.**
