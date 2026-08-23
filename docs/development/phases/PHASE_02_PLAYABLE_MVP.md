# Fase 2 — Playable MVP

## Precondición

Fase 1 aceptada manualmente por el usuario.

## Objetivo

Transformar el motor validado en una partida single-player completa y agradable de usar, todavía sin exigir el nivel de polish artístico final de Fase 3.

## Alcance

### Flujo

Implementar:

- menú principal;
- nueva partida;
- selección 3/4/5 jugadores;
- mazo 40/48;
- entrada a mesa;
- partida completa;
- pantalla de victoria;
- revancha/nueva partida.

### Game session

`apps/web` debe utilizar `LocalGameSession` como frontera.

La UI no debe importar módulos internos de reglas para decidir legalidad por su cuenta.

### Mesa Pixi

Crear mesa funcional:

- asiento humano abajo;
- bots distribuidos alrededor;
- mazo/dealer;
- zona central de baza;
- triunfo;
- montoncitos de bazas;
- mano humana;
- dorsos de cartas rivales;
- scores.

Los assets pueden ser intermedios de buena calidad, pero no placeholders de rectángulos sin intención visual.

### Interacciones

Implementar:

- pasar;
- doble golpe/tap alternativo para `Paso`;
- seleccionar y confirmar cambio 0–3;
- jugar cualquier carta propia;
- indicar sutilmente jugadas obligatorias/legales sin bloquear Palito;
- declarar/resolver Mosca;
- feedback de Chupado;
- game over inmediato.

### Bots

- 2–4 bots según configuración.
- delays visuales naturales.
- ninguna información secreta utilizada.

### Animación base

Incluir versión funcional de:

- reparto;
- reveal de triunfo;
- jugar carta;
- recoger baza;
- cambio;
- paso;
- score changes;
- Palito;
- Mosca;
- victoria.

No necesita polish final, pero no puede ser teleport instantáneo de todos los objetos.

### Audio base

Integrar infraestructura y SFX provisionales/propios/licenciados para:

- cartas;
- paso;
- Palito;
- Mosca/victoria al menos.

Incluir mute/volumen básico.

## Reglas de UX

- el turno actual siempre es evidente;
- la mano humana nunca queda tapada por HUD;
- Palito no muestra confirmación previa;
- después de una acción, evitar clicks duplicados mientras la representación visual está en transición;
- no usar modales para cada baza.

## Criterios de aceptación

- [ ] Partida completa 1 humano + 2 bots.
- [ ] Partida completa 1 humano + 3 bots.
- [ ] Partida completa 1 humano + 4 bots.
- [ ] Mazo 40 y 48 funcionan.
- [ ] Todas las reglas especiales pueden verse en UI.
- [ ] Humano puede hacer Palito deliberadamente y recibe +50.
- [ ] Bot no hace Palito.
- [ ] Mosca se resuelve visualmente.
- [ ] Victoria corta la partida inmediatamente.
- [ ] Audio puede mutearse.
- [ ] No hay errores relevantes de consola.
- [ ] Build estático sigue funcionando.

## No incluir

- backend;
- multiplayer;
- cuentas;
- ranking;
- arte de alta fidelidad si retrasa funcionalidad;
- refinamiento exhaustivo de tutorial.

## Cierre

Actualizar `PROJECT_STATUS.md` y detenerse para testing manual.
