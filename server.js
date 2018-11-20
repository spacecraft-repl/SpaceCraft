'use strict'

const debug = require('debug')('server')
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const Repl = require('./repl/Repl.js')
const port = process.env.PORT || 3000
const app = express()
const server = http.Server(app)
const io = socketIo(server) // our websocket server

app.use(express.static('public'))

const WELCOME_MSG = 'WELCOME TO SPACECRAFT!\r\n'
const TOO_MUCH_OUTPUT = '\r\n------TOO MUCH OUTPUT! REPL RESTARTED-------\r\n'
const MAX_OUTPUT_LENGTH = 10000
const DEFAULT_LANG = 'ruby'

let outputHistory = ''

io.on('connection', (socket) => {
  const handleTooMuchOutput = () => {
    Repl.write('\x03')
    initRepl(Repl.language, TOO_MUCH_OUTPUT)
  }

  const emitOutput = (output) => {
    outputHistory += output
    if (outputHistory.length > MAX_OUTPUT_LENGTH) return handleTooMuchOutput()
    io.emit('output', { output })
  }

  const initRepl = (language, initial_msg = '') => {
    Repl.kill()
    Repl.init(language)
    outputHistory = ''
    io.emit('langChange', { language: Repl.language, data: initial_msg })
    Repl.process.on('data', emitOutput)
  }

  io.of('/').clients((error, clients) => {
    if (clients.length === 1) initRepl(DEFAULT_LANG, WELCOME_MSG)
  })

  socket.on('initRepl', ({ language }) => {
    if (language === Repl.language) return
    initRepl(language)
  })

  socket.on('message', (msg) => {
    Repl.write(msg)
  })

  socket.on('clear', () => {
    io.emit('clear')
    outputHistory = ''
  })

  socket.on('disconnect', () => {
    io.of('/').clients((error, clients) => {
      if (clients.length === 0) Repl.kill()
    })
  })

  // @todo: Check if this is necessary.
  socket.emit('langChange', {
    language: Repl.language || DEFAULT_LANG,
    data: WELCOME_MSG
  })

  socket.emit('output', { output: outputHistory })

  // Yjs Websockets Server Events
  require('./yjs-ws-server.js')(io, socket)
})

server.listen(port, () => {
  console.log(`Listening on port: ${port}...`)
})
