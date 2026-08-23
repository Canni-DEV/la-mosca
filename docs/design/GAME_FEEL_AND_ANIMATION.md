# Game feel y animación

## Objetivo

Las reglas son por turnos, pero la presentación no debe sentirse estática. Cada acción importante debe tener una respuesta visual y sonora breve.

## Principios

1. **Legibilidad antes que espectáculo.** Siempre debe entenderse qué carta se jugó y quién ganó.
2. **Ritmo ágil.** Evitar esperas artificiales largas.
3. **Peso físico.** Las cartas aceleran/desaceleran, rotan apenas y proyectan sombra.
4. **Imperfección controlada.** Pequeñas variaciones de posición/rotación hacen la mesa natural.
5. **Motor primero.** La animación representa eventos ya resueltos.

## Sistema de animación

Crear una capa/servicio de presentación que pueda secuenciar eventos y devolver cuándo finalizó la representación, sin modificar reglas.

Debe soportar:

- ejecución secuencial;
- eventos visuales que pueden correr en paralelo;
- skip/aceleración futura;
- cancelación segura al salir de la partida;
- `prefers-reduced-motion`.

## Animaciones mínimas

### Barajar

- breve mezcla del mazo;
- no simular físicamente 40–48 cartas una por una si resulta lento;
- duración objetivo aproximada: 500–900 ms.

### Cortar

- separar parte del mazo y recombinar;
- 300–500 ms.

### Repartir

- cartas salen desde mazo/dealer hacia cada asiento de una en una;
- mantener orden de reparto real;
- stagger aproximado 70–130 ms por carta;
- la última del dealer debe diferenciarse al revelarse.

### Revelar triunfo

- flip legible;
- pequeño hold para reconocer palo;
- actualización del HUD sincronizada visualmente.

### Selección de carta

- hover: elevar 8–16 px equivalentes o escalar apenas;
- seleccionada para intercambio: desplazamiento/marca clara;
- touch: mismo estado sin depender de hover.

### Jugar carta

- movimiento desde asiento/mano al centro;
- pequeña rotación coherente con origen;
- 180–320 ms;
- sonido de carta al finalizar.

### Resolver baza

- pausa corta después de última carta: 200–400 ms;
- destacar ganador;
- recoger las cartas hacia su montoncito;
- score `-1` aparece cercano al jugador.

### Pasar

Gesto alternativo de doble golpe:

- pequeña vibración/feedback en zona propia;
- dos sonidos `toc toc`;
- etiqueta `PASO` breve;
- cartas del jugador se retiran/atenúan.

### Cambiar cartas

- cartas seleccionadas se deslizan al descarte;
- nuevas cartas llegan del mazo;
- preservar clara relación cantidad sale = cantidad entra.

### Palito

Secuencia recomendada:

1. carta aterriza normalmente;
2. impacto breve;
3. `¡SALTASTE EL PALITO!`;
4. `+50` en score;
5. continuar la resolución de la baza.

No revertir la carta.

### Mosca

- mostrar las cinco cartas en abanico o fila protagonista;
- texto `MOSCA`;
- `-5`;
- si produce victoria, transicionar directamente al final después de este feedback.

### Chupado

Al fin normal de mano:

- mostrar `CHUPADO +5` en cada jugador afectado;
- puede resolverse secuencial o en paralelo si sigue siendo legible.

## Ritmo de bots

Bots no deben jugar instantáneamente después de que termina una animación.

Rango sugerido:

- 250–700 ms de “respiración” antes de su acción;
- variar levemente usando RNG de presentación, no RNG del motor;
- nunca demorar varios segundos sin necesidad.

## Cámara/escena

No se necesita cámara 3D real.

Se permiten:

- leve zoom de entrada;
- parallax muy sutil;
- shake localizado para Palito;
- énfasis sobre zona central.

Evitar movimientos de cámara que mareen o escondan cartas.

## Animaciones y estado

La UI debe poder reconstruirse desde `GameViewState` aunque una animación falle. Nunca almacenar la única copia de una carta dentro de un sprite sin correspondencia con estado lógico.
