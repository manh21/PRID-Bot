require('dotenv').config();
const { exec } = require('child_process');

const { checkRoles, embedError, embedMsg, embedSuccess } = require("./utility.js");
const log = require('./logger.js');

const PR = async(msg) => {
    if(!msg.content.startsWith(process.env.PREFIX)) return;

    const withoutPrefix = msg.content.slice(process.env.PREFIX.length);
    const split = withoutPrefix.split(/ +/);
    const command = split[0];
    const args = split.slice(1);

    if(command === 'stopserver') {
        if(!checkRoles(msg)) return;
        // pidof prbf2_l64ded
        // pgrep -f prbf2_l64ded
        exec('pidof prbf2_l64ded', (err, stdout, stderr) => {
            if (err) {
                //some err occurred
                console.error(err);
                msg.channel.send(embedError());
                log.error(err);
                return;
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stderr: ${stderr}`);
                let processID = stdout.trim();

                exec(`kill 15 ${processID}`, (err) => {
                    if (err) console.error(err);
                    msg.channel.send(embedSuccess());
                    log.info('PR Server Stopped');
                    //console.log(stdout);
                });
            }
        });
    }

    if(command === 'startserver') {
        if(!checkRoles(msg)) return;

        // cd /home/pr/public && su -c ./start_pr.sh pr
        msg.channel.send(embedSuccess('Starting Server!'));
        log.info('Starting PR Server');
        exec(`./start_pr.sh`, {cwd: '/home/pr/public'}, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                msg.channel.send(embedError(err));
                log.error(err);
            } else {
                if(stderr) {
                    msg.channel.send(embedError(stderr));
                    log.error(err);
                }
            }
        });
    }

    if(command === 'status') {
        if(!checkRoles(msg)) return;
        if(!args[0]) {
            exec('pidof prbf2_l64ded', (err, stdout) => {
                if(err) {
                    msg.channel.send(embedMsg('Offline'));
                    log.error(err);
                    return;
                }

                if(stdout) {
                    msg.channel.send(embedMsg('Online'));
                } else {
                    msg.channel.send(embedMsg('Offline'));
                }
            });
        }
    }
};

module.exports = {
    PR
};