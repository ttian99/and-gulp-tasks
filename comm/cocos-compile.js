var cfg = require('../cfg.js');
var spawn = require('./spawn.js');
var os = require('os');
var _ = require('lodash');
require('colors');

/**
 * ps web android ios runtime
 */
module.exports = function compile(pf, cb) {
  if (pf === 'runtime') {
    compileRuntime(cb);
  } else if (_.include(['web', 'android', 'ios'], pf)) {
    compileCocos(pf, cb);
  } else {
    console.error(('unknown platform ' + pf).red);
  }
}

function compileRuntime(cb) {
  var cmd = 'python';
  var args = ['PackageCreator.pyc', '-s', process.cwd()];
  spawn(cmd, args, { cwd: cfg.runToolPath }, cb);
}

function compileCocos(pf, cb) {
  var cmd = 'cocos';
  if (os.platform() === 'win32') {
    cmd = 'cocos.bat';
  }

  var args = ['compile', '-m', 'release', '-p', pf];
  if (pf === 'web') {
    args.push('--source-map');
  }

  spawn(cmd, args, cb);
}

