# Modelo de estado, comandos y eventos

## Objetivo

Formalizar el contrato entre lógica y presentación para que la UI local de hoy y un cliente multiplayer futuro puedan compartir el mismo modelo mental.

## 1. Commands

Un comando expresa una **intención** del actor.

Lista conceptual mínima:

```text
START_GAME
CUT_DECK
PASS
CONFIRM_PLAY
EXCHANGE_CARDS
DECLARE_MOSCA
PLAY_CARD
START_NEXT_HAND
```

`SHUFFLE` y `DEAL` pueden ser transiciones internas automáticas y no necesariamente comandos de usuario.

### Principios

- Commands serializables.
- Incluyen actor cuando corresponde.
- No contienen objetos de UI.
- El motor verifica que el comando sea válido para el estado actual.
- `PLAY_CARD` acepta cualquier carta que realmente pertenezca a la mano del actor, aunque sea reglamentariamente ilegal; el resultado puede ser Palito.

## 2. Events

Un evento expresa un hecho ya ocurrido.

Conjunto mínimo orientativo:

```text
GameStarted
DealerChanged
DeckShuffled
DeckCut
CardDealt
TrumpRevealed
PlayerPassed
CardsExchanged
HandCancelled
MoscaDeclared
CardPlayed
PalitoViolationDetected
ScoreChanged
TrickCompleted
TrickWon
PlayerChupado
HandCompleted
GameEnded
TurnChanged
```

No todos deben ser clases separadas; discriminated unions son apropiadas en TypeScript.

## 3. Orden de eventos

El orden es observable y debe ser determinístico.

Especialmente para una jugada ilegal que completa baza:

```text
CardPlayed
PalitoViolationDetected
ScoreChanged(+50)
TrickCompleted
TrickWon
ScoreChanged(-1)
[GameEnded | TurnChanged]
```

Seguir el orden normativo de `FUNCTIONAL_SPEC.md` si existe mayor detalle.

## 4. State

El estado interno debe permitir responder:

- fase actual;
- dealer/cutter;
- mazo y configuración;
- triunfo;
- cartas por zona;
- jugadores activos/pasados;
- turno actual;
- baza actual;
- historial de bazas;
- puntuación;
- ganador;
- eventos relevantes de mano.

No almacenar datos derivables múltiples veces si pueden desincronizarse sin necesidad.

## 5. View state

La presentación no debe recibir necesariamente todo el estado interno.

### `PlayerViewState`

Debe contener:

- mano propia completa;
- cantidad de cartas de rivales, no sus identidades ocultas;
- cartas públicas jugadas;
- triunfo;
- scores;
- fase y turno;
- opciones/acciones relevantes;
- información pública de infracciones;
- historial público necesario.

### `TableViewState` futuro

Para una pantalla compartida:

- no muestra ninguna mano privada;
- sí muestra mesa, scores, turnos, triunfo y acciones públicas.

## 6. Event queue de presentación

La UI puede mantener una cola separada:

```text
Engine Event Queue → Presentation Adapter → Animation Queue
```

La cola de animación puede agrupar eventos, por ejemplo `TrickWon + ScoreChanged(-1)`, pero nunca cambiar su semántica.

## 7. Input lock visual

Durante animaciones puede bloquearse temporalmente el input humano para evitar acciones superpuestas, pero el lock pertenece a presentación/sesión, no a las reglas.

No confundir:

- “el usuario no puede hacer click durante 300 ms de animación”;
- “el comando es inválido según el estado del juego”.

## 8. Replays y debug

No es requisito del MVP, pero commands/events determinísticos deberían permitir registrar un log de sesión en desarrollo para reproducir bugs.

No construir una UI de replay salvo necesidad futura.
