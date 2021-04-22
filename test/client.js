const net = require('net');

const client = net.createConnection('8124', '127.0.0.1');

client.on('connect', () => {
	console.log('Connected');
})

client.on('error', (err) => {
	console.error(err);
})

client.on('data', (data) => {
	console.log('Recived :' + data);
})

setInterval(() => {
	client.write('Hello')
}, 2000);