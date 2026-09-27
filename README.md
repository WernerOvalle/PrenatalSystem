# MediAgenda Demo · Sistema de citas

> **Demo project — all data is fictional.** Clínica, pacientes, expedientes y teléfonos son inventados.

Web app de demostración para **agendar citas médicas** en cuatro categorías: consulta general, pediatría, prenatal y oftalmología. Construida con Next.js 16 (App Router) y exportación estática. Toda la información se guarda en el navegador con **localStorage** — no hay backend ni base de datos.

Tema oscuro único, con una paleta de marca propia de la demo.

## Datos de ejemplo y botón Restablecer

La primera vez que se abre la app (sin datos en el navegador) se cargan unas 24 citas de ejemplo, con fechas relativas a hoy: días pasados con asistencia registrada, citas de hoy en todos los estados y citas de los próximos días. Salen de `src/lib/demo.ts`.

La franja superior muestra el aviso de demo y el botón **Restablecer demo**. Con una confirmación en dos pasos, borra todo lo capturado y vuelve a cargar los datos de ejemplo, con fechas recalculadas al día de hoy. Si borras todas las citas a mano, la app respeta la lista vacía hasta que pulses Restablecer.

## Pantallas

- **Inicio**: los tres accesos, `Generar nueva cita`, `Reprogramar` y `Nuevo ingreso`, más el resumen de las citas de hoy.
- **Generar nueva cita**: nombre, # expediente, fecha, hora, teléfono del paciente, teléfono de un familiar y categoría. El nombre autocompleta con los pacientes ya registrados.
- **Reprogramar**: se busca la cita por nombre, expediente o categoría, se elige de la lista y se le asigna nueva fecha y hora. Queda registrada la fecha anterior.
- **Nuevo ingreso**: el paciente que llega sin cita previa. Se registra sobre la fecha de hoy con su hora de llegada y nace ya marcado como presente.
- **Calendario** (una vista por categoría): rejilla mensual de domingo a sábado; cada día muestra cuántas citas tiene. Al elegir un día se abre su agenda.
- **Agenda del día**: ordenada por hora, con los dos teléfonos como enlaces para llamar y los dos ejes de cada cita (ver abajo).
- **Todos pacientes**: totales de citas de la fecha elegida, con desglose por categoría.
- **Reportes**: los dos documentos imprimibles del día (ver abajo).

La campana del encabezado cuenta las citas de hoy que siguen sin confirmar.

## Los dos ejes de una cita

Confirmar por teléfono y presentarse a la consulta son hechos distintos, así que se
registran por separado:

- **Confirmación** (`estado`): `Pendiente`, `Confirmado`, `No contestó` o `Canceló`.
- **Asistencia**: `Sin registrar`, `Llegó` o `No llegó`.

El resumen de cierre del día es justamente el cruce de ambos.

## Reportes imprimibles

`/reportes` genera dos documentos para la fecha elegida:

- **Lista por categoría**: los pacientes del día divididos por categoría, una por página,
  con casillas para marcar la asistencia a mano.
- **Resumen del día**: quién llegó y quién no, cruzado con la confirmación —
  confirmados que llegaron, no confirmados que llegaron, confirmados que no llegaron,
  no confirmados que no llegaron, los de nuevo ingreso, los que quedaron **sin registrar**
  y las canceladas.

El PDF se obtiene con el propio diálogo del navegador («Guardar como PDF»): el botón
`Imprimir` llama a `window.print()` y el bloque `@media print` de `globals.css` cambia la
hoja a papel blanco, esconde el nav y coloca los saltos de página. **No se añadió ninguna
dependencia** para esto.

## Identidad visual

Tema oscuro único. La paleta de marca de la demo tiene un tono por categoría: coral `#c93a41`, ámbar `#f5a524`, índigo `#5b6ee1` y teal `#2fa37a`. Los tokens `--color-marca-*` están en un solo bloque `@theme` en `src/app/globals.css`. El logo es un SVG inline (`LogoDemo` en `src/components/icons.tsx`), y el favicon, `src/app/icon.svg`, usa el mismo dibujo.

Los estados de las citas nunca se distinguen solo por color: cada chip lleva texto e icono. Por eso el verde puede servir a la vez como tono de Oftalmología y de `Confirmado` sin crear ambigüedad.

El tema oscuro se apaga únicamente al imprimir, para no gastar tinta.

## Estructura

```
src/lib/fecha.ts     fechas, horas y rejilla del calendario (sin dependencias)
src/lib/citas.ts     categorías, estados, asistencia y selectores puros
src/lib/store.ts     persistencia en localStorage + useSyncExternalStore
src/lib/demo.ts      datos de ejemplo (ficticios) y su generador
src/components/      DemoBanner, Nav, Calendario, CitaFila, Hoja*, iconos y primitivas de UI
src/app/             Inicio, calendario/[categoria], agenda, totales, reportes
```

Las citas guardadas antes de que existieran `asistencia` y `origen` se completan al leerlas
en `store.ts`, así que los datos viejos del navegador siguen sirviendo sin migración.

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
pnpm run deploy   # build + subida a Azure Static Web Apps (ver DEPLOY.md)
```

La app se exporta como sitio estático (`output: "export"`); el contenido de `out/` puede subirse a cualquier hosting estático. No requiere un runtime de Node en producción.

Como no hay servidor, los parámetros de pantalla van por query string (`?fecha=`, `?cat=`, `?mes=`) y las cuatro vistas de calendario se generan con `generateStaticParams()`.

## Seguridad de la cadena de suministro

Las políticas de protección ("fendo") son `ignore-scripts`, `save-exact`, `minimum-release-age` (7 días), `block-exotic-subdeps` y `trust-policy=no-downgrade`. Están en `.npmrc` y **duplicadas en `pnpm-workspace.yaml`**, porque pnpm 11 ya no lee esos ajustes de `.npmrc`. Compruébalo con `pnpm config list`. A eso se suma el **modelo de permisos de Node** en los scripts locales.

Por eso los scripts `dev`, `lint` y `preview` invocan `node` con los flags `--allow-*` mínimos que Next/ESLint necesitan (lectura/escritura de fs, procesos hijo, workers y addons nativos). Verás advertencias `SecurityWarning` al ejecutarlos: son esperadas y confirman que el modelo de permisos está activo en local.

**El script `build` NO usa el modelo de permisos** y es intencional: el modelo de permisos de Node deshabilita la API `fsync` (sin flag para reactivarla), que el bundler de Next necesita al compilar — esto rompe el build en CI/Vercel con `ERR_ACCESS_DENIED`. No afecta la seguridad en producción: la salida es un export estático (`output: "export"`), sin runtime de Node que proteger. Las protecciones de cadena de suministro del `.npmrc` (instalación) siguen vigentes en el build.

Los build scripts de `sharp` y `unrs-resolver` se omiten (reconocido en `pnpm-workspace.yaml`); no se necesitan porque el export estático usa `images.unoptimized`.

La app **no añade ninguna dependencia**: el calendario, el manejo de fechas y los iconos están escritos a mano. `pnpm-lock.yaml` no cambia respecto al proyecto original.
