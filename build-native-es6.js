import cfg from './gulp-cfg.js';
import compile from './comm/cocos-compile-es6';
import * as fs from 'fs-extra-promise-es6';
import console from 'better-console';
import moment from 'moment';

async function renameApk(ch) {
  const src = `publish/android/${cfg.projectName}-release-signed.apk`;
  const buildTime = moment().format('MMDDHHmm');
  const dest = `publish/android/${cfg.projectName}_${ch}_${buildTime}.apk`;
  await fs.rename(src, dest);
}

export default async function buildNative(ch = 'blank') {
  try {
    const [projJson, projBak] = ['project.json', 'project.json.bak'];
    await fs.move(projJson, projBak, { clobber: true });

    await compile('android');
    await renameApk(ch);

    await fs.move(projBak, projJson, { clobber: true });
  } catch (e) {
    console.error(e);
  }
}
