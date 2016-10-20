import cfg from './gulp-cfg.js';
import hs from './comm/run-hs-es6';
import qrcode from 'qrcode-terminal';
import localNet from './comm/local-net.js';
import opener from 'opener';
import * as fs from 'fs-extra-promise-es6';
import console from 'better-console';
import s from 'underscore.string';
import _ from 'lodash';
import 'colors';

const RUN_WEB = 'gulp-tasks/html/run-web.html';
function createRuntimeDebugHtml(port) {
  var props = {
    url: 'http://' + localNet.ip() + ':' + port + '/' + s.replaceAll(cfg.runDestPath, '\\\\', '/') + '/',
    projectName: cfg.projectName,
    gameName: cfg.gameName,
    packageName: cfg.packageName,
    host: localNet.ip() + ':' + port + '/' + cfg.runToolPath + '/out'
  };

  templateHtml('for-baidu.html', props);
  templateHtml('for-qqbrowser.html', props);
  templateHtml('run-game.html', props);
  templateHtml('cocosplay-tencent-debug.json', props);
}

function templateHtml(tmplName, props) {
  var ctx = fs.readFileSync('gulp-tasks/tmpl/' + tmplName + '.tmpl', 'utf-8');
  var compiled = _.template(ctx);
  var rst = compiled(props);
  fs.mkdirsSync(cfg.runToolPath + '/out/');
  fs.writeFileSync(cfg.runToolPath + '/out/' + tmplName, rst);
}

async function createRunWebHtml() {
  const ctx = fs.readFileSync('gulp-tasks/html/run-web.html.tmpl', 'utf-8');
  const compiled = _.template(ctx);
  const rst = compiled({title: cfg.gameName});
  await fs.writeFile(RUN_WEB, rst);
}

function createQrcode(port, isOpen) {
  const url = `http://${localNet.ip()}:${port}/${RUN_WEB}`;
  qrcode.generate(url);
  console.log('qrcode: ' + url.green);
  if (isOpen) opener(url);
}

export default async function runWeb(port, isOpen = false) {
  try {
    await createRunWebHtml();


    createRuntimeDebugHtml(port);

    const args = ['-c', '-1', '-p', port];
    await* [hs(port, args, '.'), createQrcode(port, isOpen)];
  } catch (e) {
    console.error(e);
  }
}