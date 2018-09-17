import {isFunction, extend} from 'lodash'

const _originStorage = function () {
  var pluses = /\+/g

  function encode (s) {
    return _cookie.raw ? s : encodeURIComponent(s)
  }

  function decode (s) {
    return _cookie.raw ? s : decodeURIComponent(s)
  }

  function stringifyCookieValue (value) {
    return encode(_cookie.json ? JSON.stringify(value) : String(value))
  }

  function parseCookieValue (s) {
    if (s.indexOf('"') === 0) {
      s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    }
    try {
      s = decodeURIComponent(s.replace(pluses, ' '))
      return _cookie.json ? JSON.parse(s) : s
    } catch (e) {}
  }
  function read (s, converter) {
    var value = _cookie.raw ? s : parseCookieValue(s)
    return isFunction(converter) ? converter(value) : value
  }
  var _cookie = function (key, value, options) {
    // Write
    if (arguments.length > 1 && !isFunction(value)) {
      options = extend({}, _cookie.defaults, options)
      if (typeof options.expires === 'number') {
        var days = options.expires
        var t = options.expires = new Date()
        t.setMilliseconds(t.getMilliseconds() + days * 864e+5)
      }
      return (document.cookie = [
        encode(key), '=', stringifyCookieValue(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path ? '; path=' + options.path : '',
        options.domain ? '; domain=' + options.domain : '',
        options.secure ? '; secure' : ''
      ].join(''))
    }
    var result = key ? undefined : {}
    var cookies = document.cookie ? document.cookie.split('; ') : []
    var i = 0
    var l = cookies.length
    for (; i < l; i++) {
      var parts = cookies[i].split('=')
      var name = decode(parts.shift())
      var cookie = parts.join('=')
      if (key === name) {
        result = read(cookie, value)
        break
      }
      if (!key && (cookie = read(cookie)) !== undefined) {
        result[name] = cookie
      }
    }
    return result
  }

  // originStorage
  return (function () {
    var cookieKeyPrefix = '__localStorage__'
    var supportLocalStorage = true
    try {
      window.localStorage.setItem('__test__', 1)
      window.localStorage.getItem('__test__')
      window.localStorage.removeItem('__test__')
    } catch (e) {
      supportLocalStorage = false
    }

    if (supportLocalStorage) {
      return {
        get: function (key) {
          return window.localStorage.getItem(key)
        },
        set: function (key, value) {
          return window.localStorage.setItem(key, value)
        },
        clear: function () {
          return window.localStorage.clear()
        },
        remove: function (key) {
          return window.localStorage.removeItem(key)
        }
      }
    } else {
      return {
        get: function (key) {
          return _cookie(cookieKeyPrefix + key)
        },
        set: function (key, value) {
          return _cookie(cookieKeyPrefix + key, value, {
            expires: 365
          })
        },
        clear: function () {
          var cookies = document.cookie.split(';')
          for (var i = 0; i < cookies.length; i++) {
            var key = cookies[i].split('=')[0]
            if (key.indexOf(cookieKeyPrefix) === 0) {
              _cookie(key, '', {
                expires: -1
              })
            }
          }
        },
        remove: function (key) {
          return _cookie(cookieKeyPrefix + key, '', {
            expires: -1
          })
        }
      }
    }
  })()
}

// export default () => {
const _localStorage = function () {
  const originStorage = _originStorage()

  this.defaultOption = {
    maxAge: 0 // ms
  }

  this.get = function (k) {
    var self = this
    var a = originStorage.get(k)
    var _return
    try {
      var json = JSON.parse(a)
      var expiresTimestamp = json.e
      if (expiresTimestamp && Date.now() > expiresTimestamp) {
        _return = undefined
        self.remove(k)
      } else {
        _return = json.a
      }
    } catch (e) {
      _return = undefined
    }
    return _return
  }

  this.set = function (k, v, option) {
    option = extend(true, extend({}, this.defaultOption), option)
    var o = {
      a: v,
      e: option.maxAge > 0 ? (Date.now() + option.maxAge) : 0
    }
    originStorage.set(k, typeof o === 'string' ? o : JSON.stringify(o))
  }

  this.clear = function () {
    return originStorage.clear()
  }

  this.remove = function (k) {
    return originStorage.remove(k)
  }
}

export default new _localStorage()
