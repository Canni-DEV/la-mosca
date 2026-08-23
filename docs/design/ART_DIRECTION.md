# Dirección artística

## 1. Objetivo

La Mosca debe verse como un **videojuego de cartas con identidad argentina**, no como una web con componentes estilizados ni como un casino online.

La referencia conceptual es una mesa de **bar/bodegón argentino**: madera gastada, luz cálida, sobremesa, objetos cotidianos y una sensación de lugar vivido.

La estética debe ser **estilizada y premium**, no fotorrealista, no caricaturesca infantil y no kitsch.

## 2. Escena principal

La mesa ocupa la mayor parte del viewport.

Características:

- madera oscura o media, con vetas y desgaste sutil;
- plano ligeramente perspectivado/top-down para dar profundidad;
- cartas y manos organizadas espacialmente alrededor de la mesa;
- iluminación cálida desde arriba;
- sombras suaves de cartas y objetos;
- bordes del entorno sugeridos, no necesariamente una habitación 3D completa.

## 3. Objetos ambientales

Usar pocos objetos con fuerte identidad, evitando ruido visual.

Ideas apropiadas:

- vaso con fernet y cola sin marca comercial;
- botella o sifón genérico;
- servilletero;
- anotador/lápiz;
- posavasos;
- cenicero vacío o detalle equivalente si encaja con la composición;
- marcas de vasos sobre la madera;
- naipes viejos fuera de juego como decoración mínima.

No todos deben aparecer juntos. Elegir 2–4 elementos por composición.

## 4. Lo que NO debe parecer

Evitar explícitamente:

- mesa verde de poker/casino;
- fichas de casino como sistema principal de puntuación;
- neón;
- UI cyberpunk;
- dorados ostentosos de casino;
- paneles rectangulares tipo dashboard;
- diseño mobile banking;
- skeuomorphism fotográfico pesado;
- estética medieval/fantasy;
- assets de casino genéricos de stock.

## 5. Paleta conceptual

No es necesario fijar hexadecimales rígidos al inicio, pero la paleta debe respetar:

- marrones cálidos de madera;
- crema/marfil de cartas y papel;
- rojo apagado/bordó para énfasis;
- verde botella muy oscuro como acento secundario posible;
- amarillo cálido de iluminación;
- tinta negra/gris carbón para texto.

El color del palo de triunfo puede tener un acento visual, pero no recolorear las cartas.

## 6. Tipografía

Combinar:

- una tipografía display con personalidad para títulos/logotipo;
- una sans legible para controles, scores y tutorial.

La display puede tomar inspiración de cartelería de bar, imprenta o menú tradicional, sin caer en lettering ilegible.

Las fuentes deben poder empaquetarse localmente con licencia apropiada.

## 7. HUD

El HUD debe sentirse integrado a la mesa.

Preferir:

- etiquetas discretas cercanas a cada asiento;
- pequeñas placas, papel/anotador o elementos diegéticos estilizados;
- overlays cortos y contundentes para eventos.

Evitar:

- sidebars permanentes grandes;
- tablas de datos;
- cards UI dentro de cards UI;
- exceso de iconografía SaaS.

## 8. Estado del jugador

Cada asiento debe comunicar:

- nombre;
- score;
- estado: activo/pasó;
- dealer cuando corresponde;
- cantidad de cartas restantes.

La identidad del bot puede representarse con nombre y avatar ilustrado simple, pero no es requisito inicial. Si se usan avatares, mantener estilo coherente y no robar protagonismo a las cartas.

## 9. Triunfo

El triunfo debe ser visible durante toda la mano.

Opciones combinables:

- carta revelada colocada cerca del mazo/dealer;
- pequeño rótulo “Triunfo: Oros”;
- símbolo del palo integrado al HUD.

No usar un banner grande permanente.

## 10. Feedback especial

### Mosca

Debe ser un momento excepcional:

- las cinco cartas se presentan claramente;
- pequeña expansión/abanico;
- iluminación/énfasis breve;
- texto `MOSCA` con personalidad;
- sonido distintivo.

No convertirlo en una animación de 10 segundos.

### Chupado

Feedback con humor moderado:

- `CHUPADO +5`;
- pequeño golpe visual o sello;
- reacción sutil del asiento.

### Saltar el palito

Es el evento más explosivo del feedback regular:

- golpe de carta/mesa;
- texto `¡SALTASTE EL PALITO!`;
- `+50` muy legible;
- breve shake localizado o impacto;
- sonido característico.

No bloquear la partida con un modal.

## 11. Calidad visual mínima

Para considerar la presentación profesional:

- ninguna carta debe verse como placeholder CSS;
- los elementos deben tener estados hover/active coherentes;
- no debe haber saltos de layout durante animaciones;
- escalado y filtros de texturas deben verse limpios;
- sombras/perspectiva deben ser consistentes;
- los textos nunca deben quedar debajo de cartas importantes;
- la mesa debe verse compuesta tanto en 16:9 como en resoluciones desktop estrechas.

## 12. Arte propio y licencias

No copiar logos, etiquetas ni diseño exacto de marcas de bebidas.

No escanear/reproducir literalmente una baraja comercial conocida. Ver `CARD_ASSET_BRIEF.md`.

Registrar procedencia/licencia de cualquier asset externo en un archivo de créditos cuando se incorporen assets reales.
