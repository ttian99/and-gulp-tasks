var spawn = require('./comm/spawn.js');
var cfg = require('./cfg.js');
var fs = require('fs-extra');

module.exports = function runNative(cb) {
  fs.copySync('frameworks/js-bindings/bindings/script', cfg.nativeDebugPath + '/script');
  fs.copySync('main.js', cfg.nativeDebugPath + '/main.js');
  fs.copySync('res', cfg.nativeDebugPath + '/res');
  fs.copySync('src', cfg.nativeDebugPath + '/src');

  var project = fs.readJsonSync('project.json');
  project.channel = 'native';
  fs.writeJsonSync(cfg.nativeDebugPath + '/project.json', project);

  spawn(cfg.projectName, [], { cwd: cfg.nativeDebugPath}, cb);
};