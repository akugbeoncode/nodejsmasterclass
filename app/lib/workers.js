/*

    Workers related tasks

    working phone number: 4158675309

*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
const _data = require('./data');
const _logs = require('./logs');

const util = require('util');
const debug = util.debuglog('workers');

// Instantiate the worker object
const workers = {};

// Lookup all checks, get their data, send to a validator
workers.gatherAllCheckes = function() {
    // Get all the checks
    _data.list('checks', function(err, checksArray) {
        if (!err && checksArray && checksArray.length > 0) {
            checksArray.forEach(function(check){
                // Read in the check data
                _data.read('checks', check, function(err, originalCheckData){
                    if (!err && originalCheckData) {
                        // Pass the check data to the check validator, and let that function continue or log error ass needed
                        workers.validateCheckData(originalCheckData);
                    } else {
                        debug("Error reading one of the checks data")
                    }
                })
            });
        } else {
            debug("Error: Could not find any checks to process")
        }
    });
}

// Sanity-checking the checks data
workers.validateCheckData = function(originalCheckData) {
    originalCheckData = typeof(originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) === 'string' && originalCheckData.id.trim().length === 20 ? originalCheckData.id : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) === 'string' && originalCheckData.userPhone.trim().length > 0 ? originalCheckData.userPhone : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) === 'string' && ['https', 'http'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) === 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url : false;
    originalCheckData.method = typeof(originalCheckData.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes)  === 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;


    // Set the keys that may not be set (if the workers have never seen this check before)
    originalCheckData.state = typeof(originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    // If all the checks pass, pass the data along to the next step in the process
    if (
        originalCheckData.id &&
        originalCheckData.userPhone &&
        originalCheckData.protocol &&
        originalCheckData.url &&
        originalCheckData.method &&
        originalCheckData.successCodes &&
        originalCheckData.timeoutSeconds
    ) {
        workers.performCheck(originalCheckData);
    } else {
        debug("Error: One of the checks is not properly formatted. Skipping it.")
    }
}

// Perform the check, send the originalCheckData and the outcome of the check process, to the next step in the process
workers.performCheck = function(originalCheckData) {
    // Prepare the initial check outcome
    const checkOutcome = {
        'error': false,
        'responseCode': false
    }

    // Mark that the outcome has not been sent yet
    let outcomeSent = false;

    // Parse the hostname  and the path out of the original check data
    const parsedUrl = url.parse(originalCheckData.protocol + '://' + originalCheckData.url, true);
    const hostname = parsedUrl.hostname;
    const path = parsedUrl.path; // Using path and not "pathname" because we want the query string

    // Construct the Request
    const requestDetails = {
        'protocol': originalCheckData.protocol + ':',
        'hostname': hostname,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    }

    // Instantiate the request object (using either the http or https module)
    const _moduleToUse = originalCheckData.protocol === 'http' ? http : https;

    const request = _moduleToUse.request(requestDetails, function(response){
        // Grab the status of the sent request
        const status = response.statusCode;

        // update the checkOutcome and pass the data along
        checkOutcome.responseCode = status;

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        } 
    })

    // Bind to the error event so that it does not get thrown
    request.on('error', function(e) {
        // update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': e
        }

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        } 
    });

    // Bind to the timeout event
    request.on('timeout', function(e) {
        // update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        }

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        } 
    });

    // End the request
    request.end();
}

// process the check outcome, update the check data as needed, trigger an alert to the user if needed
// Special logic for accomodating a check that has never been updated before (dont alert on that one)
workers.processCheckOutcome = function(originalCheckData, checkOutcome) {
    // Decide if the check is considered up or down
    const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    // Decide if an alert is warranted
    const alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

    // Log the outcome
    const timeOfCheck = Date.now();
    workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);

    // Update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    // Save the update
    _data.update('checks', newCheckData.id, newCheckData, function(err) {
        if (!err) {
            // Send the new check data to the next phase in the process if needed
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                debug('Check outcome has not change, no alert needed')
            }
        } else {
            debug('Error trying to save update to one of the checks')
        }
    })
}

workers.alertUserToStatusChange = function(newCheckData) {
    const msg = 'Alert: Your check for ' + newCheckData.method.toUpperCase() + ' ' + newCheckData.protocol + '://' + newCheckData.url + ' is currently ' + newCheckData.state;

    helpers.sendTwilioSms(newCheckData.userPhone, msg, function(err) {
        if (!err) {
            debug("Success: User was alerted to a status change in their check, via SMS", msg);
        } else {
            debug("Error: Could not send SMS alert to user who had a state change in their check")
        }
    })
}

// 
workers.log = function(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck){
    // Form the log data
    const logData = {
        'check': originalCheckData,
        'outcome': checkOutcome,
        'state': state,
        'alert': alertWarranted,
        'time': timeOfCheck
    }

    // Convert log data to a string
    const logString = JSON.stringify(logData);

    // Determine the name of the log file
    const logFileName = originalCheckData.id

    // Append the log string to the file
    _logs.append(logFileName, logString, function(err) {
        if (!err) {
            debug("logging to file succeeded");
        } else {
            debug("logging to file failed");
        }
    })
}

// Rotate (compress) the logs files
workers.rotateLogs = function() {
    // List all the  (non compressed) log files
    _logs.list(false, function(err, logs) {
        if (!err && logs && logs.length > 0) {
            logs.forEach(function(logName) {
                // Compress the data to a different file
                const logId = logName.replace('.log', '');
                const newFileId = logId + '-' + Date.now();

                _logs.compress(logId, newFileId, function(err) {
                    if (!err) {
                        // Truncate the log
                        _logs.truncate(logId, function(err) {
                            if (!err) {
                                debug('Success truncating log file');
                            } else {
                                debug('Error truncating log file');
                            }
                        })
                    } else {
                        debug('Error compressing one of the log files', err);
                    }
                });
            })
        } else {
            debug('Error: Could not find any logs to rotate');
        }
    })
}


// Timer to execute the log-rotation process once per day
workers.logRotationLoop = function() {
    setInterval(function(){
        workers.rotateLogs();
    }, (1000 * 60 * 60 * 24))
}


// Timer to execute the worker process once per minute
workers.loop = function() {
    setInterval(function(){
        workers.gatherAllCheckes();
    }, (1000 * 60))
}

// Init script
workers.init = function() {
    // Send to console in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background worker are running');

    // Execute all the checks immediately
    workers.gatherAllCheckes();

    // Call the loop so the checks will execute later on
    workers.loop();

    // Compress all the logs immediately
    workers.rotateLogs();

    // Call the compression loop so logs will be compressed later on
    workers.logRotationLoop();
}

// Export the module
module.exports = workers