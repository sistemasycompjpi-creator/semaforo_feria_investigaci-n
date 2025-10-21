# Semáforo - Aplicación Electron

Sistema de gestión de proyectos y asesores con persistencia en JSON y soporte de import/export CSV.

## 🚀 Características

- ✅ **Gestión de Asesores**: CRUD completo para asesores internos y externos
- ✅ **Gestión de Proyectos**: CRUD completo con relaciones a asesores
- ✅ **Persistencia en JSON**: Base de datos guardada en archivo JSON en AppData del usuario
- ✅ **Import/Export CSV**: Importa y exporta datos en formato CSV
- ✅ **Modo híbrido**: Funciona tanto en browser (desarrollo) como en Electron (producción)

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

### Modo Browser (Desarrollo con Vite)
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

**Nota**: En modo browser, los datos se guardan en `localStorage` del navegador.

### Modo Electron (Desarrollo)

1. **Terminal 1** - Iniciar servidor de desarrollo Vite:
```bash
npm run dev
```

2. **Terminal 2** - Iniciar Electron:
```bash
npm run electron:dev
```

En este modo, los datos se guardan en:
- **Windows**: `C:\Users\{Usuario}\AppData\Roaming\semaforo\database.json`
- **macOS**: `~/Library/Application Support/semaforo/database.json`
- **Linux**: `~/.config/semaforo/database.json`

## 📦 Build para Producción

```bash
# Compilar la aplicación
npm run build

# Crear ejecutable de Electron
npm run electron:build
```

El ejecutable se generará en la carpeta `release/`.

## 📊 Import/Export CSV

### Exportar Datos

1. Ve a la página de **Asesores** o **Proyectos**
2. Haz clic en el botón verde **"Exportar"**
3. El archivo CSV se descargará automáticamente

### Importar Datos

1. Ve a la página de **Asesores** o **Proyectos**
2. Haz clic en el botón azul **"Importar"**
3. Selecciona un archivo CSV con el formato correcto
4. Los datos se importarán y se actualizará la lista

### Formato CSV

#### Asesores (`asesores.csv`)
```csv
id,nombre,tipo
1,Dr. Juan Pérez,interno
2,Ing. María López,externo
```

Campos:
- `id`: Número único (opcional al importar, se auto-genera)
- `nombre`: Nombre completo del asesor
- `tipo`: `interno` o `externo`

#### Proyectos (`proyectos.csv`)
```csv
id,nombre,lider,noControlLider,companero,noControlCompanero,asesorInterno,asesorExterno,modalidad
1,Sistema Web,"Pérez, Juan",19050123,"García, Ana",19050456,Dr. Juan Pérez,Ing. María López,protocolo
```

Campos:
- `id`: Número único (opcional al importar, se auto-genera)
- `nombre`: Nombre del proyecto
- `lider`: Apellido, Nombre del líder
- `noControlLider`: Número de control del líder
- `companero`: Apellido, Nombre del compañero
- `noControlCompanero`: Número de control del compañero
- `asesorInterno`: Nombre del asesor interno (debe existir o se crea automáticamente)
- `asesorExterno`: Nombre del asesor externo (opcional, se crea si no existe)
- `modalidad`: `protocolo`, `residencia`, o `tesis`

**Notas importantes**:
- Los valores con comas deben estar entre comillas: `"Pérez, Juan"`
- Los asesores se buscan por nombre. Si no existen, se crean automáticamente
- El asesor externo es opcional (puede estar vacío)

## 🏗️ Estructura del Proyecto

```
semaforo/
├── electron/              # Archivos de Electron
│   ├── main.js           # Proceso principal
│   └── preload.js        # Script de preload (bridge seguro)
├── src/
│   ├── backend/          # Lógica del backend
│   │   ├── database.ts   # Sistema de persistencia híbrido
│   │   ├── schemas.ts    # Tipos TypeScript
│   │   ├── importExport.ts  # Import/Export CSV
│   │   └── api/
│   │       ├── asesores.ts   # API de asesores
│   │       └── proyectos.ts  # API de proyectos
│   ├── pages/            # Páginas React
│   │   ├── Asesores.tsx
│   │   ├── Proyectos.tsx
│   │   ├── Semaforo.tsx
│   │   └── Dashboard.tsx
│   └── components/       # Componentes reutilizables
└── dist/                 # Build de producción
```

## 🔧 Tecnologías

- **React 19** - Framework UI
- **TypeScript 5.9** - Tipado estático
- **Vite 7** - Build tool ultra-rápido
- **Electron 34** - Framework para aplicaciones de escritorio
- **TailwindCSS 4** - Estilos
- **React Router 7** - Enrutamiento

## 🐛 Troubleshooting

### Los datos no se guardan en modo browser
En modo browser (desarrollo con Vite), los datos se guardan en `localStorage`. Si borras el caché del navegador, perderás los datos. Para persistencia real, usa Electron.

### Error al importar CSV
Verifica que el formato del CSV sea correcto:
- Usa comas como separador
- Los campos con comas internas deben estar entre comillas
- Los tipos deben ser exactamente `interno` o `externo`
- Las modalidades deben ser `protocolo`, `residencia`, o `tesis`

### La aplicación Electron no arranca
1. Asegúrate de tener el servidor Vite corriendo primero (`npm run dev`)
2. Luego ejecuta `npm run electron:dev` en otra terminal
3. Si hay errores, verifica la consola de DevTools (se abre automáticamente en modo desarrollo)

## 📝 Licencia

MIT
