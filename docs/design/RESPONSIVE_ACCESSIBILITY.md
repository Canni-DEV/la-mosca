# Responsive y accesibilidad

## Estrategia

El viewport mínimo oficial es **360×640**. El futuro modo celular-como-mano es otra funcionalidad y no reemplaza el responsive normal.

La geometría se resuelve con cinco modos cerrados: `desktopWide`, `desktopCompact`, `tablet`, `mobileLandscape` y `mobilePortrait`. Pixi y Svelte reciben los mismos anchors desde `computeTableLayout()`.

## Desktop

Target principal:

- 16:9 y resoluciones desktop comunes;
- soportar ventanas no maximizadas razonables;
- la mano humana puede ocupar el borde inferior;
- rivales distribuidos alrededor de la mesa.

## Tablet

- conservar mesa completa;
- reducir elementos ambientales antes que cartas/HUD;
- permitir touch con targets cómodos.

## Móvil

El juego single-player debe poder abrirse y jugarse, aunque la composición sea más compacta.

Prioridades:

1. cartas propias legibles;
2. centro de baza visible;
3. scores y turno;
4. triunfo;
5. decoración.

En pantallas pequeñas, decoración puede ocultarse.

## Orientación

- No depender exclusivamente de landscape.
- No se bloquea portrait ni se exige rotación.
- Si portrait requiere una composición distinta, resolverlo mediante layout adaptativo, no escalando todo hasta ilegibilidad.

## Touch

- Nunca depender de hover para una acción necesaria.
- Targets táctiles suficientemente grandes.
- Doble tap para “paso” es gesto alternativo, no único control.

## Reduced motion

Respetar `prefers-reduced-motion`:

- reducir vuelos largos;
- eliminar shakes;
- acortar transiciones;
- mantener feedback de estado.

## Color y texto

- No comunicar legal/ilegal únicamente por color.
- Mantener contraste legible.
- Score y textos críticos deben poder leerse sin zoom.

## Teclado

- la mano tiene un grupo DOM accesible sincronizado con Pixi;
- izquierda/derecha, Home y End cambian la carta activa;
- Enter/Espacio juega o selecciona;
- intercambio informa `aria-pressed`;
- el foco DOM dibuja énfasis visible sobre el sprite correspondiente.

Turno, triunfo, salida y scores se anuncian mediante `aria-live`. Palito, Mosca, Chupado y victoria conservan feedback textual además del audio.

## Audio

Todo cue sonoro importante debe tener equivalente visual.
