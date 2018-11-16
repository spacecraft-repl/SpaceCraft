'use strict';

const debug = require('debug')('Repl');

// @todo: Check if we should add some or all of the boilerplate in the node-pty readme.
const pty = require('node-pty');
const COMMANDS = require('./LangCommands.js');

const Repl = {
  // @todo: Check if it's necessary to set these two props to `null`.
  language: null,
  process: null,

  init(language) {
    debug(`[Repl.init(language = "${language}")]`);
    const command = COMMANDS[language];
    if (command) {
      this.process = pty.spawn(command);
      this.language = language;
      debug(`  INITIALIZED command: ${command}`);
      debug('  this.process: %O, this.language: "%s"', this.process, this.language)
      // @todo: Is it necessary to return `this` here? -- it doesn't appear to be used anywhere.
      return this;
    }

    // @todo: Refactor or remove.
    debug('WARNING: Unknown Language! Setting language to ruby...');
    return this.init('ruby');
  },


  write(string) {
    debug(`[Repl.write(string = ${string})]`);
    // @todo: Check if we also need a carriage return here, like in the node-pty readme.
    this.process.write(string + '\n');
  },

  // @todo: Check if `value` is being passed from somewhere, or is always `undefined`.
  // @todo: Don't use default value in a middle param.
  // @todo: Can interval be changed to a constant?
  untilCondIsMet(condFunc, interval = 1, value) {
    debug('[untilCondIsMet(condFunc = %s, interval = %s, value = %s)]', condFunc, interval, value)

    // @todo: Check if the return value of `untilCondIsMet` is actually getting used.
    return new Promise((resolve) => {
      debug('  `return new Promise((resolve) => {` resolve: %s', resolve);
      // @todo: Why do we need an IIFE here?
      (function wait() {
        debug('    [wait()] wait: %s', wait);
        // @todo: Check where `resolve(value)` is getting returned to...
        if (condFunc()) {
          debug('if (condFunc()) --> return resolve(value = "%s")', value);
          return resolve(value);
        }
        setTimeout(wait, interval);
      })();
    });
  },

  bufferRead(bufferInterval) {
    return this.bufferWrite('', bufferInterval, write = false);
  },

  kill() {
    this.process && this.process.removeAllListeners('data');
    if (this.process) this.process.kill();
    this.process = null;
    this.language = null;
  },
};

module.exports = Repl;
  bufferRead(bufferInterval) {
    debug('[bufferRead(bufferInterval = %s)]', bufferInterval)

    // @done: Removed `write = false` because it creates a global variable.
    // return this.bufferWrite('', bufferInterval, write = false);
    return this.bufferWrite('', bufferInterval, false);
  },

  kill() {
    debug('[kill()] this.process: %o', this.process)
    // @todo: Check if `kill` is the best method to use here.
    if (this.process) {
      this.process.removeAllListeners('data');
      this.process.kill();
    }
    debug('Repl process killed.')
    this.process = null;
    this.language = null;
  },
};

module.exports = Repl;
};

module.exports = Repl;
