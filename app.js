require('dotenv').config();
const TOKEN = process.env.TOKEN;
const Discord = require('discord.js');
const client  = new Discord.Client();
const net = require('net');

const { Public } = require("./modules/public.js");
const { Game } = require("./modules/game.js");
const { PRISM } = require('./modules/prism.js');

const main = async () => {
    let flag = false;
    const socket = net.createConnection(process.env.PORT, process.env.HOST);
    const prism = new PRISM(socket);;

    socket.once('connect', function() {
        console.info('Connected to server!')
        prism.login();
        flag = true;
    })

    socket.on('error', (error) => {
        console.error(error);
    })

    client.on('ready', () => {
        console.info(`Logged in as ${client.user.tag}!`);
        
    });

    client.on('message', async msg => {  
        // Public Scope Command
        Public(msg, client);

        //Gameserver Scope Command
        Game(msg, prism);
    });

    client.login(TOKEN);
}

main();