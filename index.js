var exists = require('101/exists')

module.exports = errToJSON

function errToJSON (err) {
  var keys = [
    'name',
    'message',
    'stack',
    'code',
    'errno',
    'syscall'
  ].concat(Object.keys(err))
  // cache Error.prototype.toJSON
  var cachedToJSON = Error.prototype.toJSON
  // stub Error.prototype.toJSON (converts nested errors to json)
  Error.prototype.toJSON = stubToJSON
  // convert to json
  var json = keys.reduce(function (json, key, i) {
    var val = err[key]
    if (exists(val)) {
      if (typeof val === 'object') {
        Error.prototype.toJSON
        val = JSON.parse(JSON.stringify(val))
      }
      json[key] = val
    }
    return json
  }, {})
  // restore Error.prototype.toJSON
  if (cachedToJSON === undefined) {
    delete Error.prototype.toJSON
  } else {
    Error.prototype.toJSON = cachedToJSON
  }
  return json
}

function stubToJSON () {
  return errToJSON(this)
}
