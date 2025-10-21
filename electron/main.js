import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ruta al archivo database.json en la carpeta de usuario (AppData)
const getUserDataPath = () => {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'database.json');
};

let mainWindow;
let splashWindow;

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 200,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

// Crear ventana principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false, // No mostrar la ventana principal todavía
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // En desarrollo: cargar desde Vite dev server
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
    } else {
        // En producción: cargar desde archivos build
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Cuando la ventana principal esté lista para mostrarse, ciérra el splash y muéstrala
    mainWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.close();
        }
        mainWindow.show();
    });
}

// Manejar IPC para guardar base de datos
ipcMain.handle('save-database', async (_event, data) => {
    try {
        const dbPath = getUserDataPath();
        const jsonContent = JSON.stringify(data, null, 2);
        await fs.writeFile(dbPath, jsonContent, 'utf8');
        console.log('✅ Base de datos guardada en:', dbPath);
        return { success: true };
    } catch (error) {
        console.error('❌ Error al guardar database:', error);
        throw error;
    }
});

// Manejar IPC para cargar base de datos
ipcMain.handle('load-database', async () => {
    try {
        const dbPath = getUserDataPath();
        const content = await fs.readFile(dbPath, 'utf8');
        console.log('✅ Base de datos cargada desde:', dbPath);
        return JSON.parse(content);
    } catch (error) {
        // Si el archivo no existe, retornar null (usará datos por defecto)
        if (error.code === 'ENOENT') {
            console.log('ℹ️ Archivo database.json no existe, usando datos por defecto');
            return null;
        }
        console.error('❌ Error al cargar database:', error);
        throw error;
    }
});

// Inicializar app
app.whenReady().then(() => {
    createSplashWindow();
    createWindow();
});

// Cerrar app cuando se cierran todas las ventanas (excepto en macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Recrear ventana en macOS al hacer click en el dock
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});