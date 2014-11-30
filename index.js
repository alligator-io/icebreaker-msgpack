var msgpack = require('msgpack5')()
var bl = require('bl')
var looper = require('looper')
var _ = require('icebreaker')

_.mixin({
  msgpack:{
    encode:function(){
      return _.asyncMap(function(chunk,callback){
        try{
          callback(null,msgpack.encode(chunk).slice(0))
        }
        catch(err){
          callback(err)
        }
      })
    },
    decode:function(){
      return function(read){
        var ended  = false

        return function(abort,callback){
          read(abort,function next(end,chunk){
            if(end){
              if(ended)return
              ended=end
              return read(ended=end,callback)
            }

            var buffer = bl().append(chunk)

            looper(function(consume){
              if(buffer.length>0){
                try{
                  callback(null,msgpack.decode(buffer))
                  return consume()
                }catch(err){
                  return next(err)
                }
              }

              if(!ended) read(null,next)
            })

          })
        }
      }
    }
  }
})