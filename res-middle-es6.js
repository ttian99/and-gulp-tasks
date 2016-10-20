/**
 * file type:
 *   img      独立文件
 *   tp       texturepack 合图
 *   spine    骨骼
 *   font     字体
 *   particle 粒子
 *   audio    音效
 *   shader   opengl
 */
import cfg from './gulp-cfg.js';
import _ from 'lodash';
import gulp from 'gulp';
import path from 'path';
import tp from 'tp-helper';
import ep from 'embed-particle';
import console from 'better-console';
import * as fs from 'fs-extra-promise-es6';
import {promisify} from 'node-promise-es6';
import glob from 'glob-all';
import del from 'del';
import {getOneTypeGlobs, getOneGroupFullTypes, getOneGroupTps} from './comm/group-util-es6';

const createTpFile = promisify(tp.create);
const embedParticle = promisify(ep.embed);

function copyFiles(globs, dest, opts = {}) {
  return new Promise((resolve) => {
    gulp.src(globs, opts)
      .pipe(gulp.dest(dest))
      .on('finish', resolve);
  });
}

function copyRes(fileType, dest) {
  return copyFiles(getOneTypeGlobs(fileType), dest, { base: cfg.resOrigin });
}

async function copyTp(dest) {
  const groups = _.keys(cfg.resGroup);
  for (const gName of groups) {
    const typeSet = getOneGroupTps(gName, 'tp');
    const dirs = glob.sync([...typeSet]);
    const group = cfg.resGroup[gName];
    for (const dir of dirs) {
      const tpName = path.basename(dir);
      let isNoTrim = false;
      if (group.noTrimTp && _.include(tpName, group.noTrimTp)) {
        isNoTrim = true;
      }

      await createTpFile(dir, cfg.tpTmpDir, { noTrim: isNoTrim });

      const [pngFile, plistFile] = [tpName + '.png', tpName + '.plist'];
      const preDest = dest + '/' + gName + '/tp/' + (dir.includes('/sub/') ? (tpName + '/') : '');
      await fs.copy(cfg.tpTmpDir + '/' + pngFile, preDest + pngFile);
      await fs.copy(cfg.tpTmpDir + '/' + plistFile, preDest + plistFile);
    }
  }
}

async function copyParticle(dest) {
  const fileType = 'particle';
  const groups = _.keys(cfg.resGroup);
  for (const gName of groups) {
    const typeSet = getOneGroupFullTypes(gName, fileType);
    for (const dir of typeSet) {
      const files = glob.sync(dir);
      for (const file of files) {
        if (path.extname(file) === '.plist') {
          const rel = path.relative(cfg.resOrigin, file);
          await embedParticle(file, path.dirname(path.join(dest, rel)));
        }
      }
    }
  }
}

export default async function resMiddle(dest) {
  try {
    await fs.remove(dest);
    await fs.mkdirs(dest);
    await fs.remove(cfg.tpTmpDir);

    await copyRes('img', dest);
    await copyRes('spine', dest);
    await copyRes('font', dest);
    await copyRes('audio', dest);
    await copyRes('shader', dest);
    del.sync(dest + '/**/font/*.ltr');

    await copyTp(dest);
    await copyParticle(dest);
  } catch (err) {
    console.error(err);
  }
}
