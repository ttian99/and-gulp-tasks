var compile = require('./comm/cocos-compile.js');
var async = require('async');
var cfg = require('./cfg.js');
var fs = require('fs-extra');
var path = require('path');
var log = require('debug')('build-web');
var del = require('del');
var _ = require('lodash');

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
    replIndex: function (callback) {
      log('replIndex');
      var ctx = fs.readFileSync('index.html', 'utf8');
      ctx = ctx.replace(/channel: \'.*\'/, "channel: 'wanba'");
      fs.writeFileSync('index.html', ctx);
      callback();
    },
    backMain: function (callback) {
      log('backMain');
      fs.copy('main.js', 'src/main.js', function (err) {
        fs.writeFileSync('main.js', '');
        callback();
      });
    },
    compile: function (callback) {
      log('compile');
      compile('web', callback);
    },
    concatHeader: function (callback) {
      log('concatHeader');
      concatHeader(callback);
    },
    concatLogic: function (callback) {
      log('concatLogic');
      concatLogic(callback);
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
    restoreMain: function (callback) {
      log('restoreMain');
      fs.move('src/main.js', 'main.js', {
        clobber: true
      }, callback);
    },
    copyStat: function (callback) {
      log('copyStat');
      fs.copy('src/utils/sdk/dcagent.min.js', cfg.webPublishPath + '/utils/dcagent.min.js', callback);
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

function concatHeader(cb) {
  var jsList = ['src/utils/web/header.js'];
  concatJs(jsList, 'header.min.js', cfg.webPublishPath, cb);
}

function concatLogic(cb) {
  var project = fs.readJsonSync('project.json');
  var jsList = ['src/main.js', 'src/utils/sdk/wanba.js', 'src/utils/web/footer.js'];
  jsList = jsList.concat(project.commList);
  jsList = jsList.concat(project.h5List);
  jsList = jsList.concat(project[project.curLang]);
  concatJs(jsList, cfg.projectName + '.min.js', cfg.webPublishPath, cb);
}

function injectJs(cb) {
  process.chdir(cfg.webPublishPath);
  gulp.src('index.html')
    .pipe(inject(gulp.src('header.min_*.js', {
      read: false
    }), {
      starttag: '<!-- head:js -->',
      endtag: '<!-- endinject -->',
      transform: function(filepath, file, i, length) {
        return '<script src="' + path.basename(filepath) + '"></script>';
      }
    }))
    .pipe(inject(gulp.src(cfg.projectName + '.min_*.js', {
      read: false
    }), {
      starttag: '<!-- logic:js -->',
      endtag: '<!-- endinject -->',
      transform: function(filepath, file, i, length) {
        return '<script src="' + path.basename(filepath) + '"></script>';
      }
    }))
    .pipe(inject(gulp.src('game.min_*.js', {
      read: false
    }), {
      starttag: '<!-- engine:js -->',
      endtag: '<!-- endinject -->',
      transform: function(filepath, file, i, length) {
        return '<script cocos id="engine" src="' + path.basename(filepath) + '"></script>';
      }
    }))
    .pipe(replace('src/utils/sdk/dcagent.min.js?v=0.1.3', 'utils/dcagent.min.js?v=0.1.3'))
    .pipe(gulp.dest('./'))
    .on('finish', function() {
      process.chdir('../..');
      cb && cb();
    });
}

function concatJs(jsList, concatName, destDir, cb) {
  var hashName = '';
  gulp.src(jsList)
    .pipe(sourcemaps.init())
    .pipe(concat(concatName))
    .pipe(uglify())
    .pipe(md5(7))
    .pipe(sourcemaps.write('maps'))
    .on('data', function (file) {
    hashName = path.basename(file.path);
  })
    .pipe(gulp.dest(destDir))
    .on('finish', function () {
    cb && cb(null, hashName);
  });
};