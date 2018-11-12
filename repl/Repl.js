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

  // TODO: Improve clarity of promises in bufferWrite and bufferRead.
  // TODO: Add reject function and/or catch clauses to all promises and 'thens'
  //       in this code and throughout project, so that all errors will be
  //       handled and/or logged.
  bufferWrite(string, bufferInterval = 5, write = true) {
    return new Promise((resolve, _reject) => {
      let result = '';
      let dataReceived = false;

      const concatResult = (data) => {
        result += data;
        dataReceived = true;
      };

      if (write) this.process.write(string + '\n');

      this.process.on('data', concatResult);

      new Promise((res) => {
        // TODO: how does this interval get cleared if no data is received?
        const intervalId = setInterval(() => {
          if (!dataReceived) return;
          clearInterval(intervalId);
          res();
        }, 1);
      }).then(() => {
        // TODO: how does this interval get cleared if currResult never equals result?
        let currResult = result;
        const intervalId = setInterval(() => {
          if (currResult !== result) return currResult = result;
          clearInterval(intervalId);
          this.removeListener('data', concatResult);
          resolve(result);
        }, bufferInterval);
      });
    });
  },

  bufferRead(bufferInterval) {
    return this.bufferWrite('', bufferInterval, write = false);
  },

  kill() {
    if (this.process) this.process.kill();
    this.process = null;
    this.language = null;
  },

  removeListener(event, func) {
    this.process && this.process.removeListener(event, func);
  },

  // TODO: delete this if not used anywhere
  // id() {
  //   console.log(`${Date().slice(4, 33)} -- [Repl.id()]`);
  //   return this.process.pid;
  // },
};

module.exports = Repl;
