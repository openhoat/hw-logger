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
  defaults: {
    levels: {NONE: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4, TRACE: 5, ALL: Number.MAX_VALUE},
    level: process.env['NODE_ENV'] === 'production' ? 'WARN' : 'INFO',
    colors: true,
    ejs: {},
    out: console.log,
    caller: true
  },
  lastTime: Date.now(),
  buildLogMethod: function (level) {
    return function () {
      var data, caller;
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
    return that.hasLevel(level) && that.getLevelValue(level) <= that.config.levelValue;
  },
  express: function (options) {
    var onFinished = require('on-finished')
      , levelName, levelValue, level;
    options = options || {};
    levelName = 'http';
    level = {};
    level[levelName] = that.getLevelValue('info') + 0.5;
    that.registerLevels(level);
    levelValue = Math.max(that.getLevelValue(that.config.level), that.getLevelValue('http'));
    that.setLevel(levelValue);
    return typeof options.logger === 'function' || function (req, res, next) {
        var reqInfo
          , doLog = function (res) {
            var contentLength = res.get('content-length');
            log.http('%s - %s %s - %s - %s',
              reqInfo.ip, reqInfo.method, reqInfo.url,
              typeof res.statusCode !== 'undefined' ? res.statusCode : '?',
              typeof contentLength !== 'undefined' ? contentLength : '?'
            );
          };
        reqInfo = {
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          method: req.method,
          url: req.url
        };
        if (options.logBefore) {
          doLog(res);
        } else {
          onFinished(res, function (err, res) {
            doLog(res);
          });
        }
        next();
      };
  },
  flush: function (cb) {
    if (typeof that.config.out === 'object' && that.config.out instanceof fs.WriteStream) {
      that.config.out.end(cb);
    }
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
    level = that.normalizeLevel(level);
    return that.config.levels.hasOwnProperty(level) ? that.config.levels[level] : null;
  },
  getLevels: function () {
    return _
      .keys(that.config.levels)
      .sort(function (a, b) {
        return that.config.levels[a] - that.config.levels[b];
      });
  },
  getLogMethodName: function (level) {
    return _.camelCase(level);
  },
  hasLevel: function (level) {
    return _.has(that.config.levels, that.normalizeLevel(level));
  },
  init: function (options) {
    options = options || {};
    that.config = _.extend(_.cloneDeep(that.defaults), _.omit(options, 'extraLevels'));
    chalk.isEnabled = that.config.colors;
    if (!that.config.format) {
      that.config.formatFile = that.config.formatFile || path.join(__dirname, '..', 'templates', 'default.ejs');
      that.config.ejs.filename = that.config.formatFile;
      that.config.format = fs.readFileSync(that.config.formatFile, 'utf8');
    }
    if (typeof that.config.format === 'function') {
      that.buildLogMessage = that.render = that.config.format;
    } else if (typeof that.config.format === 'string') {
      that.render = ejs.compile(that.config.format, that.config.ejs);
      that.buildLogMessage = function (data) {
        return that.render({data: data, chalk: chalk, util: util, path: path, config: that.config});
      };
    } else {
      throw new Error('format not supported');
    }
    if (typeof that.config.out === 'string') {
      that.config.out = fs.createWriteStream(that.config.out);
    }
    if (options.extraLevels) {
      that.registerLevels(options.extraLevels);
    } else {
      that.resetLevels();
    }
    if (process.env['HW_LOG_LEVEL'] && that.hasLevel(process.env['HW_LOG_LEVEL'])) {
      that.config.level = process.env['HW_LOG_LEVEL'];
    }
    that.setLevel(that.config.level);
    log.trace('log config :', that.config);
  },
  noop: function noop() {
  },
  normalizeLevel: function (level) {
    return _.snakeCase(level).toUpperCase();
  },
  registerLevels: function (levels) {
    _.forOwn(levels, function (index, key) {
      that.config.levels[that.normalizeLevel(key)] = levels[key];
    });
    that.resetLevels();
  },
  resetLevels: function () {
    _.forOwn(log, function (n, key) {
      delete log[key];
    });
    that.setLevel();
    that.config.levelValue = that.getLevelValue(that.config.level);
    that.config.levelsMaxLength = _.max(_.map(_.keys(that.config.levels), 'length'));
    _.keys(_.extend(that.config.levels, {NONE: 0, ALL: Number.MAX_VALUE}))
      .sort(function (a, b) {
        return that.getLevelValue(a) - that.getLevelValue(b);
      })
      .forEach(function (level, index) {
        level = that.normalizeLevel(level);
        if (level === 'NONE') {
          that.config.levels[level] = 0;
        } else if (level === 'ALL') {
          that.config.levels[level] = Number.MAX_VALUE;
        } else {
          that.config.levels[level] = index;
          that.resetLogMethod(level, that.enabled(level));
        }
      });
  },
  resetLogMethod: function (level, enabled) {
    var methodName = _.camelCase(level);
    log[methodName] = that[methodName] = enabled ? that.buildLogMethod(that.normalizeLevel(level)) : that.noop;
  },
  sendLog: function (data) {
    if (typeof that.config.out === 'object') {
      if (that.config.out instanceof fs.WriteStream) {
        that.config.out.write(data + '\n', 'utf8');
      } else if (that.config.out instanceof events.EventEmitter) {
        that.config.out.emit('data', data + '\n');
      }
    } else if (typeof that.config.out === 'string') {
      throw new Error('Output string not supported');
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
      if (!that.hasLevel(level)) {
        throw new Error(util.format('log level %s is not supported', level));
      }
      that.config.level = level;
    }
    that.config.level = that.normalizeLevel(that.config.level);
    that.config.levelValue = that.getLevelValue(that.config.level);
    _.forOwn(that.config.levels, function (index, level) {
      if (level !== 'NONE' && level !== 'ALL') {
        that.resetLogMethod(level, that.enabled(level));
      }
    });
  }
};

logger = {
  init: that.init,
  express: that.express,
  flush: that.flush,
  getLevelValue: that.getLevelValue,
  getLevels: that.getLevels,
  getLogMethodName: that.getLogMethodName,
  enabled: that.enabled,
  log: log,
  registerLevels: that.registerLevels,
  setLevel: that.setLevel
};

that.init();

exports = module.exports = logger;