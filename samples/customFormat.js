'use strict';

var logger = require('./../lib/logger')
  , log = logger.log;

logger.init({
  format: "LOG EVENT @ <%- data.time %> : <%- util.format.apply(null, data.args) %>"
  /**
   * Lodash template format (see https://www.npmjs.com/package/lodash.template)
   * Use data object to get log event details (see https://github.com/openhoat/hw-logger#log-format-data)
   * Other objects available in template : chalk (for colors), util, path, config (logger config)
   */
});

log.info('hello %s!', 'world');
log.debug('does nothing');
log.error('ouch');