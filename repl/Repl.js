const pty = require('node-pty');
const COMMANDS = require('./LangCommands.js');

const Repl = {
  language: null,
  process: null,

  init(language) {
    const command = COMMANDS[language];
    if (command) {
      this.process = pty.spawn(command);
      this.language = language;

      console.log(`INITIALIZED ${command}`);
      return this;
    } 

    throw 'Unknown Language';
  },

  write(string) {
    this.process.write(string + '\n');
  },

  bufferWrite(string, ms = 10) {
    return new Promise((resolve, reject) => {
      let result = '';

      let concatResult = (data) => {
        result += data;
      };

      this.process.write(string + '\n');

      this.process.on('data', concatResult);

      setTimeout(() => {
        resolve(result);
        this.process.removeListener('data', concatResult);
      }, ms); // wait for output to buffer
    });
  },

  bufferRead() {
    return new Promise((resolve, reject) => {
      let result = '';

      let concatResult = (data) => {
        result += data;
      };

      this.process.on('data', concatResult);

      setTimeout(() => {
        resolve(result);
        this.process.removeListener('data', concatResult);
      }, 500); // wait for output to buffer
    });
  },

  kill() {
    if (this.process) this.process.kill();
    this.process = null;
    this.language = null;
  },

  id() {
    return this.process.pid;
  },
};

module.exports = Repl;
