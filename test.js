var test = require('tape')
var _ = require('icebreaker')
require('./index.js')

var bufferEqual = require('buffer-equal')

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

test('serializer', function (t) {
  var testArr = [true, false, {
    a: 'b'
  }, 12342342342342, 2, 3, new Buffer('test*!"§')]
  t.plan(testArr.length * 2 + 1)

  var c = 0

  var ds = _.msgpack.serializer({
    source: testArr,
    sink: _.drain(function (d) {
      if (Buffer.isBuffer(d)) {
        t.equal(bufferEqual(d,testArr[c]),true)
      }
      else t.deepEqual(d, testArr[c])
      c++
    },
    function (err) {
      t.equal(err, null)
    })
  })

  _(
    ds,
    _.map(function (data) {
      t.ok(Buffer.isBuffer(data))
      return data
    }),
    ds
  )

})

test('encode/decode custom type',function(t){
  function customType(value){
    this.value = value
  }

_.msgpack.register(0x41,customType,
  function(obj){
    return new Buffer(obj.value)
  },
  function(obj){
    return new customType(obj.toString())
  }
)

var testArr = [new customType('A'),new customType('B'), new customType('C')]
  _(
    testArr,
    _.chain()
    .msgpack()
    .encode()
    .decode()
    .collect(function(err,data){
      console.log(err,data)
      t.equal(err,null)
      t.same(data,testArr)
      log(data)
      t.end()
    })
  )
})

test('encode/decode custom types',function(t){
  function customType(value){
    this.value = value
  }

  function customType2(value){
    this.value = value
  }

_.msgpack.register(0x41,customType,
  function(obj){
    return new Buffer(obj.value)
  },
  function(obj){
    return new customType(obj.toString())
  }
)

_.msgpack.register(0x42,customType2,
  function(obj){
    return new Buffer(obj.value)
  },
  function(obj){
    return new customType(obj.toString())
  }
)

  var testArr = [[
    new customType('test1'),
    new customType('test2'),
    3,
    4,
    new Buffer('tes t.plan(testArr.length * 2 +1)t5'),
    'test6',
    new customType2('test7'),
    new Buffer('test8'),
    2384723984345678943,
    new customType2('test10'),
    new customType('test11'),
    new Buffer('test12'),
    new customType('test13')
  ],[
    new customType('test1'),
    new customType('test2'),
    3,
    4,
    new Buffer('test5'),
    'test6',
    new customType2('test7'),
    new Buffer('test8'),
    2384723984345678943,
    new customType2('test10'),
    new customType('test11'),
    new Buffer('test12'),
    new customType('test13')
  ],
    new customType('test1'),
    new customType('test2'),
    3,
    4,
    new Buffer('test5'),
    'test6',
    new customType2('test7'),
    new Buffer('test8'),
    2384723984345678943,
    new customType2('test10'),
    new customType('test11'),
    new Buffer('test12'),
    new customType('test13')
  ]
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

