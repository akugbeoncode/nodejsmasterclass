/*

    Example UDP Client
    Sending a message to UDP server on port 6000

*/

// Dependencies
const dgram = require('dgram');

// Create a server
const client = dgram.createSocket('udp4');

// Define the message and pull it into a buffer
const messageString = 'This is a message';
const messageBuffer = Buffer.from(messageString);

// Send off the message
client.send(messageString, 6000, 'localhost', function(err) {
    client.close();
});