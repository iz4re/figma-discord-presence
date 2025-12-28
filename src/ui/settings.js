// Settings window logic
let settings = {};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Settings window loaded');

    // Load initial settings
    await loadSettings();

    // Set up event listeners
    setupEventListeners();

    // Update status periodically
    setInterval(updateStatus, 2000);
    updateStatus();
});

/**
 * Load settings from main process
 */
async function loadSettings() {
    try {
        settings = await window.electronAPI.getSettings();
        console.log('Settings loaded:', settings);

        // Update UI
        document.getElementById('enabled-toggle').checked = settings.enabled;
        document.getElementById('hide-filename').checked = settings.privacy.hideFilename;
        document.getElementById('hide-buttons').checked = settings.privacy.hideButtons;
        document.getElementById('hide-activity').checked = settings.privacy.hideActivity;
        document.getElementById('client-id').textContent = settings.discord.clientId;
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

/**
 * Set up event listeners for all controls
 */
function setupEventListeners() {
    // Enable/Disable toggle
    document.getElementById('enabled-toggle').addEventListener('change', async (e) => {
        try {
            await window.electronAPI.updateSetting('enabled', e.target.checked);
            showNotification(e.target.checked ? 'Presence enabled' : 'Presence disabled');
        } catch (error) {
            console.error('Failed to update enabled setting:', error);
        }
    });

    // Privacy checkboxes
    document.getElementById('hide-filename').addEventListener('change', async (e) => {
        try {
            await window.electronAPI.updateSetting('privacy.hideFilename', e.target.checked);
            showNotification('Privacy settings updated');
        } catch (error) {
            console.error('Failed to update privacy setting:', error);
        }
    });

    document.getElementById('hide-buttons').addEventListener('change', async (e) => {
        try {
            await window.electronAPI.updateSetting('privacy.hideButtons', e.target.checked);
            showNotification('Privacy settings updated');
        } catch (error) {
            console.error('Failed to update privacy setting:', error);
        }
    });

    document.getElementById('hide-activity').addEventListener('change', async (e) => {
        try {
            await window.electronAPI.updateSetting('privacy.hideActivity', e.target.checked);
            showNotification('Privacy settings updated');
        } catch (error) {
            console.error('Failed to update privacy setting:', error);
        }
    });

    // Reconnect button
    document.getElementById('reconnect-btn').addEventListener('click', async () => {
        try {
            await window.electronAPI.reconnectDiscord();
            showNotification('Reconnecting to Discord...');
        } catch (error) {
            console.error('Failed to reconnect:', error);
            showNotification('Failed to reconnect', true);
        }
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            try {
                await window.electronAPI.updateSetting('reset', true);
                await loadSettings();
                showNotification('Settings reset to default');
            } catch (error) {
                console.error('Failed to reset settings:', error);
            }
        }
    });
}

/**
 * Update status display
 */
async function updateStatus() {
    try {
        const fileInfo = await window.electronAPI.getCurrentFile();

        // Update current file
        const fileElement = document.getElementById('current-file');
        if (fileInfo && fileInfo.name) {
            fileElement.textContent = fileInfo.name;
            fileElement.style.color = '#667eea';
        } else {
            fileElement.textContent = 'No file active';
            fileElement.style.color = '#6c757d';
        }

        // Update Discord status (simplified - would need actual status from main process)
        const discordStatus = document.getElementById('discord-status');
        discordStatus.textContent = 'Connected';
        discordStatus.className = 'status-badge connected';

        // Update Figma status
        const figmaStatus = document.getElementById('figma-status');
        if (fileInfo) {
            figmaStatus.textContent = 'Active';
            figmaStatus.className = 'status-badge connected';
        } else {
            figmaStatus.textContent = 'Idle';
            figmaStatus.className = 'status-badge';
        }
    } catch (error) {
        console.error('Failed to update status:', error);
    }
}

/**
 * Show a temporary notification
 * @param {string} message
 * @param {boolean} isError
 */
function showNotification(message, isError = false) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${isError ? '#f8d7da' : '#d4edda'};
    color: ${isError ? '#721c24' : '#155724'};
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
