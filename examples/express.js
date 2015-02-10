'use strict';

var logger = require('hw-logger')
  , log = logger.log
  , express = require('express');

var app = express();
app.use(logger.express());
app.get('/hello', function (req, res) {
  res.send('Hello World!');
});
app.listen(3000, function () {
  log.info('Http server ready');
});