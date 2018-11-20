import { $ } from './utils.js'
import term from './term.js'
import { editor, socket } from './editor.js'
import './main.css'

const languageSelectElem = $('#language')
const runButton = $('.run-editor-code-button')

let state = {
  language: 'ruby'
  // locked: false,
  // lastLineLength: 0
}

// #~~~~~~~~~~~~~~~~~ Term ~~~~~~~~~~~~~~~~~#
term.open($('#terminal'))
term.fit()
term.focus()

// #~~~~~~~~~~~~~~~~~ Socket ~~~~~~~~~~~~~~~~~#
// @todo: Reimplement locking or remove.
// socket.on('output', ({ output }) => {
//   if (state.locked) {
//     state.locked = false
//     writeBackspaces(state.lastLineLength)
//   }
//   term.write(output)
// })

socket.on('langChange', ({ language, data }) => {
  editor.setOption('mode', language)
  state.language = language
  languageSelectElem.value = language
  term.reset()
  term.write(data)
})

socket.on('clear', () => {
  ClientRepl.clearLine()
  term.clear()
})

socket.on('connect', () => {
  console.log('socket connected')
  term.attach(socket)
})

socket.on('disconnect', () => {
  console.log('socket disconnected')
})

// #~~~~~~~~~~~~~~~~~ ClientRepl ~~~~~~~~~~~~~~~~~#
const ClientRepl = {
  emitClear () {
    socket.emit('clear')
  },

  emitInitRepl () {
    socket.emit('initRepl', { language: languageSelectElem.value })
  },

  clearLine () {
    term.sendData('\u0015')
  },

  handleLanguageChange () {
    this.emitInitRepl()
  },

  handleRunButtonClick () {
    let editorCode = editor.getValue().trim()
    if (editorCode === '') return
    this.emitClear()
    this.clearLine()
    term.sendData(editorCode + '\n')
  }
}

languageSelectElem.addEventListener('change', ClientRepl.handleLanguageChange.bind(ClientRepl))
runButton.addEventListener('click', ClientRepl.handleRunButtonClick.bind(ClientRepl))

// #~~~~~~~~~~~~~~~~~~~~~~~~ Debugging ~~~~~~~~~~~~~~~~~~~~~~~~#
window.state = state
window.term = term
window.ClientRepl = ClientRepl
window.localStorage.debug = '*'
