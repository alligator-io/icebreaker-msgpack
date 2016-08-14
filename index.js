var msgpack = require('msgpack5')()
var bl = require('bl')
var looper = require('looper')
var _ = typeof icebreaker ==='function'?icebreaker : require('icebreaker');

var m = module.exports = {
  register: msgpack.register,
  registerEncoder: msgpack.registerEncoder,
  registerDecoder: msgpack.registerDecoder,

  encode: function () {
    var ended = false

    return function (read) {
      return function (abort, callback) {
        if (abort) return read(abort, callback)
        if (ended) return callback(ended)
        

        read(abort, function next(end, c) {
          if (end) {
            ended = end
            return callback(end)
          }

          try {
            callback(null, msgpack.encode(c,true).slice(0))
          }
          catch (err) {
            ended = err
          }

          if (!ended) read(null, next)
        })
      }
    }

  },

  decode: function () {
    return function (read) {
      return function (abort, callback) {
        read(abort, function (end, chunk) {
          if (end) return callback(end)
          var buffer = bl().append(chunk)

          looper(function (consume) {
            if (buffer.length > 0 && !end) {
              try {
                callback(null, msgpack.decode(buffer))
                consume()
              } catch (err) {
                read(err, callback)
              }
            }
          })
        })
      }
    }
  },

  serializer: function (ds) {
    return {
      source: _(ds.source, m.encode()),
      sink: _(m.decode(), ds.sink)
    }
  }
}