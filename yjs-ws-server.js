const Y = require('yjs');

const minimist = require('minimist')
require('y-memory')(Y)
try {
  require('y-leveldb')(Y)
} catch (err) {}

try { // try to require local y-websockets-server
  require('./y-websockets-server.js')(Y)
} catch (err) { // otherwise require global y-websockets-server
  require('y-websockets-server')(Y)
}

global.yInstances = {}

module.exports = (io) => {
  module.options = minimist(process.argv.slice(2), {
    string: ['port', 'debug', 'db'],
    default: {
      port: process.env.PORT || '1234',
      debug: false,
      db: 'memory'
    }
  })

  module.getInstanceOfY = function(room) {
    if (global.yInstances[room] == null) {
      global.yInstances[room] = Y({
        db: {
          name: module.options.db,
          dir: 'y-leveldb-databases',
          namespace: room
        },
        connector: {
          name: 'websockets-server',
          room: room,
          io: io,
          debug: !!module.options.debug
        },
        share: {}
      })
    }
    return global.yInstances[room];
  }

  return module;
}