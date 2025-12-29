# Figma Discord Presence

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)

Update your Discord activity status with Rich Presence from Figma! This lightweight desktop application runs in your system tray and automatically displays what file you're working on in Figma.

## Features

- **Shows your Figma activity** - Displays the current file you're working on
- **System tray application** - Runs quietly in the background
- **Privacy controls** - Hide filenames, buttons, or activity status
- **Easy toggle** - Enable or disable presence reporting anytime
- **Smart updates** - Respects Discord's 15-second rate limit
- **Manual reconnection** - Reconnect to Discord with one click
- **Idle detection** - Shows when you're actively using Figma vs idle

## Screenshot

> **Note**: The app runs in the system tray. Right-click the icon to access settings.

## Quick Start

### Prerequisites

- **Windows 10/11**
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Figma Desktop** - [Download here](https://www.figma.com/downloads/)
- **Discord** - Running on your PC

### Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/figma-discord-presence.git
   cd figma-discord-presence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Discord Application**
   
   a. Go to [Discord Developer Portal](https://discord.com/developers/applications)
   
   b. Click "New Application" and give it a name (e.g., "Figma")
   
   c. Copy the **Application ID**
   
   d. Create a `.env` file in the project root:
   ```bash
   copy .env.example .env
   ```
   
   e. Edit `.env` and paste your Application ID:
   ```
   DISCORD_CLIENT_ID=your_application_id_here
   ```

4. **Run the application**
   ```bash
   npm start
   ```

5. **Check your system tray** - You should see the app icon. Right-click it to open settings!

## Adding Custom Icon (Optional)

The app works without a custom icon, but you can add one:

1. Create or download a PNG icon (256x256 recommended)
2. Save it as `assets/icon.png`
3. For Windows executable, also create `assets/icon.ico`

Check `assets/README.md` for more details.

## Usage

### First Time Setup

1. **Start the app** - Run `npm start`
2. **Open Figma Desktop** - Open any file
3. **Check Discord** - Your profile should show "Playing Figma" with the file name

### Settings

Right-click the system tray icon and select "Settings" to access:

- **Enable/Disable** - Toggle Rich Presence on/off
- **Privacy Options**:
  - Hide filename - Shows "Working on a Figma file" instead
  - Hide buttons - Removes "View in Figma" button
  - Hide activity - Don't show idle/active status
- **Reconnect** - Manual Discord reconnection
- **Reset Settings** - Restore defaults

### System Tray Menu

- **Current file** - Shows active Figma file
- **✓ Enabled/Disabled** - Quick toggle
- **Settings** - Open settings window
- **Reconnect to Discord** - Force reconnection
- **Quit** - Close the application

## Development

### Running in Development

```bash
npm start
```

### Building for Production

```bash
npm run dist
```

This creates a distributable Windows executable in the `dist` folder.

## How It Works

This application monitors your Figma Desktop installation by:

1. **Reading Figma state files** from `%APPDATA%\Figma` and `%APPDATA%\Figma Desktop`
2. **Polling every 5 seconds** for changes
3. **Detecting the active file** and window focus state
4. **Updating Discord** via RPC protocol (max once every 15 seconds)

## Troubleshooting

### Discord presence not showing

1. **Check Discord is running** - The app needs Discord to be open
2. **Enable Activity Status** in Discord:
   - Settings → Activity Privacy → "Display current activity as a status message"
3. **Restart both apps** - Close Figma, Discord, and this app, then restart all
4. **Check Discord Client ID** - Make sure `.env` has the correct ID

### Figma file not detected

1. **Verify Figma Desktop is installed** - Not the web version
2. **Open a file in Figma** - Must have an active file
3. **Check file locations exist**:
   - `%APPDATA%\Figma\settings.json`
   - `%APPDATA%\Figma Desktop\`
4. **Try clicking "Reconnect to Discord"** in the tray menu

### App not starting

1. **Check Node.js version** - Run `node --version` (needs v16+)
2. **Reinstall dependencies** - Delete `node_modules` and run `npm install`
3. **Check error messages** - Run from command prompt to see errors

### "No capacity available" error when generating icon

This is a temporary API limitation. The app will work fine with the default/empty icon, or you can manually add your own icon to the `assets` folder.

## Requirements

- **Windows 10/11** (Windows-specific implementation)
- **Figma Desktop** installed normally (not modified)
- **Discord** with activity status enabled
- **Node.js** v16 or higher

## Acknowledgments

- Inspired by [bryanberger/figma-discord-presence](https://github.com/bryanberger/figma-discord-presence) (macOS version)
- Built with [Electron](https://www.electronjs.org/)
- Discord RPC via [discord-rpc](https://www.npmjs.com/package/discord-rpc)

## Tips

- The app runs in the background - look for it in the system tray
- Privacy settings apply immediately, no restart needed
- If Discord disconnects, use the "Reconnect" button
- File detection updates every 5 seconds
- Discord presence updates respect the 15-second rate limit

## Future Enhancements

- macOS support
- Linux support
- Custom Discord application images
- File collaboration status
- Time tracking

---

Made with love for Figma & Discord users 

and special thanks for Yudz32 (the king of code) haha jk

**Not affiliated with Figma or Discord**
