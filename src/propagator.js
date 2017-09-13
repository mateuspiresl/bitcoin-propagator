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
     * @param {bitcoin.Network} network The network to connect. 
     */
    constructor (network, nodes) {
        super();

        if (network !== undefined && network instanceof Array)
        {
            nodes = network;
            network = undefined;
        }
        
        const defaultNodes = [ new Insight(network) ];
        this.nodes = nodes instanceof Array ? nodes : defaultNodes;
    }
    
    /**
     * Returns the unspent transactions from the first node that is up.
     * @param {bitcore.Address} address The address.
     * @return Returns a {@link Promise} that, if resolved, gives the data.
     */
    getUnspent (address) {
        return run(this, node => node.getUnspent(address));
    }

    /**
     * Broadcasts a signed transaction from the first node that is up.
     * @param {bitcore.Transaction} transaction Signed transaction object or serialized signed transaction.
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
    else return Promise.reject(new Error('ConnectionError', 'Could not connect to any propagator'));
}


module.exports = Propagator;