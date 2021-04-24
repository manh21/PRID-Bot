require('dotenv').config();
const TOKEN = process.env.TOKEN;
const Discord = require('discord.js');

const { Public } = require("./modules/public.js");
const { Game } = require("./modules/game.js");
const { PRISM } = require('./modules/prism.js');
const { checkRoles, embedLog, embedMsg, makeRoleMentions, reportPlayer } = require("./modules/utility.js");
const log = require('./modules/logger.js');

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
        const logCh = client.channels.cache.get(process.env.LOG_CHANNEL);
        const reportCh = client.channels.cache.get(process.env.REPORT_CHANNEL);

        logCh.send(embedMsg('Bot is ready!'))

        // Log
        log.info('Bot is ready!');

        prism.event.prependListener('log', (message) => {
            const msg = message.format();

            if(msg.includes('!r ')){
                const rolesId = JSON.parse(process.env.MENTION_ROLES).report;
                const role = makeRoleMentions(rolesId);
                reportCh.send(reportPlayer('```'+msg+'```', role));
                return;
            } 
            
            logCh.send(embedLog(msg));
        });     
    });

    client.on('message', async msg => {  
        // Public Scope Command
        Public(msg, client);

        // Gameserver Scope Command
        Game(msg, client, prism);
    });

    client.login(TOKEN);
}

main();