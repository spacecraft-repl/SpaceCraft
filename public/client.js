import { $ } from './utils.js';

import term from './term.js';
import editor from './editor.js';

term.open($('#terminal'));
term.write('WELCOME TO SPACECRAFT!\n');

// ========================= Socket IO ==========================
import io from 'socket.io-client';
const url = window.location.href;
const socket = io(url);

let state = {
  editor,
  line: '',
  language: 'ruby',
  currentOutput: [],
  currentPrompt: '',
};

socket.on('output', ({ output }) => {
  term.write('\u001b[2K\r' + state.currentPrompt);
  term.write(output);
  state.currentOutput = output;

  console.log(output.split('\n'));
  state.currentPrompt = output.split('\n').pop();
});

socket.on('langChange', ({ language }) => {
  state.editor.setOption('mode', language);
  state.language = language;
  console.log(`Language has been changed to: ${language}`);
});

socket.on('connect', () => {
  socket.emit('initRepl', { language: state.language });
});

socket.on('syncLine', ({ line }) => {
  state.line = line;
  term.write('\u001b[2K\r' + state.currentPrompt + line);
});

// TODO: fill in
socket.on('disconnect', function(){});

const evaluate = (line) => {
  socket.emit('execute', { line });
};

const emitReplLine = () => {
  socket.emit('updateLine', { line: state.line });
};

const handleButtonPress = (event) => {
  const language = $('input').value;
  socket.emit('initRepl', { language });
};

const handleTerminalKeypress = (key) => {
  state.line += key;
  emitReplLine();
  term.write(key);
};

const handleEnter = () => {
  const line = state.line;
  state.line = '';
  emitReplLine();
  evaluate(line);
};

const handleBackspace = () => {
  if (state.line === '') return;
  state.line = state.line.slice(0, -1);
  emitReplLine();
  term.write('\b \b');
};

$('button.language').addEventListener('click', handleButtonPress);

term.on('keypress', handleTerminalKeypress);
term.on('keydown', (event) => {
  const key = event.key;
  if (key == 'Enter') return handleEnter();
  if (key == 'Backspace') return handleBackspace();
});


$('button.execute').addEventListener('click', (event) => {
  evaluate(state.editor.getValue());
});

// ========================= Yjs =========================
import Y from 'yjs';
import yWebsocketsClient from 'y-websockets-client';
import yMemory           from 'y-memory';
import yArray            from 'y-array';
import yText             from 'y-text';
Y.extend(yWebsocketsClient, yMemory, yArray, yText);

Y({
  db: {
    name: 'memory',             // store the shared data in memory
  },
  connector: {
    name: 'websockets-client',
    room: 'spacecraft-repl',     // instances connected to the same room share data
    socket: io(url),
    url,
  },
  share: {                      // specify the shared content
    editorText:  'Text',        // new Y.Text
  },
}).then((y) => {                // Yjs is successfully initialized
  console.log('Yjs instance ready!');
  window.y = y;
  y.share.editorText.bindCodeMirror(state.editor);
});


// #============ main css ============#
import './main.css';


// ========================= Debugging =========================
window.state = state
// window.io = io;
// window.socket = socket;
// window.Y = Y;

// xterm.js
// window.term = term;
// term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');

import ansiEscapes from 'ansi-escapes';
window.ansi = ansiEscapes

// const term2 = new Terminal()
// window.term2 = term2
// term2.open($('#terminal-attach'))
// term2.write('terminal-attach')
