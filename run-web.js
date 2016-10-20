var cfg = require('./cfg');
var hs = require('./comm/run-hs.js');
var qrcode = require('qrcode-terminal');
var localNet = require('./comm/local-net.js');
var opener = require('opener');
var fs = require('fs-extra');
var _ = require('lodash');
var s = require('underscore.string');
require('colors');

module.exports = function runWeb(port, isOpen, cb) {
  createRunWebHtml();

  var args = ['-c', '-1', '-p', port];
  hs(port, args, '.', cb);

  var url = 'http://' + localNet.ip() + ':' + port + '/gulp-tasks/html/run-web.html';

  qrcode.generate(url);
  console.log('qrcode:  ' + url.green);

  if (isOpen) {
    opener(url);
  }

  createRuntimeDebugHtml(port);
};

function createRunWebHtml() {
  var props = {
    title: cfg.gameName
  };

  var ctx = fs.readFileSync('gulp-tasks/html/run-web.html.tmpl', 'utf-8');
  var compiled = _.template(ctx);
  var rst = compiled(props);
  fs.writeFileSync('gulp-tasks/html/run-web.html', rst);
}

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