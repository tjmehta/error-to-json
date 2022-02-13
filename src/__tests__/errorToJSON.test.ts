import errToJSON from '../index'
import regExpEscape from 'escape-string-regexp'

describe('error to json', function () {
  it('should convert an error w/ non-enumerable props to json', function () {
    const err = new TypeError('boom')
    const nonEnumerableProps = ['code', 'errno', 'syscall']
    nonEnumerableProps.forEach(function (prop) {
      Object.defineProperty(err, prop, {
        // val is just prop
        value: prop,
      })
    })
    // @ts-ignore
    err.json = {
      toJSON() {
        return {
          some: 'json',
        }
      },
    }
    const json = errToJSON(err)
    // @ts-ignore
    json.stack = cleanStack(json.stack)
    expect(json).toMatchInlineSnapshot(`
      Object {
        "code": "code",
        "errno": "errno",
        "json": Object {
          "some": "json",
        },
        "message": "boom",
        "name": "TypeError",
        "stack": "TypeError: boom
          at Object.<anonymous> (/src/__tests__/errorToJSON.test.ts:6:17)
          at Promise.then.completed (/node_modules/jest-circus/build/utils.js:391:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/node_modules/jest-circus/build/utils.js:316:10)
          at _callCircusTest (/node_modules/jest-circus/build/run.js:218:40)
          at _runTest (/node_modules/jest-circus/build/run.js:155:3)
          at _runTestsForDescribeBlock (/node_modules/jest-circus/build/run.js:66:9)
          at _runTestsForDescribeBlock (/node_modules/jest-circus/build/run.js:60:9)
          at run (/node_modules/jest-circus/build/run.js:25:3)",
        "syscall": "syscall",
      }
    `)
  })

  it('should convert an error w/ enumerable props to json', function () {
    var err = new TypeError('boom')
    var extended = {
      data: {
        someModel: {
          foo: 10,
          bar: 20,
          qux: function () {},
          toJSON: function () {
            return { foo: 10, bar: 20 }
          },
        },
        someData: {
          a: 1,
          b: 2,
          c: 3,
        },
        err: Object.assign(new Error('boom2'), {
          data: {
            someDeepData: 1,
            err: new Error('boom3'),
          },
        }),
      },
      statusCode: 400,
    }
    Object.assign(err, extended)
    var json = errToJSON(err)
    // @ts-ignore
    json.stack = cleanStack(json.stack)
    // @ts-ignore
    json.data.err.stack = cleanStack(json.data.err.stack)
    // @ts-ignore
    json.data.err.data.err.stack = cleanStack(json.data.err.data.err.stack)
    expect(json).toMatchInlineSnapshot(`
      Object {
        "data": Object {
          "err": Object {
            "data": Object {
              "err": Object {
                "message": "boom3",
                "name": "Error",
                "stack": "Error: boom3
          at Object.<anonymous> (/src/__tests__/errorToJSON.test.ts:69:18)
          at Promise.then.completed (/node_modules/jest-circus/build/utils.js:391:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/node_modules/jest-circus/build/utils.js:316:10)
          at _callCircusTest (/node_modules/jest-circus/build/run.js:218:40)
          at _runTest (/node_modules/jest-circus/build/run.js:155:3)
          at _runTestsForDescribeBlock (/node_modules/jest-circus/build/run.js:66:9)
          at _runTestsForDescribeBlock (/node_modules/jest-circus/build/run.js:60:9)
          at run (/node_modules/jest-circus/build/run.js:25:3)",
              },
              "someDeepData": 1,
            },
            "message": "boom2",
            "name": "Error",
            "stack": "Error: boom2
          at Object.<anonymous> (/src/__tests__/errorToJSON.test.ts:66:28)
          at Promise.then.completed (/node_modules/jest-circus/build/utils.js:391:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/node_modules/jest-circus/build/utils.js:316:10)
          at _callCircusTest (/node_modules/jest-circus/build/run.js:218:40)
          at _runTest (/node_modules/jest-circus/build/run.js:155:3)
          at _runTestsForDescribeBlock (/node_modules/jest-circus/build/run.js:66:9)
          at _runTestsForDescribeBlock (/node_modules/jest-circus/build/run.js:60:9)
          at run (/node_modules/jest-circus/build/run.js:25:3)",
          },
          "someData": Object {
            "a": 1,
            "b": 2,
            "c": 3,
          },
          "someModel": Object {
            "bar": 20,
            "foo": 10,
          },
        },
        "message": "boom",
        "name": "TypeError",
        "stack": "TypeError: boom
          at Object.<anonymous> (/src/__tests__/errorToJSON.test.ts:50:15)
          at Promise.then.completed (/node_modules/jest-circus/build/utils.js:391:28)
          at new Promise (<anonymous>)
          at callAsyncCircusFn (/node_modules/jest-circus/build/utils.js:316:10)
          at _callCircusTest (/node_modules/jest-circus/build/run.js:218:40)
          at _runTest (/node_modules/jest-circus/build/run.js:155:3)
          at _runTestsForDescribeBlock (/node_modules/jest-circus/build/run.js:66:9)
          at _runTestsForDescribeBlock (/node_modules/jest-circus/build/run.js:60:9)
          at run (/node_modules/jest-circus/build/run.js:25:3)",
        "statusCode": 400,
      }
    `)
  })

  it('should invoke toJSON if error already has toJSON', () => {
    const err = new Error()
    const json = {}
    // @ts-ignore
    err.toJSON = () => json
    expect(errToJSON(err)).toBe(json)
  })

  it('should work with Error-alike objects', () => {
    const err = {
      name: 'Error',
      message: 'boom',
      stack: 'Error: boom\n',
    }
    const json = {
      name: 'Error',
      message: 'boom',
      stack: 'Error: boom\n',
    }
    expect(errToJSON(err)).toStrictEqual(json)
  })

  it('should work with non Error-alike objects', () => {
    const err = {
      name: 'Error',
      message: 'boom',
    }
    const json = {
      name: 'Error',
      message: 'boom',
    }
    expect(errToJSON(err)).toStrictEqual(json)
  })
})

function cleanStack(stack: string) {
  return stack
    .replace(new RegExp(regExpEscape(process.cwd()), 'g'), '')
    .replace(/.*\/wallaby\/.*\n/g, '')
    .replace(/.* processTicksAndRejections .*(\n|$)/g, '')
    .replace(/queueRunner.js:77:41\n/g, 'queueRunner.js:77:41')
}
