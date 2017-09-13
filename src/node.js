/**
 * Abstract node class.
 * Must implement getUnspent, broadcast and getTransaction methods.
 */
class Node {
    /**
     * Node constructor.
     */
    constructor ()
    {
        if (new.target === Node)
            throw new TypeError("Cannot construct Node instances directly");
    }

    /**
     * Returns the unspent transactions.
     * @param {string} address The address.
     * @return Returns a {@link Promise} that, if resolved, gives the data.
     */
    getUnspent (address) {
        throw new TypeError('Abstract method \'getUnspent\' is not implemented');
    }

    /**
     * Broadcasts a signed transaction.
     * @param {string} transaction Serialized signed transaction.
     * @return Returns a {@link Promise} that, if resolved, gives the transaction ID.
     */
    broadcast (transaction) {
        throw new TypeError('Abstract method \'broadcast\' is not implemented');
    }

    /**
     * Gets transaction time and OP_RETURN data.
     * @param {string} transactionId The transaction ID.
     * @return Returns a {@link Promise} that, if resolved, gives the data.
     */
    getTransaction (transactionId) {
        throw new TypeError('Abstract method \'getTransaction\' is not implemented');
    }
}


module.exports = Node;