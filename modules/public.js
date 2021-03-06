require('dotenv').config();
const Discord = require('discord.js');
const Fuse = require('fuse.js');

const { embedError, getUserFromMention, checkRoles, deleteMsg, sendMsg} = require('./utility.js');
const log = require('./logger.js');

const Public = (msg, client) => {
    const split = msg.content.split(/ +/);
    const command = split[0].toLowerCase();
    const args = split.slice(1);

    if (command === 'ping') {
        msg.reply('pong');
    }

    if (command === 'latency') {
        msg.channel.send(`🏓Latency is ${Date.now() - msg.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
    }

    if(command === 'av') {
        if(args[0] == null) {
            const imageURL = msg.author.displayAvatarURL();
            const embed = new Discord.MessageEmbed()
                .setTitle('Avatar')
                .setColor('NOT_QUITE_BLACK')
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
                .setImage(imageURL+'?size=256');

            sendMsg(msg.channel, embed);
            return;
        }

        let taggedUser;
        let userMention = getUserFromMention(args[0]);

        if(userMention) {
            taggedUser = getUserFromMention(args[0]);
        } else {
            const options = {
                isCaseSensitive: false,
                includeScore: true,
                keys: ['username']
            };
            const fuse = new Fuse(client.users.cache.map(user => {
                return {id: user.id, username: user.username};
            }), options);
            taggedUser = fuse.search(args[0]);
            taggedUser = taggedUser[0].item;
            taggedUser = client.users.cache.find(user => user.id == taggedUser.id);
        }

        // let taggedUser = client.users.cache.find(user => user.username.toLowerCase() == args[0].toLowerCase());
        if(!taggedUser) {
            const embed = embedError(`Couldn't find that user.`);
            sendMsg(msg.channel, embed);
            return;
        }
        // if(taggedUser.bot) return;

        const imageURL = taggedUser.displayAvatarURL();
        const embed = new Discord.MessageEmbed()
            .setTitle('Avatar')
            .setColor('NOT_QUITE_BLACK')
            .setAuthor(taggedUser.tag, imageURL)
            .setImage(imageURL+'?size=256');

        // Send messages
        sendMsg(msg.channel, embed);
    }

    if(msg.content.includes('horny')) {
        // https://media.discordapp.net/attachments/407660974389329930/762589822438473748/ezgif-2-8678582ad8cb.gif?width=153&height=153
        // Create the attachment using MessageAttachment
        const attachment = new Discord.MessageAttachment('https://media.discordapp.net/attachments/407660974389329930/762589822438473748/ezgif-2-8678582ad8cb.gif');
        // Send the attachment in the message channel

        sendMsg(msg.channel, attachment);
        deleteMsg(msg);
    }

    if (command === 'rip') {
        // Create the attachment using MessageAttachment
        const attachment = new Discord.MessageAttachment('https://i.imgur.com/w3duR07.png');
        // Send the attachment in the message channel
        msg.channel.send(attachment);
    }

    if(command === 'attach') {
        if(!args[0]) return;
        const attachment = new Discord.MessageAttachment(args[0]);
        // Send the attachment in the message channel

        try {
            msg.channel.send(attachment);
        } catch (error) {
            msg.channel.send(embedError(error));
            log.error(error);
        }

        deleteMsg(msg);
    }

    if (command === 'oha') {
        // https://cdn.discordapp.com/attachments/623432857720717312/623477443323494410/ohayou.jpg
        const attachment = new Discord.MessageAttachment('https://cdn.discordapp.com/attachments/623432857720717312/623477443323494410/ohayou.jpg');

        // Send the attachment in the message channel
        sendMsg(msg.channel, attachment);
    }

    if (command === 'sms') {
        const url = 'https://cdn.discordapp.com/attachments/500263112881078272/837629163132157952/sms.gif';
        const attachment = new Discord.MessageAttachment(url);

        // Send the attachment in the message channel
        sendMsg(msg.channel, attachment);
    }

    if(command === 'fbi') {
        const url = 'https://cdn.discordapp.com/attachments/543234827407720483/600950504641527820/fbi.jpg';
        const attachment = new Discord.MessageAttachment(url);

        sendMsg(msg.channel, attachment);
        deleteMsg(msg);
    }

    if(command === 'fbi2') {
        const url = 'https://media.discordapp.net/attachments/819652513196146778/839914347118460938/based.gif';
        const attachment = new Discord.MessageAttachment(url);

        sendMsg(msg.channel, attachment);
        deleteMsg(msg);
    }

    if(command === 'bonk') {
        const url = 'https://cdn.discordapp.com/attachments/360238813387292674/837624554615734272/bonk.gif';
        const attachment = new Discord.MessageAttachment(url);

        sendMsg(msg.channel, attachment);
        deleteMsg(msg);
    }

    if(msg.content.includes('konto!') || msg.content.includes('kontol')) {
        const url = 'https://cdn.discordapp.com/attachments/500263112881078272/837625442831695872/kon.gif';
        const attachment = new Discord.MessageAttachment(url);

        sendMsg(msg.channel, attachment);
        deleteMsg(msg);
    }

    if(command === '!gamecrash') {
        if(!checkRoles(msg)) return;
        const embed = new Discord.MessageEmbed()
            .setTitle('Game Crash')
            .setDescription(`Jika anda mengalami crash pada game Project Reality, harap membaca <#815276340461961226> dan berkonsultasi ke <#791343470911422474>. Jangan lupa untuk menyertakan **PRLauncher.log** serta **Support Info**, petunjuk tertera di <#815276340461961226> pula. Kami tidak dapat membantu tanpa kooperasi anda.`);
        msg.channel.send(embed);
    }

    if(command === '!lmao') {
        const link = 'https://media.discordapp.net/attachments/500263112881078272/834626048745668608/lol.png';
        const attachment = new Discord.MessageAttachment(link);

        sendMsg(msg.channel, attachment);
        deleteMsg(msg);
    }
};

module.exports = {
    Public
};