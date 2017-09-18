const data                  = require('./data');
const { Propagator, Node }  = require('../');


class InvalidNode { }

class ErrorNode extends Node {
    constructor () {
        super();
        this.count = 0;
    }

    getUnspent (address) {
        this.count++;
        return Promise.reject({ name: 'RequestError' });
    }
}

class TestNode extends Node {
    constructor () { super(); }

    getUnspent (address) {
        return Promise.resolve([ 'unspent' ]);
    }
}


const network = 'testnet';
const privateKey = data.privateKey;
const address = data.address;

var propagator;

Promise.resolve()
    .then(() => {
        console.log('\npropagating through an invalid node')
        new Propagator([ new InvalidNode() ]);
        return 'Created propagator with invalid node';
    })


    .then(data => onError('output', data))
    .catch(error => {
        console.log('\tSuccess, expected error', error.name + ' ' + error.message);
        
        propagator = new Propagator([ new ErrorNode() ], { attempts: 2 });

        console.log('\npropagating through the error node')
        return propagator.getUnspent(address);
    })


    .then(data => onError('output', data))
    .catch(error => {
        console.log('\tSuccess, expected error', error.name + ' ' + error.message);

        if (propagator.nodes[0].count !== 2)
            onError('counting', 'The number of attemps on the node wasn\'t the number '
                + 'of attemps given to the constructor');

        propagator = new Propagator([ new ErrorNode(), new TestNode() ]);

        console.log('\npropagating through a valid node');
        return propagator.getUnspent(address);
    })


    .catch(error => onError('error', error.name + ' ' + error.message))
    .then(data => {
        console.log('\tSuccess, expected ouput', data);

        console.log('\nexpect reordering');
        if (!(propagator.nodes[0] instanceof TestNode))
            throw TypeError('The node does not extend TestNode');
    })


    .catch(error => onError('error', error.name + ' ' + error.message))
    .then(() => {
        console.log('\tSuccess, the nodes were reordered');
        console.log('\nSuccess!');
    });


function onError(unexpected, message)
{
    console.error('\tError, unexpected', unexpected, message);
    console.error('\nError!');
    process.exit(1);
}