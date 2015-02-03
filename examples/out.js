var logger = require('./../lib/logger')
  , events = require('events')
  , log = logger.log;

var eventEmitter = new events.EventEmitter();

logger.init({
  out: eventEmitter
});

eventEmitter.on('data', function (data) {
  console.log('data :', data); // Receive log messages
});

log.info('handle this!'); // Display nothing