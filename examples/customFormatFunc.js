'use strict';

var util = require('util')
  , logger = require('./../lib/logger')
  , log = logger.log;

function customFormat(data) {
  return util.format('custom format - %s : %s', data.level, data.args.join(', '));
}

logger.init({
  format: customFormat // argument : log event details object (see https://github.com/openhoat/hw-logger#log-format-data)
});

log.info('hello %s!', 'world');
log.debug('does nothing');
log.error('ouch');