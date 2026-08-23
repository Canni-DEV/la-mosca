# Experiencia de usuario

## Flujo principal

```text
Carga
  ↓
Menú principal
  ↓
Nueva partida
  ↓
Configuración breve
  ↓
Entrada a la mesa
  ↓
Partida completa
  ↓
Victoria
  ↓
Revancha / volver al menú
```

## Menú principal

Debe ser breve y visual. No convertirlo en una página de navegación corporativa.

Acciones mínimas:

- Jugar.
- Cómo jugar.
- Opciones de audio.

Opcionales si no agregan complejidad:

- Créditos.
- Acerca de la variante Las Parejas.

## Configuración de partida

Una sola pantalla o modal ligero:

- 3 / 4 / 5 jugadores;
- mazo tradicional 40 / completo 48;
- iniciar partida.

Explicar en una línea que el mazo de 40 es la forma tradicional y que 48 agrega 8 y 9.

## Entrada a la mesa

La transición al juego debe sentirse como entrar a una partida, no como cambiar de ruta web.

Puede incluir:

- paneo o fade hacia la mesa;
- ambiente sonoro;
- cartas/materiales cargándose antes de habilitar interacción.

## Durante el reparto

- Mostrar claramente quién reparte.
- Mostrar el corte de forma breve.
- Repartir de a una carta hacia la derecha.
- La quinta carta del repartidor se revela y queda visible como información de triunfo.
- Destacar el palo de triunfo en HUD sin ocupar demasiado espacio.

## Decisión: pasar o jugar

Cuando pasar está permitido:

- ofrecer acción explícita `Paso`;
- permitir como gesto alternativo doble click/tap sobre la zona de mesa propia;
- reproducir dos golpecitos de mesa;
- el jugador debe entender que pasar lo saca de la mano sin modificar puntos.

Cuando pasar está prohibido por triunfo 1 o 2, la opción no debe presentarse como disponible.

## Cambio de cartas

- Permitir seleccionar 0–3 cartas.
- Mostrar selección con feedback inequívoco.
- La carta revelada del repartidor no puede seleccionarse para cambio.
- Con triunfo 2, omitir/bloquear completamente el cambio.
- Confirmar el cambio con una acción clara.

## Turno de carta

La mano del humano debe ser legible y táctil:

- hover/touch eleva o desplaza ligeramente la carta;
- click/tap selecciona/juega según interacción elegida;
- evitar dobles confirmaciones innecesarias durante cada baza.

### Jugadas ilegales

No deshabilitar cartas ilegales de forma absoluta. Pueden distinguirse sutilmente, pero siguen siendo jugables.

Si el jugador juega una carta ilegal:

1. la carta se juega normalmente;
2. el sistema registra la infracción;
3. se muestra `¡SALTASTE EL PALITO!`;
4. se aplican +50 inmediatamente;
5. la partida continúa.

Nunca mostrar un modal que requiera aceptar la infracción antes de seguir.

## Bots

Los bots deben tener:

- nombres simples y humanos;
- tiempos de reacción breves pero no instantáneos;
- cartas ocultas;
- acciones animadas desde su posición en la mesa.

No simular “pensamiento” excesivo. El ritmo debe mantenerse ágil.

## Puntuación

Mostrar puntuaciones persistentemente cerca de cada jugador.

Cambios de score:

- `-1` por baza: pequeño feedback positivo;
- `+5` chupado: feedback negativo moderado;
- `+50` palito: feedback fuerte y memorable;
- `-5` Mosca: feedback especial.

La puntuación nueva debe quedar visible al terminar la animación.

## Fin de partida

Cuando un score llega a 0 o menos:

- detener nuevas acciones inmediatamente;
- resolver visualmente el evento que causó la victoria;
- presentar al ganador con una secuencia breve;
- no seguir simulando la mano.

Opciones:

- Revancha con misma configuración.
- Nueva partida.
- Menú principal.

## Cómo jugar

Debe estar basado en `docs/game/RULES.md`, pero presentado de manera progresiva:

- objetivo;
- triunfo;
- jerarquía;
- seguir palo y superar;
- pasar/cambiar;
- Mosca/chupado/palito.

No obligar al jugador a leer todo antes de comenzar.
