'use strict';

var path = require('path')
  , fs = require('fs')
  , logger = require('./../lib/logger')
  , log = logger.log
  , tmpDir = path.join(__dirname, '..', 'tmp')
  , logFile = path.join(tmpDir, 'out.log');

logger.init({
  out: logFile // if out is a string, it will be considered as a file path
});
log.info('file content!'); // Display nothing

function done() {
  console.log(fs.readFileSync(logFile, 'utf8'));
}

logger.flush(done);