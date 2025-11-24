# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

## [0.1.0] - 2025-11-24

- **Experiencia del semáforo**: se rediseñó `Semaforo.tsx` para que el indicador sea ahora un círculo sólido con gradientes saturados, el temporizador vive dentro de una tarjeta translúcida fuera del círculo y el badge superior resume la fase activa, manteniendo la información de proyecto y participantes expandida y legible.

## [Sin publicar]

- **Persistencia en Electron**: Se añadió almacenamiento híbrido que escribe en `AppData/roaming/semaforo/database.json` cuando se ejecuta dentro de Electron y recurre a `localStorage` en desarrollo web.
- **Interfaz CSV**: Se integraron botones de exportar/importar en las páginas de Asesores y Proyectos, reutilizando utilidades del backend, validando los datos y creando asesores faltantes automáticamente.
- **CRUD completo**: `Asesores.tsx` y `Proyectos.tsx` consumen las APIs (`asesoresAPI`/`proyectosAPI`) para listar, crear, actualizar y eliminar registros, incluyendo búsquedas y filtros.
- **Infraestructura Electron**: Se agregaron las dependencias `electron`, `electron-builder` y `cross-env`; se configuraron los scripts (`electron`, `electron:dev`, `electron:build`); y se añadieron `electron/main.js` y `electron/preload.js` con IPC para persistencia JSON.
- **Limpieza de herramientas**: ESLint y TypeScript pasan tras separar `SemaforoContext` y `useSemaforo`; se mantiene `release/` ignorado y se documenta la exportación de JSON.
- **Artefactos de release**: `npm run electron:build` genera `release/Semáforo Setup x.y.z.exe`. Mantén ese binario fuera del repo y súbelo en una release de GitHub.
