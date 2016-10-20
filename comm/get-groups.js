var fs = require('fs-extra');
var _ = require('lodash');

module.exports = function getGroups(groupFile, ch) {
  var all = fs.readJsonSync(groupFile);
  var groups = all.default;
  if (ch) {
    _.merge(groups, all[ch], function (a, b) {
      if (_.isArray(a)) {
        return a.concat(b);
      }
    });
  }
  return groups;
}