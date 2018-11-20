'use strict'

const debug = require('debug')('server')
const express = require('express')
// const path = require('path')
const bodyParser = require('body-parser')
const http = require('http')
const socketIo = require('socket.io')
const Repl = require('./repl/Repl.js')
const Ansi = require('ansi-escapes')

const port = process.env.PORT || 3000
const app = express()
const server = http.Server(app)
const io = socketIo(server) // our websocket server

let histOutputs = ''
let currOutputLength = 0
let lastOutput = ''
let currentPrompt = null

app.use(bodyParser.text())
app.use(express.static('public'))

const WELCOME_MSG = 'WELCOME TO SPACECRAFT!\n\r'
const TOO_MUCH_OUTPUT = (() => {
  const text = '--------MAXIMUM OUTPUT EXCEEDED--------'
  const formatted = `\u001b[31m\u001b[7m\u001b[1m${text}\u001b[0m`
  return Ansi.cursorUp(1) + formatted + Ansi.cursorDown(1) + Ansi.cursorBackward(text.length)
})()
const MAX_OUTPUT_LENGTH = 10000
const MAX_HIST_LENGTH = 100000
const DEFAULT_LANG = 'ruby'

io.on('connection', (socket) => {
  const resetOutputCache = () => {
    histOutputs = ''
    lastOutput = ''
    currOutputLength = 0
  }

  const cacheOutputs = (output) => {
    histOutputs += output
    currOutputLength += output.length
    lastOutput = output
    if (histOutputs.length > MAX_HIST_LENGTH) histOutputs = histOutputs.slice(-1000)
  }

  const handleTooMuchOutput = () => {
    currOutputLength = 0
    Repl.write('\x03')
    setTimeout(() => io.emit('output', { output: TOO_MUCH_OUTPUT }), 50)
  }

  const emitOutput = (output) => {
    io.emit('output', { output })
    debug('  emitOutput(output = %s)', output)
    debug('  ~~> histOutputs: %s, lastOutput: %s', histOutputs, lastOutput)

    cacheOutputs(output)
    if (currOutputLength > MAX_OUTPUT_LENGTH) return handleTooMuchOutput()
  }

  const initRepl = (language, welcome_msg = '') => {
    debug('  [initRepl] lang: %s, welcome_msg: %s', language, welcome_msg)
    Repl.kill()
    Repl.init(language)
    resetOutputCache()

    io.emit('langChange', {
      language: Repl.language,
      data: welcome_msg
    })

    Repl.process.on('data', emitOutput)
  }

  const getCurrentPrompt = () => {
    debug('  getCurrentPrompt() ~~> lastOutput: %s', lastOutput)
    return lastOutput.split('\n').pop()
  }

  // @todo: Check if this is necessary.
  debug('socket.emit("langChange", { language: %s, data: %s })', Repl.language || DEFAULT_LANG, WELCOME_MSG)
  socket.emit('langChange', {
    language: Repl.language || DEFAULT_LANG,
    data: WELCOME_MSG
  })

  debug('socket.emit("output", { output: histOutputs = %s })', histOutputs)
  socket.emit('output', { output: histOutputs })

  io.of('/').clients((error, clients) => {
    debug('  [io.of("/").clients(fn)] error: %s, clients: %s', error, clients)
    if (clients.length === 1) {
      debug('    if (clients.length === 1) --> initRepl(DEFAULT_LANG, WELCOME_MSG)')
      initRepl(DEFAULT_LANG, WELCOME_MSG)
    }
  })

  socket.on('initRepl', ({ language }) => {
    debug('  ["initRepl"] { language: %s }', language)
    currentPrompt = null
    if (language === Repl.language) return
    debug('  (language !== Repl.language) --> initRepl(language)')
    initRepl(language)
  })

  socket.on('evaluate', ({ code }) => {
    debug('  ["evaluate"] { code: %s }', code)
    currentPrompt = null
    lastOutput = ''
    currOutputLength = 0
    Repl.write(code)
  })

  socket.on('lineChanged', ({ line, syncSelf }) => {
    debug('  ["lineChanged"] { line: %s, syncSelf: %s }', line)
    currentPrompt = currentPrompt || getCurrentPrompt()

    debug('NEXT LINE: const data = { line, prompt: currentPrompt = %s }', currentPrompt)
    const data = { line, prompt: currentPrompt }

    debug('NEXT LINE: `if (syncSelf) return io.emit("syncLine", data)`')
    if (syncSelf) return io.emit('syncLine', data)

    debug('NEXT LINE: `socket.broadcast.emit("syncLine", data)`')
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
