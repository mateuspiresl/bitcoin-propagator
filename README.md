# bitcoin-propagator

Access multiple bitcoin remote nodes APIs with one single call.

The _Bitcoin Propagator_ implements an interface for several APIs and join all in the **Propagator**.

## Propagator

Each method call, on a Propagator instance, makes a request on an
API for the result, and if any request error occurr, **it 
automatically tries the next API**, and the next.

The multiple calls, when needed, are hidden from the user, that only
receives a Promise that is resolved when a request is successful, of 
rejected if any are.

## Network support

The Propagator has support for bitcoin testnet and mainnet.

## Instantiating

The network must be given to the Propagator constructor.

```js
const Propagator = require('bitcoin-propagator');
const propagator = new Propagator('testnet');
```

There are two options, `timeout` and `attempts`.
- `timeout` refers to the request timeout.
- `ettempts` refers to the number of attempts a method will try when
it receives erros from all the APIS.

## Methods

Every method returns promises. Below, _return value_ will refer to 
the argument of the function for resolved promise.

### Get unspent transactions

This method requires the address from where the unspent transactions
are associated. The return value is the **array of unspent 
transactions**.

```js
propagator.getUnspent(address)
  .then(unspent => {
    // ...
  })
  .catch(error => {
    // Handle error
  });
```

### Broadcast a transaction

This method broadcast a transaction that must be passed serialized 
as argument. The return value is the **transaction ID**.

```js
propagator.broadcast(transaction)
  .then(transactionId => {
    // ...
  })
  .catch(error => {
    // Handle error
  });
```

### Get data from a transaction

This method returns the transaction data from the transaction with 
ID passed as argument.

```js
propagator.getTransaction(transactionId)
  .then(transaction => {
    // ...
  })
  .catch(error => {
    // Handle error
  });
```

The return value has 3 attributes:
- **data**: The data stored in the OP_RETURN.
- **time**: The time of the transaction.
- **confirmations**: The number of confirmations the block has 
received.

```js
{
  data: <string>,
  time: <Date>,
  confirmations: <int>
}
```

## Example

```js
const Propagator = require('bitcoin-propagator');

const propagator = new Propagator('testnet');
const address = ... // A valid address

// Get the unspent transactions from the address
propagator.getUnspent(address)
  // Received an array of unspent transactions
  .then(unspent => {
    // Create a transaction with the unspent transactions data
    const transaction = ...
    // Broadcast the serialized transaction
    return propagator.broadcast(transaction);
  })
  // Received the transaction ID
  .then(transactionId => {
    // Get the transaction data with the transactionId
    return propagator.getTransaction(transactionId);
  })
  // Received the transaction data
  .then(data => {
    // Do something with the transaction data
  })
  // Received error
  .catch(error => {
    // Handle error
  });
```
