import {spawn} from 'child_process';
import iconv  from 'iconv-lite';
import console from 'better-console';

export default function innerSpawn(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const ls = spawn(cmd, args, opts);

    ls.stdout.on('data', (data) => console.log(iconv.decode(data, 'gbk')));
    ls.stderr.on('data', (data) => console.error(iconv.decode(data, 'gbk')));

    ls.on('exit', (code) => resolve(code));
  });
}
