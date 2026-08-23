# Especificación del bot inicial

## 1. Objetivo

El bot del MVP existe para:

- permitir jugar y probar La Mosca sin otros humanos;
- ejercer todos los caminos del motor;
- ofrecer una oposición razonable;
- mantener un ritmo natural.

No necesita ser experto.

## 2. Restricciones

El bot NO debe:

- acceder a cartas ocultas de rivales;
- inspeccionar el futuro del mazo;
- mutar `GameState` directamente;
- usar reglas distintas a las del humano;
- usar ML, LLM o servicios externos;
- hacer búsqueda exhaustiva costosa.

Debe emitir exactamente los mismos `GameCommand` que un jugador humano.

## 3. Determinismo

Cualquier desempate aleatorio debe usar RNG inyectable/seeded.

Con el mismo estado observable y seed, el bot debe tomar la misma decisión.

## 4. Nivel inicial

Implementar un único nivel: `STANDARD` o equivalente.

No crear Easy/Hard hasta que exista una necesidad de producto.

## 5. Información observable

Puede conocer:

- sus cartas;
- triunfo;
- cartas públicas ya jugadas;
- score de todos;
- quién pasó;
- bazas ganadas;
- fase/turno;
- cantidad de cartas de cada jugador;
- eventos públicos de Palito/Mosca.

No conoce cartas en manos rivales.

## 6. Decisión de pasar

Solo evaluar si pasar está permitido.

El dealer nunca pasa.

Heurística base:

El bot **juega** si cumple al menos una:

1. tiene al menos una carta de triunfo;
2. tiene al menos dos cartas de rango fuerte entre `{1, 3, 12}` aunque no sean triunfo;
3. está obligado a jugar por regla.

Si ninguna se cumple, **pasa**.

Esta regla es deliberadamente sencilla y estable.

## 7. Decisión de intercambio

Si el cambio está permitido:

### Cartas a conservar

Conservar siempre:

- cualquier triunfo;
- cualquier `1`;
- cualquier `3`;
- cualquier `12`.

Si después de conservar esas cartas quedan más de tres candidatas a descartar, ordenar por menor valor estratégico y cambiar como máximo 3.

### Valor estratégico simple

Para ordenar descartes:

1. triunfo: nunca descartarlo;
2. rank 1;
3. rank 3;
4. rank 12;
5. rank 11;
6. rank 10;
7. resto según fuerza de la baraja.

Dentro de cartas no triunfo, descartar primero las de menor fuerza.

### Mosca

No necesita una lógica especial compleja: como todos los triunfos se conservan y se cambian cartas débiles, naturalmente puede mejorar hacia Mosca.

## 8. Declaración de Mosca

Si el estado habilita declaración y la mano cumple exactamente la condición normativa, declarar Mosca inmediatamente.

No ocultarla ni seguir jugando.

## 9. Elección de carta

El bot debe pedir al motor el conjunto de cartas legalmente obligatorias.

El bot base **nunca salta el palito deliberadamente**.

### Si es líder de baza

Regla base:

1. si tiene cartas no triunfo, jugar la carta no triunfo de mayor fuerza;
2. si solo tiene triunfos, jugar el triunfo de menor fuerza.

Objetivo: abrir con amenaza sin gastar triunfo innecesariamente.

### Si sigue una baza y puede ganar

Debido a la regla de obligación, el conjunto legal ya contendrá cartas que superan al ganador actual.

Jugar la **carta legal de menor fuerza que igualmente gana**.

Objetivo: conservar cartas superiores.

### Si sigue una baza y no puede ganar

Jugar la **carta legal de menor fuerza estratégica**.

Si está obligado a triunfo pero ninguno gana, jugar el triunfo más bajo.

Si tiene libertad total, descartar la carta no triunfo más baja; si todas son triunfo, el triunfo más bajo.

## 10. Timing de presentación

La decisión del bot puede ser instantánea en lógica.

`apps/web` agrega una espera visual aproximada de 250–700 ms antes de representar el comando, sin bloquear el motor con timers internos.

## 11. Tests importantes del bot

Probar al menos:

- nunca pasa cuando está prohibido;
- dealer nunca pasa;
- nunca elige una carta fuera del conjunto legal;
- declara Mosca;
- cambia como máximo 3;
- conserva carta de triunfo revelada si fuera dealer (en realidad el motor ni debe permitir intercambiarla);
- misma seed + mismo estado => misma decisión.

No hace falta testear cada combinación estratégica posible.
