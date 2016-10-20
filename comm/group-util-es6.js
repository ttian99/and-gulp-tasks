import cfg from '../gulp-cfg.js';
import _ from 'lodash';
import glob from 'glob-all';

function arrToSet(arr = [], inSet) {
  arr.forEach(item => inSet.add(item));
}

export function getOneGroupTps(gName) {
  let typeSet = new Set();
  const group = cfg.resGroup[gName];

  _.keys(group.sub).forEach(subKey => {
    arrToSet(group.sub[subKey].tp, typeSet);
  });

  typeSet = new Set([...typeSet].map(val => `${cfg.resOrigin}/${gName}/tp/sub/${val}/`));

  typeSet.add(`${cfg.resOrigin}/${gName}/tp/!(sub)/`);
  return typeSet;
}

export function getOneGroupFullTypes(gName, fileType) {
  let typeSet = new Set();
  const group = cfg.resGroup[gName];

  _.keys(group.sub).forEach(subKey => {
    arrToSet(group.sub[subKey][fileType], typeSet);
  });

  typeSet = new Set([...typeSet].map(val => `${cfg.resOrigin}/${gName}/${fileType}/${val}`));
  typeSet.add(`${cfg.resOrigin}/${gName}/${fileType}/*.*`);

  return typeSet;
}

export function getOneTypeGlobs(fileType) {
  const globs = [];
  _.keys(cfg.resGroup).forEach(gName => {
    const typeSet = getOneGroupFullTypes(gName, fileType);
    globs.push(...typeSet);
  });
  return globs;
}

export function getSubGroupFiles(gName, subName, dir) {
  const subGroup = cfg.resGroup[gName].sub[subName];
  const types = ['img', 'spine', 'font', 'particle', 'audio'];
  const subFiles = {};
  types.forEach(fileType => {
    if (subGroup[fileType]) {
      const globs = subGroup[fileType].map(item => `${dir}/${gName}/${fileType}/${item}`);
      subFiles[fileType] = glob.sync(globs);
    }
  });

  if (subGroup.tp) {
    const globs = subGroup.tp.map(item => `${dir}/${gName}/tp/${item}/*.*`);
    subFiles.tp = glob.sync(globs);
  }
  return subFiles;
}
