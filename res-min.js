var imagemin = require('lossy-imagemin');

module.exports = function resMin(srcPath, destPath, cb) {
  imagemin(srcPath + '/**/*.*', destPath, {
    base: srcPath,
    cache: false
  }, cb);
};