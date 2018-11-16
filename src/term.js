import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import 'xterm/dist/xterm.css';

Terminal.applyAddon(fit);

// @todo: Uncomment or remove.
// import * as attach from 'xterm/lib/addons/attach/attach';
// Terminal.applyAddon(attach);

const term = new Terminal();

// @todo: Fix highlighting so that text is visible.
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
});

term.setOption('cursorBlink', true);
term.setOption('enableBold', true);
term.setOption('fontSize', 15);
term.setOption('fontFamily', 'monospace');
term.setOption('tabStopWidth', 2);

export default term;
