# 📁 Sistema de Base de Datos JSON

Sistema completo de almacenamiento con JSON, ideal para aplicaciones Electron y Vite/React.

## 📂 Estructura de Archivos

```
src/backend/
├── database.json          # Archivo de datos (editable manualmente)
├── database.ts            # Gestor de base de datos
├── schemas.ts             # Tipos TypeScript
├── importExport.ts        # Funciones de importación/exportación
├── api/
│   ├── asesores.ts       # API CRUD para asesores
│   └── proyectos.ts      # API CRUD para proyectos
└── ejemploUso.ts         # Ejemplos de uso
```

## 🚀 Uso Básico

### 1. Importar las APIs

```typescript
import { asesoresAPI } from "./backend/api/asesores";
import { proyectosAPI } from "./backend/api/proyectos";
```

### 2. CRUD de Asesores

```typescript
// Obtener todos
const asesores = asesoresAPI.getAll();

// Filtrar por tipo
const internos = asesoresAPI.getAll("interno");

// Buscar
const resultados = asesoresAPI.search("García");

// Crear
const nuevo = asesoresAPI.create({
  nombre: "Dr. Nuevo",
  tipo: "interno",
});

// Actualizar
asesoresAPI.update(1, { nombre: "Dr. García Actualizado" });

// Eliminar
asesoresAPI.delete(5);
```

### 3. CRUD de Proyectos

```typescript
// Obtener todos (con datos de asesores incluidos)
const proyectos = proyectosAPI.getAll();

// Filtrar por modalidad
const protocolos = proyectosAPI.getAll("protocolo");

// Buscar
const resultados = proyectosAPI.search("Gestión");

// Crear
const nuevo = proyectosAPI.create({
  nombre: "Sistema IoT",
  lider: "Juan Pérez",
  noControlLider: "20401234",
  companero: "María López",
  noControlCompanero: "20401235",
  asesorInternoId: 1,
  asesorExternoId: 2,
  modalidad: "protocolo",
});

// Actualizar
proyectosAPI.update(1, { nombre: "Nuevo Nombre" });

// Eliminar
proyectosAPI.delete(3);
```

## 📤 Exportar Datos

### Exportar a CSV

```typescript
import {
  exportAsesoresCSV,
  exportProyectosCSV,
  downloadCSV,
} from "./backend/importExport";

// Exportar asesores
const csvAsesores = exportAsesoresCSV();
downloadCSV("asesores.csv", csvAsesores);

// Exportar proyectos
const csvProyectos = exportProyectosCSV();
downloadCSV("proyectos.csv", csvProyectos);
```

### Exportar a JSON

```typescript
import { exportDatabaseJSON, downloadCSV } from "./backend/importExport";

const json = exportDatabaseJSON();
downloadCSV("database.json", json);
```

## 📥 Importar Datos

### Importar desde CSV

```typescript
import {
  importAsesoresCSV,
  importProyectosCSV,
  readCSVFile,
} from "./backend/importExport";

// Con input file
async function handleImport(file: File) {
  const csv = await readCSVFile(file);
  const resultado = importAsesoresCSV(csv);

  console.log(`✅ Importados: ${resultado.success}`);
  console.log(`❌ Errores: ${resultado.errors.length}`);
}
```

### Importar desde JSON

```typescript
import { importDatabaseJSON, readCSVFile } from "./backend/importExport";

async function handleImportJSON(file: File) {
  const json = await readCSVFile(file); // Funciona para cualquier texto
  const resultado = importDatabaseJSON(json);

  if (resultado.success) {
    console.log("✅ Base de datos importada");
  } else {
    console.error("❌ Error:", resultado.error);
  }
}
```

## 🎯 Ejemplo React Component

```tsx
import { useState, useEffect } from "react";
import { asesoresAPI } from "./backend/api/asesores";
import {
  exportAsesoresCSV,
  downloadCSV,
  importAsesoresCSV,
  readCSVFile,
} from "./backend/importExport";

function AsesoresManager() {
  const [asesores, setAsesores] = useState(asesoresAPI.getAll());

  const handleExport = () => {
    const csv = exportAsesoresCSV();
    downloadCSV("asesores.csv", csv);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const csv = await readCSVFile(file);
    const resultado = importAsesoresCSV(csv);

    if (resultado.success > 0) {
      setAsesores(asesoresAPI.getAll()); // Recargar
      alert(`Importados ${resultado.success} asesores`);
    }

    if (resultado.errors.length > 0) {
      console.error("Errores:", resultado.errors);
    }
  };

  const handleCreate = () => {
    asesoresAPI.create({
      nombre: "Nuevo Asesor",
      tipo: "interno",
    });
    setAsesores(asesoresAPI.getAll());
  };

  return (
    <div>
      <button onClick={handleExport}>Exportar CSV</button>
      <input type="file" accept=".csv" onChange={handleImport} />
      <button onClick={handleCreate}>Agregar Asesor</button>

      <ul>
        {asesores.map((a) => (
          <li key={a.id}>
            {a.nombre} - {a.tipo}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 📝 Formato CSV

### Asesores (asesores.csv)

```csv
ID,Nombre,Tipo
1,"Dr. García",interno
2,"Ing. Martínez",externo
```

### Proyectos (proyectos.csv)

```csv
ID,Nombre,Líder,No. Control Líder,Compañero,No. Control Compañero,Asesor Interno ID,Asesor Interno,Asesor Externo ID,Asesor Externo,Modalidad
1,"Sistema de Gestión","Juan Pérez",20401234,"María López",20401235,1,"Dr. García",2,"Ing. Martínez",protocolo
```

## 🔄 Edición Manual del JSON

Puedes editar `database.json` directamente:

```json
{
  "asesores": [
    {
      "id": 1,
      "nombre": "Dr. García",
      "tipo": "interno"
    }
  ],
  "proyectos": [
    {
      "id": 1,
      "nombre": "Mi Proyecto",
      "lider": "Juan Pérez",
      "noControlLider": "20401234",
      "companero": "María López",
      "noControlCompanero": "20401235",
      "asesorInternoId": 1,
      "asesorExternoId": null,
      "modalidad": "protocolo"
    }
  ],
  "_metadata": {
    "lastAsesorId": 1,
    "lastProyectoId": 1,
    "version": "1.0.0"
  }
}
```

**⚠️ Importante**: Después de editar manualmente, recarga la aplicación.

## 💡 Ventajas

- ✅ **Sin base de datos externa**: Todo en JSON
- ✅ **Editable manualmente**: Fácil de modificar
- ✅ **Exportación CSV**: Compatible con Excel
- ✅ **Importación CSV**: Carga masiva de datos
- ✅ **TypeScript**: Type-safe
- ✅ **Compatible con Electron**: Fácil de empaquetar
- ✅ **Versionable**: Git-friendly

## 🚀 Para Electron

En el proceso principal (`electron/main.js`), puedes usar `fs` para persistencia:

```javascript
import fs from "fs";
import path from "path";

// Guardar al disco
function saveToFile(data) {
  const dbPath = path.join(__dirname, "../src/backend/database.json");
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
```

Modifica `saveDatabase()` en `database.ts` para usar `fs` en Electron.
