# Fase 4 — Release Candidate

## Precondición

Fase 3 aceptada manualmente.

## Objetivo

Preparar una versión estática publicable y robusta del MVP single-player.

## Hardening funcional

Revisar el checklist acumulativo de `MANUAL_TEST_CHECKLIST.md`.

Priorizar bugs reales sobre features nuevas.

## Browsers

Validar versiones modernas/evergreen de:

- Chromium/Chrome/Edge;
- Firefox;
- Safari/WebKit cuando sea posible.

No soportar navegadores legacy.

## Performance

Revisar:

- tiempo/costo de carga de assets;
- texturas demasiado grandes;
- memory leaks al reiniciar partidas;
- listeners sin liberar;
- loops innecesarios;
- estabilidad de animación.

No microoptimizar lógica de cartas irrelevante.

## Responsive

Validar:

- 1920×1080;
- 1366×768;
- ventana desktop estrecha;
- tablet aproximada;
- móvil portrait y landscape.

No es obligatorio pixel-perfect idéntico; sí jugable y legible.

## Accesibilidad

- reduced motion;
- controles Svelte semánticos;
- focus visible en menús;
- información crítica no solo por color/audio;
- textos principales con contraste suficiente.

## Assets/licencias

- eliminar assets temporales sin licencia;
- incluir créditos cuando corresponda;
- no incluir marcas no autorizadas;
- optimizar archivos.

## Deploy

Configurar build para GitHub Pages según `docs/deployment/GITHUB_PAGES.md`.

Puede incluir workflow de GitHub Actions para Pages si el usuario lo desea como parte del repositorio, pero el agente no hace push ni activa settings externos.

## Criterios de aceptación

- [ ] Test suite pasa.
- [ ] Typecheck pasa.
- [ ] Build pasa desde checkout limpio tras install.
- [ ] No existen dependencias de backend.
- [ ] Rutas/assets funcionan bajo subpath de GitHub Pages.
- [ ] No hay errores de consola durante una partida normal.
- [ ] Se puede completar una partida en desktop y móvil.
- [ ] Reiniciar/revancha no acumula objetos/listeners evidentes.
- [ ] Documentación de ejecución/deploy actualizada.
- [ ] `PROJECT_STATUS.md` marca MVP listo para publicación, sujeto a aceptación manual.

## No hacer

No usar esta fase para empezar multiplayer. Cerrar el MVP primero.
