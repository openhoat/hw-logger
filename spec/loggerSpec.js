'use strict';

var chai = require('chai')
  , events = require('events')
  , util = require('util')
  , logger = require('../lib/logger')
  , log = logger.log
  , expect = chai.expect
  , logFormat = '<%- data.level %> - <%- util.format.apply(null, data.args) %>'
  , eventEmitter, logData;

describe('hw-logger', function () {

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
      expect(logData.last).to.equal(util.format('%s - %s', level, msg));
    });

    it('should log an error message', function () {
      var level = 'ERROR'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s', level, msg));
    });

    it('should log a warn message', function () {
      var level = 'WARN'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s', level, msg));
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
      expect(logData.last).to.equal(util.format('%s - %s', level, msg));
    });

    it('should log an error message', function () {
      var level = 'ERROR'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s', level, msg));
    });

    it('should log a warn message', function () {
      var level = 'WARN'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s', level, msg));
    });

    it('should log a debug message', function () {
      var level = 'DEBUG'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
      expect(logData.last).to.equal(util.format('%s - %s', level, msg));
    });

    it('should not log a trace message', function () {
      var level = 'TRACE'
        , msg = 'hello';
      log[logger.getLogMethodName(level)].call(null, msg);
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
      expect(logData.last).to.equal(util.format('%s - %s', level, msg));
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
      logger.setLevel('info');
      log.info('hello');
      expect(logData.last).to.equal('INFO - hello');
      logData.last = null;
      log.trace('hello');
      expect(logData.last).to.not.be.ok;
      logger.setLevel('trace');
      log.trace('hello');
      expect(logData.last).to.equal('TRACE - hello');
      logData.last = null;
      log.error('hello');
      expect(logData.last).to.equal('ERROR - hello');
      logData.last = null;
    });

  });

  describe('add log level', function () {

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

    it('should add a log level', function () {
      logger.setLevel('info');
      log.info('hello');
      expect(logData.last).to.equal('INFO - hello');
      logData.last = null;
      expect(log).to.not.have.property('danger');
      logger.registerLevels({DANGER: 5});
      log.danger('world');
      expect(logData.last).to.not.be.ok;
      logger.setLevel('danger');
      log.danger('world');
      expect(logData.last).to.equal('DANGER - world');
      logData.last = null;
    });

  });

  describe('collaborate with express', function () {
    var path = require('path')
      , http = require('http')
      , server
      , socketFile = path.join(__dirname, '..', 'web.sock');

    before(function (done) {
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
      (function initExpress(express) {
        var app = express();
        app.use(logger.express());
        app.get('/hello', function (req, res) {
          res.send('Hello World!');
        });
        server = app.listen(socketFile, done);
      })(require('express'));
    });

    after(function (done) {
      eventEmitter.removeAllListeners('data');
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

    it('should show express logs', function (done) {
      http.get({socketPath: socketFile, path: '/hello'}, function (/*res*/) {
        expect(logData.last).to.equal('HTTP - undefined - GET /hello - 200');
        http.get({socketPath: socketFile, path: '/world'}, function (/*res*/) {
          expect(logData.last).to.equal('HTTP - undefined - GET /world - 404');
          done();
        });
      });
    });

  });

});