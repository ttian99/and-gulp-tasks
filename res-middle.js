var gulp = require('gulp');
var path = require('path');
var async = require('async');
var log = require('debug')('res-middle');
var ep = require('embed-particle');
var glob = require('glob-all');
var tp = require('tp-helper');
var gmHelper = require('gm-helper');
var scaleFnt = require('scale-fnt');
var getGroups = require('./comm/get-groups.js');
var cfg = require('./cfg.js');
var fs = require('fs-extra');
require('colors');

var g = {
  groups: null, // groups from group.json
  destPath: null,
  origPath: 'res-origin',
  scale: 1,     // img scale rate
  maxSize: 1024, // tp maxSize
  isMini: false
};

module.exports = function (destPath, opts, cb) {
  if (typeof (opts) === 'function') {
    cb = opts;
    opts = {};
  }

  g.scale = opts.scale || 1;
  g.maxSize = opts.maxSize || 1024;
  g.isMini = opts.mini;

  g.groups = getGroups(cfg.groupFile, opts.ch || 'default');
  g.destPath = destPath;
  async.series({
    aloneImg: function (callback) {
      log('aloneImg'.green);
      var aloneScr = '/*.+(jpg|png)';
      if (g.scale === 1) {
        copyFilesInGroup(aloneScr, callback);
      } else {
        copyImgsAndMinInGroup(aloneScr, callback);
      }
    },
    spine: function(callback) {
      log('spine'.green);
      copyFilesInGroup('/**/spine/*.*', callback);
    },
    tp: function (callback) {
      log('tp'.green);
      createTpFiles(callback);
    },
    audio: function (callback) {
      log('audio'.green);
      copyFilesInGroup('/**/*.+(mp3|ogg)', callback);
    },
    font: function (callback) {
      log('font'.green);
      if (g.scale === 1) {
        copyFilesInGroup('/**/font/*.+(fnt|png)', callback);
      } else {
        copyFntAndMinInGroup('/**/font/*.fnt', callback);
      }
    },
    particle: function (callback) {
      log('particle'.green);
      copyParticleFiles('/**/particles/*.plist', callback);
    }
  }, function (err, results) {
    log('res-middle end');
    if (err) {
      log(new Error(err));
    }
    cb(err, results);
  });
};

function copyFilesInGroup(src, done) {
  async.forEachOf(g.groups, function (value, group, cb) {
    gulp.src(path.join(g.origPath, group) + src, { base: g.origPath })
      .pipe(gulp.dest(g.destPath))
      .on('finish', cb);
  }, done);
}

function copyImgsAndMinInGroup(src, done) {
  async.forEachOf(g.groups, function (value, group, cb) {
    var files = glob.sync(path.join(g.origPath, group) + src);
    async.map(files, function (file, callback) {
      var rel = path.relative(g.origPath, file);
      gmHelper.scale(file, path.join(g.destPath, rel), g.scale, g.scale, callback);
    }, cb);
  }, done);
}

function copyFntAndMinInGroup(src, done) {
  async.forEachOf(g.groups, function (value, group, cb) {
    var files = glob.sync(path.join(g.origPath, group) + src);
    async.map(files, function (file, callback) {
      var rel = path.relative(g.origPath, file);
      scaleFnt(file, path.dirname(path.join(g.destPath, rel)), g.scale,  callback);
    }, cb);
  }, done);
}

function copyParticleFiles(src, done) {
  async.forEachOf(g.groups, function (value, group, cb) {
    var files = glob.sync(path.join(g.origPath, group) + src);
    async.map(files, function (file, callback) {
      log('embed particle file ' + file);
      var rel = path.relative(g.origPath, file);
      ep.embed(file, path.dirname(path.join(g.destPath, rel)), callback);
    }, cb);
  }, done);
}

function createTpFiles(done) {
  async.forEachOf(g.groups, function (value, group, cb) {
    if (value.tp) {
      var outdir = path.join(g.destPath, group, 'tp');
      var tmpdir = 'res-middle/' + (g.isMini ? 'tp-mini-tmp' : 'tp-tmp');
      async.map(value.tp, function (tpName, callback) {
        var srcdir = path.join(g.origPath, group, tpName);
        var opts = {
          maxSize: g.maxSize,
          scale: g.scale
        };
        tp.create(srcdir, tmpdir, opts, function(err) {
          fs.copySync(tmpdir + '/' + tpName + '.png', outdir + '/' + tpName + '.png');
          fs.copySync(tmpdir + '/' + tpName + '.plist', outdir + '/' + tpName + '.plist');
          callback(err);
        });
      }, cb);
    } else {
      cb();
    }
  }, done);
}