# localstorage-cookie
make localstorage like cookie

### Usage:

```js
import cookie from 'localstorage-cookie'

// set
cookie.set('key-name', 'value', {
  // options
  maxAge: 1000 * 60 * 60 * 24 // ms
})

// get
cookie.get('key-name')

// remove
cookie.remove('key-name')

// clear (this will clear all cookie which domain you set)
cookie.clear()
```
