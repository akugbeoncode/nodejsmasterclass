/*

    CLI related tasks

*/

// Dependencies
const readline = require('readline');
const util = require('util');
const events = require('events');
const os = require('os');
const v8 = require('v8');
const childProcess = require('child_process');
const _data = require('./data');
const _logs = require('./logs');
const helpers = require('./helpers');

const debug = util.debuglog('cli');

class _events extends events {};

const e = new _events();

// Instantiate the CLI module object
const cli = {};

// Input handlers
e.on('man', function(str) {
    cli.responders.help();
});

e.on('help', function(str) {
    cli.responders.help();
});

e.on('exit', function(str) {
    cli.responders.exit();
});

e.on('stats', function(str) {
    cli.responders.stats();
});

e.on('list users', function(str) {
    cli.responders.listUsers();
});

e.on('more user info', function(str) {
    cli.responders.moreUserInfo(str);
});

e.on('list checks', function(str) {
    cli.responders.listChecks(str);
});

e.on('more check info', function(str) {
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', function(str) {
    cli.responders.listLogs();
});

e.on('more log info', function(str) {
    cli.responders.moreLogInfo(str);
});

// Responders Object
cli.responders = {};

// Help / Man
cli.responders.help = function() {
    const commands = {
        'exit': 'Kill the CLI (and the rest of the application)',
        'man': 'Show this help page',
        'help': 'Alias of the "man" command',
        'stats': 'Get statistics on the underlying operating system and resource utilization',
        'list users': 'Show all the registered (undeleted) users in the system',
        'more user info --{userId}': 'Show details of a specific user',
        'list checks --up --down': 'Show a list of all the active checks in the system, including their state. The "--up" and the "--down" are both optional',
        'more check info --{checkId}': 'Show details of a specific check',
        'list logs': 'Show a list of all files available to be read (compressed only)',
        'more log info --{fileName}': 'Show details of a specific log file'
    };

    // Show a header for the help page that is as wide as the screen
    cli.horintalLine();
    cli.centered('CLI MANUAL');
    cli.horintalLine();
    cli.verticalSpace(2);

    // Show each command, followed by its explaination, in white and yellow respectively
    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = '\x1b[33m' + key + '\x1b[0m';
            const padding = 60 - line.length;
            for (let i=0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace();

    // End with another horintal line
    cli.horintalLine();
}

// 
cli.centered = function(str) {
    str = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : '';

    const width = process.stdout.columns;

    const leftPadding = Math.floor((width - str.length) / 2);

    let line = '';
    for (let i=0; i<leftPadding; i++) {
        line += ' ';
    }

    line += str;
    console.log(line)
}

// Create a horizontal line accross the screen
cli.horintalLine = function() {
    const width = process.stdout.columns;

    var line  = '';
    for (let i=0; i<width; i++) {
        line += '-';
    }
    console.log(line)
}

// Create a vertical space
cli.verticalSpace = function(lines) {
    lines = typeof(lines) === 'number' && lines > 0 ? lines : 1;

    for (let i=0; i<lines; i++) {
        console.log('');
    }
}

cli.responders.exit = function() {
    process.exit(0);
}

cli.responders.stats = function() {
    // compile an object of stats
    const stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'Uptime': os.uptime() + ' seconds'
    }

    // Show a header for the stats
    cli.horintalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horintalLine();
    cli.verticalSpace(2);

    // Show each command, followed by its explaination, in white and yellow respectively
    for (let key in stats) {
        if (stats.hasOwnProperty(key)) {
            const value = stats[key];
            let line = '\x1b[33m' + key + '\x1b[0m';
            const padding = 60 - line.length;
            for (let i=0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace();

    // End with another horintal line
    cli.horintalLine();
}

cli.responders.listUsers = function() {
    _data.list('users', function(err, userIds) {
        if (!err && userIds && userIds.length > 0) {
            cli.verticalSpace()
            userIds.forEach(function(userId){
                _data.read('users', userId, function(err, userData) {
                    if (!err && userData) {
                        let line = 'Name: ' + userData.firstname + ' ' + userData.lastname + ', Phone: ' + userData.phone + ', checks: ';
                        const numberOfChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
                        line += numberOfChecks;
                        console.log(line);
                        cli.verticalSpace();
                    }
                });
            });
        }
    })
}

cli.responders.moreUserInfo = function(str) {
    // Get the ID from the string
    const strArr = str.split('--');
    const userId = typeof(strArr[1]) === 'string' && strArr[1].trim().length > 0 ? strArr[1].trim() : false;

    if (userId) {
        // look up user
        _data.read('users', userId, function(err, userData) {
            if (!err && userData) {
                // Remove the hashed password
                delete userData.hashedPassword;

                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(userData, {'colors': true})
                cli.verticalSpace();
            }
        });
    }
}

cli.responders.listChecks = function(str) {
    _data.list('checks', function(err, checkIds) {
        if (!err && checkIds && checkIds.length > 0) {
            cli.verticalSpace();

            checkIds.forEach(function(checkId){
                _data.read('checks', checkId, function(err, checkData) {
                    if (!err && checkData) {
                        let includeCheck = false
                        const lowerString = str.toLowerCase();

                        // Get the state, default to down
                        const state = typeof(checkData.state) === 'string' ? checkData.state : 'down';

                        // Get the state, default to unknown
                        const stateOrUnknown = typeof(checkData.state) === 'string' ? checkData.state : 'unknown';

                        // If the user has specified the state, or hasn't specified any state, include the current check accordingly
                        if (lowerString.indexOf('--' + state) > -1 || (lowerString.indexOf('--down') === -1 && lowerString.indexOf('--up') === -1)) {
                            let line  = 'ID: ' + checkData.id + ' ' + checkData.method.toUpperCase() + ' ' + checkData.protocol + '://' + checkData.url + ' State: ' + stateOrUnknown
                        
                            console.log(line);
                            cli.verticalSpace()
                        }
                    }
                });
            });
        }
    });
}

cli.responders.moreCheckInfo = function(str) {
    // Get the ID from the string
    const strArr = str.split('--');
    const checkId = typeof(strArr[1]) === 'string' && strArr[1].trim().length > 0 ? strArr[1].trim() : false;

    if (checkId) {
        // look up user
        _data.read('checks', checkId, function(err, checkData) {
            if (!err && checkData) {
                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(checkData, {'colors': true})
                cli.verticalSpace();
            }
        });
    }
}

// cli.responders.listLogs = function() {
//     _logs.list(true, function(err, logFileNames) {
//         if (!err && logFileNames && logFileNames.length > 0) {
//             cli.verticalSpace();
//             logFileNames.forEach(function(logFileName){
//                 if (logFileName.indexOf('-') > -1) {
//                     console.log(logFileName);
//                     cli.verticalSpace();
//                 }
//             });
//         }
//     });
// }

cli.responders.listLogs = function() {
    const ls =  childProcess.spawn('ls', ['./.logs/']);
    ls.stdout.on('data', function(dataObj) {
        // Explode into seperate lines
        const dataStr = dataObj.toString();
        const logFileNames = dataStr.split('\n');
        cli.verticalSpace();
        logFileNames.forEach(function(logFileName){
            if (typeof(logFileName) === 'string' && logFileName.length > 0 && logFileName.indexOf('-') > -1) {
                console.log(logFileName.trim().split('.')[0]);
                cli.verticalSpace();
            }
        });
    });
}

cli.responders.moreLogInfo = function(str) {
    // Get the ID from the string
    const strArr = str.split('--');
    const logFileName = typeof(strArr[1]) === 'string' && strArr[1].trim().length > 0 ? strArr[1].trim() : false;

    if (logFileName) {
        cli.verticalSpace();
        // Decompress the log file
        _logs.decompress(logFileName, function(err, strData) {
            if (!err && strData) {
                // Split into lines
                const logsArr = strData.split('\n');

                logsArr.forEach(function(jsonString){
                    const logObject = helpers.parseJsonToObject(jsonString);

                    if (logObject && JSON.stringify(logObject) !== '{}') {
                        console.log(logObject, {'colors': true})
                        cli.verticalSpace();
                    }
                });
            }
        });
    }
}

// Input Processor
cli.processInput = function(str) {
    str = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : false;

    if (str) {
        // codify the unique string that identify the unique questions allow to be asked
        const uniqueInput = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // Go through the possible inputs, emit an event when a match is found
        let matchFound = false;
        let counter = 0;

        uniqueInput.some(function(input){
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;
                // Emit an event matching the unique input, and include the full string given 
                e.emit(input, str);
                return true
            }
        });

        // if no match is found, tell the user to try again
        if (!matchFound) {
            console.log("Sorry, try again")
        }
    }
}

// init script
cli.init = function() {
    // Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

    // Start the interface
    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    });

    // create an initial prompt
    _interface.prompt();

    // handle each line of input
    _interface.on('line', function(str) {
        // Send to the input processor
        cli.processInput(str);

        // Re-initialize the prompt afterwards
        _interface.prompt();
    });

    // if the user stops the CLI, kill the associated process
    _interface.on('close', function() {
        process.exit(0);
    });
}

module.exports = cli;