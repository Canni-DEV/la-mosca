# Créditos y licencia de assets — Fase 3

## Baraja

`cards/spanish-deck-atlas.png` es una copia local de
[Baraja española completa.png](https://commons.wikimedia.org/wiki/File:Baraja_espa%C3%B1ola_completa.png)
en Wikimedia Commons.

- Autor: [Basquetteur](https://commons.wikimedia.org/wiki/User:Basquetteur)
- Licencia: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- Trabajo propio del autor, reutilizando elementos heráldicos de Germarquezm / Wikipedia Graphic Lab y el caballo de GnuBond (Aisleriot)

El juego recorta las celdas 1–12 de cada palo. La carta en blanco y el dorso del atlas no se usan; el dorso runtime es original.
Cualquier redistribución de este PNG (o recortes derivados) debe conservar atribución y CC BY-SA 3.0.

## Tipografías

- Fraunces, de Undercase Type, SIL Open Font License 1.1.
- Archivo, de Omnibus-Type, SIL Open Font License 1.1.

Ambas se empaquetan localmente desde el repositorio oficial de Google Fonts.

## Resto de arte

Mesa, fondo de bodegón, vaso genérico y anotador: ilustraciones originales encargadas para el proyecto (generación asistida), empaquetadas en el build.

El fondo `table/bodegon-editorial.png` es una ilustración original de generación asistida. Su derivado WebP se genera localmente. No contiene marcas, personas ni sillas fijas: los 3–5 asientos pertenecen al layout dinámico.

## Audio

`audio/foley/*.wav` proviene de [Playing Card Sounds](https://opengameart.org/content/playing-card-sounds), por Brian MacIntosh, publicado bajo CC0. Se usan `shuffle.wav`, `cut.wav`, `contact1.wav` y `contact2.wav` (renombrados localmente donde corresponde).

Ambiente y cues especiales: síntesis local con Web Audio API (`apps/web/src/audio/mixer.ts`). Los WAV viajan en el build; no hay fetches remotos.

## Guía ilustrada

`guia-ilustrada/0_Mosca.png` … `3_Mosca.png` y `La_Mosca_Guia_Ilustrada.pdf`: material original del proyecto para Cómo jugar. `runtime/` contiene derivados WebP y un PDF comprimido reproducibles; no reemplazan las fuentes.

## Uso

No hay hotlinks ni descargas remotas en runtime.

El vaso oscuro es un fernet con cola **genérico**, sin etiqueta comercial.
