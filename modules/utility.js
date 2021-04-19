const Discord = require('discord.js');

function checkRoles(msg) {
    // Check if they have one of many roles
    if(msg.member.roles.cache.some(role => ["Comunity Lead", "Lead Server PR", "Assistant Server PR"].includes(role.name)) ) {
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
}

function embedSuccess(msg = 'Success') {
    return new Discord.MessageEmbed()
        .setDescription(`:white_check_mark: ${msg}`)
        .setColor('GREEN')
}

function embedMsg(msg = '') {
    return new Discord.MessageEmbed()
        .setDescription(`${msg}`)
        .setColor('NOT_QUITE_BLACK')
}

module.exports = {
    checkRoles,
    embedError,
    embedSuccess,
    embedMsg,
    getUserFromMention
}