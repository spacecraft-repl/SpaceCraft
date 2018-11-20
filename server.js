'use strict'

const debug = require('debug')('server')
const express = require('express')
// const bodyParser = require('body-parser')
const http = require('http')
const socketIo = require('socket.io')
const Repl = require('./repl/Repl.js')

const port = process.env.PORT || 3000
const app = express()
const server = http.Server(app)
const io = socketIo(server) // our websocket server

let outputHistory = ''
// let lastOutput = ''

// app.use(bodyParser.text())
app.use(express.static('public'))

// @todo: Check if order of \n\r matters.
const WELCOME_MSG = 'WELCOME TO SPACECRAFT!\n\r'
// const TOO_MUCH_OUTPUT = '\n\r------TOO MUCH OUTPUT!-------\n\r'
// const MAX_OUTPUT_LENGTH = 10000
const DEFAULT_LANG = 'ruby'

io.on('connection', (socket) => {
  global.debug = debug
  global.Repl = Repl
  global.app = app
  global.server = server
  global.io = io
  global.socket = socket

  const initRepl = (language, welcome_msg = '') => {
    debug('  [initRepl] lang: %s, welcome_msg: %s', language, welcome_msg)
    Repl.kill()
    Repl.init(language)
    // Repl.process.on('data', emitOutput)
    Repl.process.on('data', (data) => {
      debug('[data] data: %s', data)
      io.emit('message', { data })
    })
  }

  const emitOutput = (output) => {
    debug('  emitOutput(output = %s)', output)
    // debug('  ~~> outputHistory: %s, lastOutput: %s', outputHistory, lastOutput)
    // outputHistory += output
    // lastOutput = output
    // if (lastOutput.length > MAX_OUTPUT_LENGTH) return handleTooMuchOutput()
    // io.emit('output', { output })
    // io.emit(output)
    socket.send({ data: output })
    console.log(output)
  }

  io.of('/').clients((error, clients) => {
    debug('  [io.of("/").clients(fn)] error: %s, clients: %s', error, clients)
    if (clients.length === 1) {
      debug('    if (clients.length === 1) --> initRepl(DEFAULT_LANG, WELCOME_MSG)')
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

  // socket.on('clear', () => {
  //   debug('  ["clear"]')
  //   io.emit('clear')
  //   outputHistory = ''
  // })

  socket.on('disconnect', () => {
    debug('  ["disconnect"]')
    io.of('/').clients((error, clients) => {
      debug('    [io of / .clients] error: %s, clients: %s', error, clients)
      if (clients.length === 0) Repl.kill()
    })
  })

  // const handleTooMuchOutput = () => {
  //   lastOutput = ''
  //   Repl.write('\x03')
  //   io.emit('output', { output: TOO_MUCH_OUTPUT })
  // }

  // const emitOutput = (output) => {
  //   debug('  emitOutput(output = %s)', output)
  //   // debug('  ~~> outputHistory: %s, lastOutput: %s', outputHistory, lastOutput)
  //   // outputHistory += output
  //   // lastOutput = output
  //   // if (lastOutput.length > MAX_OUTPUT_LENGTH) return handleTooMuchOutput()
  //   // io.emit('output', { output })

  //   // io.emit(output)
  //   socket.send({ data: output })

  //   console.log(output)
  // }

//   const initRepl = (language, welcome_msg = '') => {
//     debug('  [initRepl] lang: %s, welcome_msg: %s', language, welcome_msg)
//     Repl.kill()
//     Repl.init(language)
//     // outputHistory = ''
//     // lastOutput = ''

//     // io.emit('langChange', {
//     //   language: Repl.language,
//     //   data: welcome_msg
//     // })

//     // // Repl.process.on('data', emitOutput)
//     // Repl.process.on('data', (data) => {
//     //   socket.send(data)
//     // })
//   }

  // const getCurrentPrompt = () => {
  //   debug('  getCurrentPrompt() ~~> lastOutput: %s', lastOutput)
  //   return lastOutput.split('\n').pop()
  // }

  // // @todo: Check if this is necessary.
  // debug('socket.emit("langChange", { language: %s, data: %s })', Repl.language || DEFAULT_LANG, WELCOME_MSG)
  // socket.emit('langChange', {
  //   language: Repl.language || DEFAULT_LANG,
  //   data: WELCOME_MSG
  // })

  // debug('socket.emit("output", { output: outputHistory = %s })', outputHistory)
  // socket.emit('output', { output: outputHistory })

  // socket.on('evaluate', ({ code }) => {
  //   debug('  ["evaluate"] { code: %s }', code)
  //   lastOutput = ''
  //   Repl.write(code)
  // })

  // socket.on('lineChanged', ({ line, syncSelf }) => {
  //   debug('  ["lineChanged"] { line: %s, syncSelf: %s }', line)

  //   debug('NEXT LINE: `if (syncSelf) return io.emit("syncLine", data)`')
  //   if (syncSelf) return io.emit('syncLine', data)

  //   debug('NEXT LINE: `socket.broadcast.emit("syncLine", data)`')
  //   socket.broadcast.emit('syncLine', data)
  // })


  // Yjs Websockets Server Events
  require('./yjs-ws-server.js')(io, socket)
})

server.listen(port, () => {
  debug(`Listening on port: ${port}...`)
})
