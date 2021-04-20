require('dotenv').config();
const TOKEN = process.env.TOKEN;
const Discord = require('discord.js');

const { Public } = require("./modules/public.js");
const { Game } = require("./modules/game.js");
const { PRISM } = require('./modules/prism.js');
const { checkRoles, embedLog, embedMsg } = require("./modules/utility.js");

const main = () => {
    const client  = new Discord.Client();

    const prism = new PRISM();;

    prism.client.once('connect', function() {
        console.info('Connected to server!')
        prism.login();
    })

    prism.client.on('error', (error) => {
        console.error(error);
    })

    client.on('ready', () => {
        console.info(`Logged in as ${client.user.tag}!`);
        const channel = client.channels.cache.get(process.env.LOG_CHANNEL);

        channel.send(embedMsg('Bot is ready!'))

        prism.event.prependListener('log', (messages) => {
            channel.send(embedLog(messages))
        });
    });

    client.on('message', async msg => {  
        // Public Scope Command
        Public(msg, client);

        // Gameserver Scope Command
        Game(msg, client, prism);

        // if(msg.content === '>reboot bot'){
        //     if(!checkRoles(msg)) return;

        //     const channel = client.channels.cache.get(process.env.LOG_CHANNEL);

        //     channel.send(embedMsg('Rebooting Bot!'));
        //     msg.channel.send(embedMsg('Rebooting Bot!'));

        //     prism.end();

        //     // Logout Bot
        //     client.destroy();

        //     // Restart Bot
        //     main();
        // }
    });

    client.login(TOKEN);
}

main();