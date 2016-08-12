icebreaker-msgpack
============
MessagePack v5 as pull-stream

[![Sauce Test Status](https://saucelabs.com/browser-matrix/icebreaker-msgpack.svg)](https://saucelabs.com/u/icebreaker-msgpack)

[![Build Status](https://travis-ci.org/alligator-io/icebreaker-msgpack.svg?branch=master)](https://travis-ci.org/alligator-io/icebreaker-msgpack)
## Prerequisites
```bash
npm install --save icebreaker
```
## Install
```bash
npm install --save icebreaker-msgpack
```

## Example
```javascript
var _ = require('icebreaker')
var msgpack = require('icebreaker-msgpack')

_(['a','b',1,2,3],msgpack.encode(),msgpack.decode(),_.log())

```
## License

MIT
