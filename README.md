# Pacientes UI

Frontend de gestión de pacientes construido con React + TypeScript + Vite + CoreUI.

## Requisitos

- Node.js LTS recomendado: `20.x`
- npm (incluido con Node)

## Ejecutar en desarrollo

```bash
npm ci
npm run dev
```

## Build de producción

```bash
npm run build
```

## Setup en Windows (recomendado)

Para evitar problemas de versiones de Node y librerías:

1. Instalar `nvm-windows`
2. Instalar y usar Node LTS `20.x`
3. Clonar el repo e instalar dependencias con lockfile

```bash
nvm install 20.19.0
nvm use 20.19.0
node -v
npm -v

git clone <URL_DEL_REPO>
cd pacientes-ui
npm ci
npm run dev
```

## Notas

- Se recomienda usar `npm ci` en lugar de `npm install` para mantener versiones exactas.
- Si cambiás de máquina o entorno, verificá la versión con `node -v` antes de instalar.
