/**
 * 打包流程
 *    1. 修改frameworks\runtime-src\proj.android\build-cfg.json
 *       [modify] from: src -> from: src-tmp/src
 *       [Add] from: assets-tmp, to: ''
 *       [Add] from: libs-tmp, to: '../libs'
 */


var compile = require('./comm/cocos-compile.js');
var async = require('async');
var fs = require('fs-extra');
var del = require('del');
var log = require('debug')('build-native');
var cfg = require('./cfg.js');
var gulp = require('gulp');
var moment = require('moment');
var path = require('path');

var project = null;

module.exports = function buildNative(ch, cb) {
  async.series({
    replProject: function (callback) {
      log('replProject');
      fs.move('project.json', 'project.json.bak', { clobber: true }, function () {
        project = fs.readJsonSync('project.json.bak');
        project.channel = 'native';
        project.platform = ch;
        fs.writeJsonSync('project.json', project);
        callback();
      });
    },
    src2Tmp: function (callback) {
      log('src2Tmp');
      src2Tmp(callback);
    },
    clearProj: function (callback) {
      log('clearProj');
      clearProj();
      callback();
    },
    copySdk: function (callback) {
      log('copySdk');
      copySdk(ch);
      callback();
    },
    compile: function (callback) {
      log('compile');
      compile('android', callback);
    },
    renameApk: function (callback) {
      var filePath = 'publish/android/' + cfg.projectName + '-release-signed.apk';
      var extname = path.extname(filePath);
      var buildTime = moment().format('MMDDHHmm');
      var dest = 'publish/android/' + cfg.projectName + '_' + project.platform + '_' + buildTime + extname;
      fs.rename(filePath, dest, callback);
    },
    restoreProject: function (callback) {
      log('restoreProject');
      del.sync('src-tmp');
      fs.move('project.json.bak', 'project.json', { clobber: true }, callback);
    }
  }, function (err, results) {
    cb(err, results);
  });
};

function clearProj() {
  fs.removeSync("frameworks/runtime-src/proj.android/src");
  fs.removeSync("frameworks/runtime-src/proj.android/res");
  fs.removeSync("frameworks/runtime-src/proj.android/libs");
  fs.removeSync("frameworks/runtime-src/proj.android/libs-tmp");
  fs.removeSync("frameworks/runtime-src/proj.android/assets");
  fs.removeSync("frameworks/runtime-src/proj.android/assets-tmp");
  fs.removeSync("frameworks/runtime-src/proj.android/AndroidManifest.xml");
  fs.removeSync("frameworks/runtime-src/proj.android/.classpath");
  fs.removeSync("frameworks/runtime-src/proj.android/project.properties");

  fs.removeSync("frameworks/runtime-src/proj.android/sdk");
  fs.removeSync("frameworks/runtime-src/proj.android/alipay_lib");
  fs.removeSync("frameworks/runtime-src/proj.android/runtime");
}

function copySdk(ch) {
  fs.mkdirsSync('frameworks/runtime-src/proj.android/assets');
  fs.mkdirsSync('frameworks/runtime-src/proj.android/assets-tmp');
  fs.mkdirsSync('frameworks/runtime-src/proj.android/libs');
  fs.mkdirsSync('frameworks/runtime-src/proj.android/libs-tmp');
  fs.copySync('frameworks/native-sdk/' + ch, 'frameworks/runtime-src/proj.android');
  fs.copySync('frameworks/runtime-src/proj.android/assets', 'frameworks/runtime-src/proj.android/assets-tmp');
  fs.copySync('frameworks/runtime-src/proj.android/libs', 'frameworks/runtime-src/proj.android/libs-tmp');
}

function src2Tmp(cb) {
  var fileList = project.jsList;
  fileList = fileList.concat(project.commList);
  fileList = fileList.concat(project.naList);
  fileList = fileList.concat(project[project.curLang]);
  if (project.platform !== 'normal') {
    fileList = fileList.concat(project[project.platform]);
  }
  gulp.src(fileList, { base: '.' })
    .pipe(gulp.dest('src-tmp'))
    .on('finish', function () {
      cb && cb();
    });
}