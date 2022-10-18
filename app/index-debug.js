/*
    Primary file for the API
*/

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli')
const exampleDebuggingProblem =  require('./lib/exampleDebuggingProblem');

// Declare the app
const app = {};

// init function
app.init = function() {
    // Start the server
    debugger;
    server.init();
    debugger;

    // Start the workers
    debugger;
    workers.init();
    debugger;

    // Start the CLI, but make sure it starts last
    debugger;
    setTimeout(function(){
        cli.init();
        debugger;
    }, 50);
    debugger;

    // Set foo to 1
    debugger;
    let foo = 1;
    console.log('Just assigned 1 to foo')
    debugger;

    // increment foo
    foo++;
    console.log('Just incremented foo')
    debugger;

    // Square foo
    foo = foo * foo;
    console.log('Just squared foo')
    debugger;

    // Convert foo to a string
    foo = foo.toString();
    console.log('Just converted foo to a string')
    debugger;

    // call the init script that will throw
    exampleDebuggingProblem.init();
    console.log('Just called the library')
    debugger;
}

// Execute
app.init();

// Export the app
module.exports = app