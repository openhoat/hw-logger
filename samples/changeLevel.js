'use strict';

var logger = require('./../lib/logger')
  , log = logger.log; // log is immutable

logger.init({ level: 'DEBUG' }); // Initialize the log level

log.info('hey!');
log.error('ouch!');
log.debug('bug bug');
logger.setLevel('TRACE'); // Change the log level
log.trace('tssss');