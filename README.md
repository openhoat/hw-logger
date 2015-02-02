[![Build Status](https://travis-ci.org/openhoat/hw-logger.png?branch=master)](https://travis-ci.org/openhoat/hw-logger)
[![NPM version](https://badge.fury.io/js/hw-logger.svg)](http://badge.fury.io/js/hw-logger)

## hw-logger

Efficient logger for node

## Why another logger?

- Easy to use : no instance, no factory, common log levels out of the box
- Easy to configure : configure once with init options, use everywhere in your project
- Open : override the log output with any event emitter of your own, add custom log levels
- Friendly : the log format is customizable with [EJS](http://www.embeddedjs.com/) templates
- [Expressjs](http://expressjs.com/) compliant : a ready-to-use express middleware is provided (logger.express)

### Install

```sh
npm install hw-logger
```

### Getting started

Simply use log object to do the job :

```javascript
var log = require('hw-logger').log;

log.info('hey!');
log.error('ouch!');
log.debug('bug bug'); // does nothing : by default the log level is INFO
log.trace('tssss');

```

Use logger object to configure things :

```javascript
var logger = require('hw-logger');
  , log = logger.log; // log is immutable

logger.init({ level: 'DEBUG' }); // Initialize the log level

log.info('hey!');
log.error('ouch!');
log.debug('bug bug');
logger.setLevel('TRACE'); // Change the log level
log.trace('tssss');

```

#### Log levels

Log level is defined by :

- a name used for log messages (uppercase)
- a matching log method to use (camelcase)
- a level value used to enable/disable logs (number)

Default log levels are :

- ERROR: 0
- WARN: 1
- INFO: 2
- DEBUG: 3
- TRACE: 4

Corresponding methods are : error, warn, info, debug, trace

### Performances

    $ node test/benchmark.js
    Benchmarking 500000 iterations of random string logging using : console,hw-logger,winston,log4js,bunyan

    processing console   : .......
    processing hw-logger : ..........
    processing winston   : .......................
    processing log4js    : ........................................
    processing bunyan    : ............................
    ###### Benchmark result : ######
        console	 : 2668ms
      hw-logger	 : 3198ms
        winston	 : 5980ms
         log4js	 : 6987ms
         bunyan	 : 9210ms
    ################################

Enjoy !