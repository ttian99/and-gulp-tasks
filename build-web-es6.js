import cfg from './gulp-cfg.js';
import compile from './comm/cocos-compile-es6';
import * as fs from 'fs-extra-promise-es6';
import console from 'better-console';
import _ from 'lodash';

async function replaceProjectJson() {
  const ctx = fs.readFileSync(__dirname + '/tmpl/project.json.tmpl', 'utf-8');
  const rst = _.template(ctx)({ frameRate: 60 });
  await fs.writeFile('./publish/html5/project.json', rst);
}

export default async function buildWeb() {
  try {
    await fs.remove(cfg.webPublishPath);
    await compile('web');

    await replaceProjectJson();
  } catch (e) {
    console.error(e);
  }
}
