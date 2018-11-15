import { $ } from './utils.js';
import term from './term.js';
import { editor, socket } from './editor.js'
import './main.css';

const languageSelectElem = $('#language');
const runButton = $('.run-editor-code-button');

let state = {
  line: '',
  language: 'ruby',
  currentOutput: [],
  currentPrompt: '',
};


//#~~~~~~~~~~~~~~~~~ Term ~~~~~~~~~~~~~~~~~#
term.open($('#terminal'));

const clearTermLine = () => term.write('\u001b[2K\r');
const setTermPrompt = () => term.write(state.currentPrompt);
const resetTermLine = () => {
  clearTermLine();
  setTermPrompt();
};

const clearTermScreen = () => term.reset();
const resetTermScreen = () => {
  clearTermScreen();
  resetTermLine();
};


//#~~~~~~~~~~~~~~~~~ Socket ~~~~~~~~~~~~~~~~~#
socket.on('output', ({ output }) => {
  resetTermLine();
  term.write(output);
  // @todo: Extract these two lines into a function, if possible.
  state.currentOutput = output;
  state.currentPrompt = output.split('\n').pop();
});

socket.on('langChange', ({ language, data }) => {
  editor.setOption('mode', language);
  state.language = language;
  languageSelectElem.value = language;
  term.reset();
  state.currentOutput = data;
  state.currentPrompt = data.split('\n').pop();
  term.write(data);
});

socket.on('clear', () => {
  state.line = '';
  resetTermScreen();
});

// Sync line of client so that it's the same as the line from server.
socket.on('syncLine', ({ line }) => {
  state.line = line;
  resetTermLine();
  term.write(line);
});

// TODO: fill in...?
socket.on('connect', () => {});
socket.on('disconnect', () => {});



//#~~~~~~~~~~~~~~~~~ ClientRepl ~~~~~~~~~~~~~~~~~#
const ClientRepl = {
  emitEvaluate(code) {
    socket.emit('evaluate', { code });
  },

  emitClear() {
    socket.emit('clear');
  },

  // Emit 'lineChanged` event to server --> server broadcasts 'syncLine' to clients.
  emitLineChanged() {
    socket.emit('lineChanged', { line: state.line });
  },

  emitInitRepl() {
    socket.emit('initRepl', { language: languageSelectElem.value });
  },

  clearLine() {
    state.line = '';
    this.emitLineChanged();
  },

  handleEnter() {
    let lineOfCode = state.line;
    this.clearLine();
    this.emitEvaluate(lineOfCode);
  },

  handleBackspace() {
    if (state.line === '') return;
    state.line = state.line.slice(0, -1);
    this.emitLineChanged();
    term.write('\b \b');
  },

  // Handle character keys.
  handleKeypress(key) {
    state.line += key;
    this.emitLineChanged();
    term.write(key);
  },

  // Handle special keys (Enter, Backspace).
  // @param: KeyboardEvent
  handleKeydown({ key }) {
    if      (key === 'Enter')     this.handleEnter();
    else if (key === 'Backspace') this.handleBackspace();
  },

  handleRunButtonClick() {
    let editorCode = editor.getValue();
    if (editorCode === '') return;
    this.emitClear();
    this.emitEvaluate(editorCode);
  },

  handleLanguageChange() {
    this.clearLine();
    this.emitInitRepl();
  },
};

term.on('keypress', ClientRepl.handleKeypress.bind(ClientRepl));
term.on('keydown',  ClientRepl.handleKeydown.bind(ClientRepl));
runButton.addEventListener('click', ClientRepl.handleRunButtonClick.bind(ClientRepl));
languageSelectElem.addEventListener('change', ClientRepl.handleLanguageChange.bind(ClientRepl));



//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
//#~~~~~~~~~~~~~~~~~~~~~~~~ Debugging ~~~~~~~~~~~~~~~~~~~~~~~~#
//#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
window.state = state;
window.term = term;

// --- Escape codes ---
// import ansiEscapes from 'ansi-escapes';
// window.ansi = ansiEscapes;
// term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
