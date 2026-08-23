# Estrategia de testing

## Objetivo

Mantener alta confianza en las reglas sin convertir el proyecto en un ejercicio de cobertura artificial.

## Prioridad 1 — `game-core`

Acá sí se espera cobertura conceptual fuerte.

Probar:

- jerarquía de cartas;
- mazos 40/48;
- reparto y carta de triunfo;
- reglas especiales 1/2;
- pass/exchange;
- detección de Mosca;
- `getLegalCards` y obligación de superar;
- ganador de baza;
- Palito y orden de puntuación;
- chupado;
- victoria inmediata;
- rotación de dealer;
- cancelación por un solo activo;
- invariantes de cartas;
- determinismo del RNG.

Usar como mínimo los casos de aceptación ya definidos en `docs/game/FUNCTIONAL_SPEC.md`.

## Prioridad 2 — protocolo/sesión

Probar selectivamente:

- comandos inválidos para fase;
- orden de eventos en escenarios críticos;
- vista propia no expone cartas rivales;
- LocalGameSession orquesta bots sin saltarse turnos;
- game over impide nuevas acciones relevantes.

## Prioridad 3 — bot

Tests pequeños de comportamiento contractual:

- no hace Palito;
- respeta pass forzado/prohibido;
- intercambio <= 3;
- declara Mosca;
- determinismo con seed.

No testear “juega bien” con cientos de escenarios.

## UI

Preferir:

- tests de funciones/adapters donde haya lógica real;
- pruebas de interacción solo para flujos críticos;
- testing manual para animación, composición visual, audio y game feel.

No escribir unit tests para:

- clases CSS triviales;
- posiciones exactas de sprites;
- cada texto estático;
- timings visuales sin lógica.

## Simulación automática

Cuando el motor y bot estén listos, ejecutar partidas bot-vs-bot en volumen moderado para detectar:

- deadlocks;
- manos que nunca terminan;
- cartas duplicadas/perdidas;
- estados imposibles;
- scores inconsistentes.

No usar simulación como sustituto de tests normativos.

## Cobertura

No existe un porcentaje objetivo obligatorio.

Una línea importante de reglas sin test es un problema. Un 90 % de coverage lleno de tests triviales no es un objetivo.

## Pirámide recomendada

```text
        Manual visual / E2E crítico
             pocos
          Integración
          selectivos
        Unit/domain tests
       fuertes en game-core
```
