'use strict'

const debug = require('debug')('Repl')

// @todo: Check if we should add some or all of the boilerplate in the node-pty readme.
const pty = require('node-pty')
const COMMANDS = require('./LangCommands.js')

const Repl = {
  // @todo: Check if it's necessary to set these two props to `null`.
  language: null,
  process: null,

  init (language) {
    debug(`[Repl.init(language = "${language}")]`)
    const command = COMMANDS[language]
    if (command) {
      this.process = pty.spawn(command)
      this.language = language
      debug('  initialized command: %s, this.process: %o, this.language: "%s"', command, this.process, this.language)
    }
  },

  write (string) {
    debug(`[Repl.write(string = ${string})]`)
    this.process.write(string)
  },

  kill () {
    debug('[kill()] this.process: %o', this.process)

    // @todo: Check if `kill` is the best method to use here.
    if (this.process) {
      this.process.removeAllListeners('data')
      this.process.kill()
      this.process = null
      debug('Repl process killed.')
    }
    this.language = null
  }
}

module.exports = Repl
