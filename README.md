# error-to-json [![Build Status](https://travis-ci.org/tjmehta/error-to-json.svg?branch=master)](https://travis-ci.org/tjmehta/error-to-json)
Returns a JSON representation of an error (handles nested errors and calls nested toJSONs)

# Installation
```bash
npm i --save error-to-json
```

# Usage

Example: toJSON
```js
var errToJSON = require('error-to-json')

var model = {
  _json: {
    x: 1,
    y: 2
  }
  helper: function () {/*...*/},
  toJSON: function () {
    return this._json
  }
}
var err = new Error('boom')
err.data = {
  err: new TypeError('boom2'),
  model: model
}
var json = errorToJSON(err)
/*
{
  "name": "Error",
  "message": "boom",
  "stack": "Error: boom\n    ....",
  "data": {
    "err": { // nested error was also converted to json
      "name": "TypeError",
      "message": "boom2",
      "stack": "TypeError: boom2\n    ...."
    },
    "model": { // toJSON was called!
      "x": 1,
      "y": 2
    }
  }
}
 */

```

Example: Parse
```js
var parseErr = require('error-to-json').parse

var err = parse({
  message: 'boom2',
  stack: 'Error: boom2\n  at ...\n  at...'
})
/*
  > err
  [ Error: boom2 ]
  > err.stack
  `Error: boom2
    at ...
    at ...`
*/

var err2 = parse({
  message: 'boom'
  // no stack
})
/*
  > err2
  [ Error: boom ]
  > err2.stack
  'Error: boom'
*/
```


#License
MIT
