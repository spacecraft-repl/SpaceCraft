const Repl = require('./Repl.js')

const assert = (expected, actual) => {
  if (expected === actual) {
    console.log('✓ Test passed')
  } else {
    throw new Error(`\nexpected: ${expected}\nactual: ${actual}`)
  }
}

const assertIncludes = (expected, actual) => {
  if (actual.includes(expected)) {
    console.log('✓ Test passed')
  } else {
    throw new Error(`\nexpected: ${expected}\nactual: ${actual}`)
  }
}

async function test () {
  Repl.init('ruby')
  let result = ''

  Repl.process.on('data', output => {
    result += output
  })

  const writeRubyPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      Repl.write('[1,2,3].map(&:to_s)')
      resolve()
    }, 500)
  })

  await writeRubyPromise

  const assertRuby = new Promise((resolve, reject) => {
    setTimeout(() => {
      assert(`irb(main):001:0> [1,2,3].map(&:to_s)\r
=> ["1", "2", "3"]\r
irb(main):002:0> `, result)
      resolve()
    }, 200)
  })

  await assertRuby

  // JavaScript
  const initJavaScriptPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      Repl.kill()
      Repl.init('javascript')
      resolve()
    }, 100)
  })

  await initJavaScriptPromise

  result = ''

  Repl.process.on('data', output => {
    result += output
  })

  const writeJavaScriptPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      Repl.write('[1,2,3].map(String)')
      resolve()
    }, 500)
  })

  await writeJavaScriptPromise

  const assertJavaScript = new Promise((resolve, reject) => {
    setTimeout(() => {
      assert(`\u001b[1G\u001b[0J> \u001b[3G[1,2,3].map(String)\r\r
[ \u001b[32m\'1\'\u001b[39m, \u001b[32m\'2\'\u001b[39m, \u001b[32m\'3\'\u001b[39m ]\r
\u001b[1G\u001b[0J> \u001b[3G`, result)
      resolve()
    }, 200)
  })

  await assertJavaScript

  // Python
  const initPythonPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      Repl.kill()
      Repl.init('python')
      resolve()
    }, 100)
  })

  await initPythonPromise

  result = ''

  Repl.process.on('data', output => {
    result += output
  })

  const writePythonPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      Repl.write('[1,2,3]')
      resolve()
    }, 500)
  })

  await writePythonPromise

  const assertPython = new Promise((resolve, reject) => {
    setTimeout(() => {
      assertIncludes('>>> [1,2,3]\r\n[1, 2, 3]\r\n>>> ', result)
      resolve()
    }, 200)
  })

  await assertPython

  Repl.kill()
}

test()
