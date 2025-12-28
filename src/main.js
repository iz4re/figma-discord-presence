const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Import modules (will be created in next steps)
let FigmaMonitor, DiscordClient, SettingsManager;

let tray = null;
let settingsWindow = null;
let figmaMonitor = null;
let discordClient = null;
let settingsManager = null;

// Load environment variables
require('dotenv').config();

// Discord Client ID from environment or default
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1234567890123456789';

function createTray() {
  // Create tray icon
  const iconPath = path.join(__dirname, '../assets/icon.png');

  // Create a simple icon if the file doesn't exist
  let trayIcon;
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath);
  } else {
    // Create a simple colored square as fallback
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Figma Discord Presence');

  updateTrayMenu();
}

function updateTrayMenu() {
  if (!settingsManager) return;

  const isEnabled = settingsManager ? settingsManager.get('enabled', true) : true;
  const currentFile = figmaMonitor ? figmaMonitor.getCurrentFile() : null;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Figma Discord Presence',
      enabled: false
    },
    { type: 'separator' },
    {
      label: currentFile ? `Current: ${currentFile.name}` : 'No Figma file active',
      enabled: false
    },
    { type: 'separator' },
    {
      label: isEnabled ? '✓ Enabled' : 'Disabled',
      type: 'checkbox',
      checked: isEnabled,
      click: () => {
        if (settingsManager) {
          settingsManager.set('enabled', !isEnabled);
          updateTrayMenu();
          if (discordClient) {
            if (!isEnabled) {
              discordClient.clearPresence();
            }
          }
        }
      }
    },
    {
      label: 'Settings...',
      click: () => {
        createSettingsWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Reconnect to Discord',
      click: () => {
        if (discordClient) {
          discordClient.reconnect();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    maximizable: false,
    title: 'Figma Discord Presence - Settings',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'ui/settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  // Remove menu bar
  settingsWindow.setMenuBarVisibility(false);
}

function initializeApp() {
  console.log('Initializing Figma Discord Presence...');

  // Try to load modules
  try {
    SettingsManager = require('./settings/manager');
    settingsManager = new SettingsManager();
    console.log('✓ Settings manager loaded');
  } catch (error) {
    console.warn('Settings manager not available yet:', error.message);
  }

  try {
    FigmaMonitor = require('./figma/monitor');
    figmaMonitor = new FigmaMonitor();
    console.log('✓ Figma monitor loaded');

    // Listen for Figma file changes
    figmaMonitor.on('fileChanged', (fileInfo) => {
      console.log('Figma file changed:', fileInfo);
      updateTrayMenu();

      if (discordClient && settingsManager && settingsManager.get('enabled', true)) {
        discordClient.updatePresence(fileInfo, settingsManager.getPrivacySettings());
      }
    });

    figmaMonitor.on('statusChanged', (status) => {
      console.log('Figma status changed:', status);
      updateTrayMenu();
    });

    // Start monitoring
    figmaMonitor.start();
  } catch (error) {
    console.warn('Figma monitor not available yet:', error.message);
  }

  try {
    DiscordClient = require('./discord/client');
    discordClient = new DiscordClient(DISCORD_CLIENT_ID);
    console.log('✓ Discord client loaded');

    // Connect to Discord
    discordClient.connect().then(() => {
      console.log('✓ Connected to Discord');

      // Immediately update presence with current Figma state
      if (figmaMonitor && settingsManager && settingsManager.get('enabled', true)) {
        const currentFile = figmaMonitor.getCurrentFile();
        console.log('Setting initial presence, current file:', currentFile);
        discordClient.updatePresence(currentFile, settingsManager.getPrivacySettings());
      }
    }).catch((error) => {
      console.error('Failed to connect to Discord:', error);
    });
  } catch (error) {
    console.warn('Discord client not available yet:', error.message);
  }

  // Create system tray
  createTray();

  console.log('✓ Application initialized');
  console.log('Right-click the tray icon to open settings');
}

// IPC Handlers for settings window
ipcMain.handle('get-settings', () => {
  if (settingsManager) {
    return settingsManager.getAll();
  }
  return {};
});

ipcMain.handle('update-setting', (event, key, value) => {
  if (settingsManager) {
    settingsManager.set(key, value);
    updateTrayMenu();

    // Apply changes immediately
    if (key === 'enabled' && !value && discordClient) {
      discordClient.clearPresence();
    }
  }
});

ipcMain.handle('reconnect-discord', async () => {
  if (discordClient) {
    return await discordClient.reconnect();
  }
});

ipcMain.handle('get-current-file', () => {
  if (figmaMonitor) {
    return figmaMonitor.getCurrentFile();
  }
  return null;
});

// App lifecycle
app.whenReady().then(() => {
  initializeApp();
});

app.on('window-all-closed', (e) => {
  // Prevent app from quitting when all windows are closed
  // We want it to run in the background
  e.preventDefault();
});

app.on('before-quit', () => {
  // Cleanup
  if (figmaMonitor) {
    figmaMonitor.stop();
  }
  if (discordClient) {
    discordClient.disconnect();
  }
});
