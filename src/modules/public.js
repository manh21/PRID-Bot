require('dotenv').config();
const Discord = require('discord.js');
const Fuse = require('fuse.js');

const { embedError, getUserFromMention, checkRoles, deleteMsg, sendMsg} = require('./utility.js');
const log = require('./logger.js');
const { Tag } = require('./tag.js');

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

    Tag(msg)

    
};

module.exports = {
    Public
};