'use strict';

var util = require('util')
  , cluster = require('cluster')
  , path = require('path')
  , fs = require('fs')
  , _ = require('lodash')
  , template = require('lodash.template')
  , events = require('events')
  , moment = require('moment')
  , chalk = require('chalk')
  , log = {}
  , that, logger;

that = {
  defaults: {
    levels: { NONE: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4, TRACE: 5, ALL: Number.MAX_VALUE },
    level: process.env['NODE_ENV'] === 'production' ? 'WARN' : 'INFO',
    template: {},
    out: console.log,
    caller: true,
    useArgFunction: false
  },
  enabledLevels: {},
  lastTime: Date.now(),
  buildLogMethod: function(level) {
    return function() {
      var args = Array.prototype.slice.call(arguments)
        , data, caller;
      if (that.config.caller) {
        try {
          caller = that.getCaller();
        } catch (err) {
          log.warn(err.stack);
          caller = null;
        }
      }
      if (that.config.useArgFunction) {
        args = args.map(function(arg) {
          return typeof arg === 'function' ? arg() : arg;
        });
      }
      data = {
        time: moment(),
        lastTime: that.lastTime,
        level: level,
        levelValue: that.getLevelValue(level),
        args: args,
        caller: caller
      };
      that.lastTime = data.time;
      that.sendLog(that.buildLogMessage(data));
    };
  },
  express: function(options) {
    var onFinished = require('on-finished')
      , levelName, level;
    options = options || {};
    levelName = 'http';
    level = {};
    level[levelName] = that.getLevelValue('info') + 0.5;
    that.registerLevels(level);
    return typeof options.logger === 'function' || function(req, res, next) {
      var reqInfo
        , doLog = function(res) {
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
        onFinished(res, function(err, res) {
          doLog(res);
        });
      }
      next();
    };
  },
  flush: function(cb) {
    if (typeof that.config.out === 'object' && that.config.out instanceof fs.WriteStream) {
      that.config.out.end(cb);
    }
  },
  getCaller: function() {
    var stackTrace = require('stack-trace')
      , trace = stackTrace.get()
      , callsite = trace[Math.min(2, trace.length)];
    return {
      file: callsite.getFileName(),
      line: callsite.getLineNumber()
    };
  },
  getLevel: function() {
    return that.config.level;
  },
  getLevels: function() {
    return _
      .keys(that.config.levels)
      .sort(function(a, b) {
        return that.config.levels[a] - that.config.levels[b];
      });
  },
  getLevelsMaxLength: function() {
    return that.config.levelsMaxLength;
  },
  getLevelValue: function(level) {
    level = that.normalizeLevel(level);
    return that.config.levels.hasOwnProperty(level) ? that.config.levels[level] : null;
  },
  getLogMethodName: function(level) {
    return _.camelCase(level);
  },
  hasLevel: function(level) {
    return _.has(that.config.levels, that.normalizeLevel(level));
  },
  init: function(options) {
    options = options || {};
    that.config = _.extend(_.cloneDeep(that.defaults), _.omit(options, 'extraLevels'));
    if (process.env['HW_LOG_COLORS']) {
      that.config.colors = process.env['HW_LOG_COLORS'] === 'true';
    }
    that.chalk = new chalk.constructor({ enabled: typeof that.config.colors === 'boolean' ? that.config.colors : true });
    if (!that.config.format) {
      that.config.formatFile = path.resolve(path.join(__dirname, '..', 'templates'), that.config.formatFile || 'default.tpl');
      if (!path.extname(that.config.formatFile)) {
        that.config.formatFile = that.config.formatFile + '.tpl';
      }
      that.config.template.filename = that.config.formatFile;
      that.config.format = fs.readFileSync(that.config.formatFile, 'utf8').replace(/[\n]*$/, '');
    }
    if (typeof that.config.format === 'function') {
      that.buildLogMessage = that.render = that.config.format;
    } else if (typeof that.config.format === 'string') {
      that.render = template(that.config.format, that.config.template);
      that.buildLogMessage = function(data) {
        return that.render({
          data: data,
          chalk: that.chalk,
          util: util,
          cluster: cluster,
          path: path,
          config: that.config
        });
      };
    } else {
      throw new Error('format not supported');
    }
    if (typeof that.config.out === 'string') {
      that.config.out = fs.createWriteStream(that.config.out);
    }
    if (typeof that.config.out === 'object') {
      if (that.config.out instanceof fs.WriteStream) {
        that.sendLog = function(data) {
          that.config.out.write(data + '\n', 'utf8');
        };
      } else if (that.config.out instanceof events.EventEmitter) {
        that.sendLog = function(data) {
          that.config.out.emit('data', data + '\n');
        };
      } else {
        throw new Error('Output object instance not supported');
      }
    } else if (typeof that.config.out === 'function') {
      that.sendLog = that.config.out;
    } else {
      throw new Error('Output not supported');
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
  },
  isEnabled: function(level) {
    return that.hasLevel(level) && that.getLevelValue(level) <= that.config.levelValue;
  },
  normalizeLevel: function(level) {
    return _.snakeCase(level).toUpperCase();
  },
  registerLevels: function(levels) {
    _.forOwn(levels, function(index, key) {
      that.config.levels[that.normalizeLevel(key)] = levels[key];
    });
    that.resetLevels();
  },
  resetLevels: function() {
    _.forOwn(log, function(n, key) {
      delete log[key];
    });
    if (Array.isArray(that.config.levels)) {
      that.config.levels = that.config.levels.reduce(function(result, level, index) {
        result[that.normalizeLevel(level)] = index + 1;
        return result;
      }, {});
    }
    that.setLevel();
    that.config.levelValue = that.getLevelValue(that.config.level);
    that.config.levelsMaxLength = _.max(_.map(_.keys(that.config.levels), 'length'));
    _.keys(_.extend(that.config.levels, { NONE: 0, ALL: Number.MAX_VALUE }))
      .sort(function(a, b) {
        return that.getLevelValue(a) - that.getLevelValue(b);
      })
      .forEach(function(level, index) {
        level = that.normalizeLevel(level);
        if (level === 'NONE') {
          that.config.levels[level] = 0;
        } else if (level === 'ALL') {
          that.config.levels[level] = Number.MAX_VALUE;
        } else {
          that.config.levels[level] = index;
          that.resetLogMethod(level, that.isEnabled(level));
        }
      });
  },
  resetLogMethod: function(level, enabled) {
    var methodName = _.camelCase(level);
    log[methodName] = that[methodName] = enabled ? that.buildLogMethod(that.normalizeLevel(level)) : _.noop;
  },
  setLevel: function(level) {
    if (typeof level === 'number') {
      level = _.findKey(that.config.levels, function(value) {
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
    _.forOwn(that.config.levels, function(index, level) {
      if (level !== 'NONE' && level !== 'ALL') {
        that.resetLogMethod(level, that.enabledLevels[level.toLowerCase()] = that.isEnabled(level));
      }
    });
  }
};

logger = {
  init: that.init,
  express: that.express,
  flush: that.flush,
  getLevel: that.getLevel,
  getLevels: that.getLevels,
  getLevelsMaxLength: that.getLevelsMaxLength,
  getLevelValue: that.getLevelValue,
  getLogMethodName: that.getLogMethodName,
  isEnabled: that.isEnabled,
  enabled: that.isEnabled,
  enabledLevels: that.enabledLevels,
  log: log,
  registerLevels: that.registerLevels,
  setLevel: that.setLevel
};

that.init();

module.exports = logger;