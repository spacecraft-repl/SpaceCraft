'use strict'

const debug = require('debug')('server')

const express = require('express')
const path = require('path')

// @todo: Check if we need body-parser.
const bodyParser = require('body-parser')
const http = require('http')
const socketIo = require('socket.io')
const Repl = require('./repl/Repl.js')

const port = process.env.PORT || 3000

const app = express()
app.use(bodyParser.text())
app.use(express.static('public'))

const server = http.Server(app)
const io = socketIo(server) // our websocket server

let histOutputs = ''
let lastOutput = ''
let currentPrompt = null
const DEFAULT_LANG = 'ruby'

// @todo: Check if this route is necessary -- is it ever used?
app.get('/:room', (req, res) => {
  debug(`${req.method} ${req.url}, req.params: %o`, req.params)
  if (req.params.room === 'favicon.ico') return
  debug('path.join(__dirname, "./index.html") = %s', path.join(__dirname, './index.html'))
  res.sendFile(path.join(__dirname, './index.html'))
})

// @todo: Check if order of \n\r matters.
const WELCOME_MSG = 'WELCOME TO SPACECRAFT!\n\r'
const TOO_MUCH_OUTPUT = '\n\rTOO MUCH OUTPUT!\r'
const MAX_OUTPUT_LENGTH = 10000

io.on('connection', (socket) => {
  debug('io.on("connection", (socket) => {')

  const handleTooMuchOutput = () => {
    io.emit('output', { output: TOO_MUCH_OUTPUT })
    lastOutput = ''
    Repl.write('\x03')
  }

  const emitOutput = (output) => {
    histOutputs += output
    lastOutput += output
    if (lastOutput.length > MAX_OUTPUT_LENGTH) return handleTooMuchOutput()
    io.emit('output', { output })
  }

  const initRepl = (language, welcome_msg = '') => {
    debug('  [initRepl] lang: %s, welcome_msg: %s', language, welcome_msg)
    Repl.kill()
    Repl.init(language)
    histOutputs = ''
    lastOutput = ''

    io.emit('langChange', {
      language: Repl.language,
      data: welcome_msg
    })

    Repl.process.on('data', emitOutput)
  }

  const getCurrentPrompt = () => {
    return lastOutput.split('\n').pop()
  }

  // @todo: Check if this is necessary.
  debug('`socket.emit("langChange", {` ~~> language: %s, data: %s', Repl.language || 'ruby', WELCOME_MSG)
  socket.emit('langChange', {
    language: Repl.language || DEFAULT_LANG,
    data: WELCOME_MSG
  })

  socket.emit('output', { output: histOutputs })

  io.of('/').clients((error, clients) => {
    debug('  [io.of("/").clients(fn)] error: %s, clients: %s', error, clients)
    if (clients.length === 1) {
      initRepl(DEFAULT_LANG, WELCOME_MSG)
    }
  })

  socket.on('initRepl', ({ language }) => {
    debug('  ["initRepl"] { language: %s }', language)
    currentPrompt = null
    if (language === Repl.language) return
    initRepl(language)
  })

  socket.on('evaluate', ({ code }) => {
    debug('  ["evaluate"] { code: %s }', code)
    currentPrompt = null
    lastOutput = ''
    Repl.write(code)
  })

  socket.on('lineChanged', ({ line, syncSelf }) => {
    debug('  ["lineChanged"] { line: %s }', line)
    currentPrompt = currentPrompt || getCurrentPrompt()
    const data = { line, prompt: currentPrompt }

    if (syncSelf) return io.emit('syncLine', data)
    socket.broadcast.emit('syncLine', data)
  })

  socket.on('clear', () => {
    debug('  ["clear"]')
    io.emit('clear')
    histOutputs = ''
  })

  socket.on('disconnect', () => {
    debug('  ["disconnect"]')
    io.of('/').clients((error, clients) => {
      debug('    [io of / .clients] error: %s, clients: %s', error, clients)
      if (clients.length === 0) Repl.kill()
    })
  })

  // Yjs Websockets Server Events
  require('./yjs-ws-server.js')(io, socket)
})

server.listen(port, () => {
  debug(`Listening on port: ${port}...`)
})
