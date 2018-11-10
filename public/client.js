import { $ } from '../src/utils.js';
import term from '../src/term.js';
import './main.css';
import { editor, socket } from '../src/editor.js'

term.open($('#terminal'));
term.writeln('WELCOME TO SPACECRAFT!');

const url = window.location.href;

let state = {
  editor,
  line: '',
  language: 'ruby',
  currentOutput: [],
  currentPrompt: '',
};

const languageInput = $('#language');
const languageButton = $('button.language');
const runButton = $('button.execute');

const updateLine = output => { term.write('\u001b[2K\r' + state.currentPrompt + output) }

// TODO: clear state.line after user hits Run button
socket.on('output', ({ output }) => {
  updateLine(output);
  state.currentOutput = output;
  console.log(output.split('\n'));
  state.currentPrompt = output.split('\n').pop();
});

socket.on('langChange', ({ language, data }) => {
  state.editor.setOption('mode', language);
  state.language = language;
  term.reset();
  state.currentOutput = data;
  state.currentPrompt = data.split('\n').pop();
  term.write(data);
  // console.log(`Language has been changed to: ${language}`);
});

socket.on('connect', () => {
  socket.emit('initRepl', { language: state.language });
});

socket.on('syncLine', ({ line }) => {
  state.line = line;
  updateLine(line);
});

socket.on('disconnect', function(){});  // TODO: fill in...?

const ClientRepl = {

  evaluate(line) {
    term.reset();
    socket.emit('execute', { line });
  },

  emitReplLine() {
    socket.emit('updateLine', { line: state.line });
  },

  handleLanguageClick(_) {
    state.line = '';
    this.emitReplLine();
    socket.emit('initRepl', { language: languageInput.value });
  },

  handleTerminalKeypress(key) {
    state.line += key;
    this.emitReplLine();
    term.write(key);
  },

  handleTerminalKeydown(event) {
    const key = event.key;
    if (key === 'Enter') return this.handleEnter();
    if (key === 'Backspace') return this.handleBackspace();
  },

  handleEnter() {
    const line = state.line;
    state.line = '';
    this.emitReplLine();
    this.evaluate(line);
  },

  handleBackspace() {
    if (state.line === '') return;
    state.line = state.line.slice(0, -1);
    this.emitReplLine();
    term.write('\b \b');
  },

  handleLanguageKeypress(event) {
    if (event.key !== 'Enter') return;
    this.handleLanguageClick();
  }
}

languageButton.addEventListener('click', ClientRepl.handleLanguageClick.bind(ClientRepl));
languageInput.addEventListener('keypress', ClientRepl.handleLanguageKeypress.bind(ClientRepl));

term.on('keypress', ClientRepl.handleTerminalKeypress.bind(ClientRepl));
term.on('keydown', ClientRepl.handleTerminalKeydown.bind(ClientRepl));

// Clear repl input line before/after hitting the 'Run' button.
// Right now the line is visibly cleared, but if you hit enter in the repl after hitting the 'Run' button,
// the previous input will still be executed.

runButton.addEventListener('click', (event) => {
  ClientRepl.evaluate(state.editor.getValue());
});



// ========================= Debugging =========================
window.state = state;
// window.io = io;
// window.socket = socket;

window.term = term;
// term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');

import ansiEscapes from 'ansi-escapes';
window.ansi = ansiEscapes

// const term2 = new Terminal()
// window.term2 = term2
// term2.open($('#terminal-attach'))
// term2.write('terminal-attach')
