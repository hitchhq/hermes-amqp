'use strict';

const { TopicMQ } = require('@hitch/mq');
const HermesMessage = require('hermesjs-message');

function init (settings) {
  return function (hermes) {
    return new HermesAMQP(settings, hermes);
  };
}

function HermesAMQP (settings, hermes) {
  this.hermes = hermes;
  this.settings = settings;
}

HermesAMQP.prototype.listen = function listen () {
  this.setup();
  return this.connect();
};

HermesAMQP.prototype.connect = function connect () {
  return this.mq.connect();
};

HermesAMQP.prototype.setup = function setup () {
  this.mq = new TopicMQ({
    exchange: this.settings.exchange,
    queue_options: this.settings.queue_options || { exclusive: true },
    subscribe: this.settings.subscribe,
    consumer_options: this.settings.consumer_options || { noAck: true },
    topic: this.settings.topic,
    queue: this.settings.queue,
    username: this.settings.username,
    password: this.settings.password,
    host: this.settings.host || 'localhost',
    port: this.settings.port || 5672
  });

  this.mq.on('error', err => console.error(err));
  this.mq.on('connect', (connection) => {
    this.client = connection;
    this.hermes.emit('broker:ready', { name: 'AMQP adapter' });
  });

  this.mq.on('consume', this.published.bind(this));
};

HermesAMQP.prototype.published = function published (message) {
  this.hermes.emit('broker:message', this.createMessage(message, this.client));
};

HermesAMQP.prototype.createMessage = function createMessage (packet, client) {
  const message = new HermesMessage({
    topic: this.translateTopic(packet.fields.routingKey),
    payload: packet.content.toString('utf8'),
    protocol: {
      name: this.settings.protocol || 'amqp',
      headers: Object.assign({}, packet.properties, packet.fields)
    },
    connection: client,
    packet
  });

  message.on('send', this.send.bind(this, message));

  return message;
};

HermesAMQP.prototype.translateTopic = function (topic) {
  return topic.replace(/\./g, '/');
};

HermesAMQP.prototype.send = function send (message) {
  const headers = message.protocol ? message.protocol.headers : {};
  let payload = message.payload;

  if (typeof payload === 'object' && !(payload instanceof Buffer)) {
    try {
      payload = JSON.stringify(payload);
    } catch (e) {
      // Nothing to do here...
    }
  }

  if (!(payload instanceof Buffer) && typeof payload !== 'string') {
    payload = String(payload);
  }

  this.mq.publish(message.topic, payload, headers);
};

module.exports = init;
