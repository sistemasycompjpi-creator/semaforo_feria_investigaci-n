import { getDatabase, saveDatabase } from './database';
import type { Asesor, Database, Proyecto } from './schemas';

// ==================== EXPORTAR A CSV ====================

// Exportar asesores a CSV
export function exportAsesoresCSV(): string {
    const db = getDatabase();

    // Encabezados
    const headers = ['ID', 'Nombre', 'Tipo'];

    // Filas de datos
    const rows = db.asesores.map(a => [
        a.id.toString(),
        `"${a.nombre}"`, // Comillas para manejar comas en nombres
        a.tipo
    ]);

    // Combinar todo
    const csv = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    return csv;
}

// Exportar proyectos a CSV
export function exportProyectosCSV(): string {
    const db = getDatabase();

    // Encabezados
    const headers = [
        'ID',
        'Nombre',
        'Líder',
        'No. Control Líder',
        'Compañero',
        'No. Control Compañero',
        'Asesor Interno ID',
        'Asesor Interno',
        'Asesor Externo ID',
        'Asesor Externo',
        'Modalidad'
    ];

    // Filas de datos con información de asesores
    const rows = db.proyectos.map(p => {
        const asesorInterno = db.asesores.find(a => a.id === p.asesorInternoId);
        const asesorExterno = p.asesorExternoId
            ? db.asesores.find(a => a.id === p.asesorExternoId)
            : null;

        return [
            p.id.toString(),
            `"${p.nombre}"`, 
            `"${p.lider}"`, 
            p.noControlLider,
            `"${p.companero}"`, 
            p.noControlCompanero,
            p.asesorInternoId.toString(),
            asesorInterno ? `"${asesorInterno.nombre}"` : '""',
            p.asesorExternoId?.toString() || '',
            asesorExterno ? `"${asesorExterno.nombre}"` : '""',
            p.modalidad
        ];
    });

    // Combinar todo
    const csv = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    return csv;
}

// Descargar CSV como archivo (navegador)
export function downloadCSV(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== IMPORTAR DESDE CSV ====================

// Parsear CSV a array de objetos
function parseCSV(csv: string): string[][] {
    const lines = csv.trim().split('\n');
    return lines.map(line => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        return values;
    });
}

// Importar asesores desde CSV
export function importAsesoresCSV(csv: string): { data: Asesor[]; errors: string[] } {
    const rows = parseCSV(csv);
    const dataRows = rows.slice(1);
    const data: Asesor[] = [];
    const errors: string[] = [];

    dataRows.forEach((row, index) => {
        try {
            const [idStr, nombre, tipo] = row;

            if (tipo !== 'interno' && tipo !== 'externo') {
                errors.push(`Línea ${index + 2}: Tipo inválido "${tipo}" (debe ser "interno" o "externo")`);
                return;
            }

            const id = parseInt(idStr);

            data.push({
                id,
                nombre: nombre.replace(/^"|"$/g, ''),
                tipo: tipo as 'interno' | 'externo'
            });
        } catch (error) {
            errors.push(`Línea ${index + 2}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return { data, errors };
}

// Importar proyectos desde CSV
export function importProyectosCSV(csv: string): { data: Proyecto[]; errors: string[] } {
    const rows = parseCSV(csv);
    const dataRows = rows.slice(1);
    const data: Proyecto[] = [];
    const errors: string[] = [];

    dataRows.forEach((row, index) => {
        try {
            const [
                idStr,
                nombre,
                lider,
                noControlLider,
                companero,
                noControlCompanero,
                asesorInternoIdStr,
                , // asesorInternoNombre (omitido)
                asesorExternoIdStr,
                , // asesorExternoNombre (omitido)
                modalidad
            ] = row;

            if (modalidad !== 'protocolo' && modalidad !== 'informe') {
                errors.push(`Línea ${index + 2}: Modalidad inválida "${modalidad}"`);
                return;
            }

            const id = idStr.replace(/^"|"$/g, '').trim();
            const idNumber = Number(id);
            if (!id) {
                errors.push(`Línea ${index + 2}: ID vacío`);
                return;
            }
            if (Number.isNaN(idNumber)) {
                errors.push(`Línea ${index + 2}: ID inválido "${idStr}"`);
                return;
            }
            const asesorInternoId = parseInt(asesorInternoIdStr);
            const asesorExternoId = asesorExternoIdStr ? parseInt(asesorExternoIdStr) : null;

            data.push({
                id,
                nombre: nombre.replace(/^"|"$/g, ''),
                lider: lider.replace(/^"|"$/g, ''),
                noControlLider,
                companero: companero.replace(/^"|"$/g, ''),
                noControlCompanero,
                asesorInternoId,
                asesorExternoId,
                modalidad: modalidad as 'protocolo' | 'informe'
            });
        } catch (error) {
            errors.push(`Línea ${index + 2}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return { data, errors };
}

export function saveAsesores(asesores: Asesor[]) {
    const db = getDatabase();
    asesores.forEach(asesor => {
        const existente = db.asesores.find(a => a.id === asesor.id);
        if (existente) {
            Object.assign(existente, asesor);
        } else {
            db.asesores.push(asesor);
            if (asesor.id > db._metadata.lastAsesorId) {
                db._metadata.lastAsesorId = asesor.id;
            }
        }
    });
    saveDatabase(db);
}

export function saveProyectos(proyectos: Proyecto[]) {
    const db = getDatabase();
    proyectos.forEach(proyecto => {
        const existente = db.proyectos.find(p => p.id === proyecto.id);
        if (existente) {
            Object.assign(existente, proyecto);
        } else {
            db.proyectos.push(proyecto);
            const proyectoIdNumero = Number(proyecto.id);
            if (!Number.isNaN(proyectoIdNumero) && proyectoIdNumero > db._metadata.lastProyectoId) {
                db._metadata.lastProyectoId = proyectoIdNumero;
            }
        }
    });
    saveDatabase(db);
}

// Leer archivo CSV desde input file
export function readCSVFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
        };

        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };

        reader.readAsText(file);
    });
}

// ==================== EXPORTAR/IMPORTAR JSON COMPLETO ====================

// Exportar toda la base de datos a JSON
export function exportDatabaseJSON(): string {
    const db = getDatabase();
    return JSON.stringify(db, null, 2);
}

// Importar toda la base de datos desde JSON
export function importDatabaseJSON(json: string): { success: boolean; error?: string } {
    try {
        const data = JSON.parse(json) as Database;

        // Validar estructura básica
        if (!data.asesores || !data.proyectos || !data._metadata) {
            return {
                success: false,
                error: 'Estructura de JSON inválida'
            };
        }

        saveDatabase(data);

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al parsear JSON'
        };
    }
}