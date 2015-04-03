var test = require('tape')
var _ = require('icebreaker')
require('./index.js')

function log(item){
 console.log(JSON.stringify(item))
}

test('encode/decode',function(t){
  var testArr  = ['test1','test2','test3',{a:'b'},1,2,3,new Buffer('test')]

  _(
      testArr,
      _.chain().msgpack().encode().decode().collect(function(err,data){
        t.equal(err,null)
        t.same(data,testArr)
        log(data)
        t.end()
      })
  )

})

test('encode/decode custom type with a codec',function(t){
  function codecType(value){
    this.value = value
  }

  _.msgpack.register(
    _.msgpack.codec(0x41,codecType,
      function(){
       return _.map(function(obj){  // through stream
         return obj.value
       })
      },
      function(){
        return _(_.map(function(obj){ // through stream
          return new codecType(obj.toString())
        }))
      }
    )
  )

  var testArr = [new codecType('A'),new codecType('B'), new codecType('C')]
  _(
    testArr,
    _.chain()
    .msgpack()
    .encode()
    .decode()
    .collect(function(err,data){
      t.equal(err,null)
      t.same(data,testArr)
      log(data)
      t.end()
    })
  )
})

test('encode/decode custom type with a encoder/decoder',function(t){
  function testType(value){
    this.value = value
  }

  _.msgpack.register(
    _.msgpack.encoder(function(obj){
      return obj instanceof testType
    },
    function(){
      return _.chain()
      .map(function(obj){
        var header = new Buffer(1)
        header.writeInt8(0x44,0)
        return [header,JSON.stringify(obj.value)]
      })
      .flatten()
    }
    ),
    _.msgpack.decoder(0x44,function(){
      return _.map(function(data){
        return new testType(JSON.parse(data))
      })
    })
  )

  var testArr = [
    new testType('test1'),
    new testType('test2'),
    3,
    4,
    new Buffer('test5'),
    'test6'
  ]

  _(
    testArr,
    _.chain()
    .msgpack()
    .encode()
    .decode()
    .collect(function(err,data){
      t.equal(err,null)
      log(data)
      t.same(data,testArr)
      t.end()
    })
  )

}
)
