var logger = require('./../lib/logger')
  , log = logger.log;

logger.init();
console.log('log :', log);
log.info('hey!');
logger.setLevel('DEBUG');
console.log('log :', log);
log.debug('hey!');