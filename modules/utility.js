require('dotenv').config();
const Discord = require('discord.js');
const log = require('./logger.js');

function checkRoles(msg) {
    // Check if they have one of many roles
    if(msg.member.roles.cache.some(role => JSON.parse(process.env.ROLE).includes(role.name)) ) {
        return true;
    } else {
        return false;
    }
}

function getUserFromMention(mention) {
    if (!mention) return false;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return new Discord.Client().users.cache.get(mention);
    }
}

function embedError(msg = 'Error') {
    return new Discord.MessageEmbed()
        .setDescription(`:x: ${msg}`)
        .setColor('RED')
        .setTimestamp();
}

function embedSuccess(msg = 'Success') {
    return new Discord.MessageEmbed()
        .setDescription(`:white_check_mark: ${msg}`)
        .setColor('GREEN')
        .setTimestamp();
}

function embedMsg(msg = '') {
    return new Discord.MessageEmbed()
        .setDescription(`${msg}`)
        .setColor('NOT_QUITE_BLACK')
        .setTimestamp();
}

function embedLog(msg = '', title = 'Server Log', mention = '') {
    return new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription('```'+msg+'```'+mention)
        .setColor('NOT_QUITE_BLACK')
        .setTimestamp();
}

function reportPlayer(msg = "", mention = "") {
    return msg + '\n' + mention;
}

function makeRoleMentions(rolesId = []) {
    let roles = [];
    if(rolesId == undefined || rolesId == null) return;
    for (let i = 0; i < rolesId.length; i++) {
        const role = rolesId[i];
        if(role == undefined || role == null || role == '') {
            continue;
        }
        roles.push(`<@&${role}>`);
    }
    return roles.join(' ');
}

function sendMsg(channle, msg) {
    try {
        channle.send(msg);
    } catch (error) {
        console.error(error);
        log.error(error);
    }
}

function deleteMsg(msg) {
    try {
        msg.delete();
    } catch (error) {
        console.error(error);
        log.error(error);
    }
}

module.exports = {
    checkRoles,
    embedError,
    embedSuccess,
    embedMsg,
    embedLog,
    getUserFromMention,
    makeRoleMentions,
    reportPlayer,
    sendMsg,
    deleteMsg
};