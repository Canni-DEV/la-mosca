# Estructura objetivo del repositorio

Esta estructura **no existe todavía**. La Fase 1 debe crearla gradualmente. Puede variar en detalles menores, pero no en responsabilidades.

```text
la-mosca/
│
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/                 # shell, navegación y bootstrap
│       │   ├── screens/             # menú, setup, cómo jugar, resultado
│       │   ├── game/                # integración con GameSession
│       │   ├── scene/               # PixiJS: mesa y objetos visuales
│       │   ├── animation/           # cola/secuenciación visual
│       │   ├── audio/               # mixer, SFX, ambiente
│       │   ├── components/          # UI Svelte no perteneciente a Pixi
│       │   ├── styles/              # tokens y estilos globales
│       │   └── assets/              # assets locales/versionados
│       └── ...
│
├── packages/
│   ├── game-core/
│   │   ├── src/
│   │   │   ├── model/
│   │   │   ├── rules/
│   │   │   ├── state/
│   │   │   ├── engine/
│   │   │   ├── deck/
│   │   │   ├── scoring/
│   │   │   └── rng/
│   │   └── tests/
│   │
│   ├── game-protocol/
│   │   └── src/
│   │       ├── commands/
│   │       ├── events/
│   │       └── views/
│   │
│   └── game-ai/
│       ├── src/
│       │   ├── strategies/
│       │   └── bot/
│       └── tests/
│
├── docs/
├── .cursor/rules/
├── AGENTS.md
├── PROJECT_STATUS.md
├── pnpm-workspace.yaml
├── package.json
└── ...
```

## Reglas de dependencia

```text
 game-protocol
      ↑
 game-core
      ↑
 game-ai
      ↑
 LocalGameSession / apps-web integration
      ↑
 presentation
```

Se permite ajustar la dirección exacta de tipos compartidos para evitar ciclos, pero deben mantenerse estas restricciones:

### `game-core`

No depende de `game-ai` ni de `apps/web`.

### `game-ai`

Puede depender de APIs públicas de reglas/protocolo. No conoce Pixi/Svelte.

### `apps/web`

Puede depender de todos los paquetes necesarios, pero no introduce lógica normativa duplicada.

## No crear carpetas vacías por estética

La estructura se crea a medida que existe código real. No generar decenas de carpetas y archivos placeholder únicamente para coincidir con este diagrama.

## Alias

Puede configurarse alias claros si mejoran imports, pero evitar capas de alias innecesarias o mágicas.
