// @todo: Refactor / clean up code.
// @todo: Combine the two debugs into one.
const debugYjsWS = require('debug')('YjsWS')

const Y = require('yjs');

// @todo: Add Y.debug.log
debug(Y)
debug('Y.debug:', Y.debug)

const minimist = require('minimist')
require('y-memory')(Y)
try {
  require('y-leveldb')(Y)
} catch (err) {}

try {
  require('./y-websockets-server.js')(Y)  // Doesn't exist...
} catch (err) {
  require('y-websockets-server')(Y)       // <-- This one is called.
}

global.yInstances = {}

module.exports = (io, socket) => {
  debugYjsWS('[NEXT LINE: "const options = minimist(process.argv.slice(2), {..."]')
  debugYjsWS('    process.argv=', process.argv)
  const options = minimist(process.argv.slice(2), {
    string: ['port', 'debug', 'db'],
    default: {
      port: process.env.PORT || 3000,
      debug: false,
      db: 'memory'
    }
  })

  const getInstanceOfY = function(room) {
    debugYjsWS(`[getInstanceOfY(room)] arguments: `, arguments);
    if (global.yInstances[room] == null) {
      debugYjsWS('[NEXT LINE: "      global.yInstances[room] = Y({..."]')
      global.yInstances[room] = Y({
        db: {
          name: options.db,
          dir: 'y-leveldb-databases',
          namespace: room
        },
        connector: {
          name: 'websockets-server',
          room: room,
          io: io,
          debug: !!options.debug
        },
        share: {}
      })
    }
    debugYjsWS('[NEXT LINE: "return global.yInstances[room];"]')
    return global.yInstances[room];
  }

  let rooms = [];

  socket.on('joinRoom', (room) => {
    debugYjsWS(`[socket.on('joinRoom', fn)] room: ${room}`);
    debugYjsWS('User "%s" joins room "%s"', socket.id, room);
    socket.join(room);
    getInstanceOfY(room).then((y) => {
      if (rooms.indexOf(room) === -1) {
        y.connector.userJoined(socket.id, 'slave');
        rooms.push(room);
      }
    });
  });

  socket.on('yjsEvent', (msg) => {
    debugYjsWS(`[socket.on('yjsEvent', fn)] msg: ${msg}`);
    if (msg.room != null) {
      getInstanceOfY(msg.room).then((y) => {
      debugYjsWS('[PREV LINE: "getInstanceOfY(msg.room).then((y) => {"...]')
        y.connector.receiveMessage(socket.id, msg);
      });
    }
  });

  socket.on('disconnect', () => {
    debugYjsWS(`[socket.on('disconnect', fn)]`);
    for (var i = 0; i < rooms.length; i++) {
      let room = rooms[i];
      getInstanceOfY(room).then((y) => {
      debugYjsWS('[PREV LINE: "getInstanceOfY(msg.room).then((y) => {"...]')
        var i = rooms.indexOf(room);
        if (i >= 0) {
          y.connector.userLeft(socket.id);
          rooms.splice(i, 1);
        }
      })
    }
  });

  socket.on('leaveRoom', (room) => {
    debugYjsWS(`[socket.on('leaveRoom')] room: ${room}`);
    getInstanceOfY(room).then((y) => {
      debugYjsWS('[PREV LINE: "getInstanceOfY(msg.room).then((y) => {"...]')
      var i = rooms.indexOf(room);
      if (i >= 0) {
        y.connector.userLeft(socket.id);
        rooms.splice(i, 1);
      }
    });
  });

  // @todo: Check if this return value gets used anywhere.
  return module;
}
