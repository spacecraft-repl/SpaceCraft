import { Terminal } from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import 'xterm/dist/xterm.css'

Terminal.applyAddon(fit)

// @todo: Uncomment or remove.
// import * as attach from 'xterm/lib/addons/attach/attach';
// Terminal.applyAddon(attach);

const term = new Terminal()

// @todo: Fix highlighting so that text is visible.
term.setOption('theme', {
  foreground: '#abb2bf',
  background: '#282c34',
  cursor: '#ed663e',
  cursorAccent: '#e06c75',
  black: '#98c379',
  red: '#d85030',
  green: '#59DC76',
  yellow: '#DCB759',
  blue: '#597EDC',
  magenta: '#DC59BF',
  cyan: '#30B8D8',
  white: '#b9c1cb',
  brightBlack: '#56b6c2',
  brightRed: '#ed663e',
  brightGreen: '#6DED3E',
  brightYellow: '#ffc022',
  brightBlue: '#abb2bf',
  brightMagenta: '#3a3f4b',
  brightCyan: '#5c6370',
  brightWhite: '#ffffff'
})

term.setOption('cursorBlink', true)
term.setOption('enableBold', true)
term.setOption('fontSize', 15)
term.setOption('fontFamily', 'monospace')
term.setOption('tabStopWidth', 2)

export default term
