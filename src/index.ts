import stringify from 'fast-safe-stringify'

export default errToJSON

const nonEnumerablePropsToCopy = ['code', 'errno', 'syscall']

function errToJSON<T extends {}>(err: Error): T {
  let json
  // @ts-ignore
  if (typeof err.toJSON === 'function') {
    // @ts-ignore
    json = err.toJSON()
  } else {
    // stub error tojson
    const stubbed = 'toJSON' in Error.prototype
    // @ts-ignore
    const toJSON = Error.prototype.toJSON
    // @ts-ignore
    Error.prototype.toJSON = function () {
      const json = {
        // Add all enumerable properties
        ...this,
        // normal props
        name: this.name,
        message: this.message,
        stack: this.stack,
      }

      nonEnumerablePropsToCopy.forEach((key) => {
        // @ts-ignore
        if (key in this) json[key] = this[key]
      })

      return JSON.parse(stringify(json))
    }

    // get error json
    // @ts-ignore
    json = err.toJSON()

    // unstub error tojson
    // @ts-ignore
    if (stubbed) Error.prototype.toJSON = toJSON
  }

  // return error json
  return json
}

export function parse(json: { message: string }) {
  const err = new Error(json.message)
  const stack = err.stack || ''
  Object.assign(err, json)
  if (err.stack === stack) {
    // remove stacktrace generated by error constructor above
    err.stack = stack.slice(0, stack.indexOf('\n'))
  }
  return err
}
