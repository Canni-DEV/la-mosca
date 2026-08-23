# Glosario de dominio

La UI y documentación funcional están en español. El código técnico general puede estar en inglés, pero los conceptos culturales del juego deben conservar nombres reconocibles.

| Término de juego | Significado | Nombre técnico recomendado |
|---|---|---|
| Partida | Juego completo hasta que alguien llega a 0 o menos | `Game` |
| Mano | Reparto + decisiones + hasta 5 bazas | `Hand` |
| Vuelta / baza | Una carta por jugador activo | `Trick` |
| Palo | Oro, copa, espada, basto | `Suit` |
| Triunfo | Palo dominante de la mano | `TrumpSuit` |
| Palo de salida | Palo de la primera carta de la baza | `LeadSuit` |
| Repartidor / mano | Jugador que reparte | `Dealer` |
| Cortar | Cortar el mazo antes del reparto | `CutDeck` |
| Pasar | No participar de la mano | `Pass` |
| Cambiar / descartar | Reemplazar 0–3 cartas antes de jugar | `ExchangeCards` |
| Chupado | Activo sin ninguna baza al final | `Chupado` / `ChupadoPenalty` |
| Mosca | 1,3,12,11,10 del triunfo | `Mosca` |
| Saltar el palito | Incumplir una obligación de carta | `PalitoViolation` |
| “¿Cuántas querés?” | Pregunta de cambio de cartas | UI/domain phrase |
| “Paso” | Declaración de no jugar | UI/domain phrase |

## Nombres de palos en código

Recomendado:

```ts
OROS
COPAS
ESPADAS
BASTOS
```

Aunque el resto del código use inglés, mantener estos valores reduce traducciones innecesarias y conserva el dominio.

## Regla de nomenclatura

No traducir `Mosca`, `Chupado` ni `Palito` a nombres genéricos como `InstantWin`, `NoTricksPenalty` o `IllegalMove` en la API de dominio principal. Pueden existir descripciones auxiliares en inglés, pero los eventos deben conservar el término cultural.
