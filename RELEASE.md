# Release Checklist v1.0.0

## 📝 Pre-Release Steps

### 1. Commit All Changes
```bash
git add .
git commit -m "feat: Complete Figma Discord Presence v1.0.0

Features:
- Discord RPC integration with real-time presence updates
- Figma process and window title detection
- Custom presence format: 'Working on [project name]'
- Automatic idle/active state detection
- System tray integration
- Support for collaborative/shared Figma projects

Built for Windows with Electron + discord-rpc-patch"
```

### 2. Create Version Tag
```bash
git tag -a v1.0.0 -m "Release v1.0.0 - Initial Release

First stable release of Figma Discord Presence for Windows.

Features:
- Real-time Discord Rich Presence integration
- Automatic Figma file detection
- Shows 'Working on [project name]' in Discord
- System tray application
- 5-second auto-refresh

Requirements:
- Windows 10/11
- Discord Desktop
- Figma Desktop
- Node.js v16+"
```

### 3. Build Executable (Optional)
```bash
npm run dist
```
This creates Windows executable in `/dist` folder.

### 4. Push to GitHub
```bash
git push origin main
git push origin v1.0.0
```

### 5. Create GitHub Release
1. Go to: https://github.com/[your-username]/discord-presence/releases/new
2. Choose tag: `v1.0.0`
3. Release title: `v1.0.0 - Initial Release`
4. Description: (see below)
5. Attach files: `dist/Figma-Discord-Presence-Setup-1.0.0.exe` (if built)
6. Publish release

---

## 📄 Release Notes Template

```markdown
# 🎉 Figma Discord Presence v1.0.0

First stable release! Show your Figma activity on Discord automatically.

## ✨ Features

- ✅ **Real-time Discord Rich Presence** - Shows what you're working on in Figma
- ✅ **Automatic Detection** - Detects Figma files via window title
- ✅ **Custom Format** - Displays "Working on [Your Project Name]"
- ✅ **Idle Detection** - Shows "Idle" when Figma is closed
- ✅ **System Tray App** - Runs quietly in background
- ✅ **Auto-Refresh** - Updates every 5 seconds
- ✅ **Collaborative Projects** - Works with shared Figma files

## 🖥️ Requirements

- Windows 10/11
- Discord Desktop (with Activity Status enabled)
- Figma Desktop
- Node.js v16+

## 📥 Installation

### From Source
```bash
git clone https://github.com/[your-username]/discord-presence.git
cd discord-presence
npm install
npm start
```

### Setup Discord Application
1. Create app at https://discord.com/developers/applications
2. Copy Application ID
3. Create `.env` file:
   ```
   DISCORD_CLIENT_ID=your_app_id_here
   ```
4. Run `npm start`

## 🚀 Usage

1. Run the application
2. Open Figma Desktop with any file
3. Check your Discord profile - your activity will appear!

## 📸 Screenshot

Your Discord will show:
```
Playing Figma
Working on Web Admin
Designing in Figma
```

## 🔧 Known Issues

- Project name detection uses PowerShell (may occasionally fail)
- Requires Figma Desktop (not web browser version)
- Windows only (macOS/Linux not supported yet)

## 📝 Changelog

### Added
- Initial Discord RPC integration
- Figma file detection via window title
- System tray functionality
- Automatic presence updates
- Idle/active state tracking

## 🙏 Credits

Inspired by [bryanberger/figma-discord-presence](https://github.com/bryanberger/figma-discord-presence) (macOS version)

## 📄 License

MIT License
```

---

## ⚡ Quick Release Command

```bash
# All in one
git add .
git commit -m "feat: Complete Figma Discord Presence v1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0 - Initial Release"
git push origin main --tags
```

Then create GitHub Release manually via web interface.
