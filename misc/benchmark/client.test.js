const io = require('socket.io-client')
const url = 'http://localhost:3000'

let connect = null
let socket = null

beforeEach(() => {
  socket = io(url)

  connect = () => (
    new Promise(res =>
      socket.on('connect', () => res(true))
    )
  )
})

afterEach(() => {
  socket.disconnect()
})

it('successfully connects to the server', (done) => {
  connect().then(val => {
    expect(val).toBe(true)
    done()
  })
})

it('langChange event is fired', (done) => {
  connect()

  const WELCOME_MSG = 'WELCOME TO SPACECRAFT!\n\r'

  socket.on('langChange', ({ language, output }) => {
    expect(output).toBe(WELCOME_MSG)
    expect(language).toBe('ruby')
    done()
  })
})
