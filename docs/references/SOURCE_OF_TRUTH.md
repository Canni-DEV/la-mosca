# Fuentes de verdad y resolución de conflictos

## 1. Reglas de La Mosca

Prioridad:

1. `docs/game/FUNCTIONAL_SPEC.md`
2. `docs/game/RULES.md`

Si una explicación pedagógica parece contradecir la especificación funcional, la especificación funcional gana.

No usar reglas encontradas en Internet para “corregir” esta variante.

## 2. Alcance de producto

Prioridad:

1. fase activa en `docs/development/phases/`;
2. `docs/product/MVP_SCOPE.md`;
3. `docs/product/PRODUCT_VISION.md`.

Una fase puede acotar el trabajo actual, pero no redefinir el producto permanentemente sin registrarlo.

## 3. Arquitectura

Prioridad:

1. `.cursor/rules` aplicable como instrucción operativa;
2. `AGENTS.md` como instrucción global;
3. `docs/architecture/DECISIONS.md`;
4. `docs/architecture/ARCHITECTURE.md`;
5. `TARGET_REPOSITORY_STRUCTURE.md` como guía, no dogma de carpetas vacías.

## 4. Diseño

`docs/design/` define intención y restricciones. El agente puede tomar decisiones visuales concretas dentro de esa dirección sin preguntar por cada píxel.

## 5. Si sigue existiendo conflicto

- No esconderlo con una interpretación arbitraria.
- Si afecta reglas o alcance, preguntar al usuario.
- Si es un detalle técnico no normativo, escoger la alternativa más simple compatible con la arquitectura y documentarla si tiene impacto durable.
