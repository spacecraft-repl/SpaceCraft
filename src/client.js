import { $ } from './utils.js'
import term from './term.js'
import { editor, socket } from './editor.js'
import ansi from 'ansi-escapes'
import './main.css'

const languageSelectElem = $('#language')
const runButton = $('.run-editor-code-button')

let state = {
  line: '',
  language: 'ruby',
  currentPrompt: '',
  locked: false,
  lastLineLength: 0
}

// #~~~~~~~~~~~~~~~~~ Term ~~~~~~~~~~~~~~~~~#
term.open($('#terminal'))

// @todo: Refactor or remove.
const clearTermLine = () => term.write('\u001b[2K\r')
const setTermPrompt = () => term.write(state.currentPrompt)
const resetTermLine = () => {
  clearTermLine()
  setTermPrompt()
}

// @todo: Refactor or remove.
const clearTermScreen = () => term.reset()
const resetTermScreen = () => {
  clearTermScreen()
  resetTermLine()
}

const writeBackspaces = (length) => {
  for (let i = 0; i < length; i++) term.write('\b \b')
}

// #~~~~~~~~~~~~~~~~~ Socket ~~~~~~~~~~~~~~~~~#
socket.on('output', ({ output }) => {
  if (state.locked) {
    state.locked = false
    writeBackspaces(state.lastLineLength)
  }
  term.write(output)
})

socket.on('langChange', ({ language, data }) => {
  editor.setOption('mode', language)
  state.language = language
  languageSelectElem.value = language
  term.reset()
  term.write(data)
})

socket.on('clear', () => {
  state.line = ''
  resetTermScreen()
})

// Sync line of client so that it's the same as the line from server.
socket.on('syncLine', ({ line, prompt }) => {
  state.currentPrompt = prompt
  state.line = line
  resetTermLine()
  term.write(line)
})

// TODO: Fill in or remove...?
socket.on('connect', () => {})
socket.on('disconnect', () => {})

// #~~~~~~~~~~~~~~~~~ ClientRepl ~~~~~~~~~~~~~~~~~#
const ClientRepl = {
  emitEvaluate (code) {
    socket.emit('evaluate', { code })
  },

  emitClear () {
    socket.emit('clear')
  },

  // Emit 'lineChanged` event to server --> server broadcasts 'syncLine' to clients.
  emitLineChanged ({ syncSelf = undefined } = {}) {
    socket.emit('lineChanged', { line: state.line, syncSelf })
  },

  emitInitRepl () {
    socket.emit('initRepl', { language: languageSelectElem.value })
  },

  clearLine () {
    state.lastLineLength = state.line.length
    state.line = ''
    this.emitLineChanged()
  },

  handleEnter () {
    if (state.locked) return
    state.locked = true
    let lineOfCode = state.line
    this.clearLine()
    this.emitEvaluate(lineOfCode)
  },

  handleBackspace () {
    if (state.line === '') return
    state.line = state.line.slice(0, -1)
    this.emitLineChanged()
    term.write('\b \b')
  },

  // Handle character keys.
  handleKeypress (key) {
    if (state.locked) return
    state.line += key
    this.emitLineChanged()
    term.write(key)
  },

  // Handle special keys (Enter, Backspace).
  // @param: KeyboardEvent
  handleKeydown ({ key }) {
    if (key === 'Enter') this.handleEnter()
    else if (key === 'Backspace') this.handleBackspace()
  },

  handleRunButtonClick () {
    let editorCode = editor.getValue().trim()
    if (editorCode === '') return
    this.emitLineChanged({ syncSelf: true })
    this.emitClear()
    this.emitEvaluate(editorCode)
  },

  handleLanguageChange () {
    this.clearLine()
    this.emitInitRepl()
  }
}

term.on('keypress', ClientRepl.handleKeypress.bind(ClientRepl))
term.on('keydown', ClientRepl.handleKeydown.bind(ClientRepl))
runButton.addEventListener('click', ClientRepl.handleRunButtonClick.bind(ClientRepl))
languageSelectElem.addEventListener('change', ClientRepl.handleLanguageChange.bind(ClientRepl))

// #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
// #~~~~~~~~~~~~~~~~~~~~~~~~ Debugging ~~~~~~~~~~~~~~~~~~~~~~~~#
// #~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
window.state = state
window.term = term
window.ansi = ansi
// term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
