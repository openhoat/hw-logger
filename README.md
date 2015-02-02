[![Build Status](https://travis-ci.org/openhoat/hw-logger.png?branch=master)](https://travis-ci.org/openhoat/hw-logger)
[![NPM version](https://badge.fury.io/js/hw-logger.svg)](http://badge.fury.io/js/hw-logger)

## hw-logger

Efficient logger for node

## Why another logger?

- Easy to use : no instance, no factory, common log levels out of the box
- Easy to configure : configure once with init options, use everywhere in your project
- Open : override the log output with any event emitter of your own
- Friendly : the log format is customizable with [EJS](http://www.embeddedjs.com/) templates
- [Expressjs](http://expressjs.com/) compliant : a ready-to-use express middleware is provided (logger.express)

### Install

    npm install hw-logger

### Usage

```javascript
    var log = require('hw-logger').log;

    log.info('hey!');
    log.error('hey!');
```

### Performances


    # node test/benchmark
    Benchmarking 500000 iterations of random string logging using : console,hw-logger,winston,log4js,bunyan

    processing console   : .......
    processing hw-logger : ..........
    processing winston   : ....................
    processing log4js    : ........................................
    processing bunyan    : ...........................
    ###### Benchmark result : ######
        console	 : 2665ms
      hw-logger	 : 3245ms
        winston	 : 5269ms
         log4js	 : 6780ms
         bunyan	 : 9137ms
    ################################

Enjoy !