'use strict';

var chai = require('chai')
  , events = require('events')
  , util = require('util')
  , Promise = require('bluebird')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , logger = require('../lib/logger')
  , log = logger.log
  , expect = chai.expect
  , logFormat = '<%- data.level %> - <%- util.format.apply(null, data.args) %>'
  , eventEmitter, logData
  , tmpDir = path.join(__dirname, '..', 'tmp');

describe('hw-logger', function () {

  before(function () {
    return Promise.promisify(mkdirp)(tmpDir);
  });

  describe('default log config', function () {

    before(function () {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should log an info message', function () {
      var level = 'INFO'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should log an error message', function () {
      var level = 'ERROR'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should log a warn message', function () {
      var level = 'WARN'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should not log a debug message', function () {
      var level = 'DEBUG'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.not.be.ok;
    });

    it('should not log a trace message', function () {
      var level = 'TRACE'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.not.be.ok;
    });

  });

  describe('debug log config', function () {

    before(function () {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter,
        level: 'DEBUG'
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should log an info message', function () {
      var level = 'INFO'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should log an error message', function () {
      var level = 'ERROR'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should log a warn message', function () {
      var level = 'WARN'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should log a debug message', function () {
      var level = 'DEBUG'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should not log a trace message', function () {
      var level = 'TRACE'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.not.be.ok;
    });

  });

  describe('debug log config from environment', function () {

    before(function () {
      process.env['HW_LOG_LEVEL'] = 'debug';
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      delete process.env['HW_LOG_LEVEL'];
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should log an info message from environment', function () {
      var level = 'INFO'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should log an error message from environment', function () {
      var level = 'ERROR'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should log a warn message from environment', function () {
      var level = 'WARN'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should log a debug message from environment', function () {
      var level = 'DEBUG'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should not log a trace message from environment', function () {
      var level = 'TRACE'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.not.be.ok;
    });

  });

  describe('use arg function', function () {

    before(function () {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter,
        useArgFunction: true
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should call arg function', function () {
      var level = 'INFO'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, function () {
        return msg;
      });
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should not call arg function', function () {
      var level = 'TRACE'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, function () {
        return msg;
      });
      expect(logData.last).to.not.be.ok;
    });

  });

  describe('error log config', function () {

    before(function () {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter,
        level: 'ERROR'
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should not log an info message', function () {
      var level = 'INFO'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.not.be.ok;
    });

    it('should log an error message', function () {
      var level = 'ERROR'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s\n', level, msg));
    });

    it('should not log a warn message', function () {
      var level = 'WARN'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.not.be.ok;
    });

    it('should not log a debug message', function () {
      var level = 'DEBUG'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.not.be.ok;
    });

    it('should not log a trace message', function () {
      var level = 'TRACE'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.not.be.ok;
    });

  });

  describe('change log level', function () {

    before(function () {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter,
        level: 'ERROR'
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should change log level', function () {
      log.info('hello');
      expect(logData.last).to.not.be.ok;
      //
      logger.setLevel('info');
      log.info('hello');
      expect(logData.last).to.equal('INFO - hello\n');
      logData.last = null;
      log.trace('hello');
      expect(logData.last).to.not.be.ok;
      //
      logger.setLevel('trace');
      log.trace('hello');
      expect(logData.last).to.equal('TRACE - hello\n');
      logData.last = null;
      log.error('hello');
      expect(logData.last).to.equal('ERROR - hello\n');
      logData.last = null;
      //
      logger.setLevel('all');
      log.trace('hello');
      expect(logData.last).to.equal('TRACE - hello\n');
      log.debug('hello');
      expect(logData.last).to.equal('DEBUG - hello\n');
      logData.last = null;
      //
      logger.setLevel('none');
      log.trace('hello');
      expect(logData.last).to.not.be.ok;
      log.debug('hello');
      expect(logData.last).to.not.be.ok;
    });

  });

  describe('add log level', function () {

    before(function () {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter,
        level: 'info'
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should add a log level and return levels', function () {
      logger.setLevel('info');
      log.info('hello');
      expect(logData.last).to.equal('INFO - hello\n');
      logData.last = null;
      expect(log).to.not.have.property('danger');
      expect(logger.getLevels()).to.eql(['NONE', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'ALL']);
      logger.registerLevels({DANGER: 6});
      log.danger('world');
      expect(logData.last).to.not.be.ok;
      logger.setLevel('danger');
      log.danger('world');
      expect(logData.last).to.equal('DANGER - world\n');
      logData.last = null;
      expect(logger.getLevels()).to.eql(['NONE', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'DANGER', 'ALL']);
    });

  });

  describe('init with extra levels', function () {

    before(function () {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter,
        level: 'info',
        extraLevels: {important: 2.5, danger: 6}
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should have 2 extra levels', function () {
      expect(logger.getLevels()).to.eql(['NONE', 'ERROR', 'WARN', 'IMPORTANT', 'INFO', 'DEBUG', 'TRACE', 'DANGER', 'ALL']);
      log.info('hello');
      expect(logData.last).to.equal('INFO - hello\n');
      logData.last = null;
      log.important('world');
      expect(logData.last).to.equal('IMPORTANT - world\n');
      logData.last = null;
      log.danger('world');
      expect(logData.last).to.not.be.ok;
      logger.setLevel('danger');
      log.danger('world');
      expect(logData.last).to.equal('DANGER - world\n');
      logData.last = null;
    });


    it('should set log levels with an array', function () {
      var levels;
      logger.init({levels: ['error', 'warn', 'http', 'info', 'debug', 'trace']});
      expect(logger.getLevelsMaxLength()).to.equal('ERROR'.length);
      levels = logger.getLevels();
      levels.forEach(function (level, index) {
        expect(logger.getLevelValue(level)).to.equal(index === levels.length - 1 ? Number.MAX_VALUE : index);
      });
    });

  });

  describe('use a custom format function', function () {

    before(function () {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: function (data) {
          return data.args.join(',');
        },
        out: eventEmitter,
        level: 'info'
      });
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
    });

    after(function () {
      eventEmitter.removeAllListeners('data');
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should use a custom format defined in a function', function () {
      logger.setLevel('info');
      log.info('hello', 'world');
      expect(logData.last).to.equal('hello,world\n');
      logData.last = null;
    });

  });

  describe('express log middleware', function () {
    var request = require('request')
      , socketFile = path.join(tmpDir, 'web.sock')
      , server;

    before(function (done) {
      var express = require('express')
        , app = express();
      logData = {};
      eventEmitter = new events.EventEmitter();
      eventEmitter.on('data', function (data) {
        logData.buffer += data;
        logData.last = data;
      });
      logger.init({
        format: logFormat,
        out: eventEmitter
      });
      app.use(logger.express());
      app.get('/hello', function (req, res) {
        res.send('Hello World!');
      });
      server = app.listen(socketFile, done);
    });

    after(function (done) {
      eventEmitter.removeAllListeners('data');
      if (server) {
        server.close(done);
      } else {
        done();
      }
    });

    beforeEach(function () {
      logData.buffer = '';
      logData.last = null;
    });

    it('should show express logs', function () {
      var requestAsync = Promise.promisify(request);
      logger.setLevel('http');
      return requestAsync(
        {
          url: util.format('http://unix:%s:%s', socketFile, '/hello')
        })
        .spread(function (res) {
          expect(res.statusCode).to.equal(200);
          expect(logData.last).to.equal('HTTP - undefined - GET /hello - 200 - 12\n');
        }).then(function () {
          return requestAsync({url: util.format('http://unix:%s:%s', socketFile, '/world')});
        })
        .spread(function (res) {
          expect(res.statusCode).to.equal(404);
          expect(logData.last).to.equal('HTTP - undefined - GET /world - 404 - 18\n');
        });
    });

  });

  describe('log to stream', function () {
    var path = require('path')
      , fs = require('fs')
      , logFile = path.join(tmpDir, 'out.log')
      , readFile = Promise.promisify(fs.readFile)
      , unlink = Promise.promisify(fs.unlink)
      , flush = Promise.promisify(logger.flush);

    before(function () {
      logger.init({
        format: logFormat,
        out: fs.createWriteStream(logFile)
      });
    });

    after(function () {
      return unlink(logFile);
    });

    it('should log messages to log stream', function () {
      var msg = 'hello';
      log[logger.getLogMethodName('INFO')].call(null, msg);
      log[logger.getLogMethodName('ERROR')].call(null, msg);
      log[logger.getLogMethodName('WARN')].call(null, msg);
      log[logger.getLogMethodName('DEBUG')].call(null, msg);
      log[logger.getLogMethodName('TRACE')].call(null, msg);
      return flush()
        .then(function () {
          return readFile(logFile, 'utf8')
            .then(function (data) {
              expect(data).to.equal(
                ['INFO', 'ERROR', 'WARN']
                  .map(function (level) {
                    return util.format('%s - %s', level, msg);
                  })
                  .join('\n') + '\n'
              );
            });
        });
    });

  });

  describe('log to file', function () {
    var path = require('path')
      , fs = require('fs')
      , logFile = path.join(tmpDir, 'out.log')
      , readFile = Promise.promisify(fs.readFile)
      , unlink = Promise.promisify(fs.unlink)
      , flush = Promise.promisify(logger.flush);

    before(function () {
      logger.init({
        format: logFormat,
        out: logFile
      });
    });

    after(function () {
      return unlink(logFile);
    });

    it('should log messages to log file', function () {
      var msg = 'hello';
      log[logger.getLogMethodName('INFO')].call(null, msg);
      log[logger.getLogMethodName('ERROR')].call(null, msg);
      log[logger.getLogMethodName('WARN')].call(null, msg);
      log[logger.getLogMethodName('DEBUG')].call(null, msg);
      log[logger.getLogMethodName('TRACE')].call(null, msg);
      return flush()
        .then(function () {
          return readFile(logFile, 'utf8');
        })
        .then(function (data) {
          expect(data).to.equal(
            ['INFO', 'ERROR', 'WARN']
              .map(function (level) {
                return util.format('%s - %s', level, msg);
              })
              .join('\n') + '\n'
          );
        });
    });

  });

  describe('log handling by a function', function () {
    var logLines = [];

    function logHandler(data) {
      logLines.push(data);
    }

    before(function () {
      logger.init({
        format: logFormat,
        out: logHandler
      });
    });

    it('should log messages to handler', function () {
      var msg = 'hello';
      log[logger.getLogMethodName('INFO')].call(null, msg);
      log[logger.getLogMethodName('ERROR')].call(null, msg);
      log[logger.getLogMethodName('WARN')].call(null, msg);
      log[logger.getLogMethodName('DEBUG')].call(null, msg);
      log[logger.getLogMethodName('TRACE')].call(null, msg);
      expect(logLines).to.eql(['INFO', 'ERROR', 'WARN'].map(function (level) {
        return util.format('%s - %s', level, msg);
      }));
    });

  });

  describe('bad format', function () {
    it('should throw an error because of bad format', function () {
      expect(function () {
        logger.init({format: {a: 'b'}});
      }).to.throw('format not supported');
    });
  });

  describe('bad level', function () {
    it('should throw an error because of bad level', function () {
      expect(function () {
        logger.init({level: 'bad'});
      }).to.throw('log level BAD is not supported');
    });
  });

  describe('bad output', function () {
    it('should throw an error because of bad output', function () {
      expect(function () {
        logger.init({out: 3});
      }).to.throw('Output not supported');
      expect(function () {
        logger.init({out: {b: 3}});
      }).to.throw('Output object instance not supported');
    });
  });

});