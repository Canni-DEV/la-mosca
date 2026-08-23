# Estado del proyecto

**Proyecto:** La Mosca  
**Estado actual:** Fase 3 implementada, pendiente de aceptación manual  
**Fase habilitada:** Fase 3 — Professional Presentation  
**Próxima acción:** testing manual de la Fase 3; no iniciar la Fase 4 hasta aprobación explícita

## Estado por fases

| Fase | Estado | Resultado esperado |
|---|---|---|
| 1. Foundation & Rules Engine | ACCEPTED | Monorepo, motor determinístico, protocolo, bot base y playground verificable |
| 2. Playable MVP | ACCEPTED | Partida completa humano vs bots con mesa funcional |
| 3. Professional Presentation | PHASE_3_WAITING_FOR_MANUAL_ACCEPTANCE | Dirección artística, animación, audio y game feel profesional |
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

## Fase 3 — entregado, espera aceptación manual

Identidad de bodegón, mesa redonda, baraja española ilustrada local, mazo/triunfo a la derecha del dealer, props en imagen, HUD/tutorial/hints, animación/audio refinados y `prefers-reduced-motion`. `game-core` no se tocó.

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
