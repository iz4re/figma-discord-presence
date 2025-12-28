const Store = require('electron-store');

class SettingsManager {
    constructor() {
        this.store = new Store({
            name: 'figma-discord-presence-settings',
            defaults: {
                enabled: true,
                privacy: {
                    hideFilename: false,
                    hideActivity: false,
                    hideButtons: false
                },
                discord: {
                    clientId: process.env.DISCORD_CLIENT_ID || '1234567890123456789'
                }
            }
        });
    }

    /**
     * Get a setting value
     * @param {string} key - Setting key (supports dot notation)
     * @param {any} defaultValue - Default value if not found
     * @returns {any}
     */
    get(key, defaultValue = null) {
        return this.store.get(key, defaultValue);
    }

    /**
     * Set a setting value
     * @param {string} key - Setting key (supports dot notation)
     * @param {any} value - Value to set
     */
    set(key, value) {
        this.store.set(key, value);
    }

    /**
     * Get all settings
     * @returns {Object}
     */
    getAll() {
        return this.store.store;
    }

    /**
     * Get privacy settings
     * @returns {Object}
     */
    getPrivacySettings() {
        return this.get('privacy', {
            hideFilename: false,
            hideActivity: false,
            hideButtons: false
        });
    }

    /**
     * Update privacy setting
     * @param {string} key - Privacy setting key
     * @param {boolean} value - Value
     */
    setPrivacySetting(key, value) {
        this.set(`privacy.${key}`, value);
    }

    /**
     * Check if presence is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.get('enabled', true);
    }

    /**
     * Enable or disable presence
     * @param {boolean} enabled
     */
    setEnabled(enabled) {
        this.set('enabled', enabled);
    }

    /**
     * Get Discord client ID
     * @returns {string}
     */
    getDiscordClientId() {
        return this.get('discord.clientId');
    }

    /**
     * Set Discord client ID
     * @param {string} clientId
     */
    setDiscordClientId(clientId) {
        this.set('discord.clientId', clientId);
    }

    /**
     * Reset all settings to defaults
     */
    reset() {
        this.store.clear();
    }

    /**
     * Get the store path
     * @returns {string}
     */
    getStorePath() {
        return this.store.path;
    }
}

module.exports = SettingsManager;
