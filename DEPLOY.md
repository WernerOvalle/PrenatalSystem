# Despliegue manual a Azure Static Web Apps (plan Free)

La app es un export estático (`out/`). Se sube desde tu máquina con la CLI oficial de Azure, sin GitHub Actions.

## 1. Obtener el token

Portal de Azure → tu recurso **Static Web App** → *Overview* → **Manage deployment token** → copiar.

## 2. Definir el token solo en la terminal actual

El token **nunca** va en el código, en `package.json` ni en un archivo commiteado. Se define como variable de entorno y desaparece al cerrar la terminal.

PowerShell:

```powershell
$env:SWA_CLI_DEPLOYMENT_TOKEN = "pega-aqui-el-token"
```

bash / Git Bash:

```bash
export SWA_CLI_DEPLOYMENT_TOKEN="pega-aqui-el-token"
```

`.env.example` solo documenta el nombre de la variable. Los `.env*` reales están en `.gitignore`.

## 3. Subir cambios

```bash
pnpm run deploy
```

El script hace `pnpm build` y luego sube `out/` a producción con `@azure/static-web-apps-cli`.

> **Usa `pnpm run deploy`, no `pnpm deploy`.** `pnpm deploy` es un comando propio de pnpm (para workspaces) y no ejecuta el script.

El ruteo lo define `public/staticwebapp.config.json`. Next lo copia a `out/` al compilar:
- las rutas desconocidas caen en `/index.html`;
- los 404 muestran `/404.html`.

## Cadena de suministro

- **La CLI no es dependencia del proyecto.** `pnpm dlx` la descarga a una caché temporal al desplegar; no toca `package.json` ni `pnpm-lock.yaml`.
- **Versión fijada: `@azure/static-web-apps-cli@2.0.10`.**
  - Release estable del 2026-07-20.
  - La publica `azure-sdk` (Microsoft).
  - Para subirla: revisar las releases en GitHub (`Azure/static-web-apps-cli`) y en npm, y elegir una con más de 7 días de publicada.
- **Protecciones que aplican a la descarga.** Los ajustes de `pnpm-workspace.yaml` también rigen `pnpm dlx`:
  - `ignoreScripts`
  - `minimumReleaseAge` de 7 días
  - `blockExoticSubdeps`
  - `trustPolicy`
- **Binario de Microsoft.** Al desplegar, la CLI descarga `StaticSitesClient` desde Microsoft y verifica su checksum.
- **Sin llavero del sistema.** `--no-use-keychain` evita que la CLI intente guardar credenciales ahí con `keytar`, que es nativo y no compila con `ignore-scripts`.
- **Si el token se filtra**, regéneralo en el portal (*Manage deployment token* → *Reset token*).
