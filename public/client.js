import { $ } from './utils.js';
import term from './term.js';
import editor from './editor.js';
import './main.css';

term.open($('#terminal'));
term.writeln('WELCOME TO SPACECRAFT!');

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

const languageInput = $('#language');
const languageButton = $('button.language');
const runButton = $('button.execute');

// TODO: clear state.line after user hits Run button
socket.on('output', ({ output }) => {
  term.write('\u001b[2K\r' + state.currentPrompt + output);
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

socket.on('disconnect', function(){});  // TODO: fill in...?

const evaluate = (line) => {
  socket.emit('execute', { line });
};

const emitReplLine = () => {
  socket.emit('updateLine', { line: state.line });
};

const handleLanguageClick = (_) => {
  socket.emit('initRepl', { language: languageInput.value });
};

const handleTerminalKeypress = (key) => {
  state.line += key;
  emitReplLine();
  term.write(key);
};

const handleTerminalKeydown = (event) => {
  const key = event.key;
  if (key === 'Enter') return handleEnter();
  if (key === 'Backspace') return handleBackspace();
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

const handleLanguageKeypress = (event) => {
  if (event.key !== 'Enter') return;
  handleLanguageClick();
};

languageButton.addEventListener('click', handleLanguageClick);
languageInput.addEventListener('keypress', handleLanguageKeypress);

term.on('keypress', handleTerminalKeypress);
term.on('keydown', handleTerminalKeydown);

runButton.addEventListener('click', (event) => {
  evaluate(state.editor.getValue());
});



// ========================= Debugging =========================
window.state = state;
window.io = io;
window.socket = socket;

window.term = term;
// term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');

import ansiEscapes from 'ansi-escapes';
window.ansi = ansiEscapes

// const term2 = new Terminal()
// window.term2 = term2
// term2.open($('#terminal-attach'))
// term2.write('terminal-attach')
