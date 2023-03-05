const { PteroClient } = require('@devnote-dev/pterojs');

const PTERODACTYL_API_BASE_URL = process.env.PTERODACTYL_API_BASE_URL;
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY;
const PTERODACTYL_SERVER_ID = process.env.PTERODACTYL_SERVER_ID;

// Initialising the client
const client = new PteroClient(PTERODACTYL_API_BASE_URL, PTERODACTYL_API_KEY);

client.connect();

// Adding the server to listen for
const shard = client.addSocketServer(PTERODACTYL_SERVER_ID);

// Listening to events
shard.on('statusUpdate', (status) => {
    console.log(`server ${shard.id} status: ${status}`);
});

// Connecting to the server
shard.connect();

const start = async () => {
    await client.servers.setPowerState(PTERODACTYL_SERVER_ID, 'start');
}

const stop = async () => {
    await client.servers.setPowerState(PTERODACTYL_SERVER_ID, 'stop');
}

const restart = async () => {
    await client.servers.setPowerState(PTERODACTYL_SERVER_ID, 'restart');
}

const status = async () => {
    const server = await client.servers.get(PTERODACTYL_SERVER_ID);
    return server.status;
}

module.exports = {
    start,
    stop,
    restart,
    status
}