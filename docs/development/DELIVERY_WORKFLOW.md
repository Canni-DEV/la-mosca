# Flujo de entrega para el agente

## Filosofía

El agente debe trabajar con autonomía suficiente para entregar bloques grandes de valor, pero sin tomar decisiones de producto/reglas que no le corresponden.

## Al comenzar una fase

1. Leer `PROJECT_STATUS.md`.
2. Leer la especificación de la fase.
3. Leer solo la documentación vinculada desde esa fase.
4. Inspeccionar el código existente antes de proponer cambios.
5. Elaborar internamente un plan de implementación coherente.
6. Empezar a implementar sin pedir aprobación para cada subpaso.

## Durante la fase

Puede decidir autónomamente:

- nombres internos razonables;
- organización menor de archivos;
- pequeñas abstracciones;
- librerías de utilidad necesarias y justificadas;
- detalles de layout compatibles con la dirección artística;
- estrategia de refactor menor.

No puede decidir autónomamente:

- cambiar reglas de La Mosca;
- reemplazar el stack aprobado;
- agregar backend;
- recortar una feature obligatoria de fase;
- avanzar a la siguiente fase;
- introducir monetización/login/multiplayer;
- modificar Git mediante commits/push.

## Preguntas

Evitar preguntas como:

- “¿Querés que cree este archivo?”
- “¿Uso interface o type?”
- “¿Preferís 250 o 300 ms de animación?”
- “¿Puedo refactorizar esta función?”

Tomar una decisión razonable y continuar.

Preguntar únicamente si falta una regla de dominio o existe un conflicto real de requisitos.

## Al terminar una fase

Antes de reportar:

- ejecutar typecheck;
- ejecutar tests relevantes;
- ejecutar build;
- corregir fallos propios;
- revisar que no haya placeholders accidentales;
- actualizar documentación si cambió una decisión importante;
- actualizar `PROJECT_STATUS.md` a `WAITING_FOR_MANUAL_ACCEPTANCE` para esa fase.

Luego entregar al usuario:

### 1. Resultado

Qué quedó funcionando.

### 2. Cómo ejecutar

Comandos mínimos.

### 3. Verificaciones automáticas

Qué se ejecutó y resultado.

### 4. Testing manual

Pasos concretos, en orden, para validar la fase.

### 5. Decisiones

Solo decisiones importantes tomadas durante la implementación.

### 6. Pendientes

Solo deuda o limitaciones reales, no una lista de mejoras imaginarias.

## Después de la entrega

Detenerse. No comenzar la siguiente fase hasta que el usuario lo solicite.
