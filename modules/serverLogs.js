require('dotenv').config();
const Discord = require('discord.js');

const { sendMsg, embedLog, makeRoleMentions, reportPlayer } = require("./utility.js");
const captureWebsite = require('capture-website');

const ServerLogs = async (message, client) => {
    let msg;

    try{
        msg = message.format();
    } catch(error) {
        msg = message;
    }

    const bankickCh = client.channels.cache.get(process.env.BANKICK_CHANNEL);
    const logCh = client.channels.cache.get(process.env.LOG_CHANNEL);
    const reportCh = client.channels.cache.get(process.env.REPORT_CHANNEL);
    const mapCh = client.channels.cache.get(process.env.MAP_ROTATION_CHANNEL);
    const serverId = process.env.PR_SERVER_ID;

    if(msg.includes('!r ')) {
        const rolesId = JSON.parse(process.env.MENTION_ROLES).report;
        const role = makeRoleMentions(rolesId);
        const ctx = reportPlayer('```'+msg+'```', role);
        sendMsg(reportCh, ctx);
        return;
    }

    if(msg.includes('Round is ending...')) {
        setTimeout(async () => {
            const url = `https://www.realitymod.com/prspy/prbf2/${serverId}`;
            const options = {
                delay: 10,
                element: "#prspy-page-contents section .ancient-prspy-data-server .details",
                width: 1960,
                heigth: 540,
                scaleFactor: 4
            };
            const image = await captureWebsite.buffer(url, options);
            const attachment = new Discord.MessageAttachment(image);

            sendMsg(mapCh, attachment);
        }, 300000);
    }

    // Perma BAN
    if(msg.includes('HAS BEEN  BANNED')) {
        msg = msg.split('\n');

        const name = msg[0].match(/(.*)(?=HAS BEEN)/gm).trim();
        const reason = msg[0].match(/(?<=BANNED,)(.*)(?=-)/gm).trim();
        const performed = msg[0].replace(/(.*)-/gm, "").trim();

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

        sendMsg(bankickCh, embed);
    }

    // Temp BAN
    if(msg.includes('HAS BEEN TEMP BANNED')) {
        msg = msg.split('\n');

        const name = msg[0].match(/(.*)(?=HAS BEEN)/gm).trim();
        const reason = msg[0].match(/(?<=BANNED,)(.*)(?=-)/gm).trim();
        const performed = msg[0].replace(/(.*)-/gm, "").trim();

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

        sendMsg(bankickCh, embed);
    }

    // Time BAN
    if(msg.includes('HAS BEEN TIME BANNED')) {
        msg = msg.split('\n');

        const name = msg[0].match(/(.*)(?=HAS BEEN)/gm).trim();
        const reason = msg[0].match(/(?<=BANNED,)(.*)(?=-)/gm).trim();
        const performed = msg[0].replace(/(.*)-/gm, "").trim();

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

        sendMsg(bankickCh, embed);
    }

    // Kicked
    if(msg.includes('has been kicked')) {
        msg = msg.split('\n');

        const name = msg[1].macth(/(.*)(?=has been kicked,)/gm).trim();
        const reason = msg[1].match(/(?<=has been kicked,)(.*)(?=\[)/gm).trim();
        const performed = msg[0].trim();

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

        sendMsg(bankickCh, embed);
    }

    sendMsg(logCh, embedLog(msg));
};

module.exports = {
    ServerLogs
};