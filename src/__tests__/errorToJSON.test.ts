import errToJSON from '../index'
import regExpEscape from 'escape-string-regexp'

function commonTests() {
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
          at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
          at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
          at new Promise (<anonymous>)
          at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
          at /node_modules/jest-jasmine2/build/queueRunner.js:77:41",
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
    console.log(json.data.err.stack)
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
          at Object.<anonymous> (/src/__tests__/errorToJSON.test.ts:66:18)
          at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
          at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
          at new Promise (<anonymous>)
          at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
          at /node_modules/jest-jasmine2/build/queueRunner.js:77:41",
              },
              "someDeepData": 1,
            },
            "message": "boom2",
            "name": "Error",
            "stack": "Error: boom2
          at Object.<anonymous> (/src/__tests__/errorToJSON.test.ts:63:28)
          at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
          at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
          at new Promise (<anonymous>)
          at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
          at /node_modules/jest-jasmine2/build/queueRunner.js:77:41",
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
          at Object.<anonymous> (/src/__tests__/errorToJSON.test.ts:47:15)
          at Object.asyncJestTest (/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)
          at /node_modules/jest-jasmine2/build/queueRunner.js:47:12
          at new Promise (<anonymous>)
          at mapper (/node_modules/jest-jasmine2/build/queueRunner.js:30:19)
          at /node_modules/jest-jasmine2/build/queueRunner.js:77:41",
        "statusCode": 400,
      }
    `)
  })
}

describe('error to json', function () {
  commonTests()

  it('should invoke toJSON if error already has toJSON', () => {
    const err = new Error()
    const json = {}
    // @ts-ignore
    err.toJSON = () => json
    expect(errToJSON(err)).toBe(json)
  })

  describe('when Error.prototype.toJSON is not writable', () => {
    beforeAll(() => {
      Object.defineProperty(Error.prototype, 'toJSON', {
        value: undefined,
        writable: false,
        configurable: false,
      })
    })
    afterAll(() => {
      Object.defineProperty(Error.prototype, 'toJSON', {
        value: undefined,
        writable: true,
        configurable: true,
      })
    })

    commonTests()
  })
})

function cleanStack(stack: string) {
  if (!stack) return ''
  return stack
    .replace(new RegExp(regExpEscape(process.cwd()), 'g'), '')
    .replace(/.*\/wallaby\/.*\n/g, '')
    .replace(/.* processTicksAndRejections .*(\n|$)/g, '')
    .replace(/queueRunner.js:77:41\n/g, 'queueRunner.js:77:41')
}
