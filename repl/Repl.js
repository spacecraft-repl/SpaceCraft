const pty = require('node-pty');
const COMMANDS = require('./LangCommands.js');

const Repl = {
  language: null,
  process: null,

  init(language) {
    console.log(`${Date().slice(4, 33)} -- [Repl.init(language = ${language})]`);

    const command = COMMANDS[language];
    if (command) {
      this.process = pty.spawn(command);
      this.language = language;
      console.log(`${Date().slice(4, 33)} -- INITIALIZED ${command}`);
      return this;
    }

    // TODO: refactor
    console.log('WARNING: Unknown Language! Setting language to ruby...');
    this.init('ruby');
    return this;
  },

  write(string) {
    console.log(`${Date().slice(4, 33)} -- [Repl.write(string = ${string})]`);
    this.process.write(string + '\n');
  },

  untilCondIsMet(condFunc, interval = 1, value) {
    return new Promise((resolve, reject) => {
      (function wait() {
        if (condFunc()) return resolve(value);
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
