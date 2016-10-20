var compile = require('./comm/cocos-compile.js');
var async = require('async');
var cfg = require('./cfg.js');
var fs = require('fs-extra');
var path = require('path');
var log = require('debug')('build-web');
var del = require('del');
var _ = require('lodash');
var glob = require('glob');

var gulp = require('gulp');
var inject = require('gulp-inject');
var replace = require('gulp-replace');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var md5 = require('gulp-md5');
var sourcemaps = require('gulp-sourcemaps');

var hrf = require('hash-rename-file');

module.exports = function buildWeb(cb) {
  del.sync(cfg.webPublishPath);
  async.series({
    compile: function (callback) {
      log('compile');
      compile('web', callback);
    },
    hashMain: function (callback) {
      log('hashMain');
      hrf(cfg.webPublishPath + 'game.min.js', cfg.webPublishPath, callback);
    },
    inject: function (callback) {
      log('inject');
      del.sync(cfg.webPublishPath + 'game.min.js');
      injectJs(callback);
    },
    replProject: function(callback) {
      log('replProject');
      var ctx = fs.readFileSync(__dirname + '/tmpl/project.json.tmpl', 'utf-8');
      var compiled = _.template(ctx);
      var rst = compiled({ frameRate: 60 });
      fs.writeFileSync('./publish/html5/project.json', rst);
      callback();
    }
  }, function (err, results) {
    cb(err, results);
  });
};

function injectJs(cb) {
  process.chdir(cfg.webPublishPath);
  var files = glob.sync('game.min_*.js');
  gulp.src('index.html')
    .pipe(replace('game.min.js', files[0]))
    .pipe(gulp.dest('./'))
    .on('finish', function() {
      process.chdir('../..');
      cb && cb();
    });
}
