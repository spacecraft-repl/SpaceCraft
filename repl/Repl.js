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
    console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string = ${string}, bufferInterval = ${bufferInterval})]`);

    return new Promise((resolve, reject) => {
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
        const id = setInterval(() => {
          if (!dataReceived) return;
          clearInterval(id);
          res();
        }, 1);
      }).then(() => {
        let currResult = result;

        const id = setInterval(() => {
        // TODO: how does this interval get cleared if currResult never equals result?
          if (currResult !== result) return currResult = result;
          clearInterval(id);
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
    console.log(`${Date().slice(4, 33)} -- [Repl.kill()]`);
    if (this.process) this.process.kill();
    this.process = null;
    this.language = null;
  },

  id() {
    console.log(`${Date().slice(4, 33)} -- [Repl.id()]`);
    return this.process.pid;
  },

  removeListener(event, func) {
    this.process && this.process.removeListener(event, func);
  },
};

module.exports = Repl;
