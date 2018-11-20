// #~~~~~~~~~~~~~~~~~~~~~~~~~ CodeMirror ~~~~~~~~~~~~~~~~~~~~~~~~~#
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror-one-dark-theme/one-dark.css'
import 'codemirror/mode/ruby/ruby.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/shell/shell.js'

import { $ } from './utils.js'

/// /#~~~~~~~~~~~~~~~~~~~~~~~~~ Yjs ~~~~~~~~~~~~~~~~~~~~~~~~~#
import Y from 'yjs'
import yWebsocketsClient from 'y-websockets-client'
import yMemory from 'y-memory'
import yArray from 'y-array'
import yText from 'y-text'

import io from 'socket.io-client'

const code = $('.codemirror-textarea')

const editor = CodeMirror.fromTextArea(code, {
  lineNumbers: true,
  theme: 'one-dark',
  tabSize: 2,
  mode: 'ruby',
  // Prevent bug with Yjs syncing.
  // - disable auto-re-indenting on certain characters (eg: `end`).
  electricChars: false
})
Y.extend(yWebsocketsClient, yMemory, yArray, yText)

// @todo: Check if this is always a valid way to get url.
const url = window.location.href
const socket = io(url)

Y({
  db: {
    name: 'memory' // store the shared data in memory
  },
  connector: {
    name: 'websockets-client',
    room: 'spacecraft-repl', // instances connected to the same room share data
    socket,
    url
  },
  share: { // specify the shared content
    editorText: 'Text' // new Y.Text
  }
}).then((y) => { // Yjs is successfully initialized
  console.log('Yjs instance ready!')
  window.y = y
  y.share.editorText.bindCodeMirror(editor)
})

export { editor, socket }

// #~~~~~~~~~~~~~~~~~~~~~~~~ Debugging ~~~~~~~~~~~~~~~~~~~~~~~~#
window.CodeMirror = CodeMirror
window.editor = editor
window.Y = Y
window.io = io
window.socket = socket
