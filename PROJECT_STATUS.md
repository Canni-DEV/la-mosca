# Estado del proyecto

**Proyecto:** La Mosca  
**Estado actual:** Fase 2 implementada, pendiente de aceptación manual  
**Fase habilitada:** Fase 2 — Playable MVP  
**Próxima acción:** testing manual de la Fase 2; no iniciar Fase 3 hasta aprobación explícita

## Estado por fases

| Fase | Estado | Resultado esperado |
|---|---|---|
| 1. Foundation & Rules Engine | ACCEPTED | Monorepo, motor determinístico, protocolo, bot base y playground verificable |
| 2. Playable MVP | PHASE_2_WAITING_FOR_MANUAL_ACCEPTANCE | Partida completa humano vs bots con mesa funcional |
| 3. Professional Presentation | BLOCKED | Dirección artística, animación, audio y game feel profesional |
| 4. Release Candidate | BLOCKED | Hardening, responsive, accesibilidad, performance y GitHub Pages |
| Multiplayer futuro | NOT IN CURRENT SCOPE | Servidor autoritativo, rooms, view states remotos |
| Mobile hand/controller | NOT IN CURRENT SCOPE | Celular asociado al jugador como mano/controlador |

## Fase 1 — cerrado

Aceptada manualmente el 23 de agosto de 2026.

- Monorepo pnpm: `apps/web`, `packages/game-protocol`, `packages/game-core`, `packages/game-ai`
- Motor completo según `FUNCTIONAL_SPEC.md`, RNG sembrado, vistas filtradas y vista debug
- Bot heurístico `STANDARD` y simulación bot-vs-bot
- Playground Svelte + PixiJS mínimo para inspeccionar partidas (sigue disponible como “Mesa de prueba”)

## Fase 2 — entregado

- Menú, configuración 3/4/5 jugadores, mazo 40/48, cómo jugar, opciones de audio, victoria y revancha
- `LocalGameSession` como frontera: 1 humano + 2–4 bots, sin que la UI decida legalidad
- Mesa Pixi funcional: asientos, mazo, triunfo, baza, montoncitos, mano humana, dorsos rivales y scores
- Paso (botón y doble toque), cambio 0–3, jugar cualquier carta propia, Palito, Mosca, Chupado y corte de partida al llegar a 0
- Animación base de reparto, triunfo, jugadas, recolecta, paso, cambio, scores, Palito, Mosca y victoria
- Mixer de audio con mute/volumen persistente y SFX procedurales

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
