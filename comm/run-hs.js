var spawn = require('./spawn.js');

module.exports = function runHs(port, args, cwd, cb) {
  spawn('hs.cmd', args, { cwd: cwd }, cb);
};