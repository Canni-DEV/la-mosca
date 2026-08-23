# Responsive y accesibilidad

## Estrategia

El MVP es **desktop-first**, pero debe ser usable en tablet y móvil desde el comienzo. El futuro modo celular-como-mano es otra funcionalidad y no reemplaza el responsive normal.

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
- Puede recomendarse landscape para experiencia ideal si es necesario.
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

No hace falta convertir todo el juego en una experiencia keyboard-first en la primera fase, pero los menús Svelte deben usar elementos semánticos y controles accesibles. En la fase release, agregar navegación razonable de acciones principales si es viable.

## Audio

Todo cue sonoro importante debe tener equivalente visual.
