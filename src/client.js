import { $ } from './utils.js';
import term from './term.js';
import './main.css';
import { editor, socket } from './editor.js'

term.open($('#terminal'));
term.writeln('WELCOME TO SPACECRAFT!');

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
  console.log(`${Date().slice(4, 33)} -- [socket.on('output', fn)] output: ${output}`);
  updateLine(output);
  state.currentOutput = output;
  console.log('OUTPUT', output.split('\n'));
  state.currentPrompt = output.split('\n').pop();
});

socket.on('langChange', ({ language, data }) => {
  console.log(`${Date().slice(4, 33)} -- [socket.on('langChange', fn)] language: ${language}, data: ${data}`);
  state.editor.setOption('mode', language);
  state.language = language;
  term.reset();
  state.currentOutput = data;
  state.currentPrompt = data.split('\n').pop();
  term.write(data);
});

socket.on('clear', () => {
  console.log(`${Date().slice(4, 33)} -- [socket.on('clear'), fn]`);
  term.reset();
});

socket.on('connect', () => {
  console.log(`${Date().slice(4, 33)} -- [socket.on('connect'), fn]`);
  socket.emit('initRepl', { language: state.language });
});

socket.on('syncLine', ({ line }) => {
  console.log(`${Date().slice(4, 33)} -- [socket.on('syncLine', fn)] line: ${line}`);
  state.line = line;
  updateLine(line);
});

// TODO: fill in...?
socket.on('disconnect', () => {
  console.log(`${Date().slice(4, 33)} -- [socket.on('disconnect', fn)]`);
});

const ClientRepl = {
  evaluate(line) {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.evaluate(line = ${line})]`);
    socket.emit('execute', { line });
  },

  run(line) {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.run(line = ${line})]`);
    socket.emit('execute', { line, clear: true });
  },

  emitReplLine() {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.emitReplLine()]`);
    socket.emit('updateLine', { line: state.line });
  },

  handleLanguageClick(_event) {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.handleLanguageClick(_event = ${_event})]`);
    state.line = '';
    this.emitReplLine();
    socket.emit('initRepl', { language: languageInput.value });
  },

  handleTerminalKeypress(key) {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.handleTerminalKeypress(key = ${key})]`);
    state.line += key;
    this.emitReplLine();
    term.write(key);
  },

  handleTerminalKeydown(event) {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.handleTerminalKeydown(event = ${event})]`);
    const key = event.key;
    if      (key === 'Enter')     this.handleEnter();
    else if (key === 'Backspace') this.handleBackspace();
  },

  handleEnter() {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.handleEnter()] -- state.line: ${state.line}`);
    const line = state.line;
    state.line = '';
    this.emitReplLine();
    this.evaluate(line);
  },

  handleBackspace() {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.handleBackspace()]`);
    if (state.line === '') return;
    state.line = state.line.slice(0, -1);
    this.emitReplLine();
    term.write('\b \b');
  },

  handleLanguageKeypress(event) {
    console.log(`${Date().slice(4, 33)} -- [ClientRepl.handleLanguageKeypress(event = ${event})]`);
    if (event.key !== 'Enter') return;
    this.handleLanguageClick();
  },
};

languageButton.addEventListener('click', ClientRepl.handleLanguageClick.bind(ClientRepl));
languageInput.addEventListener('keypress', ClientRepl.handleLanguageKeypress.bind(ClientRepl));

term.on('keypress', ClientRepl.handleTerminalKeypress.bind(ClientRepl));
term.on('keydown', ClientRepl.handleTerminalKeydown.bind(ClientRepl));

// Clear repl input line before/after hitting the 'Run' button.
// Right now the line is visibly cleared, but if you hit enter in the repl after hitting the 'Run' button,
// the previous input will still be executed.

runButton.addEventListener('click', (event) => {
  console.log(`${Date().slice(4, 33)} -- [runButton.onclick(event = ${event})]`);
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
