require('dotenv').config();
const TOKEN = process.env.TOKEN;
const Discord = require('discord.js');
const { DiscordTogether } = require('discord-together');

const { Public } = require("./modules/public.js");
const { Game } = require("./modules/game.js");
const { PR } = require("./modules/pr.js");
const { PRISM } = require('./modules/prism.js');
const { embedLog, embedMsg, sendMsg, deleteMsg } = require("./modules/utility.js");
const log = require('./modules/logger.js');
const { ServerLogs } = require('./modules/serverLogs.js');

const main = () => {
    const client = new Discord.Client();

    const prism = new PRISM();

    prism.client.once('connect', function() {
        console.info('Connected to server!');
        prism.login();
    });

    prism.client.on('error', (error) => {
        console.error(error);
    });

    client.on('ready', () => {
        console.info(`Logged in as ${client.user.tag}!`);
        const logCh = client.channels.cache.get(process.env.LOG_CHANNEL);

        logCh.send(embedMsg('Main Bot is ready!'));

        // Log
        log.info('Main Bot is ready!');

        prism.event.prependListener('log', (message) => {
            ServerLogs(message, client);
        });
    });

    client.on('message', msg => {
        // Public Scope Command
        Public(msg, client);

        // Gameserver Scope Command
        Game(msg, client, prism);
    });

    client.login(TOKEN);
};

const test = () => {
    console.log('RUNNING TEST MODE');
    const client = new Discord.Client();

    const prism = new PRISM();

    prism.client.once('connect', function() {
        console.info('Connected to server!');
        // prism.login();
    });

    prism.client.on('error', (error) => {
        console.error(error);
    });

    client.on('ready', () => {
        const logCh = client.channels.cache.get(process.env.LOG_CHANNEL);

        console.info(`Logged in as ${client.user.tag}!`);
        // const logCh = client.channels.cache.get(process.env.LOG_CHANNEL);
        // const reportCh = client.channels.cache.get(process.env.REPORT_CHANNEL);

        // logCh.send(embedMsg('Bot is ready!'))

        // Log
        log.info('Bot is ready!');

        prism.event.prependListener('log', (message) => {
            let msg;

            try{
                msg = message.format();
            } catch(error) {
                msg = message;
            }

            console.log(message);
            console.log(msg);

            sendMsg(logCh, embedLog(msg));
        });
    });

    client.on('message', async msg => {
        const split = msg.content.split(/ +/);
        const command = split[0].toLowerCase();
        const args = split.slice(1);

        if(command === 'u') {
            let str = '';
            for (let i = 0; i < args.length; i++) {
                str += ` ${args[i]}`;
            }

            sendMsg(msg.channel, embedLog(str));
            deleteMsg(msg);
        }
    });

    client.login(TOKEN);
};

const game = async () => {
    const client = new Discord.Client();

    client.on('ready', () => {
        console.info(`Logged in as ${client.user.tag}!`);
        const logCh = client.channels.cache.get(process.env.LOG_CHANNEL);

        logCh.send(embedMsg('Game Server Bot is ready!'));

        // Log
        log.info('Game Server Bot is ready!');
    });

    client.on('message', msg => {
        PR(msg);
    });

    client.login(TOKEN);
};

const both = async () => {
    const client = new Discord.Client();

    const prism = new PRISM();

    prism.client.once('connect', function() {
        console.info('Connected to server!');
        prism.login();
    });

    prism.client.on('error', (error) => {
        console.error(error);
    });

    client.on('ready', () => {
        console.info(`Logged in as ${client.user.tag}!`);
        const logCh = client.channels.cache.get(process.env.LOG_CHANNEL);

        logCh.send(embedMsg('Main Bot is ready!'));

        // Log
        log.info('Main Bot is ready!');

        prism.event.prependListener('log', (message) => {
            ServerLogs(message, client);
        });
    });

    client.on('message', msg => {
        // Public Scope Command
        Public(msg, client);

        // Gameserver Scope Command
        Game(msg, client, prism);

        PR(msg);
    });

    client.login(TOKEN);
};

function beta() {
    const client = new Discord.Client();
    client.discordTogether = new DiscordTogether(client);

    client.on('message', async message => { // 'message' for Discord.js v12
        if (message.content === 'start lettertile') {
            if(message.member.voice.channel) {
                client.discordTogether.createTogetherCode(message.member.voice.channel.id, 'lettertile').then(async invite => {
                    return message.channel.send(`${invite.code}`);
                });
            }
        }
    });

    client.login(TOKEN);
}

switch (process.env.MODE) {
    case 'development':
        test();
        break;
    case 'main':
        main();
        break;
    case 'game':
        game();
        break;
    case 'both':
        both();
        break;
    case 'beta':
        beta();
        break;
}
