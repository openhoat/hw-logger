'use strict';

var write = process.stdout.write
  , _ = require('lodash')
  , Promise = require('bluebird')
  , logger = require('../lib/logger')
  , log = logger.log
  , winston = require('winston')
  , log4js = require('log4js')
  , log4jsLogger = log4js.getLogger()
  , bunyan = require('bunyan')
  , bunyanLogger = bunyan.createLogger({name: 'benchmark'})
  , max = 500000
  , durations = []
  , durationTitles = ['    console', '  hw-logger', '    winston', '     log4js', '     bunyan'];

function out() {
  write.apply(process.stdout, arguments);
}

function randString(x) {
  var s = '', r;
  while (s.length < x && x > 0) {
    r = Math.random();
    s += (r < 0.1 ? Math.floor(r * 100) : String.fromCharCode(Math.floor(r * 26) + (r > 0.5 ? 97 : 65)));
  }
  return s;
}

function bench(o, fnName) {
  var count, msg, start, end, timer
    , promises = [];
  timer = setInterval(function () {
    out('.');
  }, 200);
  start = Date.now();
  for (count = 0; count < max; count++) {
    msg = randString(Math.round(Math.random() * 40) + 5);
    promises.push(new Promise(function (resolve) {
      setImmediate(function () {
        o[fnName].call(o, msg);
        resolve();
      });
    }));
  }
  return Promise
    .all(promises)
    .finally(function () {
      clearInterval(timer);
      end = Date.now();
      durations.push(end - start);
    });
}

console.log('Benchmarking %s iterations of random string logging using : %s',
  max, durationTitles
    .map(function (item) {
      return item.trim();
    })
    .join(',')
);

process.stdout.write = _.noop;

logger.init({
  format: _.noop,
  out: _.noop,
  caller: false
});

log4js.loadAppender('console');

new Promise(
  function (resolve) {
    if (typeof global.gc === 'function') {
      global.gc();
    }
    resolve();
  })
  .then(function () {
    out('\nprocessing console   : ');
    return bench(console, 'log');
  })
  .then(function () {
    out('\nprocessing hw-logger : ');
    return bench(log, 'info');
  })
  .then(function () {
    out('\nprocessing winston   : ');
    return bench(winston, 'info');
  })
  .then(function () {
    out('\nprocessing log4js    : ');
    return bench(log4jsLogger, 'info');
  })
  .then(function () {
    out('\nprocessing bunyan    : ');
    return bench(bunyanLogger, 'info');
  })
  .finally(function () {
    process.stdout.write = write;
  })
  .then(function () {
    console.log();
    console.log('###### Benchmark result : ######');
    durations
      .sort(function (a, b) {
        return a - b;
      })
      .forEach(function (duration, index) {
        console.log('%s\t : %sms', durationTitles[index], duration);
      });
    console.log('################################');
  })
  .catch(function (err) {
    throw new Error(err);
  });