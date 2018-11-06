const $ = (selector) => document.querySelector(selector);

const term = new Terminal();
term.open(document.getElementById('terminal'));
term.write('REPL Prototype > ');

const socket = io('http://localhost:3000');

socket.on('output', ({ output }) => {
  term.write(output);
});

socket.on('connect', () => {
  socket.emit('execRepl', { language: 'ruby' });
});

socket.on('disconnect', function(){});

let state = {
  line: '',
};

const evaluate = (line) => (
  socket.emit('execute', { line })
);

const handleButtonPress = (event) => {
  const language = document.querySelector('input').value

  socket.emit('execRepl', { language });
}

const handleTerminalKeypress = (event) => {
  const textArea = $('.xterm-helper-textarea');
  if (event.target !== textArea) return;
  term.write(event.key);
  state.line += event.key;
}

const handleEnterReleased = () => {
  term.write('\r\n');

  evaluate(state.line)
  state.line = ''
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

document.querySelector('button').addEventListener('click', event => {
  handleButtonPress(event);
});

var editor = CodeMirror.fromTextArea(myTextarea, {
  lineNumbers: true,
});
