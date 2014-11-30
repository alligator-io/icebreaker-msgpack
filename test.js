var test = require('tape')
var _ = require('icebreaker')
require('./index.js')

test('encode/decode',function(t){
  var testArr  = ['test1','test2','test3',{a:'b'},1,2,3,new Buffer('test')]

  _(
      testArr,
      _.chain().msgpack().encode().decode().collect(function(err,data){
        t.equal(err,null)
        t.same(data,testArr)
        console.log(data)
        t.end()
      })
  )
})