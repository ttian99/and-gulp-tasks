import cfg from './gulp-cfg.js';
import _ from 'lodash';
import path from 'path';
import hashRenameFile from 'hash-rename-file';
import {promisify} from 'node-promise-es6';
import * as fs from 'fs-extra-promise-es6';
import glob from 'glob-all';
import plist from 'plist';
import s from 'underscore.string';
import {getSubGroupFiles} from './comm/group-util-es6';

const hrf = promisify(hashRenameFile);
let [middleDir, destDir] = [null, null];

async function hashFiles(src, dest, type) {
  for (const group of _.keys(cfg.resGroup)) {
    const srcGlob = path.join(middleDir, group) + src;
    await hrf(srcGlob, dest, {
      type: type,
      base: middleDir,
    });
  }
}

function originName(file) {
  let name = path.parse(file).name;
  if (name.match('_[0-9a-f]{7}$')) {
    name = s.strLeftBack(name, '_');
  }
  const ext = path.extname(file);
  name += '_' + s.strRight(ext, '.');
  return name;
}

function getResInObj() {
  const resIn = {};
  const files = glob.sync(middleDir + '/**/tp/**/*.plist');
  files.forEach(file => {
    const name = path.basename(file, '.plist');
    const group = resIn[name] = {};

    const obj = plist.parse(fs.readFileSync(file, 'utf8'));
    for (const frame in obj.frames) {
      if (obj.frames.hasOwnProperty(frame)) {
        group[path.parse(frame).name] = '#' + frame;
      }
    }
  });
  return resIn;
}

function getResObj() {
  const res = {};
  _.keys(cfg.resGroup).forEach(gName => {
    const files = glob.sync(destDir + '/' + gName + '/img/**/*.*');
    const group = res[gName] = {};
    files.forEach(file => (group[originName(file)] = file));
  });

  const types = {
    tp: '/**/*.*',
    spine: '/**/*.+(json|atlas)',
    font: '/**/*.fnt',
    particle: '/**/*.*',
    audio: '/**/*.*',
    shader: '/**/*.*',
  };

  _.keys(types).forEach(fileType => {
    const group = res[fileType] = {};
    const files = glob.sync(destDir + '/**/' + fileType + types[fileType]);
    files.forEach(file => (group[originName(file)] = file));
  });
  return res;
}

function getResLoadObj() {
  const resLoad = {};
  _.keys(cfg.resGroup).forEach(gName => {
    const group = cfg.resGroup[gName];
    resLoad[gName] = {};
    const types = ['img', 'tp', 'spine', 'particle', 'font', 'audio', 'shader'];
    types.forEach(fileType => {
      const dirGlob = destDir + '/' + gName + '/' + fileType + '/*.*';
      const files = glob.sync(dirGlob);

      if (files.length !== 0) resLoad[gName][fileType] = files;
    });

    _.keys(group.sub).forEach(subName => {
      resLoad[gName + ':' + subName] = getSubGroupFiles(gName, subName, destDir);
    });
  });
  return resLoad;
}

async function createResJs() {
  const rst = {
    resIn: JSON.stringify(getResInObj(), null, 2),
    res: JSON.stringify(getResObj(), null, 2),
    resLoad: JSON.stringify(getResLoadObj(), null, 2),
    resGroup: JSON.stringify(cfg.resGroup, null, 2),
  };

  const tmp = __dirname + '/tmpl/resource.tmpl.js';
  const ctx = fs.readFileSync(tmp, 'utf8');
  const cpl = _.template(ctx)(rst);
  await fs.writeFile(cfg.resFilePath, cpl);
}

export default async function resResult(src, dest, needHash = true) {
  [middleDir, destDir] = [src, dest];

  try {
    await fs.remove(dest);

    if (needHash) {
      await hashFiles('/**/img/**/*.*', dest, 'default'); // img
      await hashFiles('/**/tp/**/*.plist', dest, 'tp');
      await hashFiles('/**/spine/**/*.atlas', dest, 'spine');
      await hashFiles('/**/audio/**/*', dest, 'default');
      await hashFiles('/**/font/**/*.fnt', dest, 'fnt');
      await hashFiles('/**/particle/**/*.plist', dest, 'default');
      await hashFiles('/**/shader/**/*.*', dest, 'default');
    } else {
      await fs.copy(src, dest);
    }

    // 生成resource.js
    await createResJs();
  } catch (err) {
    console.error(err);
  }
}
