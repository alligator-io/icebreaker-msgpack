var msgpack = require('msgpack5')()
var bl = require('bl')
var looper = require('looper')
var _ = require('icebreaker')

function isFunction(obj) {
  return typeof obj === 'function'
}

_.mixin({
  msgpack: {
    register: msgpack.register,
    registerEncoder: msgpack.registerEncoder,
    registerDecoder: msgpack.registerDecoder,

    encode: function () {
      return _.asyncMap(function (chunk, callback) {
        try {
          callback(null, msgpack.encode(chunk, true).slice(0))
        } catch (err) {
          callback(err)
        }
      })
    },

    decode: _.through(function (read) {
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
    })
  }
})
