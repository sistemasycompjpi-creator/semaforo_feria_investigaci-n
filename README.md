# Semáforo - Gestión de Proyectos y Asesores

Aplicación híbrida construida con **React + Vite + TypeScript** para el frontend y **Electron** para ofrecer persistencia local en Desktop.

## Características principales

- CRUD completo para **asesores** y **proyectos** con filtros, búsquedas y formularios modales.
- Persistencia en JSON escrita en `AppData/roaming/semaforo/database.json` al correr en Electron y `localStorage` como fallback durante desarrollo con Vite.
- Importación y exportación de CSV directamente desde las páginas de Asesores y Proyectos, con validación y creación automática de asesores.
- Botonera amigable con accesos rápidos: nuevo proyecto/asesor, exportar CSV, importar CSV.

### Semáforo pedagógico y colores

- **Verde**: indica que la presentación está en fase inicial y aún tiene tiempo completo del bloque asignado.
- **Amarillo**: indica que el tiempo comienza a acelerarse y hay que preparar las conclusiones o el cierre.
- **Rojo**: señala que quedan pocos segundos y se debe finalizar con rapidez.
- **Cian** (`aviso`): cuenta regresiva de 10 segundos antes de abrir el turno de preguntas.
- **Morado** (`preguntasRespuestas`): periodo dedicado a preguntas y respuestas con el tribunal o público.
- **Azul** (`cambioEquipo`): transición para ceder el turno al siguiente equipo expositor.

### Esquema de colores de los botones

- **Verde (Exportar)**: Descarga un `.csv` con la vista actual (Asesores o Proyectos).
- **Azul (Importar)**: Abre el selector de archivos para cargar un `.csv` válido y actualizar datos.
- **Morado (Nuevo)**: Abre el modal de creación para agregar un nuevo proyecto o asesor.
- **Gris/rojo** en tablas: iconos de lápiz/basura indican editar o eliminar registros existentes.

## Requisitos previos

- Node.js 20+ (compatible con Electron 34)
- npm 10+

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Levanta Vite en modo desarrollo (`http://localhost:5173`). |
| `npm run electron:dev` | Ejecuta Electron apuntando al dev server (usa `VITE_DEV_SERVER_URL`). |
| `npm run electron` | Abre Electron cargando los archivos de la carpeta `dist/` generada por `npm run build`. |
| `npm run build` | Compila TypeScript + Vite para producción. |
| `npm run electron:build` | Corre el build completo y genera el instalador en `release/Semáforo Setup x.y.z.exe`. |
| `npm run lint` | Ejecuta ESLint en todo el proyecto. |

### Flujo recomendado para desarrollo Electron

1. Ejecuta `npm run dev` en un terminal para levantar Vite en `http://localhost:5173`.

2. En otro terminal ejecuta `npm run electron:dev`; Electron abrirá la ventana y tratará de conectarse al servidor de desarrollo, mostrando DevTools automáticamente.

### Comprobaciones antes de build

- Los cambios deben pasar `npm run lint` y `npm run build`.
- Si haces cambios en el backend, valida import/export con archivos CSV de prueba.
- `release/` está en `.gitignore`; los instaladores no deben versionarse.

## Arquitectura general

- `src/backend`: APIs (`asesoresAPI`, `proyectosAPI`), persistencia híbrida (`database.ts`), utilidades CSV/JSON (`importExport.ts`).
- `src/pages`: Vistas de Asesores, Proyectos y Dashboard con formularios conectados a las APIs.
- `electron/main.js` y `electron/preload.js`: Proceso principal e IPC para intercambiar datos con renderer.
- `package.json`: Scripts para `npm run electron`, `npm run electron:dev` y `npm run electron:build` junto con dependencias de Electron.


## Exportar/importar CSV

- Los botones verdes permiten descargar archivos `.csv` con los registros actuales.
- Los botones azules abren un selector de archivo; el backend valida y agrega registros nuevos.
- Se aceptan comillas dobles para campos con comas; las modalidades válidas son `protocolo` o `informe`.

## Notas finales

- Para construir un instalador personalizado, modifica `build` en `package.json` (icono, nombre, versión) y luego ejecuta `npm run electron:build`.
- Si borras los datos del navegador, puedes volver a cargar el JSON desde `/src/backend/database.json` o desde el instalador.
- Reporta problemas o mejoras en Issues y agrega los cambios clave al `CHANGELOG.md` antes de subir el release.
