# hermesjs-amqp

AMQP adapter for HermesJS

## Installing

```
npm install --save hermesjs-amqp
```

## Example

```js
const hermes = require('hermesjs');
const amqp_broker = require('hermesjs-amqp');

const app = hermes();

const amqp = amqp_broker({
  exchange: 'YOUR EXCHANGE NAME HERE...',
  username: 'YOUR BROKER USERNAME HERE...',
  password: 'YOUR BROKER PASSWORD HERE...',
  topic: 'hello.#',
  queue_options: { exclusive: true }, // OPTIONAL
  consumer_options: { noAck: true }, // OPTIONAL
  host: 'localhost', // OPTIONAL
  port: 5672 // OPTIONAL
});

app.add('broker', amqp);
```
