# La Mosca — Especificación funcional

**Variante Las Parejas**  
**Versión funcional:** 1.0  
**Fecha:** 23 de agosto de 2026  
**Estado:** Reglas base cerradas

---

## 1. Propósito del documento

Este documento define el comportamiento funcional completo del motor de juego de **La Mosca — variante Las Parejas**.

Su objetivo es que un equipo de desarrollo, un agente de programación o una implementación automatizada pueda construir el juego **sin inventar reglas de juego, prioridades, condiciones de puntuación ni resoluciones de casos borde**.

Este documento no prescribe un lenguaje de programación, framework, motor gráfico, protocolo de red ni arquitectura técnica concreta.

Cuando una decisión de producto no forma parte de las reglas tradicionales —por ejemplo temporizadores de turno, reconexión, bots, matchmaking o monetización— se considera fuera del alcance del motor de reglas y no debe inferirse como una regla de La Mosca.

---

# PARTE I — MODELO DEL JUEGO

## 2. Jerarquía conceptual

El juego se compone de:

```text
Partida
 ├─ Jugadores
 ├─ Configuración de mazo
 ├─ Puntuaciones
 └─ Manos sucesivas
     ├─ Reparto
     ├─ Triunfo
     ├─ Pase / cambios
     ├─ Posible Mosca
     └─ Hasta 5 vueltas
         └─ Una carta por jugador activo
```

---

## 3. Entidades funcionales

### 3.1. Player

Representa a un participante de la partida.

Campos funcionales mínimos:

```text
Player
- id
- seatIndex
- score
- isDealer
- isActiveInHand
- hasPassed
- handCards[]
- tricksWonInCurrentHand
```

Reglas:

- `score` inicia en 20.
- `seatIndex` no cambia durante la partida.
- el orden de juego se resuelve siempre hacia la derecha utilizando los asientos.
- solamente un jugador puede ser repartidor en cada mano.

---

### 3.2. Card

```text
Card
- suit
- rank
```

Valores de `suit`:

```text
OROS
COPAS
ESPADAS
BASTOS
```

Valores posibles de `rank`:

- mazo de 40: `1,2,3,4,5,6,7,10,11,12`
- mazo de 48: `1,2,3,4,5,6,7,8,9,10,11,12`

No existe rango 13.

---

### 3.3. DeckConfiguration

Valores válidos:

```text
TRADITIONAL_40
FULL_48
```

#### TRADITIONAL_40

- 40 cartas.
- excluye 8 y 9.
- permitido con 3, 4 o 5 jugadores.
- configuración predeterminada para 3 a 5 jugadores.

#### FULL_48

- 48 cartas.
- incluye rangos 1 a 12.
- permitido con 3, 4, 5 o 6 jugadores.
- obligatorio con 6 jugadores.

Configuraciones inválidas:

```text
6 jugadores + TRADITIONAL_40 => INVALID
menos de 3 jugadores => INVALID
más de 6 jugadores => INVALID
```

---

### 3.4. Hand

Una mano representa un reparto completo.

Campos funcionales mínimos:

```text
Hand
- number
- dealerPlayerId
- cutterPlayerId
- trumpSuit
- revealedTrumpCard
- activePlayerIds[]
- passedPlayerIds[]
- exchangeDiscardPile[]
- undealtPile[]
- tricks[]
- status
```

---

### 3.5. Trick

```text
Trick
- number           // 1..5
- leaderPlayerId
- leadSuit
- plays[]
- winnerPlayerId
- status
```

---

### 3.6. CardPlay

```text
CardPlay
- playerId
- card
- playOrder
- wasLegal
- legalCardsAtMomentOfPlay[]
- infractionId? 
```

Registrar `legalCardsAtMomentOfPlay` permite auditoría y reproducción determinística del salto del palito.

---

### 3.7. ScoreEvent

Toda modificación de puntuación debe representarse como un evento independiente.

```text
ScoreEvent
- playerId
- type
- delta
- scoreBefore
- scoreAfter
- handNumber
- trickNumber?
- sourceId?
```

Tipos obligatorios:

```text
TRICK_WON       delta = -1
MOSCA           delta = -5
CHUPADO         delta = +5
PALITO          delta = +50
```

No debe modificarse la puntuación sin generar el evento correspondiente.

---

# PARTE II — CONSTANTES Y JERARQUÍAS

## 4. Puntuación inicial

```text
INITIAL_SCORE = 20
```

Condición de victoria:

```text
score <= 0
```

La victoria es inmediata y termina toda la partida.

---

## 5. Jerarquía de cartas

### 5.1. Mazo de 48

Orden de mayor a menor:

```text
1, 3, 12, 11, 10, 9, 8, 7, 6, 5, 4, 2
```

### 5.2. Mazo de 40

Orden de mayor a menor:

```text
1, 3, 12, 11, 10, 7, 6, 5, 4, 2
```

Debe existir una función conceptual única:

```text
cardStrength(rank, deckConfiguration) -> integer
```

La implementación nunca debe comparar los números naturales de las cartas para decidir cuál gana.

Ejemplo:

```text
strength(1)  > strength(3)
strength(3)  > strength(12)
strength(12) > strength(11)
...
strength(4)  > strength(2)
```

---

# PARTE III — MÁQUINA DE ESTADOS

## 6. Estados de una partida

Estados funcionales recomendados y exhaustivos:

```text
LOBBY
GAME_INITIALIZING
HAND_SHUFFLE
HAND_CUT
HAND_DEAL
TRUMP_REVEALED
PLAYER_DECISIONS
HAND_CANCELLED
MOSCA_CHECK
TRICK_PLAY
HAND_END_SCORING
HAND_COMPLETE
GAME_OVER
```

La nomenclatura concreta puede cambiar en código, pero la implementación debe respetar estas transiciones lógicas.

---

## 7. Flujo general

```text
LOBBY
  ↓
GAME_INITIALIZING
  ↓
HAND_SHUFFLE
  ↓
HAND_CUT
  ↓
HAND_DEAL
  ↓
TRUMP_REVEALED
  ↓
PLAYER_DECISIONS
  ├─ activeCount < 2 → HAND_CANCELLED → HAND_COMPLETE
  └─ activeCount >= 2 → MOSCA_CHECK
                         ├─ Mosca → resolver Mosca
                         │           ├─ ganador → GAME_OVER
                         │           └─ sin ganador → HAND_COMPLETE
                         └─ sin Mosca → TRICK_PLAY
                                        ├─ ganador de partida → GAME_OVER
                                        └─ después de vuelta 5 → HAND_END_SCORING
                                                               ↓
                                                         HAND_COMPLETE
                                                               ↓
                                                        siguiente mano
```

---

# PARTE IV — PREPARACIÓN Y REPARTO

## 8. Inicio de partida

Al comenzar una partida:

1. validar cantidad de jugadores;
2. validar configuración de mazo;
3. asignar asientos en un orden circular fijo;
4. asignar `score = 20` a todos;
5. seleccionar el primer repartidor según el mecanismo de sala/producto;
6. iniciar la primera mano.

La regla de juego no prescribe cómo se elige al primer repartidor. Debe ser una decisión previa de producto o de sala y no debe afectar las reglas posteriores.

Una vez elegido, la rotación sí queda completamente definida.

---

## 9. Rotación de repartidor y cortador

Para una mano `H`:

```text
dealer = repartidor actual
cutter = jugador inmediatamente a la izquierda del dealer
```

Para la siguiente mano:

```text
nextDealer = jugador inmediatamente a la derecha del dealer actual
```

Consecuencia:

```text
el dealer anterior es el jugador inmediatamente a la izquierda del nuevo dealer
```

por lo que se convierte naturalmente en el cortador de la siguiente mano.

---

## 10. Mezcla

Cada mano comienza utilizando **la totalidad de las cartas del mazo configurado**.

Antes de repartir deben reincorporarse:

- cartas de manos de jugadores;
- descartes de cambios;
- cartas de jugadores que pasaron;
- cartas capturadas en vueltas;
- cartas no repartidas.

No existe persistencia de cartas entre manos.

El mazo se mezcla completamente antes del corte.

---

## 11. Corte

El jugador situado a la izquierda del repartidor realiza el corte.

Desde el punto de vista lógico, cortar significa:

1. dividir el mazo ya mezclado en dos grupos no vacíos;
2. colocar el grupo inferior por delante del superior.

En una implementación digital el servidor o autoridad de partida debe conservar la responsabilidad sobre el orden final del mazo.

La animación o gesto usado para representar el corte no modifica las reglas.

---

## 12. Reparto determinístico

Se reparten 5 rondas de una carta por jugador.

En cada ronda:

1. recibe una carta el jugador a la derecha del repartidor;
2. continúa cada asiento hacia la derecha;
3. el repartidor recibe la última carta de la ronda.

Después de cinco rondas:

```text
cardsPerPlayer = 5
```

La carta número 5 del repartidor es simultáneamente:

- la última carta entregada del reparto;
- `revealedTrumpCard`;
- una carta real de la mano del repartidor.

Debe mostrarse públicamente antes de continuar.

```text
trumpSuit = revealedTrumpCard.suit
```

La carta no se retira de la mano del repartidor.

---

# PARTE V — REGLAS DEL TRIUNFO REVELADO

## 13. Caso de triunfo con rango 1

Condición:

```text
revealedTrumpCard.rank == 1
```

Efectos:

```text
canPass(any player) = false
canExchange(nonDealer) = true
canExchange(dealer) = true, excepto revealedTrumpCard
maxExchangeCards = 3
```

Todos los jugadores son activos.

---

## 14. Caso de triunfo con rango 2

Condición:

```text
revealedTrumpCard.rank == 2
```

Efectos:

```text
canPass(any player) = false
canExchange(any player) = false
```

Todos juegan exactamente las cinco cartas del reparto original.

---

## 15. Resto de los rangos

Condición:

```text
revealedTrumpCard.rank != 1
AND revealedTrumpCard.rank != 2
```

Efectos:

```text
canPass(dealer) = false
canPass(nonDealer) = true
canExchange(active players) = true
maxExchangeCards = 3
```

El repartidor no puede incluir `revealedTrumpCard` entre las cartas a cambiar.

---

# PARTE VI — PASE Y CAMBIO

## 16. Orden de decisiones

La fase se procesa jugador por jugador hacia la derecha.

El primer jugador consultado es el jugador situado inmediatamente a la derecha del repartidor.

Se continúa alrededor de la mesa y el repartidor resuelve su cambio al final.

Para cada no repartidor cuando pasar está permitido, las acciones válidas son:

```text
PASS
PLAY_AND_EXCHANGE_0
PLAY_AND_EXCHANGE_1
PLAY_AND_EXCHANGE_2
PLAY_AND_EXCHANGE_3
```

Para el repartidor:

```text
PLAY_AND_EXCHANGE_0..3
```

salvo en una mano con 2 revelado, donde no existe intercambio.

---

## 17. Semántica de PASS

Al ejecutar `PASS`:

```text
player.isActiveInHand = false
player.hasPassed = true
```

Sus cinco cartas:

- dejan de estar disponibles para ese jugador;
- no se reutilizan durante la mano actual;
- no pueden entrar en el montón de reemplazo;
- se reincorporan al mazo recién al comenzar la siguiente mano.

El jugador:

- no recibe cartas nuevas;
- no participa de vueltas;
- no puede recibir −1 por vuelta;
- no puede recibir +5 por chupado;
- no puede cometer salto del palito;
- no participa del +5 producido por una Mosca de otro jugador.

Su puntuación permanece sin cambios durante esa mano.

---

## 18. Semántica de cambio

Si un jugador solicita `N` cartas:

```text
N ∈ {0,1,2,3}
```

Si `N > 0`:

1. el jugador selecciona exactamente N cartas válidas de su mano;
2. las cartas seleccionadas pasan a `exchangeDiscardPile`;
3. se toman exactamente N cartas desde el tope de `undealtPile`;
4. se agregan a su mano;
5. su mano vuelve a contener exactamente 5 cartas.

El cambio de un jugador debe completarse antes de comenzar el del siguiente.

Las cartas descartadas **no pueden volver al mazo de robo durante esa mano**.

---

## 19. Restricción del repartidor durante el cambio

La carta `revealedTrumpCard` está bloqueada como opción de descarte.

El repartidor puede cambiar hasta 3 de las otras 4 cartas.

La restricción debe aplicarse por identidad de carta, no solamente por rango y palo.

---

## 20. Disponibilidad de cartas

Las configuraciones permitidas garantizan matemáticamente la disponibilidad máxima de cartas para los cambios.

### 5 jugadores + mazo de 40

```text
25 repartidas
15 restantes
máximo 5 × 3 = 15 reemplazos
```

### 6 jugadores + mazo de 48

```text
30 repartidas
18 restantes
máximo 6 × 3 = 18 reemplazos
```

Por lo tanto:

- no se deben reciclar descartes para completar cambios;
- no se necesita una regla de “mazo agotado” dentro de configuraciones válidas.

---

## 21. Cancelación por insuficiencia de activos

Después de procesar las decisiones:

```text
activeCount = count(player.isActiveInHand == true)
```

Si:

```text
activeCount < 2
```

la mano se cancela.

Consecuencias:

```text
no tricks
no Mosca resolution
no chupado
no score changes
rotate dealer
start next hand
```

No se concede una victoria automática al único activo.

Con las reglas actuales, el único jugador restante normalmente será el repartidor, ya que él no puede pasar.

---

# PARTE VII — MOSCA

## 22. Momento de detección

La Mosca se verifica:

1. después de que todos los jugadores hayan terminado sus decisiones y cambios;
2. después de confirmar que existen al menos 2 jugadores activos;
3. antes de iniciar la primera vuelta.

No se verifica antes de los cambios.

---

## 23. Condición exacta de Mosca

Para un jugador activo:

```text
handCards.count == 5
AND every card.suit == trumpSuit
AND ranks(handCards) == {1,3,12,11,10}
```

No existe ninguna otra combinación que sea Mosca.

Los 8 y 9 no afectan esta condición.

Un jugador que pasó no puede tener Mosca a efectos de la mano.

Por unicidad de las cartas, dos jugadores no pueden tener Mosca simultáneamente.

---

## 24. Resolución de Mosca

Cuando existe Mosca:

1. revelar públicamente las cinco cartas;
2. generar `ScoreEvent(MOSCA, -5)` para su propietario;
3. verificar condición de victoria inmediatamente.

### 24.1. Si score <= 0

```text
GAME_OVER
winner = moscaPlayer
```

No se generan eventos `CHUPADO` para los demás.

### 24.2. Si score > 0

Por cada otro jugador activo:

```text
ScoreEvent(CHUPADO, +5)
```

Los jugadores que pasaron se ignoran.

Después:

```text
HAND_COMPLETE
```

No se crean vueltas.

---

# PARTE VIII — VUELTAS

## 25. Cantidad de vueltas

Una mano normal contiene exactamente:

```text
5 tricks
```

Cada jugador activo comienza las vueltas con 5 cartas y juega exactamente una carta en cada vuelta mientras la partida no haya terminado anticipadamente.

---

## 26. Líder de la primera vuelta

El líder es:

```text
firstActivePlayerToRightOf(dealer)
```

Los jugadores que pasaron se omiten.

Como una mano válida tiene al menos dos activos, este jugador siempre existe.

---

## 27. Líder de vueltas posteriores

Para `trickNumber > 1`:

```text
leader = previousTrick.winnerPlayerId
```

---

## 28. Orden dentro de una vuelta

1. el líder juega primero;
2. se continúa hacia la derecha;
3. se omiten jugadores que pasaron;
4. cada activo juega exactamente una carta;
5. la vuelta se resuelve cuando todos los activos jugaron.

El líder puede abrir con **cualquier carta de su mano**.

La carta del líder define:

```text
leadSuit = leaderCard.suit
```

---

# PARTE IX — MOTOR DE LEGALIDAD DE JUGADAS

## 29. Principio general

El motor debe poder calcular, para cada turno:

```text
legalCards = getLegalCards(playerHand, trickPlays, trumpSuit, deckConfiguration)
```

Sin embargo, la interfaz **no debe impedir jugar una carta que esté fuera de `legalCards`**.

La diferencia se utiliza para detectar salto del palito.

---

## 30. Líder de vuelta

Si todavía no existe ninguna carta en la vuelta:

```text
legalCards = playerHand
```

El líder puede jugar cualquier carta.

No existe obligación de abrir con triunfo, con carta alta ni con una carta que maximice sus posibilidades.

---

## 31. Obtener el ganador actual

Para cualquier turno posterior al primero debe calcularse:

```text
currentWinningPlay = getCurrentWinningPlay(trickPlays, leadSuit, trumpSuit)
```

La obligación de “superar” siempre se refiere a **la carta que actualmente gana la vuelta**, no a la carta jugada inmediatamente antes.

---

## 32. Prioridad 1 — Palo de salida

Definir:

```text
leadCards = cards in playerHand where suit == leadSuit
```

Si:

```text
leadCards is not empty
```

el jugador **debe jugar palo de salida**.

No puede utilizar triunfo ni otro palo.

### 32.1. Si el ganador actual NO es triunfo

Entonces el ganador actual pertenece al palo de salida.

Calcular:

```text
beatingLeadCards = leadCards that beat currentWinningPlay.card
```

Si `beatingLeadCards` no está vacío:

```text
legalCards = beatingLeadCards
```

El jugador está obligado a superar.

Si `beatingLeadCards` está vacío:

```text
legalCards = leadCards
```

### 32.2. Si el ganador actual ES triunfo

Una carta del palo de salida no puede vencer a un triunfo.

Por lo tanto:

```text
legalCards = leadCards
```

No existe obligación de superar porque es imposible hacerlo respetando la prioridad de palo.

---

## 33. Prioridad 2 — Triunfo

Esta regla solamente se evalúa si:

```text
leadCards is empty
```

Definir:

```text
trumpCards = cards in playerHand where suit == trumpSuit
```

Si `trumpCards` no está vacío, el jugador debe jugar triunfo.

### 33.1. Si el ganador actual no es triunfo

Cualquier triunfo lo vence.

Por lo tanto:

```text
legalCards = trumpCards
```

El jugador puede elegir cualquier triunfo.

No está obligado a utilizar el triunfo más fuerte.

### 33.2. Si el ganador actual es triunfo

Calcular:

```text
beatingTrumpCards = trumpCards that beat currentWinningPlay.card
```

Si no está vacío:

```text
legalCards = beatingTrumpCards
```

Si está vacío:

```text
legalCards = trumpCards
```

---

## 34. Prioridad 3 — Libertad total

Si:

```text
leadCards is empty
AND trumpCards is empty
```

entonces:

```text
legalCards = playerHand
```

Puede jugar cualquier carta.

---

## 35. Pseudocódigo normativo de getLegalCards

```text
function getLegalCards(hand, trick, trumpSuit):
    if trick.plays is empty:
        return hand

    leadSuit = trick.plays[0].card.suit
    currentWinner = getCurrentWinningPlay(trick.plays, leadSuit, trumpSuit)

    leadCards = hand.filter(card => card.suit == leadSuit)

    if leadCards is not empty:
        if currentWinner.card.suit == trumpSuit and trumpSuit != leadSuit:
            return leadCards

        beatingLeadCards = leadCards.filter(card =>
            compareSameSuit(card, currentWinner.card) > 0
        )

        if beatingLeadCards is not empty:
            return beatingLeadCards

        return leadCards

    trumpCards = hand.filter(card => card.suit == trumpSuit)

    if trumpCards is not empty:
        if currentWinner.card.suit != trumpSuit:
            return trumpCards

        beatingTrumpCards = trumpCards.filter(card =>
            compareSameSuit(card, currentWinner.card) > 0
        )

        if beatingTrumpCards is not empty:
            return beatingTrumpCards

        return trumpCards

    return hand
```

Nota: si `leadSuit == trumpSuit`, la prioridad de palo y la de triunfo representan el mismo conjunto. El primer bloque ya resuelve correctamente el caso.

---

# PARTE X — GANADOR DE UNA VUELTA

## 36. Comparación entre dos cartas jugadas

Para determinar el ganador de una vuelta, se aplica esta prioridad:

1. triunfo;
2. palo de salida;
3. jerarquía interna del palo.

Una carta que no sea ni triunfo ni palo de salida nunca puede ganar.

---

## 37. Algoritmo normativo de ganador

Dada la lista de jugadas en orden:

```text
winner = first play

for each candidate after first:
    winner = betterPlay(winner, candidate, leadSuit, trumpSuit)

return winner
```

Función conceptual:

```text
function betterPlay(current, candidate, leadSuit, trumpSuit):

    currentIsTrump = current.card.suit == trumpSuit
    candidateIsTrump = candidate.card.suit == trumpSuit

    if candidateIsTrump and not currentIsTrump:
        return candidate

    if currentIsTrump and not candidateIsTrump:
        return current

    if candidateIsTrump and currentIsTrump:
        return strongerSameSuit(current, candidate)

    currentIsLead = current.card.suit == leadSuit
    candidateIsLead = candidate.card.suit == leadSuit

    if candidateIsLead and not currentIsLead:
        return candidate

    if currentIsLead and not candidateIsLead:
        return current

    if candidateIsLead and currentIsLead:
        return strongerSameSuit(current, candidate)

    return current
```

Cuando ambas cartas son irrelevantes —ni triunfo ni palo de salida— ninguna desplaza a la carta ganadora actual.

---

# PARTE XI — SALTO DEL PALITO

## 38. Regla funcional

Cuando un jugador selecciona una carta:

```text
selectedCard ∈ player.handCards
```

se calcula primero `legalCards` utilizando el estado **anterior a retirar la carta de la mano**.

Entonces:

```text
wasLegal = selectedCard ∈ legalCards
```

### Si wasLegal == true

No existe infracción.

### Si wasLegal == false

Se produce un salto del palito.

---

## 39. Libertad de cometer la infracción

El motor **debe aceptar la carta seleccionada aunque sea ilegal**.

No debe:

- rechazarla;
- devolverla automáticamente a la mano;
- reemplazarla por otra carta;
- obligar al jugador a seleccionar una carta legal.

La carta se juega definitivamente.

Esto es una regla funcional deliberada para conservar la mecánica tradicional de salto del palito.

---

## 40. Penalización

Por cada carta ilegal jugada:

```text
ScoreEvent(PALITO, +50)
```

La penalización se genera una vez por jugada ilegal, aunque la misma jugada haya violado más de una condición conceptual.

Ejemplo:

Una carta concreta puede al mismo tiempo:

- no seguir el palo;
- no utilizar triunfo;
- evitar una carta ganadora.

Sigue siendo **una jugada ilegal = un único +50**.

Una segunda jugada ilegal posterior genera otro +50.

---

## 41. Orden temporal obligatorio

El orden de procesamiento de una jugada es:

```text
1. calcular legalCards
2. aceptar selectedCard
3. retirar selectedCard de la mano
4. agregarla a la vuelta
5. detectar wasLegal
6. si es ilegal → aplicar +50 inmediatamente
7. anunciar/registrar la infracción
8. si todavía faltan jugadores → continuar turno
9. si la vuelta está completa → resolver ganador
10. aplicar −1 al ganador
11. verificar victoria
```

Este orden es normativo.

Razón: un jugador no puede ganar la partida con una vuelta obtenida mediante una jugada ilegal antes de recibir el +50 correspondiente.

---

## 42. Efecto de la carta ilegal

Una carta ilegal sigue siendo una carta real de la vuelta.

Después de aplicar la penalización:

- conserva su palo;
- conserva su fuerza;
- puede convertirse en ganadora;
- puede modificar cuál es la carta ganadora para jugadores posteriores.

No se recalcula la vuelta como si esa carta no existiera.

---

## 43. Información pública de la infracción

Una implementación digital debe poder anunciar inmediatamente:

```text
<Jugador> saltó el palito: +50
```

El evento debe quedar en el historial de la mano.

No se requiere un mecanismo de denuncia entre jugadores para que la penalización sea válida, porque el motor conoce la mano real del jugador.

---

# PARTE XII — RESOLUCIÓN Y PUNTUACIÓN DE VUELTAS

## 44. Cierre de una vuelta

La vuelta se considera completa cuando todos los jugadores activos han jugado exactamente una carta.

Entonces:

1. determinar `winnerPlayerId`;
2. asignar todas las cartas de la vuelta a su historial/montón de bazas ganadas;
3. incrementar:

```text
winner.tricksWonInCurrentHand += 1
```

4. generar:

```text
ScoreEvent(TRICK_WON, -1)
```

5. comprobar victoria.

---

## 45. Victoria tras una vuelta

Después del `TRICK_WON`:

```text
if winner.score <= 0:
    GAME_OVER
```

No deben ejecutarse:

- vueltas restantes;
- chupados;
- rotación a otra mano.

La partida termina de forma abrupta en ese punto.

---

## 46. Siguiente vuelta

Si no existe ganador de partida y todavía no se jugaron cinco vueltas:

```text
nextTrick.leaderPlayerId = currentTrick.winnerPlayerId
```

Los jugadores conservan las cartas restantes en mano.

---

# PARTE XIII — CHUPADO Y FIN DE MANO

## 47. Condición de chupado

La evaluación de chupado ocurre únicamente si:

```text
5 tricks completed
AND game is not over
```

Para cada jugador activo:

```text
if tricksWonInCurrentHand == 0:
    ScoreEvent(CHUPADO, +5)
```

No se aplica a jugadores pasados.

---

## 48. Independencia de penalizaciones

Un jugador puede simultáneamente:

- haber saltado el palito una o más veces;
- no haber ganado ninguna vuelta;
- quedar chupado.

En ese caso recibe todos los eventos correspondientes.

Ejemplo:

```text
score inicial = 20
1 salto = +50 → 70
0 vueltas ganadas → +5 → 75
```

No existe compensación ni exclusión entre PALITO y CHUPADO.

---

## 49. Fin normal de mano

Después de aplicar todos los `CHUPADO`:

```text
status = HAND_COMPLETE
```

Luego:

1. reunir el mazo completo;
2. rotar repartidor a la derecha;
3. comenzar una nueva mano.

---

# PARTE XIV — VISIBILIDAD Y AUDITORÍA

## 50. Información privada

Durante una mano, las cartas todavía no jugadas de cada jugador son privadas para ese jugador.

Un jugador no debe conocer:

- cartas privadas de otros jugadores;
- cartas que todavía permanecen sin repartir.

---

## 51. Información pública

Debe ser pública para todos:

- repartidor actual;
- jugador que corta;
- carta revelada del repartidor;
- palo de triunfo;
- jugadores que pasaron;
- cantidad de cartas cambiadas por cada jugador;
- cartas jugadas en las vueltas;
- ganador de cada vuelta;
- puntuación actual de todos;
- saltos del palito detectados;
- Mosca y sus cinco cartas reveladas.

Las cartas concretas descartadas durante el cambio no necesitan ser públicas durante la mano.

---

## 52. Historial de cartas jugadas

Toda carta que fue jugada en una vuelta pasa a ser información pública y debe permanecer auditable durante el resto de la mano.

Funcionalmente debe poder reconstruirse:

```text
qué jugador jugó qué carta
en qué vuelta
en qué orden
quién ganó la vuelta
si cada jugada fue legal o no
```

La interfaz puede representar esto mediante montones, historial o revisión de vueltas.

---

# PARTE XV — EVENTOS FUNCIONALES

## 53. Eventos mínimos del motor

Una implementación orientada a eventos debería poder representar, como mínimo:

```text
GameStarted
HandStarted
DeckShuffled
DeckCut
CardDealt
TrumpRevealed
PlayerPassed
PlayerStayed
CardsExchangeRequested
CardsDiscarded
CardsDrawn
HandCancelled
MoscaDetected
MoscaRevealed
TrickStarted
CardPlayed
PalitoDetected
ScoreChanged
TrickCompleted
PlayerChupado
HandCompleted
DealerRotated
GameWon
GameEnded
```

No es obligatorio utilizar estos nombres exactos, pero ninguna transición funcional equivalente debe perderse.

---

# PARTE XVI — INVARIANTES DEL MOTOR

## 54. Invariantes de cartas

En todo momento:

```text
cada carta física/lógica existe en un único lugar
```

Posibles ubicaciones:

- mazo sin repartir;
- mano de un jugador;
- descarte de cambio;
- cartas de jugador pasado;
- vuelta actual;
- historial/montón de bazas ganadas.

Nunca debe duplicarse una carta.

La suma de todas las ubicaciones debe equivaler exactamente a 40 o 48 cartas según configuración.

---

## 55. Invariantes de mano

Antes de las vueltas:

```text
cada jugador activo tiene 5 cartas
```

Después de `k` vueltas completas:

```text
cada jugador activo tiene 5-k cartas
```

Un jugador pasado juega 0 cartas durante toda la mano.

---

## 56. Invariantes de vuelta

Una vuelta completa contiene exactamente:

```text
activePlayerCount cartas
```

Cada jugador activo aparece exactamente una vez.

---

## 57. Invariantes de puntuación

La puntuación solamente puede cambiar mediante:

```text
TRICK_WON  -1
MOSCA      -5
CHUPADO    +5
PALITO     +50
```

No existen otros modificadores en la versión 1.0.

---

# PARTE XVII — CASOS BORDE NORMATIVOS

## 58. Todos pasan salvo el repartidor

Resultado:

```text
HAND_CANCELLED
0 score changes
rotate dealer
```

No hay victoria automática.

---

## 59. Quedan exactamente dos activos

La mano es válida.

Se juegan cinco vueltas mano a mano con las mismas reglas.

---

## 60. El jugador a la derecha del dealer pasó

La primera vuelta la abre el siguiente jugador activo continuando hacia la derecha.

---

## 61. La salida es triunfo

Si el líder abre con triunfo:

```text
leadSuit == trumpSuit
```

Para los demás jugadores:

- si tienen triunfo, deben jugar triunfo;
- si pueden superar el triunfo ganador, deben hacerlo;
- si no pueden superarlo, pueden jugar cualquier triunfo;
- si no tienen triunfo, pueden jugar cualquier carta.

No existe una segunda obligación distinta porque palo de salida y triunfo son el mismo palo.

---

## 62. Un jugador tiene palo de salida y triunfo

Debe priorizar siempre el palo de salida.

No puede cortar con triunfo mientras tenga una carta del palo de salida.

---

## 63. Un triunfo ya está ganando y el jugador todavía tiene palo de salida

Debe jugar palo de salida.

No está obligado ni autorizado por las reglas a abandonar ese palo para superar con triunfo.

Como el triunfo ya gana, cualquiera de sus cartas del palo de salida es legal.

---

## 64. Puede superar con varias cartas

Si existen varias cartas legales que vencen al ganador actual, puede elegir cualquiera de ellas.

No existe obligación de:

- usar la más baja que alcance;
- usar la más alta;
- conservar una determinada carta.

La única obligación es que la carta elegida pertenezca al conjunto de cartas que efectivamente supera respetando la prioridad de palo.

---

## 65. No puede superar

Si respeta el palo obligatorio pero ninguna carta puede ganar, puede elegir libremente dentro de ese palo obligatorio.

---

## 66. Una carta ilegal gana la vuelta

Es posible.

Orden:

1. +50 al infractor;
2. la carta permanece;
3. se completa la vuelta;
4. si esa carta sigue siendo la mejor, el infractor gana la vuelta;
5. recibe −1;
6. se verifica victoria después del −1.

---

## 67. El infractor estaba a un punto de ganar

Ejemplo:

```text
score = 1
juega ilegalmente una carta que ganará
```

Resultado:

```text
+50 → 51
−1 por la vuelta → 50
```

No gana.

---

## 68. Un jugador llega a cero en la quinta vuelta

La partida termina inmediatamente después del −1.

No se aplican chupados, aunque la quinta vuelta haya completado físicamente las cinco vueltas de la mano.

La condición de victoria tiene prioridad sobre `HAND_END_SCORING`.

---

## 69. Mosca lleva a cero o menos

Aplicar −5 y terminar la partida inmediatamente.

No aplicar +5 a los demás activos.

---

## 70. Mosca no produce victoria

Aplicar −5 al jugador Mosca y +5 a cada otro jugador activo.

Luego terminar la mano.

---

## 71. Jugador pasado ante Mosca

No recibe +5.

Su puntuación permanece sin cambios.

---

## 72. Múltiples saltos del palito

Cada `CardPlay` ilegal produce un `PALITO +50` independiente.

No existe límite por mano ni por partida.

---

## 73. Mazo agotado después de cambios

Es válido que el mazo sin repartir quede en 0 cartas una vez finalizados todos los cambios.

No constituye error.

Las cinco vueltas utilizan exclusivamente las cartas que ya están en las manos de jugadores activos.

---

# PARTE XVIII — PRUEBAS DE ACEPTACIÓN

## 74. Test A — Jerarquía

Dado el mismo palo:

```text
1 vence 3
3 vence 12
12 vence 11
11 vence 10
...
4 vence 2
```

Esperado: `PASS`.

---

## 75. Test B — Triunfo mínimo vence As de otro palo

```text
trump = OROS
lead = 1 BASTOS
play = 2 OROS
```

Esperado:

```text
2 OROS gana sobre 1 BASTOS
```

---

## 76. Test C — Obligación de palo

```text
lead = BASTOS
hand = [4 BASTOS, 3 OROS]
```

Esperado:

```text
legalCards = [4 BASTOS]
```

---

## 77. Test D — Obligación de superar en palo

```text
lead = BASTOS
currentWinner = 7 BASTOS
hand = [12 BASTOS, 4 BASTOS]
```

Esperado:

```text
legalCards = [12 BASTOS]
```

---

## 78. Test E — Varias cartas que superan

```text
currentWinner = 12 BASTOS
hand = [1 BASTOS, 3 BASTOS, 4 BASTOS]
```

Esperado:

```text
legalCards = [1 BASTOS, 3 BASTOS]
```

---

## 79. Test F — No puede superar

```text
currentWinner = 3 BASTOS
hand = [12 BASTOS, 7 BASTOS]
```

Esperado:

```text
legalCards = [12 BASTOS, 7 BASTOS]
```

---

## 80. Test G — Debe triunfar

```text
trump = OROS
lead = COPAS
hand contains no COPAS
hand = [2 OROS, 12 ESPADAS]
```

Esperado:

```text
legalCards = [2 OROS]
```

---

## 81. Test H — Puede elegir cualquier triunfo si es el primero

```text
trump = OROS
currentWinner = 1 BASTOS
hand contains no BASTOS
hand = [2 OROS, 3 OROS]
```

Esperado:

```text
legalCards = [2 OROS, 3 OROS]
```

---

## 82. Test I — Debe superar triunfo

```text
trump = OROS
currentWinner = 7 OROS
hand contains no lead suit
hand = [3 OROS, 2 OROS]
```

Esperado:

```text
legalCards = [3 OROS]
```

---

## 83. Test J — Debe entregar triunfo aunque no alcance

```text
trump = OROS
currentWinner = 3 OROS
hand contains no lead suit
hand = [2 OROS, 12 ESPADAS]
```

Esperado:

```text
legalCards = [2 OROS]
```

---

## 84. Test K — Palo de salida tiene prioridad sobre triunfo

```text
trump = OROS
lead = BASTOS
currentWinner = 2 OROS
hand = [1 BASTOS, 3 OROS]
```

Esperado:

```text
legalCards = [1 BASTOS]
```

---

## 85. Test L — Libertad total

```text
trump = OROS
lead = BASTOS
hand contains no BASTOS and no OROS
```

Esperado:

```text
legalCards = entire hand
```

---

## 86. Test M — Palito por no seguir palo

Si `legalCards = [7 BASTOS]` y el usuario juega `3 OROS`:

Esperado:

```text
card accepted
PALITO +50
3 OROS remains in trick
```

---

## 87. Test N — Palito por no superar

Si:

```text
legalCards = [1 OROS]
selected = 2 OROS
```

Esperado:

```text
card accepted
PALITO +50
```

---

## 88. Test O — Dos infracciones en una mano

Dos `CardPlay` ilegales del mismo jugador.

Esperado:

```text
+50
+50
net PALITO = +100
```

---

## 89. Test P — Chupado

Después de cinco vueltas:

```text
active player tricksWon = 0
```

Esperado:

```text
CHUPADO +5
```

---

## 90. Test Q — Pasado no es chupado

```text
player.hasPassed = true
tricksWon = 0
```

Esperado:

```text
no CHUPADO event
score unchanged
```

---

## 91. Test R — Mosca exacta

```text
trump = OROS
hand = [1O,3O,12O,11O,10O]
```

Esperado:

```text
Mosca = true
```

Cualquier reemplazo de una de esas cartas por otra:

```text
Mosca = false
```

---

## 92. Test S — Triunfo 1

Con cualquier `1` revelado:

Esperado:

```text
PASS disabled for all
exchange 0..3 enabled
```

---

## 93. Test T — Triunfo 2

Con cualquier `2` revelado:

Esperado:

```text
PASS disabled for all
exchange disabled for all
```

---

## 94. Test U — Dealer normal

Con triunfo que no sea 1 ni 2:

Esperado:

```text
dealer cannot PASS
dealer can exchange 0..3
revealedTrumpCard cannot be selected
```

---

## 95. Test V — Mano con un solo activo

Todos los no repartidores pasan.

Esperado:

```text
HAND_CANCELLED
no score events
next dealer
```

---

## 96. Test W — Victoria inmediata por vuelta

```text
scoreBefore = 1
winner gets TRICK_WON -1
```

Esperado:

```text
scoreAfter = 0
GAME_OVER immediately
no remaining tricks
no chupado
```

---

## 97. Test X — Victoria inmediata por Mosca

```text
scoreBefore = 4
MOSCA -5
```

Esperado:

```text
scoreAfter = -1
GAME_OVER
no +5 to others
```

---

# PARTE XIX — REQUISITOS DE INTERFAZ DERIVADOS DE LAS REGLAS

## 98. Requisitos obligatorios

La interfaz debe permitir funcionalmente:

- visualizar la propia mano;
- identificar claramente el repartidor;
- mostrar públicamente la carta que define triunfo;
- mostrar el palo de triunfo durante toda la mano;
- elegir PASS cuando esté permitido;
- seleccionar de 0 a 3 cartas para cambio cuando esté permitido;
- impedir que el dealer seleccione la carta revelada para cambio;
- jugar cualquier carta de la propia mano, incluso una ilegal;
- mostrar todas las cartas ya jugadas de la vuelta actual;
- anunciar el ganador de cada vuelta;
- mostrar puntuaciones actualizadas inmediatamente;
- anunciar salto del palito y +50;
- anunciar chupado y +5;
- anunciar Mosca;
- finalizar inmediatamente la partida cuando alguien llegue a 0 o menos.

---

## 99. Requisito especial: no bloquear el palito

Aunque el motor calcule `legalCards`, la UI no debe utilizar ese conjunto para prohibir una jugada.

Puede utilizarse internamente para validación y auditoría.

La acción funcional correcta es:

```text
usuario juega → servidor acepta → servidor detecta → +50 → continúa
```

No:

```text
usuario intenta → UI rechaza → elige otra
```

---

## 100. Estado de puntuación visible

Como los puntos se modifican durante la mano, la UI debe representar el score actual y no solamente el score al inicio de cada mano.

Los eventos `PALITO`, `TRICK_WON` y `MOSCA` deben reflejarse inmediatamente.

---

# PARTE XX — AUTORIDAD Y CONSISTENCIA FUNCIONAL

## 101. Autoridad del motor

En una implementación multijugador, una única autoridad lógica debe determinar:

- orden del mazo;
- cartas repartidas;
- triunfo;
- conjunto de cartas legales;
- detección de palito;
- ganador de vuelta;
- puntuación;
- Mosca;
- chupados;
- condición de victoria.

Un cliente nunca debe ser la fuente autoritativa de estas decisiones.

Esto es un requisito funcional de consistencia, independientemente de la tecnología utilizada.

---

## 102. Atomicidad de acciones

Una jugada de carta debe procesarse como una acción indivisible respecto del estado de partida.

No puede aceptarse una segunda jugada antes de que hayan quedado resueltos:

- retiro de la carta de la mano;
- legalidad;
- posible +50;
- actualización del ganador actual;
- cambio de turno o resolución de vuelta.

---

# PARTE XXI — FUERA DE ALCANCE DE LAS REGLAS 1.0

## 103. Decisiones no definidas por el reglamento

Los siguientes aspectos **no forman parte del reglamento del juego** y una implementación no debe inventarlos como mecánicas sin una decisión explícita de producto:

- límite de tiempo por turno;
- expulsión por inactividad;
- abandono voluntario de una partida ya comenzada;
- reconexión de jugadores;
- sustitución por bots;
- ranking online;
- matchmaking;
- chat;
- espectadores;
- apuestas;
- recompensas externas;
- progresión de cuenta;
- sonidos y animaciones;
- elección del primer repartidor;
- reglas de revancha;
- persistencia entre sesiones.

Estas funciones pueden añadirse sin modificar el motor descrito en este documento.

---

# PARTE XXII — CONTRATO FINAL DEL MOTOR

## 104. Secuencia normativa completa de una mano

```text
1. reunir mazo completo
2. mezclar
3. cortar jugador de la izquierda del dealer
4. repartir 5 cartas de a una hacia la derecha
5. mostrar quinta carta del dealer
6. fijar trumpSuit
7. aplicar restricciones especiales por rango 1/2
8. procesar PASS/cambio jugador por jugador hacia la derecha
9. procesar cambio del dealer si corresponde
10. contar activos
11. si activos < 2:
       cancelar mano
       rotar dealer
       iniciar siguiente mano
12. comprobar Mosca
13. si Mosca:
       revelar
       -5
       comprobar victoria
       si gana → GAME_OVER
       si no → +5 a otros activos
       terminar mano
       rotar dealer
14. si no hay Mosca:
       iniciar vuelta 1 con primer activo a derecha del dealer
15. líder juega cualquier carta
16. por cada siguiente activo:
       calcular legalCards
       aceptar cualquier selectedCard
       si selectedCard no es legal → +50
17. al completar vuelta:
       determinar ganador
       ganador captura cartas
       ganador tricksWon += 1
       ganador score -= 1
       comprobar victoria
18. si gana → GAME_OVER inmediato
19. si quedan vueltas:
       ganador abre siguiente
       repetir desde 15
20. después de vuelta 5, si no terminó la partida:
       +5 a cada activo con 0 vueltas
21. reunir cartas
22. rotar dealer hacia la derecha
23. comenzar siguiente mano
```

---

## 105. Definición canónica de salto del palito

Para fines de implementación, la definición definitiva es:

> **Una jugada constituye salto del palito cuando la carta seleccionada por el jugador no pertenece al conjunto de cartas legalmente obligatorias calculado a partir de su mano completa inmediatamente antes de la jugada, el palo de salida, el palo de triunfo y la carta que actualmente gana la vuelta.**

Consecuencia:

```text
selectedCard ∉ getLegalCards(...) => PALITO +50
```

La carta permanece jugada.

---

## 106. Definición canónica de victoria

La única condición de victoria de la partida es:

```text
player.score <= 0
```

Se evalúa inmediatamente después de cualquier evento que reste puntuación:

```text
TRICK_WON
MOSCA
```

Si se cumple:

```text
winner = player
state = GAME_OVER
```

No se procesa ningún evento posterior de la mano.

---

## 107. Fuente de verdad

En caso de discrepancia durante el desarrollo:

1. las reglas explícitas de este documento tienen prioridad sobre inferencias de juegos similares;
2. no deben importarse reglas de Tute, Brisca, Truco u otras variantes de La Mosca;
3. no existe obligación de “seguir reglas tradicionales” que no estén escritas aquí;
4. cualquier nuevo caso no cubierto por una regla general debe agregarse primero a esta especificación antes de modificar el comportamiento del motor.

Con estas reglas, el núcleo de **La Mosca — variante Las Parejas v1.0** queda funcionalmente definido.
