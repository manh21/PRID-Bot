const net = require('net');
const client = new net.Socket();

// client.connect(1337, '127.0.0.1', function() {
// 	console.log('Connected');
// 	client.write('Hello, server! Love, Client.');
// });

// client.on('data', function(data) {
// 	console.log('Received: ' + data);
// 	client.destroy(); // kill client after server's response
// });

// client.on('close', function() {
// 	console.log('Connection closed');
// });

class TCPClient {
    constructor(host, port) {
        this.host = host;
        this.port = port;

        client.connect(this.port, this.host);

        this.onConnect();
    }

    onConnect() {
        client.on('connect', function() {
            console.log('Client: connection established with server');

            console.log('---------client details -----------------');
            var address = client.address();
            var port = address.port;
            var family = address.family;
            var ipaddr = address.address;
            console.log('Client is listening at port' + port);
            console.log('Client ip :' + ipaddr);
            console.log('Client is IP4/IP6 : ' + family);

        });

        client.on('drain', function() {
            console.log("DRAIN");
        });

        this.setEncoding();

        client.on('data', function(data) {
            console.log("RECEIVED");
            // client.end();
        });

        client.on('end', function() {
            console.log("END");
        });
    }

    setEncoding() {
        console.log("setEncoding");
        client.setEncoding('utf8');
    }

    onData(data) {
        console.log("DATA= ", data);
        client.write(data);
    }

    end() {
        client.end();
    }

    close() {
        client.close();
    }
}

module.exports = {
    TCPClient
};