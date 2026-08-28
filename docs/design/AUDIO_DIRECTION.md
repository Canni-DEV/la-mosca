# Dirección de audio

## Objetivo

El sonido debe aportar tactilidad y ambiente desde las primeras versiones jugables. No es un agregado decorativo final.

## Capas

### 1. SFX de cartas

Necesarios:

- barajar;
- cortar;
- repartir/deslizar;
- carta apoyada suavemente;
- carta tirada con más impacto;
- recoger baza;
- intercambio/descarte.

Conviene disponer de 2–4 variaciones de algunos sonidos para evitar repetición evidente.

### 2. Mesa

- doble golpe `toc toc` para pasar;
- pequeño golpe/impacto para Palito.

### 3. Eventos

- triunfo revelado: cue discreto;
- Mosca: cue especial;
- Chupado: cue corto;
- Palito: cue fuerte pero no molesto;
- victoria: cierre reconocible.

### 4. Ambiente

Opcional pero recomendado en la fase de presentación:

- murmullo muy tenue de bar;
- vajilla lejana;
- ambiente de interior.

Debe quedar muy por debajo de cartas y UI. No usar música constante si compite con el ambiente; la música puede limitarse a menú/victoria.

## Mixer

El formato persistido es `{ muted, masterVolume, sfxVolume, ambienceVolume }`. Se migra automáticamente la preferencia anterior `{ muted, volume }`.

- master/general;
- SFX;
- ambiente.

No hay música continua.

## Persistencia

Guardar preferencia de volumen/mute en local storage es aceptable.

## Assets

- Preferir audio original, generado, grabado o con licencia clara.
- No enlazar SFX remotos en runtime.
- Empaquetar assets localmente.
- Mantener créditos/licencia cuando corresponda.
- Foley CC0 breve en WAV local; presupuesto conjunto ≤1 MiB.
- Mantener síntesis como fallback si un archivo no puede decodificarse.

## Accesibilidad

Ninguna información de reglas puede depender solo del sonido. Todo evento importante también debe tener feedback visual.
