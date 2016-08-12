var _ = require('icebreaker')
var msgpack = require('./')

_(['a','b',1,2,3],msgpack.encode(),msgpack.decode(),_.log())
