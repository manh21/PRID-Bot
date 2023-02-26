require('dotenv').config();
const TOKEN = process.env.TOKEN;
const Discord = require('discord.js');

const {Public} = require("./modules/public.js");
const {Game} = require("./modules/game.js");
const { sendMsg, embedMsg } = require('./modules/utility');

const PRISM = require('@manh21/prism').default;

const client = new Discord.Client();
const prism = new PRISM(
    process.env.PRISM_PORT,
    process.env.PRISM_HOST,
    process.env.PRISM_USERNAME,
    process.env.PRISM_PASSWORD
);

const main = () => {
    client.on('message', msg => {
        // Public Scope Command
        Public(msg, client);

        // Gameserver Scope Command
        Game(msg, client, prism);
    });

    client.on('ready', () => {
        console.info(`Logged in as ${client.user.tag}!`);

        const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL);

        logChannel.send(embedMsg('Bot is online!'));
    });

    client.login(TOKEN);
};

const test = () => {
    return;
}

switch (process.env.MODE) {
    case 'development':
        test();
        break;
    case 'main':
    default:
        main();
        break;
}
