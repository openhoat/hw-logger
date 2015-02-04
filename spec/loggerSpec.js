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
  , should = chai.should()
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
      logger.setLevel('info');
      log.info('hello');
      expect(logData.last).to.equal('INFO - hello\n');
      logData.last = null;
      log.trace('hello');
      expect(logData.last).to.not.be.ok;
      logger.setLevel('trace');
      log.trace('hello');
      expect(logData.last).to.equal('TRACE - hello\n');
      logData.last = null;
      log.error('hello');
      expect(logData.last).to.equal('ERROR - hello\n');
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
      expect(logData.last).to.equal('INFO - hello\n');
      logData.last = null;
      expect(log).to.not.have.property('danger');
      logger.registerLevels({DANGER: 5});
      log.danger('world');
      expect(logData.last).to.not.be.ok;
      logger.setLevel('danger');
      log.danger('world');
      expect(logData.last).to.equal('DANGER - world\n');
      logData.last = null;
    });

  });

  describe('express log middleware', function () {
    var request = require('request')
      , socketFile = path.join(tmpDir, 'web.sock')
      , server;

    before(function (done) {
      logData = {};
      eventEmitter = new events.EventEmitter();
      logger.init({
        format: logFormat,
        out: eventEmitter,
        extraLevels: {http: 2.5}
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

    it('should show express logs', function () {
      log.debug('coucou');
      var requestAsync = Promise.promisify(request);
      return requestAsync(
        {
          url: util.format('http://unix:%s:%s', socketFile, '/hello')
        })
        .spread(function (res) {
          res.statusCode.should.equal(200);
          expect(logData.last).to.equal('HTTP - undefined - GET /hello - 200 - 12\n');
        }).then(function () {
          return requestAsync({url: util.format('http://unix:%s:%s', socketFile, '/world')});
        })
        .spread(function (res) {
          res.statusCode.should.equal(404);
          expect(logData.last).to.equal('HTTP - undefined - GET /world - 404 - 18\n');
        });
    });

  });

});