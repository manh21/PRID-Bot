require('dotenv').config();
const TOKEN = process.env.TOKEN;
const Discord = require('discord.js');
const PRISM = require('@manh21/prism');

const {Public} = require("./modules/public.js");
const {Game} = require("./modules/game.js");
const {PR} = require("./modules/pr.js");
const {embedMsg} = require("./modules/utility.js");
const log = require('./modules/logger.js');

const client = new Discord.Client();
const prism = new PRISM(
    process.env.PORT,
    process.env.HOST,
    process.env.USERNAME,
    process.env.PASSWORD
);

const main = () => {
    initialize();

    client.on('message', msg => {
        // Public Scope Command
        Public(msg, client);

        // Gameserver Scope Command
        Game(msg, client, prism);
    });

    client.login(TOKEN);
};


const game = async () => {
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
    initialize();

    client.on('message', msg => {
        // Public Scope Command
        Public(msg, client);

        // Gameserver Scope Command
        Game(msg, client, prism);

        PR(msg);
    });

    client.login(TOKEN);
};

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
}
