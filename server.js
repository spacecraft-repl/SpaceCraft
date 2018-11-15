'use strict';

const debug = require('debug')('server');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const Repl = require('./repl/Repl.js');

Repl.init('ruby').bufferRead()

const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.text());
app.use(express.static('public'));

const server = http.Server(app);
const io = socketIo(server);  // our websocket server

// @todo: Check if this route is necessary -- is it ever used?
app.get('/:room', (req, res) => {
  debug(`${req.method} ${req.url}, req.params: %o`, req.params)
  if (req.params.room === 'favicon.ico') return;
  debug('path.join(__dirname, "./index.html") = %s', path.join(__dirname, './index.html'))
  res.sendFile(path.join(__dirname, './index.html'));
});

const WELCOME_MSG = 'WELCOME TO SPACECRAFT!\n\r';

io.on('connection', (socket) => {
  debug('io.on("connection", (socket) => {')

  const initRepl = (language, welcome_msg = '') => {
    debug('  [initRepl] lang: %s, welcome_msg: %s', language, welcome_msg)
    Repl.kill();
    Repl.init(language);
    Repl.bufferRead()
      .then((data) => {
        debug('    data: %j', data)
        io.emit('langChange', {
          language: Repl.language,
          data: welcome_msg + data,
        })
      });
  };

  const emitOutput = (output) => {
    debug('  [emitOutput] output: %s', output)
    io.emit('output', { output });
  };

  // @todo: Check if this is necessary.
  socket.emit('langChange', {
    language: Repl.language || 'ruby',  // Added null guard to speed up initial loading.
    data: WELCOME_MSG,
  });

  io.of('/').clients((error, clients) => {
    debug('  [io.of("/").clients(fn)] error: %s, clients: %s', error, clients)
    if (clients.length === 1) {
      initRepl('ruby', WELCOME_MSG);
    }
  });

  socket.on('initRepl', ({ language }) => {
    debug('  ["initRepl"] { language: %s }', language)
    if (language === Repl.language) return;
    initRepl(language);
  });

  socket.on('evaluate', ({ code }) => {
    debug('  ["evaluate"] { code: %s }', code)
    Repl.bufferWrite(code).then(emitOutput);
  });

  socket.on('clear', () => {
    debug('  ["clear"]')
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    debug('  ["disconnect"]')
    io.of('/').clients((error, clients) => {
      debug('    [io of / .clients] error: %s, clients: %s', error, clients)
      if (clients.length === 0) {
        Repl.kill();
      }
    });
  });

  socket.on('lineChanged', ({ line }) => {
    debug('  ["lineChanged"] { line: %s }', line)
    socket.broadcast.emit('syncLine', { line });
  });

  // // Yjs Websockets Server Events
  // require('./yjs-ws-server.js')(io, socket);
});

server.listen(port, () => {
  debug(`Listening on port: ${port}...`);
});
