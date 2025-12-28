const RPC = require('discord-rpc-patch');

class DiscordClient {
    constructor(clientId) {
        this.clientId = clientId;
        this.rpc = null;
        this.isConnected = false;
        this.lastUpdateTime = 0;
        this.updateCooldown = 15000; // 15 seconds as per Discord's limit
        this.currentPresence = null;
        this.startTimestamp = null;
    }

    /**
     * Connect to Discord RPC
     * @returns {Promise}
     */
    async connect() {
        if (this.isConnected) {
            console.log('Already connected to Discord');
            return;
        }

        try {
            this.rpc = new RPC.Client({ transport: 'ipc' });

            this.rpc.on('ready', () => {
                console.log('Discord RPC ready');
                console.log('Logged in as:', this.rpc.user.username);
                this.isConnected = true;
                this.startTimestamp = new Date();
            });

            this.rpc.on('disconnected', () => {
                console.log('Discord RPC disconnected');
                this.isConnected = false;
            });

            await this.rpc.login({ clientId: this.clientId });
            console.log('Connected to Discord RPC');
        } catch (error) {
            console.error('Failed to connect to Discord:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Disconnect from Discord RPC
     */
    disconnect() {
        if (this.rpc) {
            this.rpc.destroy();
            this.rpc = null;
            this.isConnected = false;
            console.log('Disconnected from Discord');
        }
    }

    /**
     * Reconnect to Discord
     * @returns {Promise}
     */
    async reconnect() {
        console.log('Reconnecting to Discord...');
        this.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.connect();
    }

    /**
     * Update Discord Rich Presence
     * @param {Object} fileInfo - Figma file information
     * @param {Object} privacySettings - Privacy settings
     * @returns {Promise}
     */
    async updatePresence(fileInfo, privacySettings = {}) {
        if (!this.isConnected || !this.rpc) {
            console.warn('Not connected to Discord, cannot update presence');
            return;
        }

        // Check cooldown (respect Discord's 15s limit)
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateCooldown) {
            console.log('Update cooldown active, skipping update');
            return;
        }

        try {
            const presence = this.buildPresence(fileInfo, privacySettings);

            // Don't update if presence hasn't changed (except for timestamp)
            if (this.isSamePresence(presence, this.currentPresence)) {
                console.log('Presence unchanged, skipping update');
                return;
            }

            await this.rpc.setActivity(presence);
            this.currentPresence = presence;
            this.lastUpdateTime = now;
            console.log('Discord presence updated');
        } catch (error) {
            console.error('Failed to update Discord presence:', error);
        }
    }

    /**
     * Build presence object from file info and settings
     * @param {Object} fileInfo
     * @param {Object} privacySettings
     * @returns {Object}
     */
    buildPresence(fileInfo, privacySettings = {}) {
        const {
            hideFilename = false,
            hideButtons = false
        } = privacySettings;

        if (!fileInfo) {
            return {
                details: 'Idle',
                state: 'Not working on any file',
                startTimestamp: this.startTimestamp
            };
        }

        const details = hideFilename ? 'Working on a Figma file' : fileInfo.name;
        const state = 'Designing in Figma';

        const presence = {
            details: details,
            state: state,
            startTimestamp: this.startTimestamp
        };

        // Add button to view file (if not hidden)
        if (!hideButtons && fileInfo.url) {
            presence.buttons = [
                {
                    label: 'View in Figma',
                    url: fileInfo.url
                }
            ];
        }

        return presence;
    }

    /**
     * Check if two presence objects are the same (ignoring timestamps)
     * @param {Object} a
     * @param {Object} b
     * @returns {boolean}
     */
    isSamePresence(a, b) {
        if (!a || !b) return false;

        return (
            a.details === b.details &&
            a.state === b.state &&
            JSON.stringify(a.buttons || []) === JSON.stringify(b.buttons || [])
        );
    }

    /**
     * Clear Discord presence
     * @returns {Promise}
     */
    async clearPresence() {
        if (!this.isConnected || !this.rpc) {
            return;
        }

        try {
            await this.rpc.clearActivity();
            this.currentPresence = null;
            console.log('Discord presence cleared');
        } catch (error) {
            console.error('Failed to clear Discord presence:', error);
        }
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isReady() {
        return this.isConnected;
    }
}

module.exports = DiscordClient;
