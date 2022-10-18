/*

    Request handlers

*/

// Dependencies
const fs = require('fs');
const path = require('path');
const _url = require('url');
const dns = require('dns');
const _performance = require('perf_hooks').performance;
const util = require('util');
const config = require('./config');
const _data = require('./data');
const helpers = require('./helpers')
const debug = util.debuglog('performance');

// Define the handler
const handlers = {}

/*

    HTML Handlers

*/

// Favicon handlers
handlers.favicon = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Read in the favicon's data
        helpers.getStaticAsset('favicon.ico', function(err, data) {
            if (!err, data) {
                callback(200, data, 'favicon')
            } else {
                callback(500)
            }
        })
    } else {
        callback(405)
    }
}

// Public handlers
handlers.pulic = function(data, callback) {
     // Reject any request that is not a GET
     if (data.method === 'get') {
        // get filename being requested
        const trimmedAssetName = data.path.replace('public/', '').trim();

        if (trimmedAssetName && trimmedAssetName.length > 0) {
            // Read in the asset's data
            helpers.getStaticAsset(trimmedAssetName, function(err, data) {
                if (!err, data) {
                    // Determine the content type (default to plain text)
                    let contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (trimmedAssetName.indexOf('.js') > -1) {
                        contentType = 'js';
                    }

                    if (trimmedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (trimmedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }

                    if (trimmedAssetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    // callback the data
                    callback(200, data, contentType)
                } else {
                    callback(500)
                }
            })
        } else {
            callback(404)
        }
    } else {
        callback(405)
    }
}

// Get the content of a static (public) asset
helpers.getStaticAsset = function(fileName, callback) {
    fileName = typeof(fileName) === 'string' && fileName.length > 0 ? fileName : false;

    if (fileName) {
        const publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir + fileName, function(err, data) {
            if (!err && data) {
                callback(false, data)
            } else {
                callback('No file was found with the specified name')
            }
        })
    } else {
        callback('A valid file name was not specified')
    }
} 

// index handler
handlers.index = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS site of all kinds. When your site goes down, we\'ll send you a text message to let you know',
            'body.class': 'index',
        }

        // Read in a template as a string
        helpers.getTemplate('index', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}

// Create Account 
handlers.accountCreate = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Create an Account',
            'head.description': 'Signup is easy and only takes a few seconds',
            'body.class': 'accountCreate',
        }

        // Read in a template as a string
        helpers.getTemplate('accountCreate', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}

// Create New Session
handlers.sessionCreate = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Login to your Account',
            'head.description': 'Please enter your phone number and password to acess your account',
            'body.class': 'sessionCreate',
        }

        // Read in a template as a string
        helpers.getTemplate('sessionCreate', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}


// Session has been deleted
handlers.sessionDeleted = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Logged Out',
            'head.description': 'You have been logged out of your account',
            'body.class': 'sessionDeleted',
        }

        // Read in a template as a string
        helpers.getTemplate('sessionDeleted', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}

// Edit your account
handlers.accountEdit = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Account Setting',
            'body.class': 'accountEdit',
        }

        // Read in a template as a string
        helpers.getTemplate('accountEdit', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}

// Account has been Deleted
handlers.accountDeleted = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Account Deleted',
            'head.description': 'Your account has been deleted.',
            'body.class': 'accountDeleted',
        }

        // Read in a template as a string
        helpers.getTemplate('accountDeleted', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}


// Create a new check
handlers.checksCreate = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Create a new Check',
            'body.class': 'checksCreate',
        }

        // Read in a template as a string
        helpers.getTemplate('checksCreate', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}


// List all checks
handlers.checksList = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Dashboard',
            'body.class': 'checksList',
        }

        // Read in a template as a string
        helpers.getTemplate('checksList', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}


// Edit a check
handlers.checksEdit = function(data, callback) {
    // Reject any request that is not a GET
    if (data.method === 'get') {
        // Prepare data for interpolation
        const templateData = {
            'head.title': 'Check Details',
            'body.class': 'checksEdit',
        }

        // Read in a template as a string
        helpers.getTemplate('checksEdit', templateData, function(err, str) {
            if (!err && str) {
                // add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, function(err, fullStr) {
                    if (!err && fullStr) {
                        callback(200, fullStr, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })
            } else {
                callback(500, undefined, 'html')
            }
        });
    } else {
        callback(405, undefined, 'html')
    }
}


/*

    JSON API Handlers

*/

// Example Error Handler
handlers.exampleError = function(data, callback) {
    const err = new Error('This is an example error');
    throw(err);
}

// Users handler
handlers.users = function(data, callback) {
    const acceptibleMethods = ['post', 'get', 'put', 'delete'];

    if (acceptibleMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
} 

// Container for the users submethods
handlers._users = {}

// Users - post
// Required data: firstname, lastname, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback) {
    // check that all required fields are filed out
    const firstname = typeof(data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
    const lastname = typeof(data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;

    if (firstname && lastname && phone && password && tosAgreement) {
        //  Make sure that the user doesnt already exist
        _data.read('users', phone, function(err, data) {
            if (err) {
                // Hash the password
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    // Create the user object
                    const userObject = {
                        'firstname': firstname,
                        'lastname': lastname,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    }

                    // Store the user
                    _data.create('users', phone, userObject, function(err) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not create the new user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not hash the user\'s password'});
                }
            } else {
                // User already exist
                callback(400, {'Error': 'A user with that phone number already exist'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields'})
    }
}

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = function(data, callback) {
    // Check that the phone number is valid
    const phone = typeof(data.query.phone) === 'string' && data.query.phone.trim().length > 0 ? data.query.phone.trim() : false;

    if (phone) {
        // Get the token from the headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the given number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function(err, data) {
                    if (!err && data) {
                        // Remove the hashed password from user object before returning it to the requester
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404)
                    }
                })
            } else {
                callback(403, {'Error': 'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
}

// Users - put
// Required data: phone
// Optional data: firstname, lastname, phone, password, tosAgreement (at least one must be specified!!!)
handlers._users.put = function(data, callback) {
    // Check that the phone number is valid
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;

    // Check for the optional fields
    const firstname = typeof(data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
    const lastname = typeof(data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstname || lastname || password) {

            // Get the token from the headers
            const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
            // Verify that the given token is valid for the given number
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
                if (tokenIsValid) {
                    // Lookup the user
                    _data.read('users', phone, function(err, userData) {
                        if (!err && userData) {
                            // Update the fields necessary
                            if (firstname) {
                                userData.firstname = firstname;
                            }
                            
                            if (lastname) {
                                userData.lastname = lastname;
                            }

                            if (password) {
                                userData.hashedPassword = helpers.hash(password);
                            }

                            // Store the new update
                            _data.update('users', phone, userData, function(err) {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {'Error': 'Could not update the user'});
                                }
                            });
                        } else {
                            callback(400, {'Error': 'The specified user does not exist'})
                        }
                    });
                } else {
                    callback(403, {'Error': 'Missing required token in header, or token is invalid'});
                }
            });
        } else {
            callback(400, {'Error': 'Missing fields to update'})
        }
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Users - delete
// Required field: phone
handlers._users.delete = function(data, callback) {
    // Check that the phone number is valid
    const phone = typeof(data.query.phone) === 'string' && data.query.phone.trim().length > 0 ? data.query.phone.trim() : false;

    if (phone) {
        // Get the token from the headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the given number
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, function(err, userData) {
                    if (!err && userData) {
                        _data.delete('users', phone, function(err) {
                            if (!err) {
                                // Delete each of the check associated with the user
                                const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                                const checkToDelete = userChecks.length;
                                if (checkToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionErrors = false;
                                    userChecks.forEach(function(check){
                                        _data.delete('checks', check, function(err) {
                                            if (err) {
                                                deletionErrors = true;
                                            }
                                            checksDeleted += 1;
                                            if (checkToDelete === checksDeleted) {
                                                if (!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'Errors encountered while attempting to delete all'});
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500, {'Error': 'Could not delete the specified user'});
                            }
                        });
                    } else {
                        callback(400, {'Error': 'Could not find the specified user'})
                    }
                })
            } else {
                callback(403, {'Error': 'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}


// tokens handler
handlers.tokens = function(data, callback) {
    const acceptibleMethods = ['post', 'get', 'put', 'delete'];

    if (acceptibleMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
} 

// Container for the tokens submethods
handlers._tokens = {}

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data, callback) {

    _performance.mark('entered function');

    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    _performance.mark('inputs validated');
    if (phone && password) {
        // Lookup the user who matches that phone number
        _performance.mark('beginning user lookup');
        _data.read('users', phone, function(err, userData) {
            _performance.mark('user lookup complete');
            if (!err && userData) {
                // hash the password, and compare it to the password stored in the user object
                _performance.mark('beginning password hashing');
                const hashedPassword = helpers.hash(password);
                _performance.mark('password hashing complete');

                if (hashedPassword === userData.hashedPassword) {
                    // create a new token with a random, set expiration date to one hour in the future
                    _performance.mark('creating data for token');
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + (1000 * 60 * 60);
                    const tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    }

                    // Store the token
                    _performance.mark('beginning storing token');
                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        _performance.mark('storing token complete');

                        // Gather all the measurements
                        _performance.measure('Beginning to end', 'entered function', 'storing token complete');
                        _performance.measure('Validating user input', 'entered function', 'inputs validated');
                        _performance.measure('User lookup', 'beginning user lookup', 'user lookup complete');
                        _performance.measure('Password hashing', 'beginning password hashing', 'password hashing complete');
                        _performance.measure('Token data creation', 'creating data for token', 'beginning storing token');
                        _performance.measure('Token storing', 'beginning storing token', 'storing token complete');

                        // Log out all the measurements
                        const measurements = _performance.getEntriesByType('measure');
                        
                        measurements.forEach(function(measurement){
                            debug('\x1b[33m%s\x1b[0m', measurement.name + ' ' + measurement.duration);
                        });


                        if (!err) {
                            callback(200, tokenObject)
                        } else {
                            callback(500, {'Error': 'Could not create the new token'})
                        }
                    });
                } else {
                    callback(400, {'Error': 'Password did not match the specified user\'s stored password'})
                }
            } else {
                callback(400, {'Error': 'Could not find the specified user'})
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field(s)'})
    }
}

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback) {
    // Check that the id is valid
    const id = typeof(data.query.id) === 'string' && data.query.id.trim().length === 20 ? data.query.id.trim() : false;

    if (id) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404)
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Tokens - put
// Required data: id, extend
// Optional data: None
handlers._tokens.put = function(data, callback) {
    // Check that the id is valid
    const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;

    // Check for the optional fields
    const extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;

    if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, function(err, tokenData) {
            if (!err && tokenData) {
                // Check to make sure the token isn't  already expired
                if (tokenData.expires > Date.now()) {
                     // Set expiration date to one hour in the future
                     const expires = Date.now() + (1000 * 60 * 60);
                     tokenData.expires = expires;

                    //  Store the new update
                    _data.update('tokens', id, tokenData, function(err) {
                        if(!err) {
                            callback(200)
                        } else {
                            callback(500, {'Error': 'Could not update token\s expiration'})
                        }
                    });
                } else {
                    callback(400, {'Error': 'the token has already expired, and cannot be extended'});
                }
            } else {
                callback(400, {'Error': 'Specified token does not exist'});
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields or fields are invalid'})
    }
}

// Tokens - delete
// Required field: id
// Optional data: None
handlers._tokens.delete = function(data, callback) {
    // Check that the phone number is valid
    const id = typeof(data.query.id) === 'string' && data.query.id.trim().length === 20 ? data.query.id.trim() : false;

    if (id) {
        // Lookup the user
        _data.read('tokens', id, function(err, data) {
            if (!err && data) {
                _data.delete('tokens', id, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete the specified token'});
                    }
                });
            } else {
                callback(400, {'Error': 'Could not find the specified token'})
            }
        })
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
    // Lookup the token
    _data.read('tokens', id, function(err, tokenData) {
        if (!err && tokenData) {
            // Check that the token is for the given user, and has not expired
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
}

// Checks
handlers.checks = function(data, callback) {
    const acceptibleMethods = ['post', 'get', 'put', 'delete'];

    if (acceptibleMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
} 

// Container for the checks submethods
handlers._checks = {}

// Checks - post
// Required data: protocol, url, method, successCodes, timeoutSeconds
// Optional data:  none
handlers._checks.post = function(data, callback) {
    // Validate inputs
    const protocol = typeof(data.payload.protocol) === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol.trim() : false;
    const url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;
    const successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // get token from the headers
        const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

        _data.read('tokens', token, function(err, tokenData) {
            if(!err && tokenData) {
                const userPhone = tokenData.phone;

                _data.read('users', userPhone, function(err, userData) {
                    if (!err && userData) {
                        const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                        // Verify that the userhas less than the number of max-checks-per-user
                        if (userChecks.length < config.maxChecks) {
                            // Verify that the URL given has DNS entries (and therefore can resolve)
                            const parsedUrl = _url.parse(protocol + '://' + url, true);
                            const hostName = typeof(parsedUrl.hostname) === 'string' && parsedUrl.hostname.length > 0 ? parsedUrl.hostname : false;
                            
                            dns.resolve(hostName, function(err, records) {
                                if (!err && records) {
                                    const checkId = helpers.createRandomString(20)

                                    // Create the check object and include the user's phone
                                    const checkObject = {
                                        'id': checkId,
                                        'userPhone': userPhone,
                                        'protocol': protocol,
                                        'url': url,
                                        'method': method,
                                        'successCodes': successCodes,
                                        'timeoutSeconds': timeoutSeconds
                                    };

                                    // Save the object 
                                    _data.create('checks', checkId, checkObject, function(err) {
                                        if (!err) {
                                            // Add the check id to the user's object
                                            userData.checks = userChecks
                                            userData.checks.push(checkId)

                                            // Save the updated data
                                            _data.update('users', userPhone, userData, function(err) {
                                                if (!err) {
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {'Error': 'Could not update the new user with the new check'});
                                                }
                                            })
                                        } else {
                                            callback(500, {'Error': 'Could not create the new check'})
                                        }
                                    });
                                } else {
                                    callback(400, {'Error': 'The hostname of the URL entered did not resolve to any DNS entries'});
                                }
                            });
                        } else {
                            callback(400, {'Error': 'The user already has the maximum number of checks (' + config.maxChecks + ')'})
                        }
                    } else {
                        callback(403)
                    }
                })
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required inputs or inputs are invalid'})
    }
}

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function(data, callback) {
    // Check that the check id is valid
    const id = typeof(data.query.id) === 'string' && data.query.id.trim().length > 0 ? data.query.id.trim() : false;

    if (id) {
        // Lookup the check
        _data.read('checks', id, function(err, checkData) {
            if (!err && checkData) {
                // Get the token from the headers
                const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
                // Verify that the given token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if (tokenIsValid) {
                        callback(200, checkData);
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(404)
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
}

// Checks - put
// Required data: id
// Optional data: protocol, url, method, successCodes, timeoutSecodes (one must be sent)
handlers._checks.put = function(data, callback) {
    // Check that the check id is valid
    const id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length > 0 ? data.payload.id.trim() : false;

    // Check for the optional fields
    const protocol = typeof(data.payload.protocol) === 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol.trim() : false;
    const url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) === 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method.trim() : false;
    const successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            // Lookup the check
            _data.read('checks', id, function(err, checkData) {
                if (!err && checkData) {
                    // Get the token from the headers
                    const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
                    // Verify that the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkData.protocol = protocol
                            }

                            if (url) {
                                checkData.url = url
                            }

                            if (method) {
                                checkData.method = method
                            }

                            if (successCodes) {
                                checkData.successCodes = successCodes
                            }

                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds
                            }

                            // Store the new update
                            _data.update('checks', id, checkData, function(err) {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {'Error': 'Could not update the check'});
                                }
                            });
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(400, {'Error': 'Check ID did not exist'})
                }
            });
        } else {
            callback(400, {'Error': 'Missing fields to update'})
        }
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = function(data, callback) {
    // Check that the check ID is valid
    const id = typeof(data.query.id) === 'string' && data.query.id.trim().length > 0 ? data.query.id.trim() : false;

    if (id) {
        // Lookup the check
        _data.read('checks', id, function(err, checkData) {
            if (!err && checkData) {
                // Get the token from the headers
                const token = typeof(data.headers.token) === 'string' ? data.headers.token : false;

                // Verify that the given token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token, checkData.userPhone, function(tokenIsValid) {
                    if (tokenIsValid) {
                        _data.read('users', checkData.userPhone, function(err, userData) {
                            if (!err && userData) {
                                _data.delete('checks', id, function(err) {
                                    if (!err) {
                                        const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                                        
                                        const checkPosition = userChecks.indexOf(id);

                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);

                                            // Re-save the user's data
                                            userData.checks = userChecks

                                             // Save the updated data
                                            _data.update('users', checkData.userPhone, userData, function(err) {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error': 'Could not update the new user with the new check'});
                                                }
                                            })
                                        } else {
                                            callback(500, {'Error': 'Could not find the check id on the user object'});
                                        }
                                    } else {
                                        callback(500, {'Error': 'Could not delete the specified check'});
                                    }
                                });
                            } else {
                                callback(500, {'Error': 'Could not find the user who created the check, so could not remove the check item'})
                            }
                        })
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(400, {'Error': 'Check ID did not exist'})
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'})
    }
}

// Ping handler
handlers.ping = function(data, callback) {
    callback(200)
}

// Not Found handler
handlers.notFound = function(data, callback) {
    callback(404)
}

// Export the module
module.exports = handlers;