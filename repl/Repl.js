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
    return new Promise((resolve, reject) => {
      let result = '';
      let concatResult = data => result += data;

      this.process.write(string + "\n");

      this.process.on('data', concatResult);

      setTimeout(() => {
        resolve(result);
        this.process.removeListener('data', concatResult);
      }, 10);
      // wait for output to buffer
    });

  },

  kill() {
    if (this.process) this.process.kill();
    this.language = null;
  },

  id() {
    return this.process.pid;
  }
};

module.exports = Repl;
