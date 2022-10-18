/*

    Example TLS Client
    connects to port 6000 and send the word "ping" to the server

*/

// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options
const options = {
    ca: fs.readFileSync(path.join(__dirname, '/../../https/cert.pem')) //
};

// define the message
const outboundMessage = 'ping';

// Create the client
const client = tls.connect(6000, options, function() {
    client.write(outboundMessage);
});

// When the server writes back, log what it says to the console then kill the client
client.on('data', function(inboundMessage) {
    const messageString = inboundMessage.toString();
    console.log("I wrote " + outboundMessage + " and they sent " + messageString);
    client.end();
});
