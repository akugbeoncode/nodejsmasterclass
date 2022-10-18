/*

    Example UDP Server
    Create a UDP datagram server listening

*/

// Dependencies
const dgram = require('dgram');

// Create a server
const server = dgram.createSocket('udp4');

server.on('message', function(messageBuffer, sender){
    // Do something with an incoming message or do something with the sender
    let messageString =  messageBuffer.toString();
    console.log(messageString);
});

server.bind(6000);