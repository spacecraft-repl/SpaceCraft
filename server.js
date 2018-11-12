// const webpack = require('webpack');
// const config = require('./webpack.config.js');
// const compiler = webpack(config);
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
const io = socketIo(server); // our websocket server

app.get('/:room', (req, res) => {
  if (req.params.room === 'favicon.ico') return;
  res.sendFile(path.join(__dirname, './index.html'));
});

const WELCOME = 'WELCOME TO SPACECRAFT!\n\r';

io.on('connection', (socket) => {
  const initRepl = (language, welcome = '') => {
    Repl.kill();
    Repl.init(language);
    Repl.bufferRead()
      .then(data => io.emit('langChange', { language: Repl.language, 
        data: welcome + data,
      }));
  }

  const emitOutput = (output) => {
    io.emit('output', { output });
  };

  const emitClearThenOutput = (output) => {
    io.emit('clear');
    emitOutput(output);
  };

  socket.emit('langChange', { language: Repl.language, data: WELCOME });

  io.of('/').clients((error, clients) => {
    if (clients.length === 1) {
      initRepl('ruby', WELCOME);
    }
  });  

  socket.on('initRepl', ({ language }) => {
    if (language === Repl.language) return;
    initRepl(language)
  });

  socket.on('execute', ({ line, clear }) => {
    if (clear) {
      Repl.bufferWrite(line)
        .then(emitClearThenOutput);
    } else {
      Repl.bufferWrite(line)
        .then(emitOutput);
    }
  });

  socket.on('disconnect', () => {
    io.of('/').clients((error, clients) => {
      if (clients.length === 0) {
        console.log(`${Date().slice(4, 33)} -- 0 clients --> Repl.kill()`);
        Repl.kill();
      }
    });
  });

  socket.on('updateLine', ({ line }) => {
    socket.broadcast.emit('syncLine', { line });
  });

  // Yjs Websockets Server Events
  require('./src/yjs-ws-server.js')(io, socket);
});

server.listen(port, () => {
  console.log(`${Date().slice(4, 33)} -- Listening on ${port}...`)
});
