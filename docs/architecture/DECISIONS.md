# Registro de decisiones arquitectónicas

Este archivo registra decisiones durables. No hace falta crear un ADR separado para cada detalle menor.

## D-001 — Web SPA estática

**Decisión:** el MVP es una SPA compilada a archivos estáticos y desplegable en GitHub Pages.

**Razón:** alcance mínimo, costo operativo nulo y ausencia de necesidades de servidor en single-player.

## D-002 — Svelte + Vite + TypeScript

**Decisión:** shell/UI con Svelte y Vite, TypeScript como lenguaje único del frontend y paquetes de dominio.

## D-003 — PixiJS 8 para la mesa

**Decisión:** la mesa, cartas y efectos principales se renderizan con PixiJS. Svelte se usa para shell, menús, HUD y overlays.

**Razón:** lograr sensación de videojuego, control preciso de sprites/animaciones y evitar una mesa construida como colección de `div`.

## D-004 — WebGL como target estable inicial

**Decisión:** usar el renderer estable soportado por PixiJS sin hacer de WebGPU un requisito del MVP.

**Razón:** compatibilidad y ausencia de necesidad técnica que justifique forzar WebGPU.

## D-005 — `game-core` puro

**Decisión:** toda la lógica normativa vive en TypeScript puro sin dependencias de UI, browser, red o bots.

## D-006 — Sesión intercambiable

**Decisión:** la presentación habla con `GameSession`; el MVP implementa `LocalGameSession`. Un futuro multiplayer podrá implementar `RemoteGameSession`.

## D-007 — Commands + events, sin event sourcing

**Decisión:** usar commands/events como frontera interna y fuente de animaciones. No persistir un event store ni introducir framework CQRS.

## D-008 — Bot heurístico

**Decisión:** IA local determinística/heurística suficiente para probar el juego. Sin ML, LLM ni servicios externos.

## D-009 — Palito permitido por input

**Decisión:** una carta reglamentariamente ilegal sigue siendo clickeable/jugable. El motor detecta y penaliza. No deshabilitar automáticamente todas las cartas ilegales.

## D-010 — Dirección artística bodegón argentino

**Decisión:** identidad cálida y estilizada inspirada en bar/bodegón argentino, con mesa gastada y objetos de sobremesa. Evitar casino genérico.

## D-011 — Baraja española tradicional, arte propio

**Decisión:** conservar composición y legibilidad tradicional de la baraja española, pero usar arte original o assets con licencia clara; no copiar/scannear una baraja comercial protegida.

## D-012 — Audio desde el comienzo

**Decisión:** el vertical slice debe integrar infraestructura de audio temprano; no postergar todo el sonido al final.

## D-013 — Git controlado por el usuario

**Decisión:** el agente nunca hace commits/push/branching por iniciativa propia.

## D-014 — Testing proporcional al riesgo

**Decisión:** tests exhaustivos para reglas críticas, selectivos para IA e integración y poco testing unitario de detalles visuales. No existe objetivo de coverage porcentual.

## D-015 — Fases con aprobación manual

**Decisión:** el agente entrega una fase grande completa y se detiene para testing manual antes de la siguiente.

## D-016 — Primer dealer y corte digital

**Decisión:** el primer dealer es el jugador indicado en `START_GAME.firstDealerPlayerId`, o el primero de la lista. El corte es un comando con índice 1..n-1; los bots eligen ese índice con RNG sembrado.

**Razón:** la spec deja el primer dealer fuera del reglamento. El corte digital conserva dos grupos no vacíos y la autoridad del orden final del mazo.

## D-017 — Mosca automática y siguiente mano explícita

**Decisión:** el motor detecta y resuelve Mosca al cerrar las decisiones; no existe comando `DECLARE_MOSCA`. Tras `HAND_COMPLETE` hace falta `START_NEXT_HAND` para rotar dealer e iniciar la siguiente mano.

**Razón:** FUNCTIONAL_SPEC §22 hace la detección automática. El comando explícito permite inspeccionar el fin de mano en el playground y en tests.

## D-018 — Corte automático en el MVP jugable

**Decisión:** en la partida humano vs bots el corte digital se ejecuta automáticamente (también si el humano es el que corta). El índice se elige con el RNG de sesión, no con un control de UI.

**Razón:** el corte conserva dos grupos no vacíos y la atribución del cutter, pero no es una decisión estratégica en mesa digital. Evita un control extra sin cambiar las reglas.

**Consecuencias relevantes:** el playground sigue pudiendo avanzar el corte paso a paso. No existe comando de corte manual en la UI de Fase 2.

## D-019 — Humano fijo en `p1` / asiento inferior

**Decisión:** el jugador humano es siempre `p1`, se sienta abajo y el primer dealer de la partida es ese asiento. Los bots ocupan el resto de asientos, en sentido horario.

**Razón:** simplifica vista filtrada, input y layout Pixi sin perder rotación de dealer entre manos.

## D-020 — Cartas y SFX procedurales en Fase 2

**Decisión:** las cartas españolas y los SFX del MVP jugable se generan en el cliente (canvas + Web Audio), empaquetados con el build, sin assets comerciales ni fetches remotos.

**Razón:** identidad reconocible y licencia clara sin bloquear la fase por un set ilustrado final. La Fase 3 puede reemplazarlos por arte de mayor fidelidad.

## Cómo agregar una decisión

Agregar:

```text
## D-XXX — Título
Decisión:
Razón:
Consecuencias relevantes:
```

Registrar solo decisiones con impacto futuro real.
