var gulp = require('gulp');
var async = require('async');
var getGroups = require('./comm/get-groups.js');
var log = require('debug')('res-result');
var hrf = require('hash-rename-file');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var glob = require('glob-all');
var s = require('underscore.string');
var plist = require('plist');
var cfg = require('./cfg.js');

var g = {
  groups: null,
  destPath: null,
  origPath: null,
  resPath: 'src/loader/resource.js',
  miniResPath: 'src/loader/resource-mini.js',
  isMini: false,
  ch: null
};

module.exports = function (srcPath, destPath, opts, cb) {
  if (typeof (opts) === 'function') {
    cb = opts;
    opts = {};
  }
  g.ch = opts.ch;
  g.groups = getGroups(cfg.groupFile, opts.ch || 'default');
  g.destPath = destPath;
  g.origPath = srcPath;
  g.isMini = opts.mini;
  async.series({
    aloneImg: function (callback) {
      log('aloneImg'.green);
      hashFiles('/*.+(jpg|png)', 'default', callback);
    },
    tp: function (callback) {
      log('tp'.green);
      hashFiles('/**/tp/*.plist', 'tp', callback);
    },
    spine: function (callback) {
      log('spine'.green);
      hashFiles('/**/spine/*.atlas', 'spine', callback);
    },
    audio: function (callback) {
      log('audio');
      hashFiles('/**/*.+(mp3|ogg)', 'default', callback);
    },
    font: function (callback) {
      log('font');
      hashFiles('/**/font/*.fnt', 'fnt', callback);
    },
    particle: function (callback) {
      log('particle');
      hashFiles('/**/particles/*.plist', 'default', callback);
    }
  }, function (err, results) {
    if (err) {
      log(new Error(err));
    }
    createResJs(opts.mini, cb);
  });
};

function hashFiles(src, type, done) {
  async.forEachOf(g.groups, function (value, group, cb) {
    hrf(path.join(g.origPath, group) + src, g.destPath, {
      type: type,
      base: g.origPath
    }, function () {
      cb();
    });
  }, done);
}

function createResJs(isMini, cb) {
  log('createResJs ' + isMini);
  var resList = {};
  var priorities = [];
  var preloads = [];
  for (var group in g.groups) {
    var obj = resList[group] = {};
    groupList(group, obj);

    var gp = g.groups[group];
    if (gp.priority < 0) {
      preloads.push(group);
    } else {
      if (gp.preload !== false) {
        var idx = gp.priority;
        priorities[idx] = priorities[idx] || [];
        priorities[idx].push(group);
      }
    }
  }

  resList.fnt = getExtList('fnt');
  resList.audio = getExtList('mp3');
  resList.spine = getExtList('atlas', 'spine');
  var rst = {
    miniCond: (g.isMini ? 'Cfg.isMini' : '!Cfg.isMini'),
    resList: JSON.stringify(resList, null, 2),
    resInList: JSON.stringify(getTpList(), null, 2),
    priorities: JSON.stringify(priorities),
    preloads: JSON.stringify(preloads)
  };

  var tmpl = '/tmpl/resource.tmpl';
  // if (g.ch === 'web') {
  //   tmpl = '/tmpl/resource-web.tmpl';
  // }
  var ctx = fs.readFileSync(__dirname + tmpl, 'utf8');
  var cpl = _.template(ctx)(rst);
  var resFile = isMini ? g.miniResPath : g.resPath;
  fs.writeFileSync(resFile, cpl);
  cb();
}

// 编译group下的所有文件，添加到对应res分组中
function groupList(group, obj) {
  var dir = (g.isMini ? 'res-mini' : 'res') + '/';
  var files = glob.sync(dir + group + '/**/*.*');
  files.forEach(function (file) {
    var ext = path.extname(file);
    var base = path.basename(file, ext);
    base = innerBase(base);
    var key = base + '_' + s.strRight(ext, '.');
    if (g.isMini) {
      file = s.strRight(file, '/');
    }
    obj[key] = file;
  });
}

// tp
function getTpList() {
  var dir = (g.isMini ? 'res-mini' : 'res') + '/';
  var rst = {};
  var files = glob.sync(dir + '*/tp/*.plist');
  files.forEach(function (file) {
    var obj = plist.parse(fs.readFileSync(file, 'utf8'));
    var ext = path.extname(file);
    var base = path.basename(file, ext);
    base = innerBase(base);
    var group = rst[base] = {};
    for (var frame in obj.frames) {
      group[path.parse(frame).name] = '#' + frame;
    }
  });
  return rst;
}

function getExtList(ext, type) {
  var dir = (g.isMini ? 'res-mini' : 'res') + '/';
  var files = glob.sync(dir + '**/*.' + ext);
  var rst = {};
  files.forEach(function (file) {
    var ext = path.extname(file);
    var base = path.basename(file, ext);
    base = innerBase(base);
    if (g.isMini) {
      file = s.strRight(file, '/');
    }
    rst[base] = file;

    if (type === 'spine') {
      rst[base + '_json'] = s.strLeftBack(file, '.') + '.json';
    }
  });
  return rst;
}

function innerBase(base) {
  if (base.match('_[0-9a-f]{7}$')) {
    base = s.strLeftBack(base, '_');
  }
  return base;
}