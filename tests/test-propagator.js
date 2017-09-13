const data          = require('./data');
const Propagator    = require('../src/propagator');
const Node          = require('../src/node');
const Insight       = require('../src/nodes/insight');


class TestNode extends Node {
    constructor () { super(); }

    getUnspent (address) {
        return Promise.reject({ name: 'RequestError' });
    }
}


const network = 'testnet';
const privateKey = data.privateKey;
const address = data.address;

let propagator = new Propagator(
    network,
    [ new TestNode() ]
);

console.log('\npropagating through the test node')
propagator.getUnspent(address)
    .then(data => {
        console.error('\t\tError, unexpect output', data);
        onError();
    })
    .catch(error => {
        console.log('\t\tSuccess, expected error', error);
        
        propagator = new Propagator(
            network,
            [ new TestNode(), new Insight(network) ]
        );

        console.log('\npropagating through a valid node');
        return propagator.getUnspent(address);
    })

    .catch(error => {
        console.error('\t\tError, unexpected error', error);
        onError();
    })
    .then(data => {
        console.log('\t\tSuccess, expected ouput', data);

        if (propagator.nodes[0] instanceof Insight)
            console.log('\nThe nodes were successfuly reordered');
        else
        {
            console.error('\nError: The nodes were not reordered');
            onError();
        }
    })

    .then(() => console.log('\nSuccess!'));


function onError()
{
    console.error('\nError!');
    process.exit(1);
}