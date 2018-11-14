const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const Repl = require('./repl/Repl.js');

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.text());
app.use(express.static('public'));

const server = http.Server(app);
const io = socketIo(server);  // our websocket server

app.get('/:room', (req, res) => {
  if (req.params.room === 'favicon.ico') return;
  res.sendFile(path.join(__dirname, './index.html'));
});

const WELCOME_MSG = 'WELCOME TO SPACECRAFT!\n\r';

io.on('connection', (socket) => {
  const initRepl = (language, welcome_msg = '') => {
    Repl.kill();
    Repl.init(language);
    Repl.bufferRead()
      .then((data) => {
        io.emit('langChange', {
          language: Repl.language,
          data: welcome_msg + data,
        })
      });
  };

  const emitOutput = (output) => {
    io.emit('output', { output });
  };

  socket.emit('langChange', { language: Repl.language, data: WELCOME_MSG });

  io.of('/').clients((error, clients) => {
    if (clients.length === 1) {
      initRepl('ruby', WELCOME_MSG);
    }
  });

  socket.on('initRepl', ({ language }) => {
    if (language === Repl.language) return;
    initRepl(language);
  });

  socket.on('evaluate', ({ code }) => {
    Repl.bufferWrite(code).then(emitOutput);
  });

  socket.on('clear', () => io.emit('clear'));

  socket.on('disconnect', () => {
    io.of('/').clients((error, clients) => {
      if (clients.length === 0) {
        Repl.kill();
      }
    });
  });

  socket.on('lineChanged', ({ line }) => {
    socket.broadcast.emit('syncLine', { line });
  });

  // Yjs Websockets Server Events
  require('./yjs-ws-server.js')(io, socket);
});

server.listen(port, () => {
  console.log(`${Date().slice(4, 33)} -- Listening on ${port}...`);
});
