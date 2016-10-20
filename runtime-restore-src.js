var fs = require('fs-extra');

function restoreSrc() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync('src-tmp')) return reject('src-tmp unexist');
    fs.removeSync('src');
    fs.move('src-tmp', 'src', resolve);
  });
}

module.exports = restoreSrc;
