import { parse as parseErr } from '../index'

describe('parse', function () {
  it('should convert json (w/out stack) to error', function (done) {
    var json = {
      message: 'boom',
      data: {
        foo: 1,
      },
    }

    var err = parseErr(json)
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe(json.message)
    expect(err.data).toBe(json.data)
    expect(err.stack).toMatchInlineSnapshot(`
    "Error: boom
        at Object.<anonymous> (/home/piranna/github/error-to-json/src/__tests__/parse.test.js:12:15)
        at Promise.then.completed (/home/piranna/github/error-to-json/node_modules/jest-circus/build/utils.js:292:26)
        at new Promise (<anonymous>)
        at callAsyncCircusFn (/home/piranna/github/error-to-json/node_modules/jest-circus/build/utils.js:233:10)
        at _callCircusTest (/home/piranna/github/error-to-json/node_modules/jest-circus/build/run.js:314:40)
        at processTicksAndRejections (node:internal/process/task_queues:95:5)
        at _runTest (/home/piranna/github/error-to-json/node_modules/jest-circus/build/run.js:250:3)
        at _runTestsForDescribeBlock (/home/piranna/github/error-to-json/node_modules/jest-circus/build/run.js:125:9)
        at _runTestsForDescribeBlock (/home/piranna/github/error-to-json/node_modules/jest-circus/build/run.js:120:9)
        at run (/home/piranna/github/error-to-json/node_modules/jest-circus/build/run.js:70:3)
        at runAndTransformResultsToJestFormat (/home/piranna/github/error-to-json/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapterInit.js:122:21)
        at jestAdapter (/home/piranna/github/error-to-json/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:79:19)
        at runTestInternal (/home/piranna/github/error-to-json/node_modules/jest-runner/build/runTest.js:367:16)
        at runTest (/home/piranna/github/error-to-json/node_modules/jest-runner/build/runTest.js:444:34)"
    `)
    done()
  })

  it('should convert json (w/ stack) to error', function (done) {
    var json = {
      message: 'boom',
      data: {
        foo: 1,
      },
      stack: new Error().stack,
    }

    var err = parseErr(json)
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe(json.message)
    expect(err.data).toBe(json.data)
    expect(err.stack).toBe(json.stack)
    done()
  })
})
