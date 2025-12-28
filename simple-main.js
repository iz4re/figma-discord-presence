// Simplified Figma Discord Presence - Proven to Work
const { app, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const DiscordRPC = require('discord-rpc-patch');
const FigmaMonitor = require('./src/figma/monitor');

// Load environment
require('dotenv').config();
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1454711835965259934';

let tray = null;
let rpc = null;
let figmaMonitor = null;
let isConnected = false;

// Create system tray
function createTray() {
    const iconPath = path.join(__dirname, 'assets/icon.png');
    let icon = nativeImage.createEmpty();

    tray = new Tray(icon);
    tray.setToolTip('Figma Discord Presence');

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Figma Discord Presence', enabled: false },
        { type: 'separator' },
        { label: 'Running...', enabled: false },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() }
    ]);

    tray.setContextMenu(contextMenu);
}

// Connect to Discord
async function connectDiscord() {
    console.log('Connecting to Discord...');

    rpc = new DiscordRPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        console.log('✓ Discord RPC ready!');
        console.log('✓ Logged in as:', rpc.user.username);
        isConnected = true;

        // Set initial activity
        updatePresence();
    });

    rpc.on('disconnected', () => {
        console.log('Discord disconnected');
        isConnected = false;
    });

    try {
        await rpc.login({ clientId: DISCORD_CLIENT_ID });
        console.log('✓ Connected to Discord RPC');
    } catch (error) {
        console.error('✗ Failed to connect to Discord:', error.message);
    }
}

// Update Discord presence
function updatePresence(fileInfo = null) {
    if (!isConnected || !rpc) {
        console.log('Not connected to Discord');
        return;
    }

    let activity;

    if (fileInfo && fileInfo.name) {
        activity = {
            details: 'Working on ' + fileInfo.name,
            state: 'Designing in Figma',
            startTimestamp: Date.now(),
            buttons: [
                { label: 'View in Figma', url: fileInfo.url || 'https://figma.com' }
            ]
        };
        console.log('✓ Setting activity:', fileInfo.name);
    } else {
        activity = {
            details: 'Idle',
            state: 'Not working on any file',
            startTimestamp: Date.now()
        };
        console.log('✓ Setting activity: Idle');
    }

    rpc.setActivity(activity).then(() => {
        console.log('✓ Discord presence updated!');
    }).catch((err) => {
        console.error('✗ Failed to set activity:', err.message);
    });
}

// Start Figma monitoring
function startFigmaMonitor() {
    try {
        figmaMonitor = new FigmaMonitor();

        figmaMonitor.on('fileChanged', (fileInfo) => {
            console.log('File changed:', fileInfo ? fileInfo.name : 'None');
            updatePresence(fileInfo);
        });

        figmaMonitor.on('statusChanged', (status) => {
            console.log('Status changed:', status);
        });

        figmaMonitor.start();
        console.log('✓ Figma monitor started');
    } catch (error) {
        console.error('✗ Figma monitor error:', error.message);
    }
}

// App lifecycle
app.whenReady().then(() => {
    console.log('='.repeat(50));
    console.log('Figma Discord Presence - Simple Version');
    console.log('='.repeat(50));

    createTray();
    console.log('✓ System tray created');

    connectDiscord();
    startFigmaMonitor();

    console.log('='.repeat(50));
    console.log('App running! Check your Discord profile.');
    console.log('='.repeat(50));
});

app.on('window-all-closed', (e) => {
    e.preventDefault();
});

app.on('before-quit', () => {
    if (figmaMonitor) figmaMonitor.stop();
    if (rpc) rpc.destroy();
});
