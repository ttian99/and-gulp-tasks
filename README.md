## and-gulp-tasks

for gulp task，需要放在游戏工程的tasks目录中

### 配置文件
* cfg.js
* sel-task.js 把任务添加到sel-task中

### 功能说明
* res-middle.js 在res-middle目录生成当前渠道的相关资源
  * tp合图会固定生成在res-middle/tp-tmp目录
* res-min.js 压缩资源
* res-result.js 根据middle中的资源，加上hash生成到res目录，并生成resource.js文件
* build-web.js web端打包
* build-web-star.js 消星星2特别的打包逻辑
* build-runtime.js runtime打包，所有的渠道共享
* build-native.js 可以根据渠道号打包
* run-web.js 启动调试网页
* run-native.js win32平台启动调试native程序
* res-middle-es6.js es6重构的res-middle
* res-result-es6.js es6重构的res-result

### 使用
```bash
npm i -g babel
npm i
gulp
```