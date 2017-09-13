const bitcore   = require('bitcore-lib');
const data      = require('./data');
const Insight   = require('../').nodes.Insight;


const insight = new Insight(bitcore.Networks.testnet);
const privateKey = new bitcore.PrivateKey(data.privateKey);
const address = privateKey.toAddress();
const minerFee = bitcore.Unit.fromMilis(0.128).toSatoshis();

var unspent = null;
var transactionId = null;

console.log('\ngetUnspent with wrong address')
insight.getUnspent('mfbb6ohg1SRnfDKGnS2AjVX2xEALfLHWs0')
    .then(data =>  {
        console.error('\t\tError, got output', data);
        onError();
    })
    .catch(error => {
        console.log('\t\tSuccess, error as expected', error);
        
        console.log('\ngetUnspent with correct address');
        return insight.getUnspent(address)
    })


    .catch(error => {
        console.error('\t\tError, unexpected', error);
        onError();
    })
    .then(data => {
        console.log('\t\tSuccess, output as expect', data);
        unspent = data;

        console.log('\nbroadcast with empty unspent');
        return insight.broadcast(
            new bitcore.Transaction()
                .from([])
                .addData('0')
                .change(address)
                .fee(minerFee)
                .sign(privateKey)
        );
    })


    .then(data => {
        console.error('\t\tError, got output', data);
        onError();
    })
    .catch(error => {
        console.log('\t\tSuccess, error as expected', error);

        console.log('\nbroadcast with invalid data');
        return insight.broadcast(
            new bitcore.Transaction()
                .from(unspent)
                .addData(new Array(82).join('0'))
                .change(address)
                .fee(minerFee)
                .sign(privateKey)
        );
    })


    .then(data => {
        console.error('\t\tError, got output', data);
        onError();
    })
    .catch(error => {
        console.log('\t\tSuccess, error as expected', error);

        console.log('\nbroadcast with valid data');
        return insight.broadcast(
            new bitcore.Transaction()
                .from(unspent)
                .addData('test')
                .change(address)
                .fee(minerFee)
                .sign(privateKey)
        );
    })


    .catch(error => {
        console.error('\t\tError, unexpected', error);
        onError();
    })
    .then(data => {
        console.log('\t\tSuccess, output as expect', data);
        transactionId = data;

        console.log('\nverify with invalid transaction ID');
        return insight.getTransaction('a0b1');
    })


    .then(data => {
        console.error('\t\tError, got output', data);
        onError();
    })
    .catch(error => {
        console.log('\t\tSuccess, error as expected', error);

        console.log('\nverify with valid transaction ID');
        return insight.getTransaction(transactionId);
    })
    
    
    .catch(error => {
        console.error('\t\tError, unexpected', error);
        onError();
    })
    .then(data => {
        if (data.data === 'test')
            console.log('\t\tSuccess, output as expect', data);
        else
            throw console.error('\t\tWrogn data', data);
    })


    .catch(onError)
    .then(() => console.log('\nSuccess!'));


function onError()
{
    console.error('\nError!');
    process.exit(1);
}