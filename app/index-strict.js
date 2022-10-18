/*
    Primary file for the API
*/

'use strict';

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const { strict } = require('assert');

// Declare the app
const app = {};

// Declare a global (that strict mode should catch)
foo = 'bar';

// init function
app.init = function() {
    // Start the server
    server.init();

    // Start the workers
    workers.init();

    // Start the CLI, but make sure it starts last
    setTimeout(function(){
        cli.init();
    }, 50);
}

// Execute
app.init();

// Export the app
module.exports = app