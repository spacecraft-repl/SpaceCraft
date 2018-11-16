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

let histOutputs = '';
let lastOutput = '';
let timeoutId = null;
let currentPrompt = null;
const DEFAULT_LANG = 'ruby';

app.get('/:room', (req, res) => {
  if (req.params.room === 'favicon.ico') return;
  res.sendFile(path.join(__dirname, './index.html'));
});

const WELCOME_MSG = 'WELCOME TO SPACECRAFT!\n\r';

io.on('connection', (socket) => {
  const emitOutput = (output) => {
    histOutputs += output;
    lastOutput += output;
    io.emit('output', { output });
  };

  const initRepl = (language, welcome_msg = '') => {
    Repl.kill();
    Repl.init(language);
    histOutputs = '';
    lastOutput = '';

    io.emit('langChange', {
      language: Repl.language,
      data: welcome_msg,
    });

    Repl.process.on('data', emitOutput);
  };

  const getCurrentPrompt = () => {
    return lastOutput
             .split('\n')
             .pop();
  }

  socket.emit('langChange', { 
    language: Repl.language || DEFAULT_LANG, 
    data: WELCOME_MSG,
  });

  socket.emit('output', { output: histOutputs });

  io.of('/').clients((error, clients) => {
    if (clients.length === 1) {
      initRepl(DEFAULT_LANG, WELCOME_MSG);
    }
  });

  socket.on('initRepl', ({ language }) => {
    currentPrompt = null;
    if (language === Repl.language) return;
    initRepl(language);
  });

  socket.on('evaluate', ({ code }) => {
    currentPrompt = null; 
    lastOutput = '';
    Repl.write(code);
  });

  socket.on('lineChanged', ({ line }) => {
    if (!currentPrompt) currentPrompt = getCurrentPrompt();
    io.emit('syncLine', { line, prompt: currentPrompt });
  });

  socket.on('clear', () => {
    io.emit('clear')
    histOutputs = '';
  });

  socket.on('disconnect', () => {
    io.of('/').clients((error, clients) => {
      if (clients.length === 0) {
        Repl.kill();
      }
    });
  });

  // Yjs Websockets Server Events
  require('./yjs-ws-server.js')(io, socket);
});

server.listen(port, () => {
  console.log(`${Date().slice(4, 33)} -- Listening on ${port}...`);
});
