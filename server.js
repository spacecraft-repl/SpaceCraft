'use strict'

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
let sessionURL = ''

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
    cacheOutputs(output)
    if (currOutputLength > MAX_OUTPUT_LENGTH) return handleTooMuchOutput()
  }

  const initRepl = (language, welcome_msg = '') => {
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
    return lastOutput.split('\n').pop()
  }

  // @todo: Check if this is necessary.
  socket.emit('langChange', {
    language: Repl.language || DEFAULT_LANG,
    data: WELCOME_MSG
  })

  socket.emit('output', { output: histOutputs })

  io.of('/').clients((_, clients) => {
    if (clients.length === 1) {
      initRepl(DEFAULT_LANG, WELCOME_MSG)
    }
  })

  socket.on('registerSession', ({ url }) => {
    sessionURL = url
    console.log(sessionURL)
  })

  socket.on('initRepl', ({ language }) => {
    currentPrompt = null
    if (language === Repl.language) return
    initRepl(language)
  })

  socket.on('evaluate', ({ code }) => {
    currentPrompt = null
    lastOutput = ''
    currOutputLength = 0
    Repl.write(code)
  })

  socket.on('lineChanged', ({ line, syncSelf }) => {
    currentPrompt = currentPrompt || getCurrentPrompt()

    const data = { line, prompt: currentPrompt }

    if (syncSelf) return io.emit('syncLine', data)
    socket.broadcast.emit('syncLine', data)
  })

  socket.on('clear', () => {
    io.emit('clear')
    histOutputs = ''
  })

  socket.on('disconnect', () => {
    io.of('/').clients((_, clients) => {
      if (clients.length === 0) {
        Repl.kill()

        const fetch = require('node-fetch')
        fetch(sessionURL, { method: 'DELETE' })
      }
    })
  })

  // Yjs Websockets Server Events
  require('./yjs-ws-server.js')(io, socket)
})

server.listen(port, () => {
  console.log('Listening on 3000...')
})
