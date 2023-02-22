require('dotenv').config();
const TOKEN = process.env.TOKEN;
const Discord = require('discord.js');
const PRISM = require('@manh21/prism');

const {Public} = require("./modules/public.js");
const {Game} = require("./modules/game.js");

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
