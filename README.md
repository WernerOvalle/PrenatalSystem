# Sistema de Citas · UFM

Web app para **agendar citas** de una clínica con tres categorías: consulta general, pediatría y prenatal. Construida con Next.js 16 (App Router) y exportación estática. Toda la información se guarda en el navegador con **localStorage** — no hay backend ni base de datos.

Sigue el prototipo de `Proyecto super wow.pptx`, con la identidad visual de la Universidad Francisco Marroquín en tema oscuro.

## Pantallas

- **Inicio**: los dos accesos del prototipo, `Generar nueva cita` y `Reprogramar`, más el resumen de las citas de hoy.
- **Generar nueva cita**: nombre, # expediente, fecha, teléfono del paciente, teléfono de un familiar y categoría. El nombre autocompleta con los pacientes ya registrados.
- **Reprogramar**: se busca la cita por nombre, expediente o categoría, se elige de la lista y se le asigna una nueva fecha. Queda registrada la fecha anterior.
- **Calendario** (una vista por categoría): rejilla mensual de domingo a sábado; cada día muestra cuántas citas tiene. Al elegir un día se abre su agenda.
- **Agenda del día**: cada cita con sus dos teléfonos como enlaces para llamar, y el estado de la confirmación: `Pendiente`, `Confirmado`, `No contestó` o `Canceló`.
- **Todos pacientes**: totales de citas de la fecha elegida, con desglose por categoría.

La campana del encabezado cuenta las citas de hoy que siguen sin confirmar.

## Identidad visual

Tema oscuro único. La paleta sale de los colores heráldicos del escudo de la UFM, muestreados del archivo original: rojo `#c52a26`, oro `#e3be31`, azul `#3e58a2` y verde `#458b57`. Los tokens están en un solo bloque `@theme` en `src/app/globals.css`.

Los estados de las citas nunca se distinguen solo por color: cada chip lleva texto e icono.

## Estructura

```
src/lib/fecha.ts     fechas y rejilla del calendario (sin dependencias)
src/lib/citas.ts     categorías, estados y selectores puros
src/lib/store.ts     persistencia en localStorage + useSyncExternalStore
src/components/      Nav, Calendario, CitaFila, iconos y primitivas de UI
src/app/             Inicio, calendario/[categoria], agenda, totales
```

`src/lib/` es lógica pura sin React, así que se puede probar directamente con
`node --experimental-strip-types`.

## Requisitos

- Node.js 20.9+ (probado en 24.3)
- pnpm

## Comandos

```bash
pnpm install      # instalar dependencias
pnpm dev          # desarrollo en http://localhost:3000
pnpm build        # exportación estática a out/
pnpm preview      # servir out/ en http://localhost:4000 (servidor propio, sin dependencias)
pnpm lint         # ESLint
```

La app se exporta como sitio estático (`output: "export"`); el contenido de `out/` puede subirse a cualquier hosting estático. No requiere un runtime de Node en producción.

Como no hay servidor, los parámetros de pantalla van por query string (`?fecha=`, `?cat=`, `?mes=`) y las tres vistas de calendario se generan con `generateStaticParams()`.

## Seguridad de la cadena de suministro

El `.npmrc` aplica políticas de protección ("fendo"): `ignore-scripts`, `save-exact`, `minimum-release-age`, `block-exotic-subdeps`, `trust-policy=no-downgrade` y el **modelo de permisos de Node** (`node-options="--permission"`).

Por eso los scripts `dev`, `lint` y `preview` invocan `node` con los flags `--allow-*` mínimos que Next/ESLint necesitan (lectura/escritura de fs, procesos hijo, workers y addons nativos). Verás advertencias `SecurityWarning` al ejecutarlos: son esperadas y confirman que el modelo de permisos está activo en local.

**El script `build` NO usa el modelo de permisos** y es intencional: el modelo de permisos de Node deshabilita la API `fsync` (sin flag para reactivarla), que el bundler de Next necesita al compilar — esto rompe el build en CI/Vercel con `ERR_ACCESS_DENIED`. No afecta la seguridad en producción: la salida es un export estático (`output: "export"`), sin runtime de Node que proteger. Las protecciones de cadena de suministro del `.npmrc` (instalación) siguen vigentes en el build.

Los build scripts de `sharp` y `unrs-resolver` se omiten (reconocido en `pnpm-workspace.yaml`); no se necesitan porque el export estático usa `images.unoptimized`.

La app **no añade ninguna dependencia**: el calendario, el manejo de fechas y los iconos están escritos a mano. `pnpm-lock.yaml` no cambia respecto al proyecto original.
