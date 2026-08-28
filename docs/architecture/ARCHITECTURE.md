# Arquitectura objetivo

## 1. Objetivo arquitectónico

La implementación inicial es single-player y local, pero el diseño debe permitir que el mismo motor de reglas se ejecute en un servidor autoritativo en el futuro sin reescribir la lógica del juego.

La arquitectura debe separar estrictamente:

1. reglas;
2. protocolo de comandos/eventos;
3. IA;
4. sesión de juego;
5. presentación web;
6. animación/audio.

## 2. Stack aprobado

- **Language:** TypeScript.
- **Package manager / monorepo:** pnpm workspaces.
- **Web shell:** Svelte.
- **Build:** Vite.
- **Rendering de mesa:** PixiJS 8.
- **Renderer inicial:** WebGL estable mediante PixiJS; no depender de WebGPU para el MVP.
- **Testing:** runner compatible con TypeScript/Vite; preferentemente Vitest salvo motivo concreto documentado.
- **Backend:** ninguno en el MVP.
- **Deploy:** build estático en GitHub Pages.

## 3. Diagrama conceptual

```text
┌─────────────────────────────────────────────────────────┐
│                    apps/web                             │
│                                                         │
│  Svelte shell / menus / HUD      PixiJS game table      │
│               │                         │               │
│               └─────────┬───────────────┘               │
│                         │                               │
│                    GameSession                          │
│                         │                               │
│                 LocalGameSession                       │
└─────────────────────────┼───────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
      packages/game-ai       packages/game-core
              │                       │
              └───────────┬───────────┘
                          │
                 packages/game-protocol
```

Futuro:

```text
apps/web ── RemoteGameSession ── WebSocket ── apps/server
                                              │
                                         game-core
```

## 4. `game-core`

Biblioteca TypeScript pura. Es la autoridad sobre las reglas.

Debe contener como mínimo:

- modelos de dominio;
- configuración de mazo;
- generación/barajado/corte/reparto;
- máquina de estados;
- evaluación de jugadas legales;
- procesamiento de comandos;
- generación de eventos;
- cálculo de ganador de baza;
- puntuación;
- Mosca;
- chupado;
- salto del palito;
- finalización de mano/partida;
- RNG inyectable/determinístico.

### Prohibido en `game-core`

No importar:

- Svelte;
- PixiJS;
- DOM;
- `window`;
- `document`;
- WebSocket;
- APIs HTTP;
- almacenamiento local;
- audio;
- timers de animación;
- implementación de bot.

El motor debe poder ejecutarse en Node sin browser.

## 5. `game-protocol`

Define contratos compartidos y estables:

- `GameCommand`;
- `GameEvent`;
- IDs y DTOs necesarios;
- `GameViewState`;
- `PlayerViewState`;
- `TableViewState` futuro;
- tipos serializables para transporte futuro.

No debe contener lógica de reglas.

Los tipos del protocolo deben evitar referencias a objetos gráficos o clases no serializables.

## 6. `game-ai`

Contiene bots y estrategias.

Un bot:

- observa únicamente la vista/información que un jugador legítimo podría conocer;
- consulta acciones legales mediante APIs del motor/sesión;
- decide un comando;
- nunca muta el estado directamente;
- utiliza exactamente la misma vía de comandos que el humano.

La IA inicial está definida en `docs/ai/BOT_SPECIFICATION.md`.

## 7. `apps/web`

Responsabilidades:

- navegación y pantallas;
- configuración de partida;
- instancia de `LocalGameSession`;
- render de HUD;
- escena PixiJS;
- animaciones;
- input de mouse/touch;
- sonido;
- opciones locales;
- tutorial/cómo jugar;
- build estático.

### Frontera de presentación de mesa

- `TableScreen` mide el host con `ResizeObserver`, coalescea cambios en un RAF y es dueño de `TableLayout`.
- `computeTableLayout()` trabaja siempre en píxeles CSS y produce los anchors compartidos.
- Pixi conserva fondo/mesa, cartas/manos, stock/triunfo público, bazas, props y efectos.
- Svelte conserva placas, turno, palos, acciones, ayudas y semántica accesible.
- `resolution`/DPR sólo mejora nitidez; nunca cambia coordenadas lógicas.
- `PixiTable.sync(PlayerViewState)` puede reconstruir toda la escena después de cancelar una animación.

No debe recalcular reglas de cartas por su cuenta.

La UI puede consultar información derivada para presentación, pero la decisión normativa siempre proviene del motor.

## 8. `GameSession`

La UI habla con una abstracción de sesión, no directamente con estructuras internas del motor.

Interfaz conceptual:

```ts
interface GameSession {
  getViewState(): GameViewState;
  dispatch(command: GameCommand): Promise<CommandResult>;
  subscribe(listener: (event: GameEvent) => void): Unsubscribe;
}
```

La forma exacta puede adaptarse, pero debe conservar estas capacidades:

- snapshot de vista;
- envío de intención/comando;
- stream de eventos;
- posibilidad de cambiar implementación local por remota.

### `LocalGameSession`

MVP:

- ejecuta `game-core` dentro del navegador;
- orquesta turnos de bots;
- produce eventos para la UI;
- no requiere red.

### `RemoteGameSession`

Futuro:

- misma interfaz pública;
- envía comandos al servidor;
- recibe snapshots/eventos;
- no contiene autoridad de reglas.

No implementarlo en el MVP.

## 9. Comandos, eventos y estado

Principio:

```text
Input humano/bot
      ↓
   Command
      ↓
 Game Engine
      ↓
New State + Events
      ↓
 Presentation
```

Una animación nunca debe ser condición para que el motor determine el siguiente estado.

## 10. Animación desacoplada

El motor puede resolver una acción inmediatamente. La UI reproduce después la secuencia correspondiente.

Ejemplo:

```text
PLAY_CARD
  ↓
CardPlayed
PalitoViolationDetected (si aplica)
ScoreChanged +50 (si aplica)
TrickWon (si completa la baza)
ScoreChanged -1
TurnChanged / GameEnded
```

La capa visual consume esos eventos en orden y puede tardar varios cientos de milisegundos en representarlos.

### Regla crítica

No hacer:

```text
animar carta → callback → modificar game state
```

Hacer:

```text
modificar estado → emitir evento → animar representación
```

`PresentationTimeline.run(clips, signal)` es la única vía de secuenciación. La composición ofrece `sequence`, `parallel`, `stagger` y waits cancelables sin polling RAF persistente.

## 11. RNG y determinismo

Barajado y cualquier decisión aleatoria del bot deben aceptar una fuente de aleatoriedad inyectable o seed.

Objetivos:

- tests reproducibles;
- reproducción de bugs;
- simulaciones masivas;
- futuro replay/debug.

No usar `Math.random()` disperso por el dominio.

## 12. Identidad de cartas y jugadores

Usar IDs estables.

Una carta debe poder identificarse inequívocamente durante toda una mano aunque cambie de zona.

Ejemplo conceptual:

```text
cardId = OROS_1
playerId = P1
```

No usar posición de array como identidad persistente.

## 13. Estado privado vs estado de vista

Aunque el MVP sea local, diseñar desde el principio una separación entre:

- estado interno completo;
- vista autorizada del jugador;
- vista pública de mesa.

Esto evita que el futuro multiplayer exponga manos rivales por accidente.

No hace falta construir red ahora, pero sí evitar que los componentes gráficos dependan de acceder a `GameState` completo.

## 14. Persistencia

No existe persistencia normativa del MVP.

Puede guardarse configuración no sensible en `localStorage` si aporta UX, por ejemplo volumen. No persistir partidas a mitad de juego salvo que una fase futura lo requiera.

## 15. Errores

Distinguir:

- `invalid command`: acción imposible para el estado actual;
- `illegal card play`: jugada permitida por diseño que produce Palito;
- error técnico inesperado.

**Una carta ilegal según el reglamento NO es un error de validación del comando.** Es una acción válida del producto con consecuencia `+50`.

## 16. Performance

La Mosca no requiere optimización extrema. Prioridades:

- 60 FPS razonables en animaciones en hardware moderno;
- evitar re-renderizar toda la escena por cambios pequeños;
- precargar assets esenciales antes de entrar a la mesa;
- destruir listeners/texturas/escenas al abandonar una partida;
- renderer y layout medidos desde el host, no sólo desde `window`;
- ocultar habitación/props antes de reducir cartas críticas;
- no introducir ECS ni arquitectura de engine compleja sin necesidad.

## 17. Seguridad del alcance

No agregar por anticipación:

- DI containers complejos;
- CQRS framework;
- event sourcing persistente;
- microservicios;
- backend;
- base de datos;
- autenticación;
- infraestructura cloud.

Commands/events son un patrón interno simple, no una excusa para sobreingeniería.
