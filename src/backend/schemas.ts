export interface Asesor {
    id: number;
    nombre: string;
    tipo: 'interno' | 'externo';
}

export interface Proyecto {
    id: number;
    nombre: string;
    lider: string;
    noControlLider: string;
    companero: string;
    noControlCompanero: string;
    asesorInternoId: number;
    asesorExternoId: number | null;
    modalidad: 'protocolo' | 'informe';
}

export interface ProyectoConAsesores extends Proyecto {
    asesorInterno?: Asesor;
    asesorExterno?: Asesor | null;
}

export interface Database {
    asesores: Asesor[];
    proyectos: Proyecto[];
    _metadata: {
        lastAsesorId: number;
        lastProyectoId: number;
        version: string;
    };
}

// Tipos para creación (sin ID)
export type NuevoAsesor = Omit<Asesor, 'id'>;
export type NuevoProyecto = Omit<Proyecto, 'id'>;
