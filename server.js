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

const io = socketIo(server); // our websocket server

io.on('connection', (socket) => {
  const emitOutput = (output) => io.emit('output', { output });
  const languageChange = (data) => io.emit('langChange', { language: Repl.language, data });

  socket.on('initRepl', ({ language = 'ruby' } = {}) => {
    if (language === Repl.language) return;
    Repl.kill();
    Repl.init(language);
    Repl.process.on('data', languageChange);   
  });

  socket.on('execute', ({ line }) => {
    Repl.process.removeListener('data', languageChange);
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
  require('./src/yjs-ws-server.js')(io, socket);

});
