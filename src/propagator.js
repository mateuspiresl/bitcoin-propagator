const Promise   = require('bluebird');
const Node      = require('./node');
const Insight   = require('./nodes/insight');
const Error     = require('./error');


/**
 * Propagator class.
 * Propagate the request to the first node that is up.
 */
class Propagator extends Node {
    /**
     * Propagator contructor.
     * The first argument can be the network, testnet or mainnet (livenet too),
     * or the list of nodes instances. Each node must extend the Node class.
     * @param {string | Array} network The network to connect or an array of nodes.
     */
    constructor (network) {
        super();

        if (typeof network === 'string')
        {
            this.nodes = [ new Insight(network) ];
        }
        else if (network instanceof Array)
        {
            if (!network.every(node => node instanceof Node))
                throw new TypeError('Every node must extend the class Node.');

            this.nodes = network;
        }
    }
    
    /**
     * Returns the unspent transactions from the first node that is up.
     * @param {string} address The address.
     * @return Returns a {@link Promise} that, if resolved, gives the data.
     */
    getUnspent (address) {
        return run(this, node => node.getUnspent(address));
    }

    /**
     * Broadcasts a signed transaction from the first node that is up.
     * @param {string} transaction Serialized signed transaction.
     * @return Returns a {@link Promise} that, if resolved, gives the transaction ID.
     */
    broadcast (transaction) {
        return run(this, node => node.broadcast(transaction));
    }

    /**
     * Gets transaction time and OP_RETURN data from the first node that is up.
     * @param {string} transactionId The transaction ID.
     * @return Returns a {@link Promise} that, if resolved, gives the data.
     */
    getTransaction (transactionId) {
        return run(this, node => node.getTransaction(transactionId));
    }
}


// Private methods

function run (propagator, method, index)
{
    if (index === undefined) index = 0;

    if (index < propagator.nodes.length)
    {
        return method(propagator.nodes[index])
            .then(result => {
                // Moves unworking nodes to the end of the nodes list,
                // this avoids using them first and the consequently delay
                while (index-- > 0) propagator.nodes.push(propagator.nodes.splice(0, 1));
                return result;
            })
            .catch(error => {
                // On connection error, try the next
                if (error.name === 'RequestError')
                    return run(propagator, method, index + 1);
                else
                    throw error;
            });
    }
    else return Promise.reject(new ConnectionError('Could not connect to any propagator'));
}


// Errors

class ConnectionError extends Error { constructor(message) { super('ConnectionError', message); } }


Propagator.nodes = [ Insight ];
Propagator.Insight = Insight;


module.exports = Propagator;