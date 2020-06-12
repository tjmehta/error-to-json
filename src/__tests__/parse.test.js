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
    expect(err.stack).toBe('Error: ' + err.message)
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
