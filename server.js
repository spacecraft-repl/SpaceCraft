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
    debug('  emitOutput(output = %s)', output)
    outputHistory += output
    if (outputHistory.length > MAX_OUTPUT_LENGTH) return handleTooMuchOutput()
    io.emit('output', { output })
  }

  const initRepl = (language, initial_msg = '') => {
    debug('  [initRepl] language: %s, initial_msg: %s', language, initial_msg)
    Repl.kill()
    Repl.init(language)
    outputHistory = ''
    io.emit('langChange', { language: Repl.language, data: initial_msg })
    Repl.process.on('data', emitOutput)
  }

  io.of('/').clients((error, clients) => {
    debug('  [io.of("/").clients(fn)] error: %s, clients: %s', error, clients)
    if (clients.length === 1) {
      debug('    if (clients.length === 1) --> initRepl(DEFAULT_LANG, initial_msg)')
      initRepl(DEFAULT_LANG, WELCOME_MSG)
    }
  })

  socket.on('initRepl', ({ language }) => {
    debug('  ["initRepl"] { language: %s }', language)
    if (language === Repl.language) return
    debug('  (language !== Repl.language) --> initRepl(language)')
    initRepl(language)
  })

  socket.on('message', (msg) => {
    debug('  ["message"] msg: %s', msg)
    Repl.write(msg)
  })

  socket.on('clear', () => {
    debug('  ["clear"]')
    io.emit('clear')
    outputHistory = ''
  })

  socket.on('disconnect', () => {
    debug('  ["disconnect"]')
    io.of('/').clients((error, clients) => {
      debug('    [io of / .clients] error: %s, clients: %s', error, clients)
      if (clients.length === 0) Repl.kill()
    })
  })

  // @todo: Check if this is necessary.
  debug('socket.emit("langChange", { language: %s, data: %s })', Repl.language || DEFAULT_LANG, WELCOME_MSG)
  socket.emit('langChange', {
    language: Repl.language || DEFAULT_LANG,
    data: WELCOME_MSG
  })

  debug('socket.emit("output", { output: outputHistory = %s })', outputHistory)
  socket.emit('output', { output: outputHistory })

  // Yjs Websockets Server Events
  require('./yjs-ws-server.js')(io, socket)
})

server.listen(port, () => {
  debug(`Listening on port: ${port}...`)
})
