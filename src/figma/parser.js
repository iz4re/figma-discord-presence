const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class FigmaParser {
    constructor() {
        this.appDataPath = process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming');
        this.figmaSettingsPath = path.join(this.appDataPath, 'Figma', 'settings.json');
        this.figmaDesktopPath = path.join(this.appDataPath, 'Figma Desktop');
    }

    /**
     * Read Figma settings file
     * @returns {Object|null} Settings object or null if not found
     */
    readSettings() {
        try {
            if (!fs.existsSync(this.figmaSettingsPath)) {
                return null;
            }

            const content = fs.readFileSync(this.figmaSettingsPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            console.error('Error reading Figma settings:', error);
            return null;
        }
    }

    /**
     * Get recent files from Figma Desktop directory
     * @returns {Array} Array of recent file info
     */
    getRecentFiles() {
        try {
            if (!fs.existsSync(this.figmaDesktopPath)) {
                return [];
            }

            const files = fs.readdirSync(this.figmaDesktopPath);
            const recentFiles = [];

            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const filePath = path.join(this.figmaDesktopPath, file);
                        const content = fs.readFileSync(filePath, 'utf8');
                        const data = JSON.parse(content);

                        if (data && data.name) {
                            recentFiles.push({
                                name: data.name,
                                key: data.key || file.replace('.json', ''),
                                lastModified: fs.statSync(filePath).mtime
                            });
                        }
                    } catch (err) {
                        // Skip invalid files
                    }
                }
            }

            // Sort by last modified
            recentFiles.sort((a, b) => b.lastModified - a.lastModified);
            return recentFiles;
        } catch (error) {
            console.error('Error reading recent files:', error);
            return [];
        }
    }

    /**
     * Parse current active file information
     * Tries to determine the most recently active Figma file
     * @returns {Object|null} File info or null
     */
    getCurrentFile() {
        const settings = this.readSettings();
        const recentFiles = this.getRecentFiles();

        if (recentFiles.length > 0) {
            const mostRecent = recentFiles[0];
            return {
                name: mostRecent.name,
                key: mostRecent.key,
                url: `https://www.figma.com/file/${mostRecent.key}`,
                lastActive: mostRecent.lastModified
            };
        }

        return null;
    }

    /**
     * Check if Figma is currently running
     * @returns {boolean}
     */
    isFigmaRunning() {
        try {
            const { execSync } = require('child_process');
            const result = execSync('tasklist /FI "IMAGENAME eq Figma.exe" /NH', { encoding: 'utf8' });
            return result.toLowerCase().includes('figma.exe');
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if Figma window is focused (active)
     * This is a simplified check - checks if Figma process exists
     * @returns {boolean}
     */
    isFigmaActive() {
        try {
            const { execSync } = require('child_process');

            // Get the currently focused window title
            const psScript = `
        Add-Type @"
          using System;
          using System.Runtime.InteropServices;
          public class Win32 {
            [DllImport("user32.dll")]
            public static extern IntPtr GetForegroundWindow();
            [DllImport("user32.dll")]
            public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);
          }
"@
        $handle = [Win32]::GetForegroundWindow()
        $title = New-Object System.Text.StringBuilder 256
        [void][Win32]::GetWindowText($handle, $title, 256)
        Write-Output $title.ToString()
      `;

            const result = execSync(`powershell -Command "${psScript.replace(/\n/g, ' ')}"`, {
                encoding: 'utf8',
                timeout: 2000
            });

            return result.toLowerCase().includes('figma');
        } catch (error) {
            // Fallback: just check if Figma is running
            return this.isFigmaRunning();
        }
    }

    /**
     * Get file name from settings or recent files
     * @param {string} fileKey - File key to look up
     * @returns {string|null}
     */
    getFileName(fileKey) {
        const recentFiles = this.getRecentFiles();
        const file = recentFiles.find(f => f.key === fileKey);
        return file ? file.name : null;
    }
}

module.exports = FigmaParser;
