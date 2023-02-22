require('dotenv').config();
const Discord = require('discord.js');
const { exec } = require('child_process');
const axios = require('axios');
const Fuse = require('fuse.js');
const moment = require('moment');
require('moment/locale/id');

const { checkRoles, embedError, embedSuccess, sendMsg, deleteMsg } = require("./utility.js");
const log = require('./logger.js');
const realityadmin = require('../../data/realityadmin.json');
const adminCommand = require('../../data/admin.json');

const Game = async (msg, client, prism) => {
    if(!msg.content.startsWith(process.env.PREFIX)) return;

    const withoutPrefix = msg.content.slice(process.env.PREFIX.length);
    const split = withoutPrefix.split(/ +/);
    const command = split[0];
    const args = split.slice(1);

    moment.locale('id');

    if(command === 'help') {
        if(!checkRoles(msg)) return;

        if(args[0]) {
            let command = adminCommand.find(x => x.command.includes(args[0]));
            const embed = new Discord.MessageEmbed()
                .setTitle('Command Details')
                .setColor('NOT_QUITE_BLACK')
                .addFields(
                    {name: 'Command', value: command.command},
                    {name: 'Description', value: command.description},
                )
                .setFooter(`Server Time ${moment().format('LLLL')}`);

            sendMsg(msg.channel, embed);
        } else {
            let list = {
                command: [],
                description: []
            };
            for (let i = 0; i < adminCommand.length; i++) {
                const el = adminCommand[i];
                list.command.push(el.command);
                list.description.push(el.description.substring(0, 42));
            }
            const embed = new Discord.MessageEmbed()
                .setTitle('Command List')
                .setColor('NOT_QUITE_BLACK')
                .addFields(
                    {name: 'Command', value: list.command.join('\n'), inline: true},
                    {name: 'Description', value: list.description.join('\n'), inline: true},
                )
                .setFooter(`Server Time ${moment().format('LLLL')}`);

            sendMsg(msg.channel, embed);
        }
    }

    if(command === 'u') {
        if(!checkRoles(msg)) return;
        let str = '';
        for (let i = 0; i < args.length; i++) {
            str += ` ${args[i]}`;
        }

        sendMsg(msg.channel, str);
        deleteMsg(msg);
    }

    if(command === 'gameinfo') {
        msg.channel.send(await getServerInfo(args));
    }

    if(command === 'serverdetails') {
        if(!checkRoles(msg)) return;
        prism.get_server_details();
        prism.event.once('serverdetails', (details) => {
            const embed = new Discord.MessageEmbed()
                .setTitle('Server Details')
                .setColor('NOT_QUITE_BLACK')
                .addFields(
                    {name: 'Server Name', value: `${details.servername}`, inline: true},
                    {name: 'Server IP', value: `${details.serverIP}`, inline: true},
                    {name: 'Server PORT', value: `${details.serverPort}`, inline: true},
                    {name: 'Server Startup Time', value: `${moment.unix(details.serverStartupTime).format('LLLL')}`, inline: true},
                    {name: 'Server Warmup', value: `${moment.duration(details.serverWarmup, 'seconds').humanize()}`, inline: true},
                    {name: 'Server Round Length', value: `${moment.duration(details.serverRoundLength, 'seconds').humanize()}`, inline: true},
                )
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    {name: 'Map', value: `${details.map}`, inline: true},
                    {name: 'Game Mode', value: `${details.mode}`, inline: true},
                    {name: 'Layer', value: `${details.layer}`, inline: true},
                    {name: 'Time Started', value: `${moment.unix(details.timeStarted).format('LLLL')}`, inline: true},
                    {name: 'Online Duration', value: `${moment.unix(details.serverStartupTime).fromNow()}`, inline: true},
                )
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    {name: 'Team 1', value: `${details.team1}`, inline: true},
                    {name: 'Team 2', value: `${details.team2}`, inline: true},
                )
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    {name: 'Tickets Team 1', value: `${details.tickets1}`, inline: true},
                    {name: 'Tickets Team 2', value: `${details.tickets2}`, inline: true},
                )
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    {name: 'Max Players', value: `${details.maxPlayers}`, inline: true},
                    {name: 'Players', value: `${details.players}`, inline: true},
                )
                .setFooter(`Server Time ${new Date(Date.now()).toUTCString()}`);
            msg.channel.send(embed);
        });
    }

    if(command === 'pr') {
        if(!checkRoles(msg)) return;
        if(args[0] === 'commands') {
            let content = {
                commands: [],
                examples: []
            };

            if(args[1]) {
                let param = [];
                let com = realityadmin.find(x => x.name == args[1]);

                if(!com) return;

                for (let i = 0; i < com.paramater.length; i++) {
                    const el = com.paramater[i];
                    param.push(el);
                }

                if(param.length == 0) {
                    param.push('None');
                }

                let syntax = `${com.syntax} ${param.map(x => {
                    if(x == "None") return; return '<'+x+'>';
                }).join(' ')}`;

                let embed = new Discord.MessageEmbed()
                    .setTitle('Command Details')
                    .setColor('NOT_QUITE_BLACK')
                    .addFields(
                        {name: 'Name', value: com.name},
                        {name: 'Syntax', value: syntax},
                        {name: 'Example', value: com.example},
                        {name: 'Paramater', value: param.join('\n')}
                    )
                    .setDescription(com.description)
                    .setFooter(`Server Time ${moment().format('LLLL')}`);

                msg.channel.send(embed);
            } else {
                for (let i = 0; i < realityadmin.length; i++) {
                    const command = realityadmin[i];
                    content.commands.push(command.name);
                    content.examples.push(command.example);
                }

                let embed = new Discord.MessageEmbed()
                    .setTitle('Command List')
                    .setColor('NOT_QUITE_BLACK')
                    .addFields(
                        {name: 'Command', value: content.commands.join('\n'), inline: true},
                        {name: 'Examples', value: content.examples.join('\n'), inline: true},
                    )
                    .setFooter(`Server Time ${moment().format('LLLL')}`);

                msg.channel.send(embed);
            }

            return;
        }

        prism.send_raw_command('say', args.join(' '));

        prism.event.onetime(['adminalert', 'game', 'response', 'error'], (message) => {
            msg.channel.send('```'+message.format()+'```');
        });
    }

    if(command === 'admin') {
        if(!msg.member.roles.cache.some(role => JSON.parse(process.env.LEVEL2_ROLE).includes(role.name)) ) {
            return;
        }

        if(JSON.parse(process.env.LEVEL2_COMMAND).includes(args[0])) {
            prism.send_raw_command('say', args.join(' '));

            prism.event.onetime(['adminalert', 'game', 'response', 'error'], (message) => {
                msg.channel.send('```'+message.format()+'```');
            });
        } else {
            msg.channel.send(embedError('Not authorized'));
        }
    }

    if(command === 'login') {
        if(!checkRoles(msg)) return;
        prism.login();
    }

    if(command === 'reconnect') {
        if(!checkRoles(msg)) return;
        msg.channel.send(embedSuccess('Reconneting PRISM'));

        setTimeout(() => {
            prism.disconnect();
            setTimeout(() => {
                prism.reconnect();
            }, 1000);
        }, 1000);
    }
};

const getServerInfo = async (args = []) => {
    try {
        let result;
        const response = await axios.get('https://servers.realitymod.com/api/serverinfo');

        const serverId = process.env.PR_SERVER_ID;

        if(args[0] === 'list') {
            let list;
            let players;
            let map;
            result = response.data.servers;

            list = result.map(server => {
                return `${server.properties.hostname.split(/ +/).slice(2).join(' ')} ${server.properties.password == 1 ? ':lock:' : ''}`;
            });
            list = list.join('\n');

            players = result.map(server => server.properties.numplayers);
            players = players.join('\n');

            map = result.map(server => server.properties.mapname);
            map = map.join('\n');

            return new Discord.MessageEmbed()
                .setTitle('Game Info')
                .setColor('NOT_QUITE_BLACK')
                .addFields(
                    {name: 'Server List', value: list, inline: true},
                    {name: 'Players', value: players, inline: true},
                    {name: 'Map', value: map, inline: true},
                )
                .setFooter(`Server Time ${moment().format('LLLL')}`);
        }

        if(args[0]) {
            const options = {
                isCaseSensitive: false,
                includeScore: true,
                keys: ['serverId', 'properties.hostname']
            };
            const fuse = new Fuse(response.data.servers, options);
            result = fuse.search(args[0]);
            result = result[0].item;
        } else {
            result = response.data.servers.find(server => server.serverId == serverId);
        }

        if(args[1] === 'player') {

            let teamOne = result.players.filter(player => player.team == 1).map(player => player.name);
            teamOne = teamOne.join('\n');

            let teamTwo = result.players.filter(player => player.team == 2).map(player => player.name);
            teamTwo = teamTwo.join('\n');

            if (teamOne == '') {
                teamOne = 'Tidak ada player';
            }

            if(teamTwo == '') {
                teamTwo = 'Tidak ada player';
            }

            return new Discord.MessageEmbed()
                .setTitle('Game Info')
                .setColor('NOT_QUITE_BLACK')
                .addFields(
                    {name: 'Player List', value: result.properties.hostname, },
                    {name: 'Team 1', value: teamOne, inline: true},
                    {name: 'Team 2', value: teamTwo, inline: true},
                )
                .setImage(result.bf2_sponsorlogo_url)
                .setFooter(`Server Time ${moment().format('LLLL')}`);
        }

        result = result.properties;

        return new Discord.MessageEmbed()
            .setTitle('Game Info')
            .setColor('NOT_QUITE_BLACK')
            .addFields(
                {name: 'Server Name', value: `${result.hostname}`},
                {name: 'Current Map', value: `${result.mapname}`, inline: true},
                {name: 'Map Size', value: `${result.bf2_mapsize}`, inline: true},
                {name: 'Game Mode', value: `${result.gametype.slice(4)}`, inline: true},
                {name: 'Team 1', value: `${result.bf2_team1}`, inline: true},
                {name: 'Team 2', value: `${result.bf2_team2}`, inline: true},
                {name: 'Players', value: `${result.numplayers}`},
            )
            .setImage(result.bf2_sponsorlogo_url)
            .setFooter(`Server Time ${moment().format('LLLL')}`);

    } catch (error) {
        log.error(error);
        return embedError(error);
    }
};

module.exports = {
    Game
};