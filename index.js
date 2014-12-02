var msgpack = require('msgpack5')()
var bl = require('bl')
var looper = require('looper')
var _ = require('icebreaker')
var assert = require('assert')

function isFunction(obj) {
  return typeof obj === 'function'
}

function isEncoder(obj) {
  return obj instanceof Object && obj.type === 'encoder'
}

function isDecoder(obj) {
  return obj instanceof Object && obj.type === 'decoder'
}

function isCodec(obj) {
  return obj instanceof Object && obj.type === 'codec'
}

_.mixin({
  msgpack : {

    register : function() {
      function registerEncoder(encoder, callback) {
        if (!isFunction(encoder.check))
          return callback('encoder has no check function')

        msgpack.registerEncoder(encoder.check, function(obj) {
          var buffer = bl()

          _([ obj ], encoder(), _.drain(function(chunk) {
            buffer.append(chunk)
          },
          function(err) {
            if (err) _([ err ], _.log())
          }))

          return buffer.slice(0)
        })

        callback()
      }

      function registerDecoder(decoder, callback) {
        msgpack.registerDecoder(decoder.subtype, function(data) {
          return _([ data ], decoder())
        })
        return callback()
      }

      return _(
        [].slice.apply(arguments),
        _.asyncMap(function(stream, callback) {
          if (isCodec(stream)) {
            var codec = stream

            if (!isEncoder(codec.encoder))
              return callback(
                'codec encoder is required and must be a _.msgpack.encoder.'
              )

            if (!isDecoder(codec.decoder))
              return callback(
                'codec decoder is required and must be a _.msgpack.decoder.'
              )

            return registerEncoder(codec.encoder, function(err) {
              if (err) return callback(err)
              registerDecoder(codec.decoder, callback)
            })
          }

          if (isEncoder(stream)) return registerEncoder(stream, callback)
          if (isDecoder(stream)) return registerDecoder(stream, callback)

          callback()
        }),
        _.onEnd(function(err) {
          if (err === true) return
          assert(err == null || err === true, err)
        })
      )
    },

    encoder : function(check, encode) {
      var enc = encode
      enc.type = 'encoder'
      enc.check = check
      return enc
    },

    decoder : function(type, decoder) {
      var decode = decoder
      decode.type = 'decoder'
      decode.subtype = type
      return decode
    },

    codec : function(type, constructor, encode, decode) {
      return {
        type : 'codec',
        encoder : _.msgpack.encoder(function(obj) {
          return obj instanceof constructor
        },
        function() {
          return _(encode(), _.map(function(obj) {
            var header = new Buffer(1)
            header.writeInt8(type, 0)
            return [ header, obj ]
          }),
          _.flatten()
          )
        }),
        decoder : _.msgpack.decoder(type, decode)
      }
    },

    encode : function() {
      return _.asyncMap(function(chunk, callback) {
        try {
          callback(null, msgpack.encode(chunk).slice(0))
        }
        catch (err) {
          callback(err)
        }
      })
    },

    decode : function() {
      return _(
        _.through(function(read) {
          var ended = false

          return function(abort, callback) {
            read(abort, function next(end, chunk) {
              if (end) {
                if (ended) return

                ended = end
                return read(ended = end, callback)
              }

              var buffer = bl().append(chunk)

              looper(function(consume) {
                if (buffer.length > 0) {
                  try {
                    var decoded = msgpack.decode(buffer)
                    callback(null, isFunction(decoded) ? decoded : [ decoded ])
                    return consume()
                  }
                  catch (err) {
                    return next(err)
                  }
                }

                if (!ended) read(null, next)
              })
            })
          }
        })(),
        _.flatten()
      )
    }
  }
})