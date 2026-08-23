# Definition of Done

## Para cualquier cambio funcional

Un cambio está terminado cuando:

- cumple el requisito que lo originó;
- no duplica reglas de dominio en UI;
- TypeScript no introduce `any` evitables;
- no deja errores de consola relevantes;
- no rompe build;
- tiene tests cuando el riesgo lo justifica;
- estados de error importantes tienen comportamiento definido;
- documentación afectada se actualizó si corresponde.

## Para lógica de `game-core`

Además:

- comportamiento determinístico con seed;
- tests para casos normativos afectados;
- invariantes de cartas y scores conservados;
- no hay dependencias de browser/UI;
- los comandos/eventos son coherentes con protocolo;
- ninguna regla nueva fue inventada.

## Para UI de gameplay

Además:

- usable con mouse y touch;
- estados de turno claros;
- no depende de hover para funcionalidad necesaria;
- animaciones no alteran la lógica;
- input no permite corrupción de estado;
- Palito continúa siendo jugable, no bloqueado;
- layout no se rompe en viewport desktop razonable.

## Para una fase

La fase solo se presenta como completa si:

- todos sus criterios de aceptación obligatorios están implementados;
- test/typecheck/build pasan;
- existe un camino de prueba manual;
- no se avanzó a features de la siguiente fase como sustituto de pendientes;
- `PROJECT_STATUS.md` está actualizado;
- el agente no hizo commits.
