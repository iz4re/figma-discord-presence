// Simple Discord RPC Test
const DiscordRPC = require('discord-rpc-patch');

const clientId = '1454711835965259934';

const rpc = new DiscordRPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
    console.log('✓ Discord RPC Connected!');
    console.log('Logged in as:', rpc.user.username);
    console.log('User ID:', rpc.user.id);

    // Set a simple activity
    rpc.setActivity({
        details: 'Testing Discord RPC',
        state: 'This is a test',
        startTimestamp: Date.now(),
    }).then(() => {
        console.log('✓ Activity set successfully!');
        console.log('Check your Discord profile now!');
    }).catch((err) => {
        console.error('✗ Failed to set activity:', err);
    });
});

rpc.on('disconnected', () => {
    console.log('Disconnected from Discord');
});

rpc.login({ clientId }).catch((err) => {
    console.error('✗ Failed to connect to Discord:', err.message);
    console.error('Full error:', err);
    process.exit(1);
});

console.log('Connecting to Discord...');

// Keep process alive
setTimeout(() => {
    console.log('\nTest running for 30 seconds...');
    console.log('Press Ctrl+C to stop');
}, 5000);
