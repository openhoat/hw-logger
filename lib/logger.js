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

function noop() {
}

function getCaller(depth) {
  var prepareStackTrace, stack, file, item;
  prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function (_, stack) {
    Error.prepareStackTrace = prepareStackTrace;
    return stack;
  };
  stack = (new Error()).stack;
  depth = !depth || isNaN(depth) ? 1 : Math.min(depth, stack.length - 2);
  stack = stack.slice(depth + 1);
  do {
    item = stack.shift();
    file = item && item.getFileName();
  } while (stack.length && file === 'module.js');
  return file;
}

that = {
  config: {
    levels: {ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3, TRACE: 4},
    formatFile: path.join(__dirname, '..', 'templates', 'default.ejs'),
    level: process.env['LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'WARN' : 'INFO'),
    colors: true,
    ejs: {},
    out: console.log,
    caller: true
  },
  render: null,
  init: function (options) {
    options = options || {};
    that.config = _.assign(that.config, options);
    chalk.isEnabled = that.config.colors;
    if (!that.config.format && that.config.formatFile) {
      that.config.ejs.filename = that.config.formatFile;
      that.config.format = fs.readFileSync(that.config.formatFile, 'utf8');
    }
    if (typeof that.config.format === 'function') {
      that.render = that.config.format;
    } else {
      that.render = ejs.compile(that.config.format, that.config.ejs);
    }
    that.resetLevels();
    log.trace('log config :', that.config);
  },
  buildLog: function (data) {
    return that.render({data: data, chalk: chalk, util: util, path: path});
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
  getLevelValue: function (level) {
    return that.config.levels.hasOwnProperty(level) ? that.config.levels[level] : null;
  },
  setLevel: function (level) {
    if (typeof level === 'number') {
      level = _.findKey(that.config.levels, function (value) {
        return value === level;
      });
    }
    if (level) {
      that.config.level = _.snakeCase(level).toUpperCase();
      that.resetLogMethod(that.config.level, true);
    }
    that.config.levelValue = that.getLevelValue(that.config.level);
  },
  resetLogMethod: function (level, enabled) {
    var methodName = _.camelCase(level);
    log[methodName] = that[methodName] = enabled ? that.buildLogMethod(level) : noop;
  },
  registerLevels: function (levels) {
    that.config.levels = _.assign(that.config.levels, levels);
    that.resetLevels();
  },
  enabled: function (level) {
    return that.config.levels.hasOwnProperty(level) && that.getLevelValue(level) <= that.config.levelValue;
  },
  getLogMethodName: function (level) {
    return _.camelCase(level);
  },
  buildLogMethod: function (level) {
    return function () {
      var data, caller;
      if (!that.enabled(level)) {
        return;
      }
      if (that.config.caller) {
        try {
          caller = getCaller();
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
      that.sendLog(that.buildLog(data));
    };
  },
  resetLevels: function () {
    _.forOwn(log, function (n, key) {
      delete log[key];
    });
    that.setLevel();
    that.config.levelValue = that.getLevelValue(that.config.level);
    _.keys(that.config.levels)
      .sort(function (a, b) {
        return that.getLevelValue(a) - that.getLevelValue(b);
      })
      .forEach(function (level, index) {
        that.config.levels[level] = index;
        that.resetLogMethod(level, that.enabled(level));
      });
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
  express: function () {
    that.registerLevels({'HTTP': 2.5});
    that.setLevel('HTTP');
    return function (req, res, next) {
      next();
      log.http('%s - %s %s - %s', req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.method, req.url, res.statusCode);
    };
  }
};

that.init();

exports = module.exports = logger;