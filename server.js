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
  console.log(`${Date().slice(4, 33)} -- [app.get('/:room')]`);
  if (req.params.room === 'favicon.ico') return;
  res.sendFile(path.join(__dirname, './index.html'));
});

io.on('connection', (socket) => {
  console.log(`${Date().slice(4, 33)} -- [io.on('connection')] socket: ${socket}`);

  const emitOutput = (output) => {
    console.log(`${Date().slice(4, 33)} -- [emitOutput(output)] output: ${output}`)
    io.emit('output', { output });
  };

  const emitClearThenOutput = (output) => {
    console.log(`${Date().slice(4, 33)} -- [emitClearThenOutput(output)] output: ${output}`)
    io.emit('clear');
    emitOutput(output);
  };

  socket.on('initRepl', ({ language = 'ruby' } = {}) => {
    console.log(`${Date().slice(4, 33)} -- [socket.on('initRepl')] language: ${language}`);
    if (language === Repl.language) return;
    Repl.kill();
    Repl.init(language);
    Repl.bufferRead()
      .then(data => io.emit('langChange', { language: Repl.language, data }));
  });

  socket.on('execute', ({ line, clear }) => {
    console.log(`${Date().slice(4, 33)} -- [socket.on('execute')] line: ${line}, clear: ${clear}`);
    if (clear) {
      Repl.bufferWrite(line)
        .then(emitClearThenOutput)
    } else {
      Repl.bufferWrite(line)
        .then(emitOutput);
    }
  });

  socket.on('disconnect', () => {
    console.log(`${Date().slice(4, 33)} -- [socket.on('disconnect')] Client disconnected`);
    io.of('/').clients((error, clients) => {
      if (clients.length === 0) {
        console.log(`${Date().slice(4, 33)} -- 0 clients --> Repl.kill()`);
        Repl.kill();
      }
    });
  });

  socket.on('updateLine', ({ line }) => {
    console.log(`${Date().slice(4, 33)} -- [socket.on('updateLine')] line: ${line}`)
    socket.broadcast.emit('syncLine', { line });
  });

  // Yjs Websockets Server Events
  
  require('./src/yjs-ws-server.js')(io, socket);
});

server.listen(port, () => {
  console.log(`${Date().slice(4, 33)} -- Listening on ${port}...`)
});
