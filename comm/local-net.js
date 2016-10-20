var os = require('os');
var s = require('underscore.string');

var localIp = null;

exports.ip = function() {
  if (localIp) {
    return localIp;
  }

  var net = os.networkInterfaces();
  for (var inters in net) {
    net[inters].forEach(function (i) {
      if (s.startsWith(i.address, '192.168.1.')) {
        localIp = i.address;
      }
    });
  }
  return localIp || '0.0.0.0';
}
