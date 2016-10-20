import cfg from '../gulp-cfg.js';
import os from 'os';
import console from 'better-console';
import spawn from './spawn-es6';

async function compileRuntime() {
  const cmd = 'python';
  const args = ['PackageCreator.pyc', '-s', process.cwd()];
  await spawn(cmd, args, { cwd: cfg.runToolPath });
}

async function compileCocos(pf) {
  const cmd = 'cocos' + ((os.platform() === 'win32') ? '.bat' : '');
  const args = ['compile', '-m', 'release', '-p', pf];
  await spawn(cmd, args);
}

export default async function compile(pf = 'runtime') {
  switch (pf) {
    case 'runtime':
      await compileRuntime();
      break;
    case 'web':
    case 'android':
    case 'ios':
      await compileCocos(pf);
      break;
    default:
      console.error(new Error('unknow pf ' + pf));
  }
}