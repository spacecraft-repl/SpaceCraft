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
      let dataReceived = false;

      const concatResult = (data) => {
        result += data;
        dataReceived = true;
      };

      this.process.write(string + '\n');
      this.process.on('data', concatResult);

      new Promise(res => {
        const id = setInterval(() => {
          if (dataReceived) {
            clearInterval(id);
            res();
          }
        }, 1);
      }).then(() => {
        let currResult = result;

        const id = setInterval(() => {
          
          if (currResult === result) {
            resolve(result);
            clearInterval(id);
            this.process.removeListener('data', concatResult);      
          } else {
            currResult = result;
          }
        }, 4);
      });
    });
  },

  bufferRead(ms = 400) {
    return new Promise((resolve, reject) => {
      let result = '';
      const concatResult = (data) => (result += data);

      this.process.on('data', concatResult);

      setTimeout(() => {
        resolve(result);
        this.process.removeListener('data', concatResult);
      }, ms); // wait for output to buffer
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
