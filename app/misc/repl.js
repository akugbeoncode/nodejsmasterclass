/*

    Example REPL Server
    Take in the word "fizz" and log out "buzz"

    repl => read eval print loop

*/

// Dependencies
const repl = require('repl');

// start the repl
repl.start({
    'prompt': '>',
    'eval': function(str) {
        // Evaluation function for incoming inputs
        console.log('At the evaluation stage: ', str);

        // If the user said "fiz", say "buzz" back to them
        if (str.indexOf('fizz') > -1) {
            console.log('buzz');
        }
    }
});