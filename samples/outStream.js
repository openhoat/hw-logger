'use strict';

var path = require('path')
  , fs = require('fs')
  , logger = require('./../lib/logger')
  , log = logger.log
  , tmpDir = path.join(__dirname, '..', 'tmp')
  , logFile = path.join(tmpDir, 'out.log');

logger.init({
  out: fs.createWriteStream(logFile)
});
log.info('stream data!'); // Display nothing

function done() {
  console.log(fs.readFileSync(logFile, 'utf8'));
}

logger.flush(done);
