var describe = global.describe
var it = global.it

var expect = require('chai').expect

var parseErr = require('../index.js').parse

describe('parse', function () {
  it('should convert json (w/out stack) to error', function (done) {
    var json = {
      message: 'boom',
      data: {
        foo: 1
      }
    }

    var err = parseErr(json)
    expect(err).to.be.an.instanceOf(Error)
    expect(err.message).to.equal(json.message)
    expect(err.data).to.equal(json.data)
    expect(err.stack).to.equal('Error: ' + err.message)
    done()
  })

  it('should convert json (w/ stack) to error', function (done) {
    var json = {
      message: 'boom',
      data: {
        foo: 1
      },
      stack: new Error().stack
    }

    var err = parseErr(json)
    expect(err).to.be.an.instanceOf(Error)
    expect(err.message).to.equal(json.message)
    expect(err.data).to.equal(json.data)
    expect(err.stack).to.equal(json.stack)
    done()
  })
})
