require('dotenv').config();
const Discord = require('discord.js');

const { sendMsg, embedLog, makeRoleMentions, reportPlayer, getBoundingClientRect} = require("./utility.js");
const puppeteer = require('puppeteer-core');

const ServerLogs = async (message, client) => {
    let msg;

    try{
        msg = message.format();
    } catch(error) {
        msg = message;
    }

    const serverLogCh = client.channels.cache.get(process.env.SERVER_LOG_CHANNEL);
    const logCh = client.channels.cache.get(process.env.LOG_CHANNEL);
    const reportCh = client.channels.cache.get(process.env.REPORT_CHANNEL);
    const mapCh = client.channels.cache.get(process.env.MAP_ROTATION_CHANNEL);
    const serverId = process.env.PR_SERVER_ID;

    if(msg.includes('!r ')) {
        try {
            const rolesId = JSON.parse(process.env.MENTION_ROLES).report;
            const role = makeRoleMentions(rolesId);
            const ctx = reportPlayer('```'+msg+'```', role);
            sendMsg(reportCh, ctx);
            return;
        } catch (error) {
            console.error(error);
        }
    }

    // Round is ending...
    if(msg.includes('Round is ending...')) {
        try {
            setTimeout(async () => {
                const url = `https://www.realitymod.com/prspy/prbf2/${serverId}`;
                const elements = '#prspy-page-contents section .ancient-prspy-data-server .details';
                const browser = await puppeteer.connect({
                    browserWSEndpoint: process.env.BROWSER_ENDPOINT,
                });
            
                const page = await browser.newPage();

                // Set Options
                await page.setViewport({ 
                    width: 1960, 
                    height: 540,
                    deviceScaleFactor: 4,
                });
                await page.setBypassCSP(true);
                await page.setJavaScriptEnabled(true)

                // Go to URL
                await page.goto(url, { waitUntil: 'networkidle0' });

                await page.waitForSelector(elements, {
                    visible: true,
                    timeout: 60 * 1000,
                });

                const clip = await page.$eval(elements, getBoundingClientRect);

                const buffer = await page.screenshot({
                    clip: clip
                });
                
                await browser.close();

                const attachment = new Discord.MessageAttachment(buffer);

                sendMsg(mapCh, attachment);
            }, 300000);
        } catch (error) {
            console.error(error);
        }
    }

    // Vote finished
    if(msg.includes('Vote finished:')) {
        try {
            const mapData = msg.match(/(?<=Vote finished: )(.*)/gm);
            const maps = mapData ? mapData.split('|') : [];
            
            const embed = new Discord.MessageEmbed()
                .setTitle("Map Vote Results")
                .setColor('PURPLE')
                .setTimestamp();

            for (const map of maps) {
                const data = map.trim().split(' ');
                const mapName = data[0];
                const votes = data[1];

                embed.addField(mapName, votes);
            }

            sendMsg(serverLogCh, embed);
        } catch (error) {
            console.error(error);
        }
    }

    // Set Next Map
    if(msg.includes('Next map set to:')) {
        try {
            const map = msg.match(/(?<=Next map set to: )(.*)/gm);

            const embed = new Discord.MessageEmbed()
                .setTitle("SETNEXT")
                .addFields(
                    {name: 'Map:', value: map},
                )
                .setColor('TEAL')
                .setTimestamp();

            sendMsg(serverLogCh, embed);
        } catch (error) {
            console.error(error);
        }
    }

    // Perma BAN
    if(msg.includes('HAS BEEN BANNED')) {
        try {
            msg = msg.split('\n');

            const name = msg.match(/(.*)(?=HAS BEEN)/gm).trim();
            const reason = msg.match(/(?<=BANNED,)(.*)(?=-)/gm).trim();
            const performed = msg.replace(/(.*)-/gm, "").trim();

            const embed = new Discord.MessageEmbed()
                .setTitle("Banned")
                .addFields(
                    {name: 'Name:', value: ` ${name} `},
                    {name: 'Performed By:', value: ` ${performed} `},
                    {name: 'Reason:', value: reason},
                    {name: 'Duration:', value: "Permanently"}
                )
                .setDescription('This issued ban is under admin review!\nYou can still appeal this ban in <#860214661660409856>')
                .setColor('RED')
                .setTimestamp();

            sendMsg(serverLogCh, embed);
        } catch (error) {
            console.error(error);
        }
    }

    // Temp BAN
    if(msg.includes('HAS BEEN TEMP BANNED')) {
        try {
            msg = msg.split('\n');

            const name = msg.match(/(.*)(?=HAS BEEN)/gm).trim();
            const reason = msg.match(/(?<=BANNED,)(.*)(?=-)/gm).trim();
            const performed = msg.replace(/(.*)-/gm, "").trim();

            const embed = new Discord.MessageEmbed()
                .setTitle("Banned")
                .addFields(
                    {name: 'Name:', value: ` ${name} `},
                    {name: 'Performed By:', value: ` ${performed} `},
                    {name: 'Reason:', value: reason},
                    {name: 'Duration:', value: "3 Houres"}
                )
                .setDescription('This issued ban is under admin review!\nYou can still appeal this ban in <#860214661660409856>')
                .setColor('RED')
                .setTimestamp();

            sendMsg(serverLogCh, embed);
        } catch (error) {
            console.error(error);
        }
    }

    // Time BAN
    if(msg.includes('HAS BEEN TIME BANNED')) {
        try {
            msg = msg.split('\n');

            const name = msg.match(/(.*)(?=HAS BEEN)/gm).trim();
            const reason = msg.match(/(?<=BANNED,)(.*)(?=-)/gm).trim();
            const performed = msg.replace(/(.*)-/gm, "").trim();

            const embed = new Discord.MessageEmbed()
                .setTitle("Banned")
                .addFields(
                    {name: 'Name:', value: ` ${name} `},
                    {name: 'Performed By:', value: ` ${performed} `},
                    {name: 'Reason:', value: reason},
                    {name: 'Duration:', value: "3 Houres"}
                )
                .setDescription('This issued ban is under admin review!\nYou can still appeal this ban in <#860214661660409856>')
                .setColor('RED')
                .setTimestamp();

            sendMsg(serverLogCh, embed);
        } catch (error) {
            console.error(error);
        }
    }

    // Kicked
    if(msg.includes('has been kicked')) {
        try {
            msg = msg.split('\n');

            const name = msg[1].macth(/(.*)(?=has been kicked,)/gm).trim();
            const reason = msg[1].match(/(?<=has been kicked,)(.*)(?=\[)/gm).trim();
            const performed = msg.trim();

            const embed = new Discord.MessageEmbed()
                .setTitle("Kicked")
                .addFields(
                    {name: 'Name:', value: ` ${name} `},
                    {name: 'Performed By:', value: ` ${performed} `},
                    {name: 'Reason:', value: reason},
                )
                .setDescription("You can rejoin after getting kicked.")
                .setColor('YELLOW')
                .setTimestamp();

            sendMsg(serverLogCh, embed);
        } catch (error) {
            console.error(error);
        }
    }

    if(msg.includes('Running next map.')) {
        try {
            // Running next map. - PRID Lieutenant_Mason
            const name = 'Running next map.'
            const performed = msg[0].match(/(?<= - )(.*)/gm).trim();

            const embed = new Discord.MessageEmbed()
                .setTitle("Kicked")
                .addFields(
                    {name: 'Name:', value: ` ${name} `},
                    {name: 'Performed By:', value: ` ${performed} `},
                )
                .setDescription("You can rejoin after getting kicked.")
                .setColor('YELLOW')
                .setTimestamp();

            sendMsg(serverLogCh, embed);
        } catch (error) {
            console.error(error);
        }
    }


    if(msg.includes('No parser found')) return;

    sendMsg(logCh, embedLog(msg));
};

module.exports = {
    ServerLogs
};