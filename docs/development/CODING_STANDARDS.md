# Coding standards

## Lenguaje

- TypeScript strict.
- Código, símbolos y documentación técnica de APIs internas preferentemente en inglés.
- UI y documentación funcional en español.
- Conservar `Mosca`, `Chupado`, `Palito`, `OROS`, `COPAS`, `ESPADAS`, `BASTOS` como vocabulario de dominio.

## TypeScript

- Evitar `any`; usar `unknown` y narrow cuando corresponda.
- Preferir discriminated unions para commands/events/state variants.
- Preferir tipos inmutables/read-only en fronteras de dominio cuando sea práctico.
- No usar enums numéricos si una union literal es más clara y serializable.
- No esconder errores con casts amplios.

## Funciones

- Funciones de reglas pequeñas y puras cuando sea posible.
- Nombres que expresen dominio: `getLegalCards`, `resolveTrickWinner`, `applyScoreEvent`.
- Evitar helpers genéricos sin significado si vuelven opaca la regla.

## Estado

- Una única fuente de verdad.
- Evitar estado duplicado entre Svelte store y Pixi scene.
- Los sprites reflejan estado; no lo sustituyen.

## Errores

- Fallar temprano ante invariantes internas imposibles.
- Tratar input de usuario esperado mediante resultados/validación clara.
- `Palito` no es excepción ni error técnico.

## Dependencias

Agregar una dependencia solo si:

- resuelve un problema real;
- su costo es menor que mantener una implementación casera;
- no introduce un framework completo para una necesidad pequeña.

No instalar librerías por comodidad para operaciones triviales.

## Svelte

- Componentes responsables de UI, no del motor.
- Mantener lógica de integración en servicios/adapters cuando sea compleja.
- Evitar mega-componentes de mesa que mezclen Pixi, audio, reglas y navegación.

## PixiJS

- Centralizar ciclo de vida de `Application`/scene.
- Destruir recursos/listeners apropiadamente.
- No crear texturas repetidamente por frame.
- Separar entidades visuales (`CardView`, `SeatView`, etc.) de estado de dominio.

## CSS/estilo

- Usar tokens de diseño básicos.
- Evitar estilos inline masivos.
- No traer un framework UI corporativo que contradiga la dirección artística.

## Comentarios

Comentar razones no obvias, no narrar código evidente.

Las reglas complejas deben apuntar al documento funcional cuando ayude:

```ts
// Functional spec §32: lead suit has priority over trump.
```

No copiar páginas enteras del reglamento dentro del código.
