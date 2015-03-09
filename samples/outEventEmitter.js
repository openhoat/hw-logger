'use strict';

var logger = require('./../lib/logger')
  , events = require('events')
  , log = logger.log
  , eventEmitter = new events.EventEmitter();

eventEmitter.on('data', function (data) {
  console.log('data :', data); // Receive log messages
});

logger.init({
  out: eventEmitter
});

log.info('handle this!'); // Display nothing