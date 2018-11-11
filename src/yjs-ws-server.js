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

module.exports = (io, socket) => {
  const options = minimist(process.argv.slice(2), {
    string: ['port', 'debug', 'db'],
    default: {
      port: process.env.PORT || 3000,
      debug: false,
      db: 'memory'
    }
  })

  const getInstanceOfY = function(room) {
    console.log(`${Date().slice(4, 33)} -- [getInstanceOfY(room)] room: ${room}`);
    if (global.yInstances[room] == null) {
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
    return global.yInstances[room];
  }

  let rooms = [];

  socket.on('joinRoom', (room) => {
    console.log(`${Date().slice(4, 33)} -- [socket.on('joinRoom', fn)] room: ${room}`);
    console.log('User "%s" joins room "%s"', socket.id, room);
    socket.join(room);
    getInstanceOfY(room).then((y) => {
      if (rooms.indexOf(room) === -1) {
        y.connector.userJoined(socket.id, 'slave');
        rooms.push(room);
      }
    });
  });

  socket.on('yjsEvent', (msg) => {
    console.log(`${Date().slice(4, 33)} -- [socket.on('yjsEvent', fn)] msg: ${msg}`);
    if (msg.room != null) {
      getInstanceOfY(msg.room).then((y) => {
        y.connector.receiveMessage(socket.id, msg);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`${Date().slice(4, 33)} -- [socket.on('disconnect', fn)]`);
    for (var i = 0; i < rooms.length; i++) {
      let room = rooms[i];
      getInstanceOfY(room).then((y) => {
        var i = rooms.indexOf(room);
        if (i >= 0) {
          y.connector.userLeft(socket.id);
          rooms.splice(i, 1);
        }
      })
    }
  });

  socket.on('leaveRoom', (room) => {
    console.log(`${Date().slice(4, 33)} -- [socket.on('leaveRoom')] room: ${room}`);
    getInstanceOfY(room).then((y) => {
      var i = rooms.indexOf(room);
      if (i >= 0) {
        y.connector.userLeft(socket.id);
        rooms.splice(i, 1);
      }
    });
  });

  return module;
}
