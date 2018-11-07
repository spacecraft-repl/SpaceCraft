const $ = (selector) => document.querySelector(selector);

const term = new Terminal();
term.open(document.getElementById('terminal'));
term.write('WELCOME TO SPACECRAFT!!!\n');

const socket = io('http://localhost:3000');

socket.on('output', ({ output }) => {
  term.write(output);
});

socket.on('connect', () => {
  socket.emit('initRepl', { language: 'ruby' });
});

socket.on('disconnect', function(){});

let state = {
  line: '',
};

const evaluate = (line) => (
  socket.emit('execute', { line })
);

const handleButtonPress = (event) => {
  const language = $('input').value

  socket.emit('initRepl', { language });
}

const handleTerminalKeypress = (event) => {
  const textArea = $('.xterm-helper-textarea');
  if (event.target !== textArea) return;
  term.write(event.key);
  state.line += event.key;
}

const handleEnterReleased = () => {
  term.write('\r\n');

  evaluate(state.line);
  state.line = '';
}

const handleBackspaceReleased = () => {
  term.write('\b \b');
  state.line = state.line.slice(0, -1);
  console.log(state.line);
}

document.addEventListener('keypress', handleTerminalKeypress);

document.getElementById('terminal').addEventListener('keyup', event => {
  console.log(state.line);
  const key = event.key;
  if (key == 'Enter') return handleEnterReleased();
  if (key == 'Backspace') return handleBackspaceReleased();
});

$('button.language').addEventListener('click', event => {
  handleButtonPress(event);
});

let editor;

document.addEventListener('DOMContentLoaded', event => {
  let code = $('.codemirror-textarea');

  editor = CodeMirror.fromTextArea(code, {
    lineNumbers: true,
    mode: { name: 'text/x-ruby' },
    theme: 'one-dark',
    tabSize: 2,
  });

  console.log(CodeMirror.modes);

  $('button.execute').addEventListener('click', event => {
    evaluate(editor.getValue());
  });
});



console.log('----- YJS ------');
import Y from 'yjs';
import yWebsocketsClient from 'y-websockets-client';
import yMemory           from 'y-memory';
import yArray            from 'y-array';
import yText             from 'y-text';
Y.extend(yWebsocketsClient, yMemory, yArray, yText);
window.Y = Y;

// const url = 'https://catstones-websocket-server.herokuapp.com/';
// const io  = Y['websockets-client'].io;

Y({
  db: {
    name: 'memory',             // store the shared data in memory
  },
  connector: {
    name: 'websockets-client',  // use the websockets connector
    room: 'catstones-repl',     // instances connected to the same room share data
    // TODO: uncomment to use custom WebSocket server
    // socket: io(url),         // Pass socket.io object to use (CORS...?)
    // url,
  },
  share: {                      // specify the shared content
    array:       'Array',
    editorText:  'Text',  // new Y.Text
    // termLine:    'Array',
    // termOutput:  'Array',
  },
}).then((y) => {                // Yjs is successfully initialized
  console.log('Yjs instance ready!')
  window.y = y
  y.share.editorText.bindCodeMirror(editor)
})
