//========================= CodeMirror =========================
import CodeMirror from 'codemirror/lib/codemirror.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror-one-dark-theme/one-dark.css';
import 'codemirror/mode/ruby/ruby.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/shell/shell.js';

import { $ } from './utils.js';

const code = $('.codemirror-textarea');

const editor = CodeMirror.fromTextArea(code, {
  lineNumbers: true,
  theme: 'one-dark',
  tabSize: 2,
  mode: 'ruby',
});

// TODO: fix bug where indentation doesn't sync correctly in editor
// - To reproduce (in ruby mode):
//   ```
//     def foo
//       puts 42
//     end
//   ```
// - Result:
//   - first browser:  end
//   - second browser: edn
//========================= Yjs =========================
import Y from 'yjs';
import yWebsocketsClient from 'y-websockets-client';
import yMemory           from 'y-memory';
import yArray            from 'y-array';
import yText             from 'y-text';
Y.extend(yWebsocketsClient, yMemory, yArray, yText);

import io from 'socket.io-client';
const url = window.location.href;
const socket = io(url);

Y({
  db: {
    name: 'memory',              // store the shared data in memory
  },
  connector: {
    name: 'websockets-client',
    room: 'spacecraft-repl',     // instances connected to the same room share data
    socket,
    url,
  },
  share: {                       // specify the shared content
    editorText: 'Text',          // new Y.Text
  },
}).then((y) => {                 // Yjs is successfully initialized
  console.log('Yjs instance ready!');
  window.y = y;
  y.share.editorText.bindCodeMirror(editor);
});



//#================= Debugging =================#
window.CodeMirror = CodeMirror;
window.editor = editor;
window.Y = Y;
window.io = io;
window.socket = socket;

export { editor, socket };
