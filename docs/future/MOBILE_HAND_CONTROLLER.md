# Futuro — celular como mano/controlador

**Estado:** fuera del MVP, pero es un objetivo arquitectónico explícito.

## 1. Experiencia

Una pantalla grande (PC/TV) muestra la mesa compartida. Cada jugador puede abrir una URL/QR en su celular y ver exclusivamente sus cartas.

```text
Pantalla principal
┌───────────────────────────────────────┐
│               LA MESA                 │
│   jugadores, triunfo, scores, baza    │
│   sin revelar manos privadas          │
└───────────────────────────────────────┘

Celular del jugador
┌───────────────────────┐
│ Tus cartas            │
│ [ ] [ ] [ ] [ ] [ ]   │
│ Tu turno / acciones   │
└───────────────────────┘
```

## 2. Modelo de identidad

Un **Player** puede tener más de un cliente asociado.

```text
Player
 ├─ TABLE/DESKTOP client
 └─ HAND client (mobile)
```

El celular no es otro jugador.

## 3. Roles de cliente futuros

Prever conceptos equivalentes a:

- `PLAYER`: experiencia completa normal;
- `TABLE`: vista pública sin manos;
- `HAND_CONTROLLER`: mano privada y controles del jugador.

No hace falta introducir enums vacíos en el código si todavía no aportan valor, pero `ViewState` no debe asumir que toda pantalla puede ver la mano.

## 4. Emparejamiento

Flujo futuro sugerido:

1. crear mesa en desktop;
2. mostrar QR/código;
3. móvil abre URL;
4. servidor vincula dispositivo con seat/player mediante token corto/seguro;
5. móvil recibe `PlayerHandView`;
6. desktop recibe `TableViewState`.

## 5. Transporte

Usar la misma conexión WebSocket del multiplayer.

Evitar conexión peer-to-peer directa teléfono-PC en primera versión. Un servidor de sesión simplifica NAT, sincronización y seguridad.

## 6. Latencia

No requiere latencia de juego de acción. Objetivo de interacción percibida rápida (< cientos de ms en condiciones normales) es suficiente.

## 7. Animación coordinada

Cuando el móvil juega una carta:

1. móvil envía `PLAY_CARD`;
2. servidor procesa;
3. mesa recibe `CardPlayed`;
4. la pantalla grande anima la carta desde el asiento hacia el centro;
5. móvil actualiza su mano.

La carta no debe “volar” físicamente entre pantallas; ambas representan el mismo evento.

## 8. Privacidad

La pantalla compartida jamás debe recibir IDs de cartas ocultas. Ni siquiera si no los renderiza.

Esta restricción debe guiar el diseño de view states desde el MVP.
