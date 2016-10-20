var path = require('path');

module.exports = {
  // 原始的分组定义文件
  groupFile: 'res-origin/group.json',

  // runtime分组文件
  runGroupFile: 'group.json',

  // 工程名
  projectName: null,

  // 游戏名
  gameName: null,

  // 工程包名
  packageName: null,

  // runtime编译环境
  runToolPath: 'frameworks/runtime-tools/package-creator',

  // runtime生成路径
  runDestPath: null,

  // native调试目录
  nativeDebugPath: 'frameworks/runtime-src/proj.win32/Debug.win32',

  // native打包资源目录
  nativeProjPath: 'frameworks/runtime-src/proj.android/',

  // web打包目录
  webPublishPath: 'publish/html5/',

  // web调试端口
  debugPort: 8090,

  init: function(projectName, gameName) {
    this.projectName = projectName;
    this.gameName = gameName;
    this.packageName = 'org.zeusky.' + projectName;
    this.runDestPath = path.join(this.runToolPath, 'out', this.packageName, '1');
  }
};