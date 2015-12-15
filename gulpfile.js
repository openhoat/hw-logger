'use strict';

var _ = require('lodash')
  , chalk = require('chalk')
  , checkstyleReporter = require('gulp-jshint-checkstyle-reporter')
  , coveralls = require('gulp-coveralls')
  , debug = require('gulp-debug')
  , del = require('del')
  , gulp = require('gulp')
  , gulpif = require('gulp-if')
  , gutil = require('gulp-util')
  , istanbul = require('gulp-istanbul')
  , jshint = require('gulp-jshint')
  , licenseFinder = require('gulp-license-finder')
  , minimist = require('minimist')
  , mkdirp = require('mkdirp')
  , mocha = require('gulp-mocha')
  , path = require('path')
  , f = require('util').format.bind(null)
  , $, cmdOpt, taskSpecs, config, jenkins;

require('jshint-stylish');
process.env['NODE_ENV'] = 'test';
jenkins = !!process.env['JENKINS_URL'];

function log(newLine) {
  var args = Array.prototype.slice.call(arguments);
  if (typeof args[0] === 'boolean') {
    args.shift();
  }
  process.stdout.write(f.apply(null, args));
  if (newLine !== false) {
    process.stdout.write('\n');
  }
}

function toRelativePath(file, baseDir) {
  if (Array.isArray(file)) {
    return file.map(toRelativePath);
  } else {
    return path.relative(baseDir || __dirname, file);
  }
}

function toArray(s, sep, format) {
  return s.split(sep || ',').map(function (item) {
    return f(format || '%s', item.trim());
  });
}

function rm(src) {
  return del([src], {dryRun: cmdOpt['dry-run']})
    .then(function (files) {
      if (cmdOpt.verbose) {
        gutil.log(files && files.length ? $.yellow(f('Files and folders deleted :', toRelativePath(files).join(', '))) : $.yellow(f('Nothing deleted')));
      }
    });
}

cmdOpt = minimist(process.argv.slice(2), {
  string: ['include', 'transaction', 'log-level'],
  boolean: ['log-body', 'dry-run', 'verbose', 'color'],
  default: {color: true},
  alias: {
    i: 'include',
    t: 'transaction',
    l: 'log-body',
    d: 'dry-run',
    v: 'verbose'
  }
});

if (cmdOpt['dry-run'] || cmdOpt['log-body']) {
  cmdOpt.verbose = true;
}
if (cmdOpt['log-level']) {
  process.env['HW_LOG_LEVEL'] = cmdOpt['log-level'];
}
$ = new chalk.constructor({enabled: cmdOpt.color});
process.env['HW_LOG_COLORS'] = cmdOpt.color;

config = {
  distDir: 'dist',
  reportDir: 'dist/reports',
  jshint: {
    src: [
      'gulpfile.js',
      'lib/**/*.js',
      'spec/**/*.js'
    ],
    reporter: jenkins ? 'checkstyle' : 'jshint-stylish',
    checkStyleReporter: {
      filename: 'jshint_checkstyle.xml'
    }
  },
  test: {
    src: ['spec/*Spec.js'],
    options: {
      reporter: jenkins ? 'spec-xunit-file' : 'spec',
      grep: cmdOpt.transaction
    }
  },
  coverage: {
    instrument: {
      pattern: ['lib/**/*.js']
    },
    reporters: ['text', 'html', 'lcov'],
    reportOpts: {
      html: {file: 'coverage.html'},
      lcov: {file: 'lcov.info'}
    }
  }
};

_.merge(config, {
  coverage: {
    reportOpts: {
      html: {
        dir: path.join(config.reportDir, 'coverage/html')
      },
      lcov: {
        dir: path.join(config.reportDir, 'coverage/lcov')
      }
    }
  },
  coveralls: {
    src: [path.join(config.reportDir, 'coverage/lcov/lcov.info')]
  }
});

if (jenkins) {
  process.env['XUNIT_FILE'] = path.join(config.reportDir, 'test/xunit.xml');
  config.coverage.reporters.push('cobertura');
  config.coverage.reportOpts.cobertura = {
    dir: path.join(config.reportDir, 'coverage/cobertura'),
    file: 'coverage.xml'
  };
}

taskSpecs = {
  default: {
    deps: 'help'
  },
  help: {
    desc: 'Show tasks descriptions',
    task: function () {
      var l = 0, tasks;
      log();
      log($.bold('Usage'));
      log('  gulp %s', $.cyan('task'));
      log();
      log($.bold('Tasks'));
      tasks = [];
      _.forIn(taskSpecs, function (taskSpec, taskSpecName) {
        var task = _.omit(taskSpec, 'task');
        l = Math.max(taskSpecName.length, l);
        task.name = taskSpecName;
        task.providesFn = typeof taskSpec.task === 'function';
        tasks.push(task);
      });
      tasks.forEach(function (task) {
        log(false, '  %s : %s', $.cyan(_.padRight(task.name, l)), task.desc);
        if (task.deps) {
          log(false, ' %s', $.yellow(f('[%s]', task.deps.join(', '))));
        }
        log(false, ' ');
        if (task.config) {
          log(false, '%s', $.yellow.bold(f('\u2692 ')));
        }
        if (task.providesFn) {
          log(false, '%s', $.green(f('\u0192 ')));
        }
        log();
      });
      log();
    }
  },
  clean: {
    desc: 'Clean all generated files',
    config: {src: path.join(config.distDir, '**/*'), continueOnDryRun: true},
    task: function (t) {
      return rm(t.config.src);
    }
  },
  mkdir: {
    desc: 'Create dir to generate build files',
    deps: 'clean',
    config: {src: config.reportDir},
    task: function (t, cb) {
      mkdirp(t.config.src, function (err, dir) {
        if (cmdOpt.verbose) {
          gutil.log(dir ? $.yellow(f('Directory created :', toRelativePath(dir))) : $.yellow(f('Nothing created')));
        }
        cb(err);
      });
    }
  },
  lint: {
    desc: 'Detect errors and potential problems in code',
    config: {src: config.jshint.src},
    task: function (t) {
      var checkstyle = config.jshint.reporter === 'checkstyle';
      return gulp.src(t.config.src)
        .pipe(jshint(config.jshint.options))
        .pipe(checkstyle ? checkstyleReporter(config.jshint.checkStyleReporter) : jshint.reporter(config.jshint.reporter))
        .pipe(gulpif(checkstyle, gulp.dest(config.reportDir)));
    }
  },
  test: {
    desc: 'Run mocha specs',
    deps: 'mkdir',
    config: {src: cmdOpt.include ? toArray(cmdOpt.include, ',', 'spec/%sSpec.js') : config.test.src},
    task: function (t) {
      return gulp.src(t.config.src, {read: false})
        .pipe(mocha(config.test.options));
    }
  },
  coverage: {
    default: {
      desc: 'Run istanbul test coverage',
      deps: 'prepare',
      config: {src: config.test.src},
      task: function (t) {
        return gulp.src(t.config.src, {read: false})
          .pipe(mocha(config.test.options))
          .pipe(istanbul.writeReports({
            dir: config.reportDir,
            reporters: config.coverage.reporters,
            reportOpts: config.coverage.reportOpts
          }))
          .pipe(gulp.dest(config.reportDir));
      }
    },
    prepare: {
      desc: 'Prepare for coverage',
      config: {src: config.coverage.instrument.pattern},
      task: function (t) {
        return gulp.src(t.config.src)
          .pipe(istanbul())
          .pipe(istanbul.hookRequire());
      }
    }
  },
  coveralls: {
    default: {
      desc: 'Submit code coverage to coveralls',
      deps: '../coverage',
      config: {src: config.coveralls.src},
      task: function (t) {
        return gulp.src(t.config.src, {read: false})
          .pipe(coveralls());
      }
    }
  },
  licenses: {
    desc: 'Find licenses in node project and dependencies',
    task: function () {
      var dest = path.join(config.distDir, 'licenses.csv');
      return licenseFinder(path.basename(dest),
        {
          csv: true,
          depth: 1
        })
        .once('finish', function () {
          if (cmdOpt.verbose) {
            gutil.log($.yellow(f('Created license report : %s', dest)));
          }
          this.emit('end');
        })
        .pipe(gulp.dest(path.dirname(dest)));
    }
  }
};

function initTasks() {
  function taskSpecTransformer(baseNs) {
    return function (result, taskSpec, taskSpecName) {
      var ns, item;

      function isTaskGroup() {
        return !Object.keys(_.pick(taskSpec, ['deps', 'task', 'desc'])).length;
      }

      function dryRun() {
        if (cmdOpt['dry-run']) {
          if (_.get(item, 'config.src')) {
            return gulp.src(item.config.src)
              .pipe(debug({title: ns}));
          }
          return true;
        }
      }

      ns = baseNs ? (taskSpecName === (_.get(config, 'taskSpecs.defaultGroupTask') || 'default') ? baseNs : path.join(baseNs, taskSpecName)) : taskSpecName;
      if (isTaskGroup()) {
        _.transform(taskSpec, taskSpecTransformer(ns), result);
        return;
      }
      item = result[ns] = {};
      if (taskSpec.desc) {
        item.desc = typeof taskSpec.desc === 'function' ? taskSpec.desc(taskSpecName, taskSpec) : taskSpec.desc;
      }
      if (taskSpec.deps) {
        item.deps = [];
        (Array.isArray(taskSpec.deps) ? taskSpec.deps : [taskSpec.deps]).forEach(function (dep) {
          if (dep.indexOf('/') === 0) {
            item.deps.push(dep.substring(1));
          } else {
            item.deps.push(baseNs ? path.join(baseNs, dep) : dep);
          }
        });
      }
      if (typeof taskSpec.task === 'function') {
        item.task = function (cb) {
          if (dryRun(item.config)) {
            if (!_.get(item, 'config.continueOnDryRun')) {
              return cb();
            }
          }
          return taskSpec.task.call(this, _.omit(item, 'task'), function (err, data) {
            if (cmdOpt.verbose && data) {
              gutil.log($.yellow('Task result :', data));
            }
            cb(err);
          });
        };
      }
      if (taskSpec.config) {
        item.config = taskSpec.config;
      }
    };
  }

  function registerTasks() {
    _.forIn(taskSpecs, function (taskSpec, taskSpecName) {
      var args = [taskSpecName];
      if (!taskSpec.desc && taskSpec.deps.length === 1) {
        taskSpec.desc = taskSpecs[_.first(taskSpec.deps)].desc;
      }
      if (taskSpec.deps) {
        args.push(taskSpec.deps);
      }
      if (taskSpec.task) {
        args.push(taskSpec.task);
      }
      gulp.task.apply(gulp, args);
    });
  }

  taskSpecs = _.transform(taskSpecs, taskSpecTransformer(), {});
  registerTasks();
}

initTasks();