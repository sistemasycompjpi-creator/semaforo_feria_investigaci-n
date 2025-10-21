import { getDatabase, saveDatabase } from '../database';
import type { Proyecto, ProyectoConAsesores, NuevoProyecto } from '../schemas';

export const proyectosAPI = {
    // Obtener todos los proyectos con sus asesores
    getAll(modalidad?: 'protocolo' | 'informe'): ProyectoConAsesores[] {
        const db = getDatabase();

        let proyectos = db.proyectos;

        if (modalidad) {
            proyectos = proyectos.filter(p => p.modalidad === modalidad);
        }

        // Agregar información de asesores
        return proyectos.map(p => {
            const asesorInterno = db.asesores.find(a => a.id === p.asesorInternoId);
            const asesorExterno = p.asesorExternoId
                ? db.asesores.find(a => a.id === p.asesorExternoId)
                : null;

            return {
                ...p,
                asesorInterno,
                asesorExterno
            };
        });
    },

    // Obtener un proyecto por ID
    getById(id: number): ProyectoConAsesores | undefined {
        const db = getDatabase();
        const proyecto = db.proyectos.find(p => p.id === id);

        if (!proyecto) return undefined;

        const asesorInterno = db.asesores.find(a => a.id === proyecto.asesorInternoId);
        const asesorExterno = proyecto.asesorExternoId
            ? db.asesores.find(a => a.id === proyecto.asesorExternoId)
            : null;

        return {
            ...proyecto,
            asesorInterno,
            asesorExterno
        };
    },

    // Crear un nuevo proyecto
    create(proyecto: NuevoProyecto): Proyecto {
        const db = getDatabase();

        // Generar nuevo ID
        const newId = db._metadata.lastProyectoId + 1;

        const nuevoProyecto: Proyecto = {
            id: newId,
            ...proyecto
        };

        db.proyectos.push(nuevoProyecto);
        db._metadata.lastProyectoId = newId;

        saveDatabase(db);

        return nuevoProyecto;
    },

    // Actualizar un proyecto
    update(id: number, proyecto: Partial<NuevoProyecto>): boolean {
        const db = getDatabase();
        const index = db.proyectos.findIndex(p => p.id === id);

        if (index === -1) return false;

        db.proyectos[index] = {
            ...db.proyectos[index],
            ...proyecto
        };

        saveDatabase(db);

        return true;
    },

    // Eliminar un proyecto
    delete(id: number): boolean {
        const db = getDatabase();
        const index = db.proyectos.findIndex(p => p.id === id);

        if (index === -1) return false;

        db.proyectos.splice(index, 1);

        saveDatabase(db);

        return true;
    },

    // Buscar proyectos
    search(termino: string, modalidad?: 'protocolo' | 'informe'): ProyectoConAsesores[] {
        const db = getDatabase();
        const terminoLower = termino.toLowerCase();

        let proyectos = db.proyectos.filter(p => {
            const matchNombre = p.nombre.toLowerCase().includes(terminoLower);
            const matchLider = p.lider.toLowerCase().includes(terminoLower);
            const matchNoControl = p.noControlLider.includes(termino);

            return matchNombre || matchLider || matchNoControl;
        });

        if (modalidad) {
            proyectos = proyectos.filter(p => p.modalidad === modalidad);
        }

        // Agregar información de asesores
        return proyectos.map(p => {
            const asesorInterno = db.asesores.find(a => a.id === p.asesorInternoId);
            const asesorExterno = p.asesorExternoId
                ? db.asesores.find(a => a.id === p.asesorExternoId)
                : null;

            return {
                ...p,
                asesorInterno,
                asesorExterno
            };
        });
    }
};
