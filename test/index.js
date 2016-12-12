const sinon = require('sinon');
const should = require('should');
const HermesAMQP = require('../');
const EventEmitter = new require('events');

function createInstance (settings, hermes) {
  const _settings = settings || { host_url: 'testing' };
  const init = HermesAMQP(_settings);
  const instance = init(hermes || new EventEmitter());

  return instance;
}

describe('HermesAMQP', () => {
  describe('#init', () => {
    it('returns a function', () => {
      const wrapper = HermesAMQP();
      wrapper.should.be.type('function');
    });

    it('wraps config and hermes, and exposes the methods', () => {
      const settings = { settings: true };
      const hermes = new EventEmitter();
      const mqtt = createInstance(settings, hermes);

      mqtt.hermes.should.be.exactly(hermes);
      mqtt.settings.should.be.exactly(settings);
      mqtt.listen.should.be.type('function');
      mqtt.send.should.be.type('function');
      mqtt.setup.should.be.type('function');
      mqtt.published.should.be.type('function');
      mqtt.createMessage.should.be.type('function');
    });
  });

  describe('#listen', () => {
    it('calls connect and setup', () => {
      const instance = createInstance();
      const mock = sinon.mock(instance);
      mock.expects('connect').once();
      mock.expects('setup').once();

      instance.listen();

      mock.verify();
    });
  });
});
