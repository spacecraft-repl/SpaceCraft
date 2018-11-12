import { $ } from './utils.js';
import term from './term.js';
import './main.css';
import { editor, socket } from './editor.js'

term.open($('#terminal'));

let state = {
  editor,
  line: '',
  language: 'ruby',
  currentOutput: [],
  currentPrompt: '',
};

const languageSelect = $('#language');
const runButton = $('button.execute');

const updateLine = output => { term.write('\u001b[2K\r' + state.currentPrompt + output) }

// TODO: clear state.line after user hits Run button
socket.on('output', ({ output }) => {
  updateLine(output);
  state.currentOutput = output;
  state.currentPrompt = output.split('\n').pop();
});

socket.on('langChange', ({ language, data }) => {
  state.editor.setOption('mode', language);
  state.language = language;
  languageSelect.value = language;

  term.reset();
  state.currentOutput = data;
  state.currentPrompt = data.split('\n').pop();
  term.write(data);
});

socket.on('clear', () => {
  term.reset();
});

socket.on('connect', () => {

});

socket.on('syncLine', ({ line }) => {
  state.line = line;
  updateLine(line);
});

// TODO: fill in...?
socket.on('disconnect', () => {
});

const ClientRepl = {
  evaluate(line) {
    socket.emit('execute', { line });
  },

  run(line) {
    socket.emit('execute', { line, clear: true });
  },

  emitReplLine() {
    socket.emit('updateLine', { line: state.line });
  },

  handleTerminalKeypress(key) {
    state.line += key;
    this.emitReplLine();
    term.write(key);
  },

  handleTerminalKeydown(event) {
    const key = event.key;
    if      (key === 'Enter')     this.handleEnter();
    else if (key === 'Backspace') this.handleBackspace();
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

  handleLanguageChange() {
    state.line = '';
    this.emitReplLine();
    socket.emit('initRepl', { language: languageSelect.value });    
  }
};

languageSelect.addEventListener('change', ClientRepl.handleLanguageChange.bind(ClientRepl));

term.on('keypress', ClientRepl.handleTerminalKeypress.bind(ClientRepl));
term.on('keydown', ClientRepl.handleTerminalKeydown.bind(ClientRepl));

// Clear repl input line before/after hitting the 'Run' button.
// Right now the line is visibly cleared, but if you hit enter in the repl after hitting the 'Run' button,
// the previous input will still be executed.

runButton.addEventListener('click', (event) => {
  ClientRepl.run(state.editor.getValue());
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
