# Fase 3R — Professional Presentation Refactor

**Estado:** `IN_PROGRESS` — consolidación visual reabierta el 1 de septiembre de 2026.

La implementación funcional de esta fase incluye el layout compartido Pixi/Svelte, los cinco modos responsive, la mano accesible por teclado, timeline cancelable, mixer de tres buses y sistema artístico editorial. La aceptación visual se reabrió porque el fondo y la superficie Pixi muestran dos mesas incompatibles. La Fase 4 continúa bloqueada hasta una nueva aprobación explícita.

## Precondición

Fase 2 aceptada manualmente.

## Objetivo

Llevar el MVP funcional al nivel visual/sonoro de un juego web con identidad propia.

## Dirección artística

Aplicar `docs/design/ART_DIRECTION.md` de forma integral.

La mesa debe evocar un bodegón/bar argentino de manera estilizada:

- madera;
- luz cálida;
- fernet con cola genérico como detalle ambiental permitido;
- objetos de sobremesa seleccionados;
- HUD integrado.

No usar marcas comerciales.

## Baraja

Aplicar `docs/design/CARD_ASSET_BRIEF.md`.

Resultado esperado:

- baraja española tradicional reconocible;
- fronts consistentes 1–12;
- reverso propio;
- alta legibilidad;
- assets locales y optimizados.

## Game feel

Refinar todos los timings y transiciones según `GAME_FEEL_AND_ANIMATION.md`.

Prioridades:

- reparto satisfactorio;
- cartas con peso;
- colección de baza clara;
- Palito impactante;
- Mosca memorable;
- score changes legibles;
- ritmo rápido entre bots.

## Audio

Refinar:

- variaciones de cartas;
- toc toc de Paso;
- ambiente sutil;
- Palito;
- Mosca;
- victoria.

Evitar saturación.

## Tutorial

Implementar `Cómo jugar` usable desde menú.

Además, durante primera partida pueden aparecer ayudas contextuales discretas para:

- triunfo;
- cambio;
- seguir palo;
- superar;
- Palito.

No obligar a recorrer un tutorial largo antes de jugar.

## Responsive

Validar desktop, tablet y móvil según `RESPONSIVE_ACCESSIBILITY.md`.

Reducir decoración antes que legibilidad de cartas.

## Criterios de aceptación visual

- [ ] La primera impresión es de videojuego, no de app web.
- [ ] Identidad de bodegón argentino evidente sin texto explicativo.
- [ ] No existen placeholders visuales notorios.
- [ ] Baraja consistente y tradicional.
- [ ] Animaciones no dificultan lectura del estado.
- [ ] Palito/Mosca/Chupado tienen feedback diferenciado.
- [ ] Audio tiene variedad suficiente para no cansar rápidamente.
- [ ] UI funciona en viewport desktop y móvil razonable.
- [ ] `prefers-reduced-motion` reduce efectos fuertes.

## Calidad técnica

No sacrificar separación arquitectónica por animaciones. Si un efecto requiere que Pixi modifique reglas, rediseñar el efecto.

## Cierre

Actualizar `PROJECT_STATUS.md` y detenerse para testing manual.
