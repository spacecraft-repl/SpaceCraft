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


  // @todo: Delete this function, or use it within `bufferWrite`.
  // write(string) {
  //   debug(`[Repl.write(string = ${string})]`);
  //   // @todo: Check if we need a carriage return here, like in the node-pty readme.
  //   this.process.write(string + '\n');
  // },

  // @todo: Check if `value` is being passed from somewhere, or is always `undefined`.
  // @todo: Don't use default value in a middle param.
  untilCondIsMet(condFunc, interval = 1, value) {
    debug('[untilCondIsMet(condFunc = %s, interval = %s, value = %s)]', condFunc, interval, value)
    // @todo: Check if the return value of `untilCondIsMet` is actually getting used.
    return new Promise((resolve) => {
      debug('  `return new Promise((resolve) => {` resolve: %s', resolve)
      // @todo: Why do we need an IIFE here?
      (function wait() {
        debug('    [wait()] wait: %s', wait)
        // @todo: Check where `resolve(value)` is getting returned to...
        if (condFunc()) return resolve(value);
        setTimeout(wait, interval);
      })();
    });
  },

  // @todo: Improve clarity of bufferWrite and bufferRead.
  // @todo: Add reject function and/or catch clauses to all promises and 'thens'
  //        in this code and throughout project, so that all errors will be
  //        handled and/or logged.
  // @todo: Rename `write` param to something more descriptive.
  bufferWrite(string, bufferInterval = 5, write = true) {
    debug('[bufferWrite(string = %s, bufferInterval = %s, write = %s)]', string, bufferInterval, write)
    let result = '';

    const concatResult = (data) => {
      debug('  [concatResult(data = %s)], result: %s', data, result)
      // @todo: Check if return is necessary here.
      return result += data;
    };

    const isDataReceived = () => {
      debug('  [isDataReceived()], result: %s', result)
      return result !== '';
    };

    if (write) this.process.write(string + '\n');
    this.process.on('data', concatResult);

    // @todo: Check how async arrow functions within Promise constructors work.
    return new Promise(async (resolve) => {
      debug('  `return new Promise(async (resolve) => {` resolve: %s', resolve)
      await this.untilCondIsMet(isDataReceived);

      let currResult = result;

      // @todo: Delete this function, since it's not being used anywhere.
      // const noNewDataReceived = () => currResult === result;

      // @todo: See if this can be refactored to avoid using an interval.
      const intervalId = setInterval(() => {
        debug('  [setInterval()]')

        // @todo: Check where currResult is being returned to.
        if (currResult !== result) return currResult = result;

        debug('  intervalId: %s', intervalId)
        clearInterval(intervalId);

        // @todo: Check if it's necessary to remove listener every time.
        this.removeListener('data', concatResult);

        debug('  NEXT LINE: `resolve(result = %s)`', result)
        resolve(result);
      }, bufferInterval);
    });
  },

  // @todo: Rename.
  bufferRead(bufferInterval) {
    debug('[bufferRead(bufferInterval = %s)]', bufferInterval)

    // @done: Removed `write = false` because it creates a global variable.
    // return this.bufferWrite('', bufferInterval, write = false);
    return this.bufferWrite('', bufferInterval, write);
  },

  kill() {
    debug('[kill()] this.process: %o', this.process)
    // @todo: Check if `kill` is the best method to use here.
    if (this.process) this.process.kill();
    debug('Repl process killed.')
    this.process = null;
    this.language = null;
  },

  // @todo: Rename `event` to `eventName`.
  removeListener(event, func) {
    debug('[removeListener(event = %s, func = %s)]', event, func)
    this.process && this.process.removeListener(event, func);
  },

  // @todo: Delete this if not used anywhere.
  // id() {
  //   debug(`[Repl.id()]`);
  //   return this.process.pid;
  // },
};

module.exports = Repl;
