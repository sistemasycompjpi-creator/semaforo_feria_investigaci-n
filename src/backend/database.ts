import type { Database } from './schemas';
import databaseData from './database.json';

const STORAGE_KEY = 'semaforo_database';

const isElectron = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(window.process && window.process.type === 'renderer');
};

function loadFromLocalStorage(): Database | null {
    if (typeof localStorage === 'undefined') return null;
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            console.log('📂 Base de datos cargada desde localStorage');
            return JSON.parse(stored) as Database;
        }
    } catch (err) {
        console.warn('No se pudo cargar desde localStorage:', err);
    }
    return null;
}

function loadInitialDatabase(): Database {
    const fromStorage = loadFromLocalStorage();
    if (fromStorage) return fromStorage;
    
    console.log('📂 Usando datos iniciales de database.json');
    return JSON.parse(JSON.stringify(databaseData));
}

let database: Database = loadInitialDatabase();

export function getDatabase(): Database {
    return database;
}

async function persistToElectron(data: Database): Promise<boolean> {
    if (!isElectron() || !window.electronAPI?.saveDatabase) {
        return false;
    }
    
    try {
        await window.electronAPI.saveDatabase(data);
        console.log('💾 Base de datos guardada en disco (Electron)');
        return true;
    } catch (err) {
        console.error('❌ Error al guardar con Electron:', err);
        return false;
    }
}

export async function saveDatabase(data: Database): Promise<void> {
    database = data;
    
    const savedToElectron = await persistToElectron(data);
    
    if (!savedToElectron && typeof localStorage !== 'undefined') {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
            console.log('💾 Base de datos guardada en localStorage');
        } catch (err) {
            console.error('❌ Error al guardar en localStorage:', err);
        }
    }
}

export async function reloadDatabase(): Promise<void> {
    if (isElectron() && window.electronAPI?.loadDatabase) {
        try {
            const loaded = await window.electronAPI.loadDatabase();
            if (loaded) {
                database = loaded;
                console.log('🔄 Base de datos recargada desde disco (Electron)');
                return;
            }
        } catch (err) {
            console.warn('No se pudo recargar desde Electron:', err);
        }
    }
    
    database = loadInitialDatabase();
    console.log('🔄 Base de datos recargada');
}

export function exportDatabaseToFile(): void {
    const json = JSON.stringify(database, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `database-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('📥 Base de datos exportada como archivo JSON');
}

declare global {
    interface Window {
        electronAPI?: {
            saveDatabase: (data: Database) => Promise<void>;
            loadDatabase: () => Promise<Database | null>;
        };
        process?: {
            type?: string;
        };
    }
}
