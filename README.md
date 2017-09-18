# bitcoin-propagator

Access multiple bitcoin remote nodes APIs with one single call.

The _Bitcoin Propagator_ implements an interface for several APIs and join all in the **Propagator**.

## Propagator

Each method call, on a Propagator instance, makes a request on an API for the result,
and if any request error occurr, **it automatically tries the next API**, and the next.

The multiple calls, when needed, are hidden from the user, that only receives a Promise
that is resolved when a request is successful, of rejected if any are.

## Network support

The Propagator has support for bitcoin testnet and mainnet.

## Example

```js
const Propagator = require('bitcoin-propagator');

const propagator = new Propagator('testnet');
const address = ... // A valid address

propagator.getUnspent(address)
  .then(unspent => {
    const transaction = ... // Create a transaction with the unspent transactions data
    return propagator.broadcast(transaction);
  })
  .then(transactionId => {
    return propagator.getTransaction(transactionId);
  })
  .then(data => {
    // Do something with the transaction data
  })
  .catch(error => {
    // Handle error
  });
```
