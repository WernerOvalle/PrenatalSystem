# Control Prenatal

Web app para **registro y control prenatal** de gestantes. Construida con Next.js 16 (App Router) y exportación estática. Toda la información se guarda en el navegador con **localStorage** — no hay backend ni base de datos.

## Funcionalidades

- **Panel general**: total de gestantes, controles del mes, próximas citas y alertas de alto riesgo.
- **Registro de gestantes**: datos personales, obstétricos (FUM, talla, peso, grupo sanguíneo) y antecedentes.
- **Control prenatal**: peso, presión arterial, altura uterina, FCF, movimientos fetales, edemas, observaciones y próxima cita.
- **Cálculos automáticos**: edad gestacional (`sem+días`), fecha probable de parto (regla de Naegele), trimestre.
- **Clasificación de riesgo**: por edad materna, antecedentes y presión arterial del último control.

## Requisitos

- Node.js 20.9+ (probado en 22.18)
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

## Seguridad de la cadena de suministro

El `.npmrc` aplica políticas de protección ("fendo"): `ignore-scripts`, `save-exact`, `minimum-release-age`, `block-exotic-subdeps`, `trust-policy=no-downgrade` y el **modelo de permisos de Node** (`node-options="--permission"`).

Por eso los scripts `dev`, `lint` y `preview` invocan `node` con los flags `--allow-*` mínimos que Next/ESLint necesitan (lectura/escritura de fs, procesos hijo, workers y addons nativos). Verás advertencias `SecurityWarning` al ejecutarlos: son esperadas y confirman que el modelo de permisos está activo en local.

**El script `build` NO usa el modelo de permisos** y es intencional: el modelo de permisos de Node deshabilita la API `fsync` (sin flag para reactivarla), que el bundler de Next necesita al compilar — esto rompe el build en CI/Vercel con `ERR_ACCESS_DENIED`. No afecta la seguridad en producción: la salida es un export estático (`output: "export"`), sin runtime de Node que proteger. Las protecciones de cadena de suministro del `.npmrc` (instalación) siguen vigentes en el build.

Los build scripts de `sharp` y `unrs-resolver` se omiten (reconocido en `pnpm-workspace.yaml`); no se necesitan porque el export estático usa `images.unoptimized`.
