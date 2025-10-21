import { getDatabase, saveDatabase } from '../database';
import type { Asesor, NuevoAsesor } from '../schemas';

export const asesoresAPI = {
    // Obtener todos los asesores
    getAll(tipo?: 'interno' | 'externo'): Asesor[] {
        const db = getDatabase();

        if (tipo) {
            return db.asesores.filter(a => a.tipo === tipo);
        }

        return db.asesores;
    },

    // Obtener un asesor por ID
    getById(id: number): Asesor | undefined {
        const db = getDatabase();
        return db.asesores.find(a => a.id === id);
    },

    // Crear un nuevo asesor
    create(asesor: NuevoAsesor): Asesor {
        const db = getDatabase();

        // Generar nuevo ID
        const newId = db._metadata.lastAsesorId + 1;

        const nuevoAsesor: Asesor = {
            id: newId,
            ...asesor
        };

        db.asesores.push(nuevoAsesor);
        db._metadata.lastAsesorId = newId;

        saveDatabase(db);

        return nuevoAsesor;
    },

    // Actualizar un asesor
    update(id: number, asesor: Partial<NuevoAsesor>): boolean {
        const db = getDatabase();
        const index = db.asesores.findIndex(a => a.id === id);

        if (index === -1) return false;

        db.asesores[index] = {
            ...db.asesores[index],
            ...asesor
        };

        saveDatabase(db);

        return true;
    },

    // Eliminar un asesor
    delete(id: number): boolean {
        const db = getDatabase();
        const index = db.asesores.findIndex(a => a.id === id);

        if (index === -1) return false;

        // Verificar que no esté siendo usado por algún proyecto
        const proyectoUsandoAsesor = db.proyectos.find(
            p => p.asesorInternoId === id || p.asesorExternoId === id
        );

        if (proyectoUsandoAsesor) {
            throw new Error('No se puede eliminar el asesor porque está asignado a uno o más proyectos');
        }

        db.asesores.splice(index, 1);

        saveDatabase(db);

        return true;
    },

    // Buscar asesores por nombre
    search(nombre: string, tipo?: 'interno' | 'externo'): Asesor[] {
        const db = getDatabase();
        const nombreLower = nombre.toLowerCase();

        return db.asesores.filter(a => {
            const matchNombre = a.nombre.toLowerCase().includes(nombreLower);
            const matchTipo = tipo ? a.tipo === tipo : true;
            return matchNombre && matchTipo;
        });
    }
};
