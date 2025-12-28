const EventEmitter = require('events');
const FigmaParser = require('./parser');

class FigmaMonitor extends EventEmitter {
    constructor() {
        super();
        this.parser = new FigmaParser();
        this.currentFile = null;
        this.isActive = false;
        this.isRunning = false;
        this.pollInterval = null;
        this.pollRate = 5000; // Check every 5 seconds
    }

    /**
     * Start monitoring Figma
     */
    start() {
        console.log('Starting Figma monitor...');

        // Do initial check
        this.check();

        // Start polling
        this.pollInterval = setInterval(() => {
            this.check();
        }, this.pollRate);

        console.log(`Figma monitor started (polling every ${this.pollRate / 1000}s)`);
    }

    /**
     * Stop monitoring
     */
    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('Figma monitor stopped');
        }
    }

    /**
     * Perform a check of Figma state
     */
    check() {
        const wasRunning = this.isRunning;
        const wasActive = this.isActive;
        const previousFile = this.currentFile;

        // Check if Figma is running
        this.isRunning = this.parser.isFigmaRunning();

        if (!this.isRunning) {
            // Figma not running
            if (wasRunning) {
                console.log('Figma stopped');
                this.currentFile = null;
                this.isActive = false;
                this.emit('statusChanged', {
                    running: false,
                    active: false
                });
                this.emit('fileChanged', null);
            }
            return;
        }

        // Figma is running, check if it's active
        this.isActive = this.parser.isFigmaActive();

        // Get current file
        const fileInfo = this.parser.getCurrentFile();

        // Check if file changed
        const fileChanged = this.hasFileChanged(previousFile, fileInfo);

        if (fileChanged) {
            console.log('Figma file changed:', fileInfo ? fileInfo.name : 'No file');
            this.currentFile = fileInfo;
            this.emit('fileChanged', fileInfo);
        }

        // Check if active status changed
        if (wasActive !== this.isActive) {
            console.log('Figma active status changed:', this.isActive ? 'active' : 'idle');
            this.emit('statusChanged', {
                running: this.isRunning,
                active: this.isActive
            });
        }

        // Emit status if Figma just started
        if (!wasRunning && this.isRunning) {
            console.log('Figma started');
            this.emit('statusChanged', {
                running: this.isRunning,
                active: this.isActive
            });
        }
    }

    /**
     * Check if file has changed
     * @param {Object|null} oldFile
     * @param {Object|null} newFile
     * @returns {boolean}
     */
    hasFileChanged(oldFile, newFile) {
        // Both null = no change
        if (!oldFile && !newFile) return false;

        // One is null = change
        if (!oldFile || !newFile) return true;

        // Compare file keys
        return oldFile.key !== newFile.key;
    }

    /**
     * Get current file info
     * @returns {Object|null}
     */
    getCurrentFile() {
        return this.currentFile;
    }

    /**
     * Get current status
     * @returns {Object}
     */
    getStatus() {
        return {
            running: this.isRunning,
            active: this.isActive,
            file: this.currentFile
        };
    }

    /**
     * Force a manual check
     */
    forceCheck() {
        this.check();
    }
}

module.exports = FigmaMonitor;
