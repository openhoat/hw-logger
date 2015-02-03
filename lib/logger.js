'use strict';

var util = require('util')
  , path = require('path')
  , fs = require('fs')
  , _ = require('lodash')
  , ejs = require('ejs')
  , events = require('events')
  , moment = require('moment')
  , chalk = require('chalk')
  , log = {}
  , that, logger;

that = {
  config: {
    levels: {ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, TRACE: 4},
    level: process.env['HW_LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'WARN' : 'INFO'),
    colors: true,
    ejs: {},
    out: console.log,
    caller: true
  },
  lastTime: Date.now(),
  render: null,
  buildLogMessage: function (data) {
    return that.render({data: data, chalk: chalk, util: util, path: path, config: that.config});
  },
  buildLogMethod: function (level) {
    return function () {
      var data, caller;
      if (!that.enabled(level)) {
        return;
      }
      if (that.config.caller) {
        try {
          caller = that.getCaller();
        } catch (err) {
          log.warn(err.stack);
          caller = null;
        }
      }
      data = {
        time: moment(),
        lastTime: that.lastTime,
        level: level,
        levelValue: that.getLevelValue(level),
        args: Array.prototype.slice.call(arguments),
        caller: caller
      };
      that.lastTime = data.time;
      that.sendLog(that.buildLogMessage(data));
    };
  },
  enabled: function (level) {
    return that.config.levels.hasOwnProperty(level) && that.getLevelValue(level) <= that.config.levelValue;
  },
  express: function () {
    that.registerLevels({'HTTP': 2.5});
    that.setLevel('HTTP');
    return function (req, res, next) {
      var result = next();
      log.http('%s - %s %s - %s', req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.method, req.url, res.statusCode);
      return result;
    };
  },
  getCaller: function () {
    var stackTrace = require('stack-trace')
      , trace = stackTrace.get()
      , callsite = trace[Math.min(2, trace.length)];
    return {
      file: callsite.getFileName(),
      line: callsite.getLineNumber()
    };
  },
  getLevelValue: function (level) {
    return that.config.levels.hasOwnProperty(level) ? that.config.levels[level] : null;
  },
  getLogMethodName: function (level) {
    return _.camelCase(level);
  },
  init: function (options) {
    options = options || {};
    that.config = _.assign(_.omit(that.config,'format','formatFile'), options);
    chalk.isEnabled = that.config.colors;
    if (!that.config.format) {
      that.config.formatFile = that.config.formatFile || path.join(__dirname, '..', 'templates', 'default.ejs');
      that.config.ejs.filename = that.config.formatFile;
      that.config.format = fs.readFileSync(that.config.formatFile, 'utf8');
    }
    if (typeof that.config.format === 'function') {
      that.render = that.config.format;
    } if (typeof that.config.format === 'string') {
      that.render = ejs.compile(that.config.format, that.config.ejs);
    }
    that.setLevel(that.config.level);
    that.resetLevels();
    log.trace('log config :', that.config);
  },
  noop: function noop() {
  },
  normalizeLevel: function (level) {
    return _.snakeCase(level).toUpperCase();
  },
  registerLevels: function (levels) {
    that.config.levels = _.assign(that.config.levels, levels);
    that.resetLevels();
  },
  resetLevels: function () {
    _.forOwn(log, function (n, key) {
      delete log[key];
    });
    that.setLevel();
    that.config.levelValue = that.getLevelValue(that.config.level);
    that.config.levelsMaxLength = _.max(_.map(_.keys(that.config.levels), 'length'));
    _.keys(that.config.levels)
      .sort(function (a, b) {
        return that.getLevelValue(a) - that.getLevelValue(b);
      })
      .forEach(function (level, index) {
        level = that.normalizeLevel(level);
        that.config.levels[level] = index;
        that.resetLogMethod(level, that.enabled(level));
      });
  },
  resetLogMethod: function (level, enabled) {
    var methodName = _.camelCase(level);
    level = that.normalizeLevel(level);
    log[methodName] = that[methodName] = enabled ? that.buildLogMethod(level) : that.noop;
  },
  sendLog: function (data) {
    if (typeof that.config.out === 'object') {
      if (that.config.out instanceof events.EventEmitter) {
        that.config.out.emit('data', data);
      }
    } else if (typeof that.config.out === 'function') {
      that.config.out.call(null, data);
    } else {
      throw new Error('Output not supported');
    }
  },
  setLevel: function (level) {
    if (typeof level === 'number') {
      level = _.findKey(that.config.levels, function (value) {
        return value === level;
      });
    }
    if (level) {
      level = that.normalizeLevel(level);
      if (!_.has(that.config.levels, level)) {
        throw new Error(util.format('log level %s is not supported', level));
      }
      that.config.level = level;
      that.resetLogMethod(level, true);
    }
    that.config.levelValue = that.getLevelValue(that.config.level);
  }
};

logger = {
  init: that.init,
  log: log,
  getLogMethodName: that.getLogMethodName,
  getLevelValue: that.getLevelValue,
  setLevel: that.setLevel,
  isEnabled: that.isEnabled,
  registerLevels: that.registerLevels,
  express: that.express
};

that.init();

exports = module.exports = logger;