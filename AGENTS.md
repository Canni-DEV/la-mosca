# La Mosca — instrucciones globales para agentes

## Misión

Construir un videojuego web de cartas con identidad visual fuerte, jugable inicialmente en single-player contra bots, preservando exactamente las reglas de **La Mosca — variante Las Parejas**.

El producto debe sentirse como un **juego terminado**, no como una aplicación CRUD con cartas.

## Antes de modificar código

1. Leer `PROJECT_STATUS.md`.
2. Leer el documento de la fase activa en `docs/development/phases/`.
3. Consultar `docs/architecture/ARCHITECTURE.md`.
4. Si el trabajo toca reglas, leer `docs/game/FUNCTIONAL_SPEC.md` antes de implementar.
5. Si toca UI, Pixi, animaciones o assets, leer los documentos correspondientes en `docs/design/`.

No cargues documentación irrelevante por rutina: usá `docs/INDEX.md` para localizar el contexto necesario.

## Fuentes de verdad

- Reglas ejecutables: `docs/game/FUNCTIONAL_SPEC.md`.
- Explicación humana: `docs/game/RULES.md`.
- Arquitectura: `docs/architecture/ARCHITECTURE.md` y `docs/architecture/DECISIONS.md`.
- Alcance: `docs/product/MVP_SCOPE.md`.
- Fases: `docs/development/ROADMAP.md`.
- Dirección visual: `docs/design/ART_DIRECTION.md`.

No inventar reglas de juego. Si una regla necesaria no está definida y realmente cambia el resultado de una partida, preguntar al usuario.

## Principios de implementación

- TypeScript estricto.
- Svelte + Vite para shell/UI.
- PixiJS 8 para la mesa, cartas y presentación animada.
- `game-core` debe ser TypeScript puro, determinístico y sin dependencias de navegador, Svelte, Pixi, bots o red.
- La UI nunca es la fuente de verdad del estado.
- Las animaciones representan eventos ya resueltos; no gobiernan las reglas.
- Bots y humanos deben emitir los mismos comandos públicos.
- Preparar el diseño para `LocalGameSession` y futuro `RemoteGameSession`.
- No crear backend, base de datos, login ni multiplayer durante el MVP salvo instrucción explícita de una fase futura.

## Calidad sin burocracia

Priorizar tests donde previenen regresiones costosas:

- reglas;
- puntuación;
- máquina de estados;
- determinismo;
- comandos/eventos;
- IA en decisiones esenciales.

No perseguir cobertura porcentual arbitraria. No escribir tests triviales de presentación si no aportan seguridad real. El testing manual de cada fase es obligatorio y complementa los tests automáticos.

## Flujo de trabajo

- Implementar una fase como unidad grande y coherente.
- No interrumpir con microconsultas evitables.
- No avanzar a la fase siguiente sin aprobación del usuario.
- Actualizar `PROJECT_STATUS.md` al finalizar una fase.
- Mantener documentación sincronizada cuando una decisión técnica importante cambie.
- Si se toma una decisión arquitectónica nueva y durable, registrarla en `docs/architecture/DECISIONS.md`.

## Git

El agente NO debe:

- `git commit`;
- `git push`;
- crear o cambiar ramas por iniciativa propia;
- rebasear;
- resetear historial;
- etiquetar releases.

Puede usar comandos Git de lectura (`status`, `diff`, `log`) para inspección. Los commits los hace el usuario.
