var describe = global.describe
var it = global.it

var assign = require('101/assign')
var expect = require('chai').expect

var errToJSON = require('../index.js')

describe('error to json', function () {
  it('should convert an error w/ non-enumerable props to json', function (done) {
    var err = new TypeError('boom')
    var nonEnumerableProps = [
      'code',
      'errno',
      'syscall'
    ]
    nonEnumerableProps.forEach(function (prop) {
      Object.defineProperty(err, prop, {
        // val is just prop
        value: prop
      })
    })
    var json = errToJSON(err)
    expect(json.name).to.equal('TypeError')
    expect(json.stack).to.match(/TypeError:/)
    nonEnumerableProps.forEach(function (prop) {
      // val is just prop
      expect(json[prop]).to.equal(prop)
    })
    done()
  })

  it('should convert an error w/ enumerable props to json', function (done) {
    var err = new TypeError('boom')
    var extended = {
      data: {
        someModel: {
          foo: 10,
          bar: 20,
          qux: function () {},
          toJSON: function () {
            return { foo: 10, bar: 20 }
          }
        },
        someData: {
          a: 1,
          b: 2,
          c: 3
        },
        err: assign(new Error('boom2'), {
          data: {
            someDeepData: 1,
            err: new Error('boom3')
          }
        })
      },
      statusCode: 400
    }
    assign(err, extended)
    var json = errToJSON(err)
    expect(json.name).to.equal('TypeError')
    expect(json.message).to.equal('boom')
    expect(json.stack).to.match(/TypeError:/)
    // expect(json.data).to.deep.contain(['someModel', 'someData', 'err'])
    expect(json.data.someModel).to.deep.equal({
      foo: 10,
      bar: 20
    })
    expect(json.data.someData).to.deep.equal({
      a: 1,
      b: 2,
      c: 3
    })
    expect(json.data.err.name).to.equal('Error')
    expect(json.data.err.message).to.equal('boom2')
    expect(json.data.err.stack).to.match(/Error:/)
    expect(json.data.err.data.someDeepData).to.deep.equal(1)
    expect(json.data.err.data.err.name).to.equal('Error')
    expect(json.data.err.data.err.message).to.equal('boom3')
    expect(json.data.err.data.err.stack).to.match(/Error:/)
    expect(json.statusCode).to.equal(400)
    expect(json.data.err.stack).to.match(/Error:/)
    expect(json.data.err.data.err.stack).to.match(/Error:/)
    done()
  })
})