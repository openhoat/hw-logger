'use strict';

var logger = require('./../lib/logger')
  , log = logger.log;

function logHandler(data) {
  console.log(data);
}

logger.init({
  out: logHandler
});

log.info('file content!'); // Display nothing