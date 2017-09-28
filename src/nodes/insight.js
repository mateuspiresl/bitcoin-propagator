const request   = require('request-promise');
const Node      = require('../node');
const Error     = require('../error');


const timeout = 5 * 1000;

/**
 * Insight Node class.
 */
class Insight extends Node {
    /**
     * Constructor.
     */
    constructor (network, timeout) {
        super();

        this.timeout = timeout ? timeout : 30000;

        if (network === 'mainnet' || network === 'livenet')
            this.address = 'https://insight.bitpay.com/api';
        
        else if (network === 'testnet')
            this.address = 'https://test-insight.bitpay.com/api';

        else throw new UnknownNetworkError('Unknown network ' + network);
    }

    /**
     * Returns the unspent transactions.
     * @param {string} address The address.
     * @return Returns a {@link Promise} that, if resolved, gives the data.
     */
    getUnspent (address)
    {
        const url = this.address + '/addrs/utxo';
        const data = { addrs: address };
    
        return request.post({ url: url, json: data, timeout: this.timeout })
            .catch(onError(InvalidAddressError));
    }

    /**
     * Broadcasts a signed transaction.
     * @param {string} transaction Serialized signed transaction.
     * @return Returns a {@link Promise} that, if resolved, gives the transaction ID.
     */
    broadcast (transaction)
    {
        const url = this.address + '/tx/send';
        const data = { rawtx: transaction };

        return request.post({ url: url, json: data, timeout: this.timeout })
            .then(data => data.txid)
            .catch(onError(TransactionBroadcastError));
    }

    /**
     * Gets transaction time and OP_RETURN data.
     * @param {string} transactionId The transaction ID.
     * @return Returns a {@link Promise} that, if resolved, gives the data.
     */
    getTransaction (transactionId)
    {
        const url = this.address + '/tx/' + transactionId;
    
        return request.get({ url: url, timeout: this.timeout })
            .then(JSON.parse)
            .then(data => {
                return {
                    data: getOpReturnData(data.vout[0].scriptPubKey.hex),
                    time: data.time * 1000,
                    confirmations: data.confirmations
                };
            })
            .catch(error => {
                if (error.name === 'StatusCodeError')
                    throw new TransactionNotFoundError('The transaction with ID \'' + transactionId + '\' wasn\'t found');
                else
                    onError(InvalidTransactionError)(error);
            });
    }
}


// Private functions

function onError(errorClass)
{
    return error => {
        if (error.name === 'RequestError')
            throw error;
        else
            throw new errorClass(error.error);
    }
}

/**
 * Returns the size of the data.
 * If the size of the data is up to 75 bytes, the second byte specifies
 * the size of the data. Otherwise, the second byte is equal to 0x4c,
 * that is the PUSHDATA1 code, and the third byte specifies the size.
 * @param {string} opReturn The OP_RETURN data.
 * @return The size of the data as int.
 */
function getOpReturnData(opReturn)
{
    // Gets the second byte to check if it is equal to the PUSHDATA1 code
    const pushData = opReturn.substr(2, 2);
    const sizeIndex = pushData === '4c' ? 4 : 2;

    const size = getSize(opReturn, sizeIndex);
    const asHex = opReturn.substr(sizeIndex + 2, size * 2);
    return new Buffer(asHex, 'hex').toString('ascii');
}

/**
 * Parses a byte to int.
 * @param {string} hex The hex string.
 * @param {int} index The index of the byte.
 * @return The byte parsed to int.
 */
function getSize(hex, index) {
    return new Buffer(hex.substr(index, 2), 'hex').readInt8(0);
}


// Errors

class UnknownNetworkError       extends Error { constructor(message) { super('UnknownNetworkError', message); this.name = 'UnknownNetworkError'; } }
class InvalidAddressError       extends Error { constructor(message) { super('InvalidAddressError', message); } }
class TransactionBroadcastError extends Error { constructor(message) { super('TransactionBroadcastError', message); } }
class TransactionNotFoundError  extends Error { constructor(message) { super('TransactionNotFoundError', message); } }
class InvalidTransactionError   extends Error { constructor(message) { super('InvalidTransactionError', message); } }


module.exports = Insight;