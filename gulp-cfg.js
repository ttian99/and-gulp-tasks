import fs from 'fs-extra';

export default {
  // runtime分组文件
  runGroupFile: 'group.json',

  // 工程名
  projectName: null,

  // 中文游戏名
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

  // 原始图片路径
  resOrigin: 'res-origin',

  // 图片分组描述文件名
  resGroupFile: 'res-group.json',

  // 资源分组信息
  resGroup: null,

  // tp临时目录
  tpTmpDir: 'res-middle/tp-tmp',

  // 中间文件路径
  resMiddle: 'res-middle',

  // 最终生成resource.js位置
  resFilePath: 'lib/loader/resource.js',

  // proj.json obj
  projObj: null,

  init(projectName, gameName) {
    this.projectName = projectName;
    this.gameName = gameName;
    this.packageName = 'org.zeusky.' + projectName;
    this.runDestPath = `${this.runToolPath}/out/${this.packageName}/1`;

    const file = `${this.resOrigin}/${this.resGroupFile}`;
    this.resGroup = fs.readJsonSync(file);
    this.projObj = fs.readJsonSync('project.json');
  },
};
