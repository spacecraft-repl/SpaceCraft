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

  bufferWrite(string, ms = 10) {
    console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string = ${string}, ms = ${ms})]`);

    return new Promise((resolve, reject) => {
      let result = '';
      let dataReceived = false;

      const concatResult = (data) => {
        console.log(`${Date().slice(4, 33)} -- [bufferWrite: concatResult(data = ${data})]`);

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

      setTimeout(() => {
        console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): setTimeout()]`);
        resolve(result);
        this.process.removeListener('data', concatResult);
      }, ms); // wait for output to buffer
    });
  },

  bufferRead(ms = 400) {
    console.log(`${Date().slice(4, 33)} -- [Repl.bufferRead(ms = ${ms})]`);
    return new Promise((resolve, reject) => {
      let result = '';

      const concatResult = (data) => {
        console.log(`${Date().slice(4, 33)} -- [bufferRead: concatResult(data = ${data})]`);
        result += data;
      };

      this.process.on('data', concatResult);

      setTimeout(() => {
        console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): setTimeout()]`);
        resolve(result);
        this.process.removeListener('data', concatResult);
      }, ms); // wait for output to buffer
    });
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
};

module.exports = Repl;
