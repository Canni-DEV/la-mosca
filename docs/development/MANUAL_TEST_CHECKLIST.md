# Checklist de testing manual acumulativo

Este checklist crece con las fases. La especificación de cada fase incluye un subconjunto más concreto.

## Partida jugable Fase 2

- [ ] Menú: Jugar, Cómo jugar, Opciones, Mesa de prueba.
- [ ] Nueva partida 3 / 4 / 5 jugadores.
- [ ] Mazo 40 y mazo 48.
- [ ] Entrada a la mesa con reparto animado y triunfo visible.
- [ ] Paso por botón y por doble toque/click en la zona propia.
- [ ] Cambio: seleccionar 0–3, confirmar; la carta de triunfo del dealer no se elige.
- [ ] Con triunfo 2 no aparecen Paso ni cambio.
- [ ] Jugar carta con un click/tap; las ilegales siguen clickeables.
- [ ] Palito: texto `¡SALTASTE EL PALITO!`, +50, sin modal.
- [ ] Mosca y Chupado se ven en mesa.
- [ ] Scores junto a cada asiento; el turno actual se entiende.
- [ ] La mano propia no queda tapada por el HUD.
- [ ] Audio mute/volumen; la partida sigue siendo comprensible en silencio.
- [ ] Victoria corta la partida; Revancha / Nueva partida / Menú funcionan.
- [ ] No hay errores relevantes en consola.
- [ ] `pnpm build` genera un estático usable.

## Playground Fase 1

- [ ] `pnpm install` y `pnpm dev` abren el playground.
- [ ] Seed visible y editable; al repetir seed el reparto coincide.
- [ ] **Nueva partida** deja fase `HAND_CUT`, scores 20 y pocos eventos iniciales. Mesa Pixi, panel Estado y log coinciden.
- [ ] **Paso** cambia turno/fase en los tres paneles a la vez.
- [ ] **Hasta el final** termina en `GAME_OVER` con un ganador y score ≤ 0. Mesa, Estado y log muestran el mismo final (no un recorte al inicio de la partida).
- [ ] El log indica el total de eventos y lista los más recientes arriba (`GameWon` / `GameEnded` / `ScoreChanged`).
- [ ] Manos visibles en modo debug durante el juego.
- [ ] El log de eventos muestra Palito si se usa "Forzar palito" en un turno con carta ilegal.

## Partida y configuración

- [ ] Crear partida de 3 jugadores con mazo 40.
- [ ] Crear partida de 4 jugadores con mazo 40.
- [ ] Crear partida de 5 jugadores con mazo 40.
- [ ] Crear partida con mazo 48.
- [ ] Verificar score inicial 20 para todos.

## Reparto

- [ ] Se reparten 5 cartas por jugador.
- [ ] La quinta del dealer es la última carta y se revela.
- [ ] El palo revelado se muestra como triunfo.
- [ ] El dealer conserva esa carta.

## Triunfo 1

- [ ] Nadie puede pasar.
- [ ] Se pueden cambiar hasta 3 cartas.
- [ ] Dealer no puede cambiar la carta revelada.

## Triunfo 2

- [ ] Nadie puede pasar.
- [ ] Nadie puede cambiar.

## Paso

- [ ] Jugador puede pasar cuando está permitido.
- [ ] El pasado no juega bazas.
- [ ] Su score no cambia.
- [ ] Si queda solo el dealer/único activo, la mano se cancela y rota reparto.
- [ ] Si quedan dos, se juega mano a mano.

## Cambio

- [ ] Se pueden seleccionar 0–3.
- [ ] Sale la misma cantidad que entra.
- [ ] Descartadas no vuelven a la mano.
- [ ] La carta de triunfo del dealer no se puede cambiar.

## Bazaje

- [ ] Líder correcto abre primera baza.
- [ ] Ganador abre siguiente.
- [ ] Triunfo vence a no triunfo.
- [ ] Jerarquía 1 > 3 > 12 > 11 > 10 ... > 2.

## Obligaciones

- [ ] Con palo de salida, debe asistir.
- [ ] Si puede superar en ese palo, debe superar.
- [ ] Si no tiene palo, debe triunfar.
- [ ] Si hay triunfo y puede superarlo, debe hacerlo.
- [ ] Si tiene palo de salida, no puede usar triunfo como jugada legal aunque gane.
- [ ] Sin palo ni triunfo, libertad total.

## Palito

- [ ] Una carta ilegal sigue siendo jugable.
- [ ] Se anuncia Palito.
- [ ] +50 se aplica inmediatamente.
- [ ] La carta permanece en la baza.
- [ ] Puede haber múltiples +50 en la misma mano.
- [ ] Si la jugada ilegal completa la baza, +50 ocurre antes del -1 del ganador.

## Mosca

- [ ] 1+3+12+11+10 del triunfo permite declarar Mosca.
- [ ] No se juegan bazas.
- [ ] -5 al jugador con Mosca.
- [ ] +5 a otros activos si la partida no terminó antes.
- [ ] Pasados no reciben chupado.
- [ ] Si Mosca lleva a 0 o menos, termina inmediatamente.

## Chupado

- [ ] Activo con 0 bazas recibe +5 al fin normal.
- [ ] Pasado no recibe +5.
- [ ] Si la partida terminó antes, no se computa chupado pendiente.

## Victoria

- [ ] Score 0 termina inmediatamente.
- [ ] Score negativo también.
- [ ] No se completan bazas/mano después de Game Over.

## UX visual

- [ ] Siempre se entiende de quién es el turno.
- [ ] Las cartas propias son legibles.
- [ ] El triunfo es visible.
- [ ] Durante el bazaje, a la izquierda de Triunfo aparece Salida con el palo (y la carta) de la primera jugada; cambia en cada baza.
- [ ] Scores son legibles.
- [ ] Animaciones no traban input indefinidamente.
- [ ] Audio puede mutearse.
- [ ] No hay errores relevantes en consola.

## Presentación Fase 3

- [ ] Primera impresión de videojuego/bodegón, no de app web ni de mesa rectangular.
- [ ] 3, 4 y 5 jugadores quedan a igual distancia angular, humano abajo.
- [ ] Mazo y triunfo público a la derecha de quien reparte; el centro solo tiene la baza.
- [ ] El dealer conserva su 5ª carta en la mano; el triunfo público es otra copia etiquetada.
- [ ] 10, 11 y 12 se leen como Sota, Caballo y Rey (número grande + figura).
- [ ] Fernet genérico y anotador son imágenes, no dibujos vectoriales; no tapan HUD ni cartas.
- [ ] Los montoncitos de bazas quedan como pilas junto al asiento y no desaparecen.
- [ ] Palito, Mosca y Chupado tienen feedback visual y sonoro distinto.
- [ ] Cómo jugar cubre jerarquía, palos, Palito y Mosca sin ser un tutorial obligatorio.
- [ ] Ayudas contextuales discretas en la primera partida; se pueden cerrar y no vuelven.
- [ ] Desktop usable; tablet/móvil razonable; en chico se reduce decoración antes que cartas.
- [ ] `prefers-reduced-motion` acorta vuelos y saca el shake.
- [ ] Salir al menú a mitad de mano no deja ticker/audio/animación colgados.
- [ ] Mesa de prueba sigue disponible desde el menú.
