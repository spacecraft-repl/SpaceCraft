'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function attach (term, socket, bidirectional, buffered) {
  bidirectional = (typeof bidirectional === 'undefined') ? true : bidirectional
  term.socket = socket

  term.flushBuffer = () => {
    term.write(term.attachSocketBuffer)
    term.attachSocketBuffer = null
  }

  term.pushToBuffer = (data) => {
    if (term.attachSocketBuffer) {
      term.attachSocketBuffer += data
    } else {
      term.attachSocketBuffer = data
      setTimeout(term.flushBuffer, 10)
    }
  }

  // var myTextDecoder

  term.getMessage = function (ev) {
    // var str
    // if (typeof ev.data === 'object') {
    //   if (ev.data instanceof ArrayBuffer) {
    //     if (!myTextDecoder) myTextDecoder = new TextDecoder()
    //     str = myTextDecoder.decode(ev.data)
    //   } else {
    //     throw new Error('TODO: handle Blob?')
    //   }
    // }
    buffered 
      ? term.pushToBuffer(ev.data)
      : term.write(ev.data)
      // ? term.pushToBuffer(str || ev.data)
      // : term.write(str || ev.data)
  }

  term.sendData = (data) => {
    socket.send(data)
  }

  socket.on('message', term.getMessage)
  // socket.addEventListener('message', term.getMessage)
  if (bidirectional) term.on('data', term.sendData)
  socket.addEventListener('close', term.detach.bind(term, socket))
  socket.addEventListener('error', term.detach.bind(term, socket))
}
exports.attach = attach

function detach (term, socket) {
  var term = term
  term.off('data', term.sendData)
  socket = (typeof socket === 'undefined') ? term.socket : socket
  if (socket) socket.removeEventListener('message', term.getMessage)
  delete term.socket
}
exports.detach = detach

function apply (terminalConstructor) {
  terminalConstructor.prototype.attach = function (socket, bidirectional, buffered) {
    attach(this, socket, bidirectional, buffered)
  }
  terminalConstructor.prototype.detach = function (socket) {
    detach(this, socket)
  }
}
exports.apply = apply
