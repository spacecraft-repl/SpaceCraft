import CodeMirror from 'codemirror/lib/codemirror.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror-one-dark-theme/one-dark.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/ruby/ruby.js';

import { $ } from './utils.js'

const code = $('.codemirror-textarea');

const editor = CodeMirror.fromTextArea(code, {
  lineNumbers: true,
  theme: 'one-dark',
  tabSize: 2,
  mode: 'ruby',
});

// Debugging
window.CodeMirror = CodeMirror;
window.editor = editor;

export default editor;
