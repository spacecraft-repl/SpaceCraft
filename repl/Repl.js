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

  // TODO: Remove repetitive code in bufferWrite and bufferRead
  // TODO: Improve clarity of promises in bufferWrite and bufferRead
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

      new Promise((res) => {
        // TODO: how does this interval get cleared if no data is received?
        const id = setInterval(() => {
          if (dataReceived) {
            console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): new Promise(fn(res)) -- if (dataReceived)] -- before 'clearInterval(id); res()'`);
            clearInterval(id);
            res();
            console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): new Promise(fn(res)) -- if (dataReceived)] -- after 'clearInterval(id); res()'`);
          }
        }, 1);
      }).then(() => {
        let currResult = result;

        const id = setInterval(() => {
        // TODO: how does this interval get cleared if currResult never equals result?
          if (currResult === result) {
            console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): new Promise(fn(res)).then -- if currResult === result] -- before 'resolve(result)'`);
            resolve(result);
            console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): new Promise(fn(res)).then -- if currResult === result] -- after 'resolve(result)', before 'clearInterval(id)'`);
            clearInterval(id);

            console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): new Promise(fn(res)).then -- if currResult === result] -- after 'clearInterval(id)', before 'this.process.removeListener("data", concatResult)'`);
            // added nil guard:
            this.process && this.process.removeListener('data', concatResult);      
            console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): new Promise(fn(res)).then -- if currResult === result] -- after 'this.process.removeListener("data", concatResult)'`);
          } else {
            console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): new Promise(fn(res)).then -- else currResult !== result] -- before 'currResult = result'`);
            currResult = result;
            console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): new Promise(fn(res)).then -- else currResult !== result] -- after 'currResult = result'`);
          }
        }, 4);
      });

      setTimeout(() => {
        console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): setTimeout()] -- before 'resolve(result)'`);
        resolve(result);
        console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): setTimeout()] -- after 'resolve(result)'`);

        console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): setTimeout()] -- before 'removeListener("data", concatResult)'`);
        // added nil guard:
        this.process && this.process.removeListener('data', concatResult);
        console.log(`${Date().slice(4, 33)} -- [Repl.bufferWrite(string, ms): setTimeout()] -- after 'removeListener("data", concatResult)'`);
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
        // added nil guard:
        this.process && this.process.removeListener('data', concatResult);
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
