[![NPM version](https://badge.fury.io/js/hw-logger.svg)](http://badge.fury.io/js/hw-logger)
[![Build Status](https://travis-ci.org/openhoat/hw-logger.png?branch=master)](https://travis-ci.org/openhoat/hw-logger)
[![Coverage Status](https://coveralls.io/repos/openhoat/hw-logger/badge.svg)](https://coveralls.io/r/openhoat/hw-logger)

## hw-logger

Efficient logger for node

## Why another logger?

- Easy to use : no instance, no factory, common log levels out of the box, with error only by default for production systems
- Easy to configure : configure once with init options, use everywhere in your project
- Open : override the log output with any event emitter of your own, and add custom log levels
- Friendly : log format is customizable with [EJS](http://www.embeddedjs.com/) templates, w/ or w/o colors
- [Expressjs](http://expressjs.com/) compliant : a ready-to-use express middleware is provided (logger.express)
- Efficient : disabled log methods behave like noop function, allowing to consume fewer ressources

### Install

```sh
npm install hw-logger
```

### Getting started

#### Simply use log object to do the job : [samples/simple.js](https://github.com/openhoat/hw-logger/blob/master/samples/simple.js)

```javascript
var log = require('hw-logger').log;

log.info('hey!');
log.debug('does nothing');
log.error('ouch');
```

Output :

    $ node samples/simple
    INFO  - simple:3 - 0ms - hey!
    ERROR - simple:5 - 1ms - ouch

By default, hw-logger displays source filename and line number (simple:3).
To get those informations hw-logger need to know the caller and this process is loud, so if you don't need to display the caller informations it's better to set caller property to false in init options.

Override log level with environment variable :

    $ HW_LOG_LEVEL=debug node samples/simple
    INFO  - simple:3 - 4ms - hey!
    DEBUG - simple:4 - 2ms - does nothing
    ERROR - simple:5 - 0ms - ouch

Trace level also display log config at initialization :

    $ HW_LOG_LEVEL=trace node samples/simple
    TRACE - logger:97 - 4ms - log config : { levels: { NONE: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4, TRACE: 5, ALL: 6 },
      formatFile: '/home/openhoat/dev/nodejs/hw-logger/templates/default.ejs',
      level: 'TRACE',
      ejs: { filename: '/home/openhoat/dev/nodejs/hw-logger/templates/default.ejs' },
      out: [Function],
      caller: true,
      format: '<%\nvar colorMethods, colorMethod, level;\ncolorMethods = {\n  ERROR: \'red\',\n  WARN:  \'yellow\',\n  INFO:  \'blue\',\n  DEBUG: \'bgBlack\',\n  TRACE: \'inverse\'\n};\ncolorMethod = colorMethods[data.level] || \'white\';\nlevel = (data.level + new Array(config.levelsMaxLength + 1).join(\' \')).slice(0, config.levelsMaxLength);\n%><%- chalk.bold[colorMethod](level) %> - <%\nif (data.caller) {\n%><%- chalk.magenta(util.format(\'%s:%s\', path.basename(data.caller.file, \'.js\'), data.caller.line)) %> - <%\n} %><%- data.lastTime ? (function(duration) {\n  return duration > 1000 ? Math.round(duration / 100) / 10 + \'s\' : duration + \'ms\';\n})(data.time.diff(data.lastTime)) : \'0ms\' %> - <%- util.format.apply(null, data.args) %>',
      levelValue: 4,
      levelsMaxLength: 5 }
    INFO  - simple:3 - 3ms - hey!
    DEBUG - simple:4 - 0ms - does nothing
    ERROR - simple:5 - 0ms - ouch

Usual NODE_ENV environment variable is detected to override default log level with error only (useful on production systems) :

    $ NODE_ENV=production node samples/simple
    ERROR - simple:5 - 4ms - ouch

Tips : if HW_LOG_LEVEL and NODE_ENV are both defined, HW_LOG_LEVEL has priority

#### Use logger object to configure and change level : [samples/changeLevel.js](https://github.com/openhoat/hw-logger/blob/master/samples/changeLevel.js)

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

    $ node samples/changeLevel
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

- NONE: 0
- ERROR: 1
- WARN: 2
- INFO: 3
- DEBUG: 4
- TRACE: 5
- ALL: 6

Corresponding methods are : error, warn, info, debug, trace (NONE and ALL do not have methods, they're juste levels)

### API doc

#### logger :

##### init(options)

Initialize logger with optionnal custom options.

Available options :

```javascript
{
  caller,       // (boolean) if true (default), insert caller data
  colors,       // (boolean) if true, enable colors if supported (enabled by default for tty)
  ejs,          // (object) EJS options (see https://www.npmjs.com/package/ejs#options)
  format,       // (string|function) log format template string or result of function
  formatFile,   // (string) log format template file, overrides format if defined, default base dir is templates and default extension is .ejs
  levels,       // (object) registered levels map (key : name, value : level value)
  out           // (object) defines where to send log messages (call a function, use an [events.EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter), a writable stream or a file)
}
```

##### log

Log object that provides log methods for all levels.

If logger levels change then log methods are redefined.

##### getLogMethodName(level)

Return the log method name matching the specified level string

##### getLevelValue :

Return the log level value number for the specified level string

##### setLevel(level) :

Change the current log level (indeed the maximum log level value).

Throw an error if the specified log level is not supported (not in registered levels)

##### isEnabled(level) :

Return true if the specified log level is enabled, else false

##### registerLevels(levels) :

Register (add or override) the specified log levels map (key : level name, value : level value number).

Log levels are first sorted by value number, then value numbers are redefined to an index.

##### express :

Return an [express middleware](http://expressjs.com/guide/using-middleware.html) that logs request and response informations.

It adds HTTP level between INFO and DEBUG, and set HTTP to the current level.

An options object can be specified :

```javascript
{
  logger,    // (function) if set the function is called by logger as a custom express middleware
  logBefore, // (boolean) if true logs are done before the end of request and do not include response infos
}
```

##### flush :

Flush data to the stream or file if specified as out, else do nothing.

### Log format data

Each log event rendering is based on a data object with useful informations :

```javascript
{
  time,         // current timestamp (in moment format)
  lastTime,     // last log timestamp (in moment format)
  level,        // log level name
  levelValue,   // log level value number
  args,         // log method arguments, for example in log.info('hello', 'world') arguments are ['hello', 'world']
  caller: {     // if enabled, provides caller informations
    file,       // source filename
    line        // source file line number
  }
}
```

### Use cases

#### Custom level : [samples/customLevel.js](https://github.com/openhoat/hw-logger/blob/master/samples/customLevel.js)

```javascript
var logger = require('hw-logger')
  , log = logger.log;

logger.registerLevels({
  IMPORTANT: 2.5,
  /**
   *  Current levels are : NONE, ERROR, WARN, INFO, DEBUG, TRACE, ALL
   *  with a level value equal to its index (0 to 6).
   *  Adding a new level with a value of 2.5 will have the effect to insert the new level between values 2 and 3
   *  After having the new level inserted, the all level values are redefined to reflect indexes of an array
   */
  FED_UP: 99 // very high level means very low priority
});

log.important('hello %s!', 'world');
log.debug('does nothing');
log.error('ouch');
log.fedUp('boring log'); // methods are in camel case
console.log(logger.getLevels());
/**
 *  After having the new level inserted, the all level values are redefined to reflect indexes of an array
 */

logger.setLevel('fed_up'); // lower or upper case, don't care, but the format has to be snake case for levels
log.fedUp('boring again'); // now it should display
```

Output :

    $ node samples/customLevel
    IMPORTANT - customLevel:15 - 4ms - hello world!
    ERROR     - customLevel:17 - 2ms - ouch
    [ 'NONE', 'ERROR', 'WARN', 'IMPORTANT', 'INFO', 'DEBUG', 'TRACE', 'FED_UP', 'ALL' ]
    FED_UP    - customLevel:25 - 1ms - boring again

#### Custom format : [samples/customFormat.js](https://github.com/openhoat/hw-logger/blob/master/samples/customFormat.js)

```javascript
var logger = require('hw-logger')
  , log = logger.log;

logger.init({
  format: "LOG EVENT @ <%- data.time %> : <%- util.format.apply(null, data.args) %>"
  /**
   * EJS template format (see https://www.npmjs.com/package/ejs)
   * Use data object to get log event details (see https://github.com/openhoat/hw-logger#log-format-data)
   * Other objects available in template : chalk (for colors), util, path, config (logger config)
   */
});

log.info('hello %s!', 'world');
log.debug('does nothing');
log.error('ouch');
```

Output :

    $ node samples/customFormat
    LOG EVENT @ Tue Feb 03 2015 14:19:35 GMT+0100 : hello world!
    LOG EVENT @ Tue Feb 03 2015 14:19:35 GMT+0100 : ouch

To use a template file, use formatFile option instead of format option ([template examples](https://github.com/openhoat/hw-logger/tree/master/templates)).

#### Custom format function : [samples/customFormatFunc.js](https://github.com/openhoat/hw-logger/blob/master/samples/customFormatFunc.js)

```javascript
var util = require('util')
  , logger = require('hw-logger')
  , log = logger.log;

function customFormat(data) {
  return util.format('custom format - %s : %s', data.level, data.args.join(', '));
}

logger.init({
  format: customFormat // argument : log event details object (see https://github.com/openhoat/hw-logger#log-format-data)
});

log.info('hello %s!', 'world');
log.debug('does nothing');
log.error('ouch');
```

Output :

    $ node samples/customFormatFunc
    custom format - INFO : hello %s!, world
    custom format - ERROR : ouch

#### Replace express logger : [samples/express.js](https://github.com/openhoat/hw-logger/blob/master/samples/express.js)

Just register the express middleware before your routes (and after logger.init) :

```javascript
var logger = require('hw-logger')
  , log = logger.log
  , express = require('express');

// logger.init({...}); // if needed, has to be before logger.express because init restore logger config to defaults
var app = express();
app.use(logger.express()); // Be sure to not have logger.init after this line to prevent http level removing
app.get('/hello', function (req, res) {
  res.send('Hello World!');
});
app.listen(3000, function () {
  log.info('Http server ready');
});
```

Output :

    $ node samples/express.js &
    INFO  - express:13 - 81ms - Http server ready

    $ curl localhost:3000/hello
    Hello World!
    HTTP  - logger:62 - 15s - 127.0.0.1 - GET /hello - 200 - 12

    $ curl localhost:3000/world
    HTTP  - logger:62 - 51.7s - 127.0.0.1 - GET /world - 404 - 0
    Cannot GET /world

Express log message format :

- (request method) (request path) - (response status code) - (response body length)

#### Handle log output

Specify any handler based on an [event emitter](http://nodejs.org/api/events.html), a function, a [writable stream](http://nodejs.org/api/stream.html#stream_class_stream_writable), or a file to handle all log messages.

##### Event emitter : [samples/outEventEmitter.js](https://github.com/openhoat/hw-logger/blob/master/samples/outEventEmitter.js)

Each log message is a provided through 'data' event.

```javascript
var logger = require('./../lib/logger')
  , events = require('events')
  , log = logger.log
  , eventEmitter = new events.EventEmitter();

eventEmitter.on('data', function (data) {
  console.log('data :', data); // Receive log messages
});

logger.init({
  out: eventEmitter
});

log.info('handle this!'); // Display nothing
```

Output :

    $ node samples/outEventEmitter
    data : INFO  - out:14 - 5ms - handle this!

##### Stream : [samples/outStream.js](https://github.com/openhoat/hw-logger/blob/master/samples/outStream.js)

The logger writes log messages asynchronously, so to be sure to be able to read data you can flush the logger.

```javascript
var path = require('path')
  , fs = require('fs')
  , logger = require('hw-logger')
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
```

Output :

    $ node samples/outStream.js
    INFO  - outStream:13 - 6ms - stream data!

##### File : [samples/outFile.js](https://github.com/openhoat/hw-logger/blob/master/samples/outFile.js)

The logger uses an interal stream, and writes log messages asynchronously into it, so use flush to be sure data are effectively written in file.

```javascript
var path = require('path')
  , fs = require('fs')
  , logger = require('hw-logger')
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
```

Output :

    $ node samples/outFile.js
    INFO  - outFile:13 - 6ms - file content!

##### Function handler : [samples/outFunc.js](https://github.com/openhoat/hw-logger/blob/master/samples/outFunc.js)

Use any function to handle log messages.

```javascript
var logger = require('hw-logger')
  , log = logger.log;

function logHandler(data) {
  console.log(data);
}

logger.init({
  out: logHandler
});

log.info('file content!'); // Display nothing
```

Output :

    $ node samples/outFunc.js
    INFO  - outFunc:14 - 5ms - file content!

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

### Build

Prerequisite :

    $ npm install -g grunt-cli

#### Run tests

    $ grunt test

#### Test coverage

    $ grunt coverage
    $ xdg-open dist/reports/coverage.html

#### Code quality

    $ grunt verify

#### Default build

Does test, coverage and verify

    $ grunt


Enjoy !
