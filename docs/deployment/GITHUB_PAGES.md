# Deploy — GitHub Pages

## Objetivo

El MVP debe compilar a archivos estáticos y poder hospedarse como Project Page de GitHub Pages sin servidor.

## Requisitos

- No usar SSR.
- No requerir API runtime.
- No requerir variables secretas.
- Assets empaquetados con el build.
- Navegación compatible con hosting estático.

## Base path

GitHub Project Pages normalmente sirve el sitio bajo un subpath como:

```text
https://<owner>.github.io/la-mosca/
```

Por lo tanto:

- no asumir que la app vive en `/`;
- configurar correctamente `base` de Vite para el repo/deploy;
- evitar paths absolutos manuales a `/assets/...`;
- preferir imports procesados por Vite.

Si más adelante se usa dominio propio, la configuración puede adaptarse sin reescribir la app.

## Routing

Para el MVP, preferir una navegación que no dependa de rutas server-side.

Opciones válidas:

- una SPA con estado/pantallas internas sin router;
- hash routing si se necesita routing real;
- configuración explícita de fallback si la estrategia de Pages lo permite.

No agregar un router complejo únicamente porque Svelte sea una SPA.

## GitHub Actions

En la fase release puede agregarse un workflow de build/deploy a Pages.

El agente puede crear el archivo, pero **no debe hacer push ni cambiar settings del repositorio**.

## Build reproducible

Documentar y verificar:

```text
pnpm install
pnpm build
```

Preferir lockfile versionado.

## Verificación antes de publicar

- cargar app desde subpath;
- recargar página;
- assets de cartas cargan;
- audio carga;
- no existen fetch a localhost;
- no hay dependencia de API externa para jugar;
- consola sin 404 relevantes;
- nueva partida y partida completa funcionan desde build de producción.
