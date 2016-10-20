var fs = require('fs-extra');
var path = require('path');
var project = fs.readJsonSync('project.json');
var async = require('async');
var _ = require('lodash');
var glob = require('glob-all');
var getGroups = require('./comm/get-groups.js');
var cfg = require('./cfg.js');

function createGroup() {
  // js文件，放置在boot中
  var jsList = project.jsList;
  jsList = jsList.concat(project.commList);
  jsList = jsList.concat(project.naList);
  jsList = jsList.concat(project.runList);

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
}

function copySrcFiles() {
  var fileList = project.jsList;
  fileList = fileList.concat(project.commList);
  fileList = fileList.concat(project.naList);
  fileList = fileList.concat(project.runList);
  fileList = fileList.concat(project[project.curLang]);
  if (project.platform !== 'normal') {
    fileList = fileList.concat(project[project.platform]);
  }
  fileList = _.compact(fileList);
  fileList.forEach(file => {
    var relPath = path.relative('src', file);
    fs.copySync(file, path.join('src-mid-tmp', relPath));
  });
}

function backupSrc() {
  console.log('in backupSrc');
  return new Promise((resolve, reject) => {
    if (fs.existsSync('src-tmp')) return reject('src-tmp exist');
    createGroup();
    copySrcFiles();
    async.series([
      function(callback) {
        console.log('src => src-tmp');
        fs.move('src', 'src-tmp', callback);
      },
      function(callback) {
        console.log('src-mid-tmp => src');
        fs.move('src-mid-tmp', 'src', callback);
      },
    ],
    function(err, results) {
      console.log('backupSrc end');
      if (err) return reject();
      resolve();
    });
  });
}

module.exports = backupSrc;
