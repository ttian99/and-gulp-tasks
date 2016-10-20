import lossyImagemin from 'lossy-imagemin';
import {promisify} from 'node-promise-es6';
const imagemin = promisify(lossyImagemin);
import del from 'del';

export default async function resImagemin(src, dest) {
  del.sync(dest);
  await imagemin(src + '/**/*.*', dest, { base: src, cache: false });
}
