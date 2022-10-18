/*

    Helpers for various tasks

*/

// Dependencies
const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');
const path = require('path');
const fs = require('fs');

const config = require('./config');


// Container for all helpers
const helpers = {};

// Sample for testing that simply returns a number
helpers.getANumber = function() {
    return 1;
}

// Create a SHA256 hash
helpers.hash = function(str) {
    if (typeof(str) === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

// Parse a JSON string to an object in all cases without throwing exceptions
helpers.parseJsonToObject = function(str) {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (error) {
        return {};
    }
}

// Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;

    if (strLength) {
        // Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // generate the random string
        let str = '';

        for (let i=0; i<strLength; i++) {
            // get a random character from the possible cahracter string
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            // Append the random character to final string variable
            str += randomCharacter;
        }

        // return string
        return str;
    } else {
        return false;
    }
}


// Send an SMS message via Twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
    // Validate parameters
    phone = typeof(phone) === 'string' && phone.trim().length > 0 ? phone.trim() : false;
    msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false;

    if (phone && msg) {
        // Configure the request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+1' + phone,
            'Body': msg
        }

        // Stringify the payload
        const stringifyPayload = querystring.stringify(payload);

        // Configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringifyPayload)
            }
        }

        // Instantiate the request object
        const request = https.request(requestDetails, function(response) {
            // Grab the status of the sent request
            const status = response.statusCode;

            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback('Status code returned was '+ status);
            }
        });

        // Bind to the error event so it doesn't get thrown
        request.on('error', function(e) {
            callback(e)
        });

        // Add the payload
        request.write(stringifyPayload);

        // End the request || Send the request
        request.end();
    } else {
        callback(400, {'Error': 'Given parameters were missing or invalid'})
    }
}

// Get the string content of a template
helpers.getTemplate = function(templateName, data, callback) {
    templateName = typeof(templateName) === 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) === 'object' && data !== null ? data : {};

    if (templateName) {
        const templatesDir = path.join(__dirname, '/../templates/');
        fs.readFile(templatesDir + templateName + '.html', 'utf8', function(err, str) {
            if (!err && str, str.length > 0) {
                // Do interpolation on string
                const finalStr = helpers.interpolate(str, data)
                callback(false, finalStr)
            } else {
                callback('No template was found')
            }
        });
    } else {
        callback('A valid template name was not specified')
    }
}

// Add the universal header and footer to a string, and pass the provided data object to the header and footer for interploation
helpers.addUniversalTemplates = function(str, data, callback) {
    str = typeof(str) === 'string' && str.length > 0 ? str : '';
    data = typeof(data) === 'object' && data !== null ? data : {};

    // Get the header
    helpers.getTemplate('_header', data, function(err, headerStr) {
        if (!err && headerStr) {
            // Get the footer
            helpers.getTemplate('_footer', data, function(err, footerStr) {
                if (!err && footerStr) {
                    const fullStr = headerStr + str + footerStr
                    callback(false, fullStr)
                } else {
                    callback('Could not find the footer template')
                }
            })
        } else {
            callback('Could not find the header template')
        }
    })
}

// Take a given string and data object and find/replace all the keys within it
helpers.interpolate = function(str, data) {
    str = typeof(str) === 'string' && str.length > 0 ? str : '';
    data = typeof(data) === 'object' && data !== null ? data : {};

    

    // Add the template globals to the data object, prepending their key name with "global"
    for (let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName];
        }
    }

    // for each key in the data object, insert its value into the string at the corresponding placeholder
    for(let key in data) {
        if (data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
            const replace = data[key];
            const find = '{' + key + '}';

            str = str.replace(find, replace)
        }
    }

    return str;
}

module.exports = helpers
