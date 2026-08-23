# Multiplayer futuro — arquitectura prevista

**Estado:** fuera del alcance del MVP. Este documento existe para evitar decisiones actuales que vuelvan costosa la evolución.

## 1. Modelo

El multiplayer debe ser **server authoritative**.

```text
Client A ─┐
Client B ─┼── WebSocket ── Game Room Server ── game-core
Client C ─┘
```

Los clientes envían comandos. El servidor valida/ejecuta y distribuye vistas/eventos.

## 2. No confiar en el cliente

El servidor debe ser autoridad sobre:

- mazo;
- shuffle;
- manos;
- turnos;
- legalidad/Palito;
- scores;
- Mosca;
- condición de victoria.

Un cliente nunca informa “gané la baza” ni “mi score es X”.

## 3. Transporte

WebSocket es suficiente y preferido para primeras versiones.

No introducir WebRTC inicialmente.

Un framework de rooms autoritativas como Colyseus puede evaluarse cuando se implemente la fase, pero no es una dependencia del MVP actual.

## 4. Rooms

Una room representa una partida aislada.

Conceptualmente:

```text
Room
- roomId / joinCode
- game instance
- seats
- connected clients
- session ownership
- state/view synchronization
```

## 5. Información privada

El servidor mantiene `GameState` completo.

Cada cliente recibe solo su vista autorizada.

Nunca serializar el estado completo al navegador y “ocultar” cartas con CSS.

## 6. Invitaciones

Primera versión futura sugerida:

- crear mesa;
- obtener código corto/URL;
- compartir;
- entrar como invitado;
- elegir asiento disponible;
- comenzar cuando hay suficientes jugadores.

No se requieren cuentas para un primer multiplayer casual.

## 7. Bots mixtos

La arquitectura debe permitir en el futuro:

- humano + humano + bots;
- reemplazo temporal por bot si un jugador abandona, si se decide como política.

No definir todavía reglas de desconexión: son producto/red, no reglas tradicionales.

## 8. Reconexión

Cuando se implemente multiplayer, definir tokens efímeros de sesión y recuperación de vista. No construirlo ahora.

## 9. Anti-cheat

Separar view state desde el MVP reduce exposición. El servidor futuro además debe:

- ignorar comandos fuera de turno;
- verificar ownership de cartas;
- registrar Palito según el estado real;
- no aceptar scores del cliente.

## 10. Compatibilidad del motor

El mismo `game-core` del single-player debe poder ejecutarse en Node/servidor.

Si para multiplayer es necesario reescribir reglas que hoy están dentro de Svelte/Pixi, la arquitectura del MVP se considera fallida.
