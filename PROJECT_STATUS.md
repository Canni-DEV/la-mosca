# Estado del proyecto

**Proyecto:** La Mosca  
**Estado actual:** Fase 1 implementada, pendiente de aceptación manual  
**Fase habilitada:** Fase 1 — Foundation & Rules Engine  
**Próxima acción:** testing manual de la Fase 1; no iniciar Fase 2 hasta aprobación explícita

## Estado por fases

| Fase | Estado | Resultado esperado |
|---|---|---|
| 1. Foundation & Rules Engine | PHASE_1_WAITING_FOR_MANUAL_ACCEPTANCE | Monorepo, motor determinístico, protocolo, bot base y playground verificable |
| 2. Playable MVP | BLOCKED | Partida completa humano vs bots con mesa funcional |
| 3. Professional Presentation | BLOCKED | Dirección artística, animación, audio y game feel profesional |
| 4. Release Candidate | BLOCKED | Hardening, responsive, accesibilidad, performance y GitHub Pages |
| Multiplayer futuro | NOT IN CURRENT SCOPE | Servidor autoritativo, rooms, view states remotos |
| Mobile hand/controller | NOT IN CURRENT SCOPE | Celular asociado al jugador como mano/controlador |

## Fase 1 — entregado

- Monorepo pnpm: `apps/web`, `packages/game-protocol`, `packages/game-core`, `packages/game-ai`
- Motor completo según `FUNCTIONAL_SPEC.md`, RNG sembrado, vistas filtradas y vista debug
- Bot heurístico `STANDARD` y simulación bot-vs-bot
- Playground Svelte + PixiJS mínimo para inspeccionar partidas

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
