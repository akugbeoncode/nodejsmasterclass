/*
    
    Server related tasks


*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');

const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module object
const server = {};

// Define a request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping' : handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    'favicon.ico': handlers.favicon,
    'public': handlers.pulic,
    'examples/error': handlers.exampleError
}

// All Server logic for both http and https server
server.unifiedServer = function(request, response) {
    // Get the URL and parse it
    const parsedUrl = url.parse(request.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string 
    const queryStringObject = parsedUrl.query;

    // Get the HTTP method 
    const method = request.method.toLowerCase();

    // Get the HTTP headers 
    const headers = request.headers;

    // Get the payload, if any 
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    request.on('data', function(data){
        buffer += decoder.write(data);
    });

    request.on('end', function() {
        buffer += decoder.end();

        // Choose the handler the request should go to, if no handler is found, go to the non found handler
        let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // If the request is within the public directory, use the public handlers instead
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.pulic : chosenHandler;

        // Construct the data object to send to the handler
        const data = {
            'path': trimmedPath,
            'query': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        try {
            chosenHandler(data, function(statusCode, payload, contentType){
                server.processHandlerResponse(response, method, trimmedPath, statusCode, payload, contentType)
            });
        } catch (e) {
            debug(e);
            const errMsg = {
                'Error': 'An unknown error has occured'
            }
            server.processHandlerResponse(response, method, trimmedPath, 500, errMsg, 'json')
        }
    });
}

// Process the response from the handler
server.processHandlerResponse = function(response, method, trimmedPath, statusCode, payload, contentType) {
     // Determine the type of response (fallback to JSON)
     contentType = typeof(contentType) === 'string' ? contentType : 'json'

     // Use the status code called back by the handler, or default to 200
     statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

     // return a response part that are content specific
     let payloadString = '';

     if (contentType === 'json') {
         response.setHeader('Content-Type', 'application/json');
         payload = typeof(payload) === 'object' ? payload : {};
         payloadString = JSON.stringify(payload);
     }

     if (contentType === 'html') {
         response.setHeader('Content-Type', 'text/html');
         payloadString = typeof(payload) === 'string' ? payload : '';
     }

     if (contentType === 'favicon') {
         response.setHeader('Content-Type', 'image/x-icon');
         payloadString = typeof(payload) !== 'undefined' ? payload : '';
     }

     if (contentType === 'css') {
         response.setHeader('Content-Type', 'text/css');
         payloadString = typeof(payload) !== 'undefined' ? payload : '';
     }

     if (contentType === 'js') {
         response.setHeader('Content-Type', 'text/javascript');
         payloadString = typeof(payload) !== 'undefined' ? payload : '';
     }

     if (contentType === 'png') {
         response.setHeader('Content-Type', 'image/png');
         payloadString = typeof(payload) !== 'undefined' ? payload : '';
     }

     if (contentType === 'jpg') {
         response.setHeader('Content-Type', 'image/jpg');
         payloadString = typeof(payload) !== 'undefined' ? payload : '';
     }

     if (contentType === 'plain') {
         response.setHeader('Content-Type', 'text/plain');
         payloadString = typeof(payload) !== 'undefined' ? payload : '';
     }

     // return the response part that are common to all content-types
     response.writeHead(statusCode);
     response.end(payloadString);

     // If the response is 200, print green otherwise print red
     if (statusCode >= 200 && statusCode < 300) {
         debug('\x1b[32m%s\x1b[0m', method.toUpperCase()+ ' /' + trimmedPath + ' ' + statusCode)
     } else if (statusCode >= 300 && statusCode < 400) {
         debug('\x1b[33m%s\x1b[0m', method.toUpperCase()+ ' /' + trimmedPath + ' ' + statusCode)
     } else {
         debug('\x1b[31m%s\x1b[0m', method.toUpperCase()+ ' /' + trimmedPath + ' ' + statusCode)
     }
}

// Instantiating the HTTP Server
server.httpServer = http.createServer((request, response)=>{
    server.unifiedServer(request, response)
});


// Instantiating the HTTPS Server
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsServerOptions, (request, response)=>{
    server.unifiedServer(request, response)
});

// Init server
server.init = function() {
    // Start the HTTP server, and have it listen on port 3000 or 3001
    server.httpServer.listen(config.httpPort, ()=>{
        console.log('\x1b[36m%s\x1b[0m', `HTTP Server is listening on port ${config.httpPort}`);
    });

    // Start the HTTPS server, and have it listen on port 5000 or 5001
    server.httpsServer.listen(config.httpsPort, ()=>{
        console.log('\x1b[35m%s\x1b[0m', `HTTPS Server is listening on port ${config.httpsPort}`);
    });
}


// Export server module
module.exports = server;

