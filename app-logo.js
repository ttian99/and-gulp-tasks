var gm = require('gm-helper');
var async = require('async');

module.exports = function appLogo(logoFile, cb) {
  var logoPath = 'frameworks/runtime-src/proj.android/res/';
  var fileList = {
    'drawable-hdpi/icon.png': 72,
    'drawable-mdpi/icon.png': 48,
    'drawable-ldpi/icon.png': 32
  };

  async.forEachOf(fileList, function(value, key, callback) {
    var dest = logoPath + key;
    gm.resize(logoFile, dest, value, value, callback);
  }, cb);
};