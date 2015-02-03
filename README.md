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
- Efficient : disabled log methods behave like noop function to consume less resources

### Install

```sh
npm install hw-logger
```

### Getting started

#### Simply use log object to do the job : [example/simple.js](https://github.com/openhoat/hw-logger/blob/master/examples/simple.js)

```javascript
var log = require('hw-logger').log;

log.info('hey!');
log.debug('does nothing');
log.error('ouch');
```

Output :

    $ node examples/simple
    INFO  - simple:3 - 0ms - hey!
    ERROR - simple:5 - 1ms - ouch

By default, hw-logger displays source filename and line number (simple:3). To get those informations hw-logger need to know the caller and this process is loud, so if you don't need to display the caller informations it's better to set caller property to false in init options.

#### Use logger object to configure and change level : [example/changeLevel.js](https://github.com/openhoat/hw-logger/blob/master/examples/changeLevel.js)

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

Output :

    $ node examples/changeLevel
    INFO  - changeLevel:6 - 0ms - hey!
    ERROR - changeLevel:7 - 1ms - ouch!
    DEBUG - changeLevel:8 - 1ms - bug bug
    TRACE - changeLevel:10 - 0ms - tssss

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

### API doc

#### logger :

##### init(options) : initialize logger with optionnal custom options

Available options :

```javascript
{
  caller,       // (boolean) if true (default), insert caller data
  colors,       // (boolean) if true, enable colors if supported
  ejs,          // (object) EJS options (see https://www.npmjs.com/package/ejs#options)
  format,       // (string|function) log format template string or result of function
  formatFile,   // (string) log format template file, overrides format if defined
  levels,       // (object) registered levels map (key : name, value : level value)
  out           // (object) defines where to send log messages (call a function, use an [events.EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter))
}
```

##### log : @TODO

##### getLogMethodName : @TODO

##### getLevelValue : @TODO

##### setLevel : @TODO

##### isEnabled : @TODO

##### registerLevels : @TODO

##### express : @TODO

### Log format data

@TODO

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
