require('dotenv').config();
const crypto = require('crypto');
const events = require('events');
const net = require('net');
const log = require('./logger.js');

class PRISM {
    constructor() {
        const self = this;
        // NET
        this.port = process.env.PORT;
        this.host = process.env.HOST;
        this.output_buffer = [];
        this.input_buffer = "";
        this.client = null;

        // Credential
        this.username = process.env.PRISM_USERNAME;
        this.password = process.env.PRISM_PASSWORD;
        this.password_hash = '';
        this.client_challange = '';
        this.server_challange = '';
        this.salt = "";

        // State
        this.authenticated = false;
        this.COMMAND_CHANNEL = null;
        this.eventEmitter = new events.EventEmitter();
        this.status = false;

        this.connect();
		this.after();
    }
	
	after() {
		let self = this;
		this.client.on('end', () => {
            self.emit_event('log', 'Disconnected from PRISM Server');
            self.status = false;
            log.info('Disconnected form PRISM Server');
        });
        
        this.client.on('data', function(data) {
            //console.log("RECEIVED "+data.toString());
            self.messages(data.toString());
        });

        this.client.on('connect', () => {
            self.status = true;
            self.emit_event('log', 'Connected to PRISM Server');
            log.info('Connected to PRISM Server');
        })
		
		this.client.on('error', (data) => {
			self.emit_event('log', data);
            log.error(data);
		})
	}

    connect(){
        this.client = net.createConnection(process.env.PORT, process.env.HOST);
    }

	reconnect() {
		let self = this;
		this.client.removeAllListeners();
		this.client = net.createConnection(process.env.PORT, process.env.HOST);
		
		this.client.on('error', err => {
			console.error(err)
            log.error(err);
		})
		
		this.client.once('connect', function() {
			self.emit_event('log', 'Connectd to PRISM Server');
			console.info('Connected to server!')
			self.after();
			self.login();
		})
        log.info('Reconnecting to PRISM Server');
    }

    disconnect() {
		this.authenticated = false;
        this.client.end();
        log.info('Disconnected form PRISM Server');
    }

    /**
     * Send Radlity admin command
     * @param  {...string} args 
     * args should be a list like ["setnext", "kashan", "cq", "std"]
     */
    send_command(...args) {
        this.send_raw_command('apiadmin', ...args);
    }

    messages(data) {
        const DELIMITER = '\x04\x00';
        if(this.input_buffer) {
            data = this.input_buffer + data;
            this.clear_input_buffer();
        }

        const msg = data.split(DELIMITER, 1);

        if(data.includes(DELIMITER) && (msg[1] == undefined || msg[1] == null) ){
            this.parse_command(msg[0]);
        } else if(data.includes(DELIMITER) == false) {
            this.set_input_buffer(data);
        } else if(data.includes(DELIMITER) && msg[1].includes(DELIMITER) == false){
            this.parse_command(msg[0]);
            this.set_input_buffer(msg[1]);
        } else if (data.includes(DELIMITER) && msg[1].includes(DELIMITER)) {
            this.parse_command(msg[0]);
            this.messages(msg[1]);
        }
    }

    parse_command(command){
        const message = new Message(command);
        const subject = message.subject;
       
        switch (subject) {
            case 'login1':
                this._h_login1(message);
                break;

            case 'connected':
                this._h_connected(message);
                break;

            case 'serverdetails':
                this._h_serverdetails(message);
                break;

            case 'updateserverdetails':
                break;

            case 'APIAdminResult':
                this.emit_event(subject, message.messages);
				//this._log(message);
                break;

            case 'chat':
                this._chat(message);
                break;

            case 'success':
				this._log(message);
                break;

            case 'error':
                this.emit_event('error', message);
				this._log(message);
                break;

            case 'errorcritical':
				this._log(message);
                break;

            case 'raconfig':
				//this._log(message);
                break;
        
            default:
                console.log('No parser found: ' + subject);
                // this._log(message);
                break;
        }
    }

    set_input_buffer(data) {
        console.log('Set Input Buffer');
        this.input_buffer = data;
    }

    clear_input_buffer() {
        console.log('Clear Input Buffer');
        this.input_buffer = "";
    }

    send_output_buffer(){
        if(!this.client) return;
        const client = this.client;

        while (this.output_buffer.length > 0) {
            const data = this.output_buffer.shift();
            // console.log(data.toString());
            client.write(data);
        }
    }

    get_server_details(){
        this.send_raw_command("serverdetailsalways");
    }

    send_raw_command(subject, ...args) {
        const data = '\x01' + subject + '\x02' + args.join('\x03') + '\x04' + '\x00';
        this.output_buffer.push(Buffer.from(data, 'utf-8'));
        this.send_output_buffer();
    }

    login(username = this.username, password = this.password) {
        if(this.authenticated) {
			this.emit_event('log', 'already authenticated!')
			return
		};
        const self = this;
        // Cryptographically Secure Pseudorandom Number Generator
        const csrpng = parseInt(crypto.randomBytes(8).toString('hex'), 16);

        this.password_hash = crypto.createHash('sha1').update(password.toString('utf-8')).digest('hex');
        this.client_challange = csrpng.toString(16).replace(/(x0)+/, '').replace(/L+$/, '');
        this.send_raw_command("login1", "1", username, this.client_challange);
    }

    auth_digest(username, password_hash, salt, client_challange, server_challange){
        const salt_pass = salt + '\x01' + password_hash;
        const salted_hash = crypto.createHash('sha1').update(salt_pass.toString('utf-8')).digest('hex');
        const res = [username, client_challange, server_challange, salted_hash].join('\x03').toString('utf-8');
        return crypto.createHash('sha1').update(res).digest('hex');
    }
    
    get event() {
        return this.eventEmitter;
    }

    emit_event(subject,...data){
        this.eventEmitter.emit(subject, ...data);
    }

    /**
     * SUBJECT HANDLER
     */

    _h_login1(message) {
        [this.salt, this.server_challange] = message.messages;
        if(this.salt && this.server_challange) {
            this._login2();
        }
    }

    _login2() {
        const digest = this.auth_digest(this.username, this.password_hash, this.salt, this.client_challange, this.server_challange);
        this.send_raw_command('login2', digest)
        this.password_hash = '';
        this.client_challange = '';
    }

    _h_connected(message) {
        this.authenticated = true;
        this._log(message);
		this.emit_event('log', 'Authenticated as Skynet')
    }

    _log(message, queue = false, channel_id = null) {
        // if(channel_id){
        //     channel_id = this.COMMAND_CHANNEL;
        // }

        if(message instanceof Message){
            this.emit_event('log', message.messages.join('\n'));
        }
    }

    isGameManagementChat(message){
        if(message.subject != 'chat') return false;
        if(message.messages.length < 3) return false;
        if(message.messages[2].includes('Game') || message.messages[2].includes('Admin Alert') || message.messages[2].includes('Response')) return true;
        return false;
    }

    _chat(message){
        if(this.isGameManagementChat(message)){
            message.messages = message.messages.slice(2);
			
            switch (message.messages[0]) {
                case 'Game':
                    this._man_game(message);
					this._log(message);
                    break;

                case 'Admin Alert':
                    this._man_adminalert(message);
					this._log(message);
                    break;

                case 'Response':
                    this._man_response(message);
					this._log(message);
                    break;
            
                default:
                    console.log(message);
                    break;
            }
        }
    }

    _man_game(message){
        this.emit_event('game', message);
    }

    _man_adminalert(message){
        this.emit_event('adminalert', message);
    }
    
    _man_response(message){
        this.emit_event('response', message);
    }

    /**
     * Parse server details message
     * @param {Message} message 
     */
    _h_serverdetails(message){
        const msg = message.messages;
        const details = {
            'servername'        : msg[0],
            'serverIP'          : msg[1],
            'serverPort'        : msg[2],
            'serverStartupTime' : msg[3],
            'serverWarmup'      : msg[4],
            'serverRoundLength' : msg[5],
            'maxPlayers'        : msg[6],
            'status'            : msg[7],
            'map'               : msg[8],
            'mode'              : msg[9],
            'layer'             : msg[10],
            'timeStarted'       : msg[11],
            'players'           : msg[12],
            'team1'             : msg[13],
            'team2'             : msg[14],
            'tickets1'          : msg[15],
            'tickets2'          : msg[16],
            'rconUsers'         : msg[17],
        }

        const layers = {
            '16': 'inf',
            '32': 'alt',
            '64': 'std',
            '128': 'large',
        }

        // details["serverStartupTime"] = 
        // details["serverWarmup"] = str(float(details["serverWarmup"])/60) + " minutes"
        // details["serverRoundLength"] = str(float(details["serverRoundLength"])/60) + " minutes"
        details["layer"] = layers[details["layer"]]
        // details["timeStarted"] = datetime.datetime.fromtimestamp(float(details["timeStarted"])).strftime("%Y-%m-%d-T%H:%M:%S")

        // if(details['status'] != 0){
        //     details['status'] = "LOADING SCREEN";
        //     details["mode"] = null;
        //     details["layer"] = null;
        //     details["team1"] = null;
        //     details["team2"] = null;
        // } else {
        //     details['status'] = null;
        // }

        this.emit_event('serverdetails', details);
    }
}

class Message {
    constructor(data) {
        this.data = data;
        this.subject = data.split('\x02')[0].replace('\x01', '');
        this.messages = data.split('\x02')[1].split('\x03');
        this.messages[this.messages.length - 1] = this.messages[this.messages.length-1].replace('\x04\x00', '');
    }
}

module.exports = {
    PRISM
}