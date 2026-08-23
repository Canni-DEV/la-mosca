# Product Vision — La Mosca

## Producto

**La Mosca** es una adaptación digital de la variante tradicional jugada en Las Parejas y alrededores. El objetivo no es producir una simulación de casino genérica, sino preservar una experiencia social y cultural reconocible: baraja española, sobremesa, picardía, ritmo de ronda y expresiones propias del juego.

## Propuesta de valor

El jugador debe poder abrir la web y sentir que está jugando una partida real en una mesa de bodegón argentino, aunque los rivales iniciales sean bots.

El proyecto prioriza:

1. fidelidad absoluta a las reglas documentadas;
2. claridad suficiente para que alguien que nunca jugó pueda aprender;
3. presentación visual y sonora de videojuego;
4. feedback inmediato y satisfactorio de cada acción;
5. arquitectura reutilizable para multiplayer futuro;
6. deploy simple y barato como aplicación estática.

## Pilares

### 1. Game first

La mesa es el centro. Menús, paneles y controles existen para servir al juego. Evitar una apariencia de dashboard, SaaS o sitio de cartas.

### 2. Identidad local

La estética toma referencias de un bar/bodegón argentino: madera usada, iluminación cálida, objetos de sobremesa y una atmósfera cotidiana. No usar estética Las Vegas, poker online, neón o casino premium.

### 3. Cartas reconocibles

La baraja debe leerse inmediatamente como española tradicional. La interpretación artística puede ser propia, pero no debe convertirla en una baraja abstracta o de fantasía.

### 4. Movimiento y tactilidad

Repartir, tirar, recoger y revelar cartas deben sentirse físicos. El jugador debe percibir peso, velocidad, fricción y pequeñas imperfecciones controladas.

### 5. Reglas transparentes

El juego permite incluso una jugada ilegal para conservar la mecánica de “saltar el palito”, pero siempre informa la infracción y aplica la penalización exacta.

### 6. Arquitectura preparada, alcance controlado

El MVP no tendrá backend ni multiplayer. Sin embargo, el motor no puede acoplarse al navegador ni a una partida local de forma que impida agregar un servidor autoritativo después.

## Experiencia objetivo

Una partida típica debe transmitir:

- expectativa cuando se revela el triunfo;
- decisión al pasar o cambiar cartas;
- tensión al decidir qué carta jugar;
- satisfacción al encadenar bazas;
- humor/impacto cuando alguien “salta el palito”;
- un momento especial cuando aparece una Mosca;
- cierre inmediato y contundente cuando alguien llega a 0.

## Métrica cualitativa principal

Una persona que conozca el juego físico debería poder decir:

> “Sí, esto es La Mosca que jugábamos nosotros.”

Y una persona que nunca lo jugó debería entender qué hacer sin tener que leer código, reglas externas ni recibir explicaciones del desarrollador.
