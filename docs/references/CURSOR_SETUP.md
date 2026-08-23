# Configuración para Cursor

## Estrategia

Este repositorio utiliza dos niveles:

1. `AGENTS.md` raíz para instrucciones globales breves y legibles.
2. `.cursor/rules/*.mdc` para reglas específicas y scope por archivos.

No utilizar `.cursorrules` legacy.

## Reglas incluidas

- `00-project-principles.mdc`: principios globales.
- `01-agent-workflow.mdc`: fases y autonomía.
- `02-git-safety.mdc`: Git controlado por el usuario.
- `10-game-core.mdc`: motor/protocolo.
- `11-game-ai.mdc`: bots.
- `20-web-presentation.mdc`: Svelte/Pixi.
- `21-art-direction.mdc`: identidad visual.
- `30-quality.mdc`: calidad/testing proporcional.

## Diseño de las reglas

Las reglas globales son cortas. Los detalles viven en `docs/` y las `.mdc` apuntan a esos documentos en vez de duplicarlos.

Esto reduce contexto repetido y permite mantener una sola fuente de verdad.

## Uso recomendado

Abrir **la raíz `la-mosca/` como workspace** en Cursor.

Antes de pedir implementación, confirmar que Cursor detecta:

- `AGENTS.md`;
- `.cursor/rules/`.

Prompt sugerido: `START_PROMPT.md`.

## Actualización

Si en el futuro una regla se vuelve demasiado grande:

- mover explicación a `docs/`;
- conservar en `.mdc` solo la obligación y el link/ruta;
- usar `globs` para limitar reglas técnicas a su área.

## Referencia oficial

La estructura sigue el sistema de Project Rules de Cursor (`.cursor/rules/*.mdc`) y soporte de `AGENTS.md` vigente al crear este repositorio en agosto de 2026.
