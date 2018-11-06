const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const Repl = require('./repl/Repl.js');

const port = process.env.port || 3000;

const app = express();
app.use(bodyParser.text());
app.use(express.static('public'));

app.get('/:room', (req, res) => {
  if (req.params.room === 'favicon.ico') return;
  res.sendFile(path.join(__dirname, './index.html'));
});

const server = http.Server(app);
server.listen(port, () => console.log(`Listening on ${port}...`));

const io = socketIo(server);

io.on('connection', (socket) => {

  socket.on('execRepl', ({ language = 'ruby' } = {}) => {
    if (language === Repl.language) return;
    Repl.kill();
    Repl.init(language);
  });

  socket.on('execute', ({ line }) => {
    Repl.write(`${line}`)
      .then(output => {
        io.emit('output', { output });
      });
  });

  socket.on('disconnect', () => {
    io.of('/').clients((error, clients) => {
      if (clients.length === 0) {
        Repl.kill();
      }
    });
  });
});
