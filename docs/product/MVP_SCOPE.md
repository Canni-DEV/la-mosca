# Alcance del MVP

## Objetivo

Entregar una aplicación web single-player completa en la que una persona pueda jugar partidas de La Mosca contra bots desde el inicio hasta una victoria, con presentación profesional y deploy estático.

## Incluido

### Modos

- Single-player local.
- 3, 4 o 5 jugadores totales.
- Exactamente 1 jugador humano.
- El resto son bots.

### Mazo

- 40 cartas como opción predeterminada para 3–5 jugadores.
- 48 cartas como variante configurable para 3–5 jugadores.
- La arquitectura puede representar 6 jugadores, pero la interfaz single-player inicial se enfoca en 3–5.

### Gameplay

Debe implementar todo lo definido en `docs/game/FUNCTIONAL_SPEC.md`, incluyendo:

- reparto;
- triunfo;
- reglas especiales del 1 y del 2;
- pase;
- cambio de 0–3 cartas;
- Mosca;
- cinco bazas;
- obligación de asistir;
- obligación de superar;
- obligación de triunfar;
- salto del palito permitido pero penalizado;
- chupado;
- puntuación inmediata;
- fin inmediato de partida.

### IA

- Bot heurístico básico.
- No necesita jugar a nivel competitivo.
- Debe respetar reglas y permitir probar todos los flujos principales.
- No usa LLM, ML ni servicios externos.

### Presentación

- Mesa renderizada con PixiJS.
- HUD/menús con Svelte.
- Animaciones de cartas.
- Sonidos de acciones principales.
- Feedback visual de triunfo, bazas, puntuación, chupado, Mosca y salto del palito.
- Estética definida en `docs/design/ART_DIRECTION.md`.

### Plataforma

- Aplicación web SPA.
- Desktop-first.
- Usable en tablet y móvil.
- Build estático compatible con GitHub Pages.

### Configuración mínima

Antes de iniciar una partida el jugador puede elegir:

- cantidad total de jugadores: 3, 4 o 5;
- mazo: 40 o 48 cartas;
- sonido activado/desactivado o volumen básico.

Los demás parámetros siguen las reglas canónicas y no requieren pantalla de configuración.

## Fuera de alcance del MVP

No implementar salvo instrucción futura explícita:

- cuentas;
- login;
- perfiles persistentes;
- base de datos;
- backend;
- matchmaking;
- multiplayer por Internet;
- chat;
- ranking global;
- logros persistentes;
- monetización;
- compras;
- WebRTC;
- PWA/offline avanzada;
- app nativa;
- celular como controlador real;
- IA con búsqueda exhaustiva, MCTS o entrenamiento;
- editor de reglas;
- variantes no documentadas;
- 6 jugadores como flujo principal del MVP.

## Restricción de alcance

“Preparado para multiplayer” significa **límites arquitectónicos correctos**, no código de servidor anticipado.

No crear infraestructura futura porque “quizás haga falta”. Crear interfaces y contratos que eviten acoplamientos irreversibles.
