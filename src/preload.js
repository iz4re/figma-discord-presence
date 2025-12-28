const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSetting: (key, value) => ipcRenderer.invoke('update-setting', key, value),

    // Discord
    reconnectDiscord: () => ipcRenderer.invoke('reconnect-discord'),

    // Figma
    getCurrentFile: () => ipcRenderer.invoke('get-current-file'),

    // Listeners
    onSettingsChanged: (callback) => {
        ipcRenderer.on('settings-changed', callback);
    },
    onFigmaFileChanged: (callback) => {
        ipcRenderer.on('figma-file-changed', callback);
    }
});
