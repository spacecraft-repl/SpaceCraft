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

document.addEventListener('DOMContentLoaded', event => {
  let code = $('.codemirror-textarea');

  let editor = CodeMirror.fromTextArea(code, {
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
