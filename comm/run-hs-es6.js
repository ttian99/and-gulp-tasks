import spawn from './spawn-es6';

export default async function hs(port, args, cwd) {
  await spawn('hs.cmd', args, {cwd});
}
