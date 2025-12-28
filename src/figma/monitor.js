// Figma Monitor with Window Title Detection
const { execSync } = require('child_process');
const EventEmitter = require('events');

class FigmaMonitor extends EventEmitter {
    constructor() {
        super();
        this.currentFile = null;
        this.pollInterval = null;
        this.pollRate = 5000;
    }

    isFigmaRunning() {
        try {
            const result = execSync('tasklist /FI "IMAGENAME eq Figma.exe" /NH', {
                encoding: 'utf8',
                timeout: 2000,
                windowsHide: true
            });
            return result.toLowerCase().includes('figma.exe');
        } catch (error) {
            return false;
        }
    }

    getFigmaWindowTitle() {
        try {
            // PowerShell to get window title from Figma.exe process ONLY
            const psCommand = `Get-Process -Name Figma -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle} | Select-Object -ExpandProperty MainWindowTitle -First 1`;

            const result = execSync(`powershell -Command "${psCommand}"`, {
                encoding: 'utf8',
                timeout: 3000,
                windowsHide: true
            }).trim();

            return result || null;
        } catch (error) {
            return null;
        }
    }

    parseFileName(title) {
        if (!title || title === 'Figma') return null;

        // Figma window titles: "FileName – Figma" or "FileName - Figma"
        let fileName = title
            .replace(/\s*[–-]\s*Figma\s*$/i, '')
            .trim();

        if (!fileName || fileName === 'Figma') return null;

        return {
            name: fileName,
            url: 'https://www.figma.com'
        };
    }

    start() {
        console.log('✓ Figma monitor started (with title detection)');
        this.check();
        this.pollInterval = setInterval(() => {
            this.check();
        }, this.pollRate);
    }

    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }

    check() {
        const isRunning = this.isFigmaRunning();

        if (!isRunning) {
            if (this.currentFile) {
                console.log('Figma closed');
                this.currentFile = null;
                this.emit('fileChanged', null);
            }
            return;
        }

        // Figma is running, try to get window title
        const windowTitle = this.getFigmaWindowTitle();
        const fileInfo = this.parseFileName(windowTitle);

        // If we can't get title, use generic message
        const finalFileInfo = fileInfo || {
            name: 'Working on a design',
            url: 'https://www.figma.com'
        };

        // Check if file changed
        if (this.hasFileChanged(this.currentFile, finalFileInfo)) {
            console.log('✓ Figma file:', finalFileInfo.name);
            this.currentFile = finalFileInfo;
            this.emit('fileChanged', finalFileInfo);
        }
    }

    hasFileChanged(oldFile, newFile) {
        if (!oldFile && !newFile) return false;
        if (!oldFile || !newFile) return true;
        return oldFile.name !== newFile.name;
    }

    getCurrentFile() {
        return this.currentFile;
    }
}

module.exports = FigmaMonitor;
