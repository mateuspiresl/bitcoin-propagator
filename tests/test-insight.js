const bitcore   = require('bitcore-lib');
const data      = require('./data');
const Insight   = require('../').Propagator.Insight;


const insight = new Insight('testnet');
const privateKey = data.privateKey;
const address = data.address;
const minerFee = bitcore.Unit.fromMilis(0.128).toSatoshis();

var unspent = null;
var transactionId = null;

console.log('\ngetUnspent with wrong address')
insight.getUnspent('mfbb6ohg1SRnfDKGnS2AjVX2xEALfLHWs0')
    .then(data => onError('output', data))
    .catch(error => {
        console.log('\tSuccess, error as expected', error.name + ' ' + error.message);
        
        console.log('\ngetUnspent with correct address');
        return insight.getUnspent(address)
    })


    .catch(error => onError('error', error.name + ' ' + error.message))
    .then(unspent => {
        console.log('\tSuccess, expected output', unspent);

        console.log('\nbroadcast with valid data');
        return insight.broadcast(
            new bitcore.Transaction()
                .from(unspent)
                .addData('test')
                .change(address)
                .fee(minerFee)
                .sign(privateKey)
                .serialize()
                .toString()
        );
    })


    .catch(error => onError('error', error.name + ' ' + error.message))
    .then(data => {
        console.log('\tSuccess, expected output', data);
        transactionId = data;

        console.log('\nverify with invalid transaction ID');
        return insight.getTransaction('a0b1');
    })


    .then(data => onError('output', data))
    .catch(error => {
        console.log('\tSuccess, expected error', error.name + ' ' + error.message);

        console.log('\nverify with valid transaction ID');
        return insight.getTransaction(transactionId);
    })
    
    
    .catch(error => onError('error', error.name + ' ' + error.message))
    .then(data => {
        if (data.data === 'test')
            console.log('\tSuccess, expected output', data);
        else
            onError('output', data);
    })


    .then(() => console.log('\nSuccess!'));


function onError(unexpected, message)
{
    console.error('\tError, unexpected', unexpected, message);
    console.error('\nError!');
    process.exit(1);
}