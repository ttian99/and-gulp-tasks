var compile = require('./comm/cocos-compile.js');
var async = require('async');
var log = require('debug')('build-runtime');
var glob = require('glob-all');
var getGroups = require('./comm/get-groups.js');
var fs = require('fs-extra');
var project = fs.readJsonSync('project.json');
var cfg = require('./cfg.js');
var path = require('path');

var pf = 'runtime';
module.exports = function buildRuntime(cb) {
  async.series({
    createGroup: function (callback) {
      log('createGroup');
      createGroup(callback);
    },
    replProject: function (callback) {
      log('replProject');
      fs.move('project.json', 'project.json.bak', { clobber: true }, function () {
        var json = fs.readJsonSync('project.json.bak');
        json.jsList = json.jsList.concat(json.commList);
        json.jsList = json.jsList.concat(json.naList);
        json.jsList = json.jsList.concat(json.runList);
        json.jsList = json.jsList.concat(project[project.curLang]);
        delete json.commList;
        delete json.naList;
        delete json.runList;
        delete json.h5List;
        delete json.curProject;

        json.channel = pf;
        fs.writeJsonSync('project.json', json);
        callback();
      });
    },
    compile: function (callback) {
      log('compile');
      compile(pf, callback);
    },
    restoreProject: function (callback) {
      log('restoreProject');
      fs.move('project.json.bak', 'project.json', { clobber: true }, callback);
    }
  }, function (err, results) {
    cb(err, results);
  });
};

function createGroup(cb) {
  // js文件，放置在boot中
  var jsList = project.jsList;
  jsList = jsList.concat(project.commList);
  jsList = jsList.concat(project.naList);
  jsList = jsList.concat(project.runList);
  jsList = jsList.concat(project[project.curLang]);

  // runtime自带资源
  var res_engine_list = glob.sync(['res_engine/*.*']);
  jsList = jsList.concat(res_engine_list);

  var rewire = require('rewire');
  var lib = rewire('../src/loader/resource.js');
  var res = lib.__get__('res');

  var groups = getGroups(cfg.groupFile, 'runtime');
  var rst = {
    boot: {
      priority: 0,
      files: jsList
    }
  };

  var groupList = null;
  for (var name in groups) {
    if (groups[name].priority <= 0) {
      groupList = res[name];
      for (var key in groupList) {
        rst.boot.files.push(groupList[key])
      }
    } else {
      rst[name] = {
        priority: groups[name].priority
      };

      rst[name].files = [];
      groupList = res[name];
      for (var key in groupList) {
        rst[name].files.push(groupList[key])
      }
    }
  }

  fs.writeFileSync(cfg.runGroupFile, JSON.stringify(rst, null, 2));
  cb && cb();
}