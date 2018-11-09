const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const express = require('express');
const config = require('./webpack.config.js');
const compiler = webpack(config);
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const Repl = require('./repl/Repl.js');

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.text());
app.use(express.static('public'));

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));

app.get('/:room', (req, res) => {
  if (req.params.room === 'favicon.ico') return;
  res.sendFile(path.join(__dirname, './index.html'));
});

const server = http.Server(app);
server.listen(port, () => console.log(`Listening on ${port}...`));

const io = socketIo(server);

io.on('connection', (socket) => {
  const emitOutput = (output) => io.emit('output', { output });

  socket.on('initRepl', ({ language = 'ruby' } = {}) => {
    if (language === Repl.language) return;
    Repl.kill();
    Repl.init(language);
    Repl.process.on('data', emitOutput);
    io.emit('langChange', { language });
  });

  socket.on('execute', ({ line }) => {
    Repl.process.removeListener('data', emitOutput);
    Repl.bufferWrite(`${line}`)
      .then(emitOutput);
  });

  socket.on('disconnect', () => {
    io.of('/').clients((error, clients) => {
      if (clients.length === 0) {
        Repl.kill();
      }
    });
  });

  socket.on('updateLine', ({ line }) => {
    socket.broadcast.emit('syncLine', { line });
  });

  // Yjs Websockets Server Events
  const { getInstanceOfY, options } = require('./yjs-ws-server.js')(io);

  var rooms = [];

  socket.on('joinRoom', (room) => {
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
    if (msg.room != null) {
      getInstanceOfY(msg.room).then((y) => {
        y.connector.receiveMessage(socket.id, msg);
      });
    }
  });

  socket.on('disconnect', () => {
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
    getInstanceOfY(room).then((y) => {
      var i = rooms.indexOf(room);
      if (i >= 0) {
        y.connector.userLeft(socket.id);
        rooms.splice(i, 1);
      }
    });
  });
});
