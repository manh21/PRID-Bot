require('dotenv').config();
const Discord = require('discord.js');
const { exec } = require('child_process');
const axios = require('axios');
const Fuse = require('fuse.js');
const moment = require('moment');
require('moment/locale/id');

const { checkRoles, embedError, embedMsg, embedSuccess, getUserFromMention } = require("./utility.js");
const log = require('./logger.js');

const Game = async (msg, client, prism) => {
    if(!msg.content.startsWith(process.env.PREFIX)) return;

    const withoutPrefix = msg.content.slice(process.env.PREFIX.length);
    const split = withoutPrefix.split(/ +/);
	const command = split[0];
	const args = split.slice(1);

    moment.locale('id');
    
    if(command === 'u') {
        if(!checkRoles(msg)) return;
        let str = '';
        for (let i = 0; i < args.length; i++) {
            str += ` ${args[i]}`;
        }
        msg.channel.send(str);

        try {
            msg.delete();
        } catch (error){
            console.error(error);
        }
    }

    if(command === 'stopserver') {
        if(!checkRoles(msg)) return;
        // pidof prbf2_l64ded
        // pgrep -f prbf2_l64ded
        exec('pidof prbf2_l64ded', (err, stdout, stderr) => {
            if (err) {
                //some err occurred
                console.error(err)
                msg.channel.send(embedError());
                log.error(err);
                return;
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stderr: ${stderr}`);
                let processID = stdout.trim();

                exec(`kill 15 ${processID}`, (err, stdout, stderr) => {
                    if (err) console.error(err);
                    msg.channel.send(embedSuccess());
                    log.info('PR Server Stopped');
                    //console.log(stdout);
                });
            }
        });
    }

    if(command === 'startserver'){
        if(!checkRoles(msg)) return;

        // cd /home/pr/public && su -c ./start_pr.sh pr
        msg.channel.send(embedSuccess('Starting Server!'));
        log.info('Starting PR Server');
        exec(`./start_pr.sh`, {cwd: '/home/pr/public'}, (err, stdout, stderr) => {
            if (err) {
                console.error(err)
                msg.channel.send(embedError(err));
                log.error(err);
            } else {
                if(stderr){
                    msg.channel.send(embedError(stderr));
                    log.error(err);
                }
            }
        });
    }

    if(command === 'status') {
        if(!checkRoles(msg)) return;
        if(!args[0]){
            exec('pidof prbf2_l64ded', (err, stdout, stderr) => {
                if(err){
                    msg.channel.send(embedMsg('Offline'));
                    log.error(err);
                    return;
                }

                if(stdout){
                    msg.channel.send(embedMsg('Online'));
                } else {
                    msg.channel.send(embedMsg('Offline'));
                }
            });
        }        
    }

    if(command === 'gameinfo'){
        msg.channel.send(await getServerInfo(args));
    }

    if(command === 'serverdetails'){
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
                    {name: 'Max Players', value: `${details.maxPlayers}`,inline: true},
                    {name: 'Players', value: `${details.players}`,inline: true},
                )
                .setFooter(`Server Time ${new Date(Date.now()).toUTCString()}`);
            msg.channel.send(embed);
        });
    }

    if(command === 'pr'){
        if(!checkRoles(msg)) return;
        // const [sub, ...res] = args;
        prism.send_raw_command('say', args.join(' '));
		
        prism.event.onetime(['adminalert', 'game', 'response', 'error'], (message) => {
			msg.channel.send('```'+message.format()+'```');
		});
    }

    if(command === 'admin'){
        if(!msg.member.roles.cache.some(role => JSON.parse(process.env.LEVEL2_ROLE).includes(role.name)) ) {
            return;
        }

        if(JSON.parse(process.env.LEVEL2_COMMAND).includes(args[0])) {
            prism.send_raw_command('say', args.join(' '));
			
			prism.event.onetime(['adminalert', 'game', 'response', 'error'], (message) => {
				msg.channel.send('```'+message.format()+'```');
			});

        }
    }

    if(command === 'login'){
        if(!checkRoles(msg)) return;
        prism.login();
    }

    if(command === 'reconnect'){
        if(!checkRoles(msg)) return;
        msg.channel.send(embedSuccess('Reconneting PRISM'));
		
        setTimeout(() => {
			prism.disconnect();
			setTimeout(() => {
				prism.reconnect();
			}, 1000); 
		}, 1000);        
    }

    if(command === 'reload'){
        if(!checkRoles(msg)) return;

        // cd /home/pr/public && su -c ./start_pr.sh pr
        msg.channel.send(embedSuccess('PM2 Reload All!'));
        log.info('Reloading PM2 Services');
        exec(`pm2 reload all`, {}, (err, stdout, stderr) => {
            if (err) {
                console.error(err)
                msg.channel.send(embedError(err));
                log.error(err);
            } else {
                if(stderr){
                    msg.channel.send(embedError(stderr));
                    log.error(stderr);
                }
            }
        });
    }
};

async function getServerInfo(args = []){
    try {
        let result;
        const response = await axios.get('https://servers.realitymod.com/api/serverinfo');

        const serverId = '979e55faf3851606dc796ab4ca730c661172cd66';
        const countryFlag = 'ID';

        if(args[0] === 'list') {
            let list;
            let players;
            let map;
            result = response.data.servers;
            
            list = result.map(server => {return `${server.properties.hostname.split(/ +/).slice(2).join(' ')} ${server.properties.password == 1 ? ':lock:' : ''}`});
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

        if(args[0]){
            const options = {
                isCaseSensitive: false,
                includeScore: true,
                keys: ['serverId', 'properties.hostname']
            };
            const fuse = new Fuse(response.data.servers, options);
            result = fuse.search(args[0]);
            result = result[0].item;
        } else {
            result = response.data.servers.find(server => server.serverId == serverId || server.countryFlag == countryFlag);
        }

        if(args[1] === 'player') {

            let teamOne = result.players.filter(player => player.team == 1).map(player => player.name);
            teamOne = teamOne.join('\n');

            let teamTwo = result.players.filter(player => player.team == 2).map(player => player.name);
            teamTwo = teamTwo.join('\n');

            if (teamOne == '') {
                teamOne = 'Tidak ada player';
            }

            if(teamTwo == ''){
                teamTwo = 'Tidak ada player';
            }

            return new Discord.MessageEmbed()
                .setTitle('Game Info')
                .setColor('NOT_QUITE_BLACK')
                .addFields(
                    {name: 'Player List', value: result.properties.hostname,},
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
        return embedError(error);
        log.error(error);
    }
}

module.exports = {
    Game
}