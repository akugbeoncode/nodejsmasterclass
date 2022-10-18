/*

    Example TCP (Net) Client
    connects to port 6000 and send the word "ping" to the server

*/

// Dependencies
const net = require('net');

// define the message
const outboundMessage = 'ping';

// Create the client
const client = net.createConnection({ 'port': 6000 }, function() {
    client.write(outboundMessage);
});

// When the server writes back, log what it says to the console then kill the client
client.on('data', function(inboundMessage) {
    const messageString = inboundMessage.toString();
    console.log("I wrote " + outboundMessage + " and they sent " + messageString);
    client.end();
});
