require('dotenv').config();
const TOKEN = process.env.TOKEN;
const Discord = require('discord.js');

const { Public } = require("./modules/public.js");
const { Game } = require("./modules/game.js");
const { PRISM } = require('./modules/prism.js');
const { embedLog, embedMsg, makeRoleMentions, reportPlayer } = require("./modules/utility.js");
const log = require('./modules/logger.js');
const captureWebsite = require('capture-website');

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
        const reportCh = client.channels.cache.get(process.env.REPORT_CHANNEL);
        const mapCh = client.channels.cache.get(process.env.MAP_ROTATION_CHANNEL);

        logCh.send(embedMsg('Bot is ready!'));

        // Log
        log.info('Bot is ready!');

        prism.event.prependListener('log', (message) => {
            let msg;

            try{
                msg = message.format();
            } catch(error) {
                msg = message;
            }

            if(msg.includes('!r ')) {
                const rolesId = JSON.parse(process.env.MENTION_ROLES).report;
                const role = makeRoleMentions(rolesId);
                reportCh.send(reportPlayer('```'+msg+'```', role));
                return;
            }

            if(msg.includes('Round is ending...')) {
                setTimeout(async () => {
                    const url = 'https://www.realitymod.com/prspy/prbf2/979e55faf3851606dc796ab4ca730c661172cd66';
                    const options = {
                        delay: 10,
                        element: "#prspy-page-contents section .ancient-prspy-data-server .details",
                        width: 1960,
                        heigth: 540,
                        scaleFactor: 4
                    };
                    const image = await captureWebsite.buffer(url, options);
                    const attachment = new Discord.MessageAttachment(image);

                    mapCh.send(attachment);
                }, 300000);
            }

            logCh.send(embedLog(msg));
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

            if(msg.includes('!r ')) {
                // const rolesId = JSON.parse(process.env.MENTION_ROLES).report;
                // const role = makeRoleMentions(rolesId);
                // reportCh.send(reportPlayer('```'+msg+'```', role));
                return;
            }

            // logCh.send(embedLog(msg));
        });
    });

    // client.on('message', async msg => {
    //     const split = msg.content.split(/ +/);
    //     const command = split[0].toLowerCase();
    //     const args = split.slice(1);
    // });

    client.login(TOKEN);
};

if(process.env.MODE == 'development') {
    test();
} else {
    main();
}
