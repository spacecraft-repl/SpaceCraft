import io from 'socket.io-client';

const $ = (selector) => document.querySelector(selector);

const term = new Terminal();
term.setOption('theme', {
  foreground:     '#abb2bf',
  background:     '#282c34',
  cursor:         '#e06c75',
  cursorAccent:   '#e06c75',
  selection:      '#98c379',
  black:          '#98c379',
  red:            '#d19a66',
  green:          '#d19a66',
  yellow:         '#61afef',
  blue:           '#61afef',
  magenta:        '#c678dd',
  cyan:           '#c678dd',
  white:          '#56b6c2',
  brightBlack:    '#56b6c2',
  brightRed:      '#abb2bf',
  brightGreen:    '#ffffff',
  brightYellow:   '#abb2bf',
  brightBlue:     '#abb2bf',
  brightMagenta:  '#3a3f4b',
  brightCyan:     '#5c6370',
  brightWhite:    '#1e2127',
})
term.setOption('cursorBlink', true)
term.setOption('enableBold', true)
term.setOption('fontSize', 15)
term.setOption('fontFamily', 'monospace')
term.setOption('tabStopWidth', 2)
term.open($('#terminal'));
term.write('WELCOME TO SPACECRAFT!\n');

window.term = term;

const socket = io('http://localhost:3000');

let state = {
  line: '',
  editor: null,
  language: null,
  currentOutput: [],
  currentPrompt: '',
};

socket.on('output', ({ output }) => {
  term.write('\u001b[2K\r' + state.currentPrompt);
  term.write(output);
  state.currentOutput = output;
  
  console.log(output.split("\n"));
  state.currentPrompt = output.split("\n").pop();
});

socket.on('langChange', ({ language }) => {
  state.editor.setOption("mode", language);
  state.language = language;
});

socket.on('connect', () => {
  socket.emit('initRepl', { language: 'ruby' });
});

socket.on('syncLine', ({ line }) => {
  state.line = line;
  term.write('\u001b[2K\r' + state.currentPrompt + line);
});

socket.on('disconnect', function(){});

const evaluate = (line) => (
  socket.emit('execute', { line })
);

const emitReplLine = () => {
  socket.emit('updateLine', { line: state.line });
}

const handleButtonPress = (event) => {
  const language = $('input').value

  socket.emit('initRepl', { language });
}

const handleTerminalKeypress = (key) => {
  state.line += key;
  emitReplLine();  
  term.write(key);
}

const handleEnter = () => {
  evaluate(state.line);
  state.line = '';
}

const handleBackspace = () => {
  if (state.line === '') return;
  state.line = state.line.slice(0, -1);
  emitReplLine();
  term.write('\b \b');
}

$('button.language').addEventListener('click', handleButtonPress);

term.on('keypress', handleTerminalKeypress);
term.on('keydown', event => {
  const key = event.key;
  if (key == 'Enter') return handleEnter();
  if (key == 'Backspace') return handleBackspace();
});

document.addEventListener('DOMContentLoaded', event => {
  let code = $('.codemirror-textarea');

  state.editor = CodeMirror.fromTextArea(code, {
    lineNumbers: true,
    theme: 'one-dark',
    tabSize: 2,
  });

  $('button.execute').addEventListener('click', event => {
    evaluate(state.editor.getValue());
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

Y({
  db: {
    name: 'memory',             // store the shared data in memory
  },
  connector: {
    name: 'websockets-client',
    room: 'spacecraft-repl',     // instances connected to the same room share data
    socket: io('http://localhost:3000'),
    url: 'http://localhost:3000',
  },
  share: {                      // specify the shared content
    editorText:  'Text',        // new Y.Text
  },
}).then((y) => {                // Yjs is successfully initialized
  console.log('Yjs instance ready!');
  window.y = y;
  y.share.editorText.bindCodeMirror(state.editor);
})
