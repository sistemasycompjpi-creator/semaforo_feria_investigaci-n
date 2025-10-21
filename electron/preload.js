import { contextBridge, ipcRenderer } from 'electron';

// Exponer API segura al renderer
contextBridge.exposeInMainWorld('electronAPI', {
    saveDatabase: (data) => {
        return ipcRenderer.invoke('save-database', data);
    },
    loadDatabase: () => {
        return ipcRenderer.invoke('load-database');
    }
});

// Exponer información del proceso para detección de Electron
contextBridge.exposeInMainWorld('process', {
    type: 'renderer'
});
