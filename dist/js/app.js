(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],2:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":26,"./_wks":78}],3:[function(require,module,exports){
'use strict';
var at = require('./_string-at')(true);

 // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};

},{"./_string-at":67}],4:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":33}],5:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":71,"./_to-iobject":73,"./_to-length":74}],6:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":8,"./_ctx":13,"./_iobject":30,"./_to-length":74,"./_to-object":75}],7:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":32,"./_is-object":33,"./_wks":78}],8:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":7}],9:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":10,"./_wks":78}],10:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],11:[function(require,module,exports){
var core = module.exports = { version: '2.6.5' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],12:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

},{"./_object-dp":44,"./_property-desc":55}],13:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":1}],14:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],15:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":20}],16:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":24,"./_is-object":33}],17:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],18:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":11,"./_ctx":13,"./_global":24,"./_hide":26,"./_redefine":56}],19:[function(require,module,exports){
var MATCH = require('./_wks')('match');
module.exports = function (KEY) {
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch (f) { /* empty */ }
  } return true;
};

},{"./_wks":78}],20:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],21:[function(require,module,exports){
'use strict';
require('./es6.regexp.exec');
var redefine = require('./_redefine');
var hide = require('./_hide');
var fails = require('./_fails');
var defined = require('./_defined');
var wks = require('./_wks');
var regexpExec = require('./_regexp-exec');

var SPECIES = wks('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
})();

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
    }
    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(
      defined,
      SYMBOL,
      ''[KEY],
      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      }
    );
    var strfn = fns[0];
    var rxfn = fns[1];

    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};

},{"./_defined":14,"./_fails":20,"./_hide":26,"./_redefine":56,"./_regexp-exec":58,"./_wks":78,"./es6.regexp.exec":96}],22:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"./_an-object":4}],23:[function(require,module,exports){
module.exports = require('./_shared')('native-function-to-string', Function.toString);

},{"./_shared":64}],24:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],25:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],26:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":15,"./_object-dp":44,"./_property-desc":55}],27:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":24}],28:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":15,"./_dom-create":16,"./_fails":20}],29:[function(require,module,exports){
var isObject = require('./_is-object');
var setPrototypeOf = require('./_set-proto').set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

},{"./_is-object":33,"./_set-proto":60}],30:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":10}],31:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":40,"./_wks":78}],32:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":10}],33:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],34:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = require('./_is-object');
var cof = require('./_cof');
var MATCH = require('./_wks')('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};

},{"./_cof":10,"./_is-object":33,"./_wks":78}],35:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":4}],36:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":26,"./_object-create":43,"./_property-desc":55,"./_set-to-string-tag":62,"./_wks":78}],37:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":18,"./_hide":26,"./_iter-create":36,"./_iterators":40,"./_library":41,"./_object-gpo":49,"./_redefine":56,"./_set-to-string-tag":62,"./_wks":78}],38:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":78}],39:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],40:[function(require,module,exports){
module.exports = {};

},{}],41:[function(require,module,exports){
module.exports = false;

},{}],42:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;

},{"./_fails":20,"./_iobject":30,"./_object-gops":48,"./_object-keys":51,"./_object-pie":52,"./_to-object":75}],43:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":4,"./_dom-create":16,"./_enum-bug-keys":17,"./_html":27,"./_object-dps":45,"./_shared-key":63}],44:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":4,"./_descriptors":15,"./_ie8-dom-define":28,"./_to-primitive":76}],45:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":4,"./_descriptors":15,"./_object-dp":44,"./_object-keys":51}],46:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":15,"./_has":25,"./_ie8-dom-define":28,"./_object-pie":52,"./_property-desc":55,"./_to-iobject":73,"./_to-primitive":76}],47:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":17,"./_object-keys-internal":50}],48:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],49:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":25,"./_shared-key":63,"./_to-object":75}],50:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":5,"./_has":25,"./_shared-key":63,"./_to-iobject":73}],51:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":17,"./_object-keys-internal":50}],52:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],53:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":11,"./_export":18,"./_fails":20}],54:[function(require,module,exports){
var getKeys = require('./_object-keys');
var toIObject = require('./_to-iobject');
var isEnum = require('./_object-pie').f;
module.exports = function (isEntries) {
  return function (it) {
    var O = toIObject(it);
    var keys = getKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) if (isEnum.call(O, key = keys[i++])) {
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};

},{"./_object-keys":51,"./_object-pie":52,"./_to-iobject":73}],55:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],56:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var $toString = require('./_function-to-string');
var TO_STRING = 'toString';
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":11,"./_function-to-string":23,"./_global":24,"./_has":25,"./_hide":26,"./_uid":77}],57:[function(require,module,exports){
'use strict';

var classof = require('./_classof');
var builtinExec = RegExp.prototype.exec;

 // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }
  if (classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }
  return builtinExec.call(R, S);
};

},{"./_classof":9}],58:[function(require,module,exports){
'use strict';

var regexpFlags = require('./_flags');

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/,
      re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;

},{"./_flags":22}],59:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

},{}],60:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":4,"./_ctx":13,"./_is-object":33,"./_object-gopd":46}],61:[function(require,module,exports){
'use strict';
var global = require('./_global');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_descriptors":15,"./_global":24,"./_object-dp":44,"./_wks":78}],62:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":25,"./_object-dp":44,"./_wks":78}],63:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":64,"./_uid":77}],64:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":11,"./_global":24,"./_library":41}],65:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":1,"./_an-object":4,"./_wks":78}],66:[function(require,module,exports){
'use strict';
var fails = require('./_fails');

module.exports = function (method, arg) {
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};

},{"./_fails":20}],67:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":14,"./_to-integer":72}],68:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('./_is-regexp');
var defined = require('./_defined');

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};

},{"./_defined":14,"./_is-regexp":34}],69:[function(require,module,exports){
var $export = require('./_export');
var defined = require('./_defined');
var fails = require('./_fails');
var spaces = require('./_string-ws');
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = fails(function () {
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;

},{"./_defined":14,"./_export":18,"./_fails":20,"./_string-ws":70}],70:[function(require,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

},{}],71:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":72}],72:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],73:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":14,"./_iobject":30}],74:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":72}],75:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":14}],76:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":33}],77:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],78:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":24,"./_shared":64,"./_uid":77}],79:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":9,"./_core":11,"./_iterators":40,"./_wks":78}],80:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $filter = require('./_array-methods')(2);

$export($export.P + $export.F * !require('./_strict-method')([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":6,"./_export":18,"./_strict-method":66}],81:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":2,"./_array-methods":6,"./_export":18}],82:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":2,"./_array-methods":6,"./_export":18}],83:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $forEach = require('./_array-methods')(0);
var STRICT = require('./_strict-method')([].forEach, true);

$export($export.P + $export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn /* , thisArg */) {
    return $forEach(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":6,"./_export":18,"./_strict-method":66}],84:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":12,"./_ctx":13,"./_export":18,"./_is-array-iter":31,"./_iter-call":35,"./_iter-detect":38,"./_to-length":74,"./_to-object":75,"./core.get-iterator-method":79}],85:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $indexOf = require('./_array-includes')(false);
var $native = [].indexOf;
var NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? $native.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments[1]);
  }
});

},{"./_array-includes":5,"./_export":18,"./_strict-method":66}],86:[function(require,module,exports){
// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = require('./_export');

$export($export.S, 'Array', { isArray: require('./_is-array') });

},{"./_export":18,"./_is-array":32}],87:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":2,"./_iter-define":37,"./_iter-step":39,"./_iterators":40,"./_to-iobject":73}],88:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var toIObject = require('./_to-iobject');
var toInteger = require('./_to-integer');
var toLength = require('./_to-length');
var $native = [].lastIndexOf;
var NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
    // convert -0 to +0
    if (NEGATIVE_ZERO) return $native.apply(this, arguments) || 0;
    var O = toIObject(this);
    var length = toLength(O.length);
    var index = length - 1;
    if (arguments.length > 1) index = Math.min(index, toInteger(arguments[1]));
    if (index < 0) index = length + index;
    for (;index >= 0; index--) if (index in O) if (O[index] === searchElement) return index || 0;
    return -1;
  }
});

},{"./_export":18,"./_strict-method":66,"./_to-integer":72,"./_to-iobject":73,"./_to-length":74}],89:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $map = require('./_array-methods')(1);

$export($export.P + $export.F * !require('./_strict-method')([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":6,"./_export":18,"./_strict-method":66}],90:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $some = require('./_array-methods')(3);

$export($export.P + $export.F * !require('./_strict-method')([].some, true), 'Array', {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /* , thisArg */) {
    return $some(this, callbackfn, arguments[1]);
  }
});

},{"./_array-methods":6,"./_export":18,"./_strict-method":66}],91:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var aFunction = require('./_a-function');
var toObject = require('./_to-object');
var fails = require('./_fails');
var $sort = [].sort;
var test = [1, 2, 3];

$export($export.P + $export.F * (fails(function () {
  // IE8-
  test.sort(undefined);
}) || !fails(function () {
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !require('./_strict-method')($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});

},{"./_a-function":1,"./_export":18,"./_fails":20,"./_strict-method":66,"./_to-object":75}],92:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });

},{"./_export":18,"./_object-assign":42}],93:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":51,"./_object-sap":53,"./_to-object":75}],94:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof');
var test = {};
test[require('./_wks')('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  require('./_redefine')(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}

},{"./_classof":9,"./_redefine":56,"./_wks":78}],95:[function(require,module,exports){
var global = require('./_global');
var inheritIfRequired = require('./_inherit-if-required');
var dP = require('./_object-dp').f;
var gOPN = require('./_object-gopn').f;
var isRegExp = require('./_is-regexp');
var $flags = require('./_flags');
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (require('./_descriptors') && (!CORRECT_NEW || require('./_fails')(function () {
  re2[require('./_wks')('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  require('./_redefine')(global, 'RegExp', $RegExp);
}

require('./_set-species')('RegExp');

},{"./_descriptors":15,"./_fails":20,"./_flags":22,"./_global":24,"./_inherit-if-required":29,"./_is-regexp":34,"./_object-dp":44,"./_object-gopn":47,"./_redefine":56,"./_set-species":61,"./_wks":78}],96:[function(require,module,exports){
'use strict';
var regexpExec = require('./_regexp-exec');
require('./_export')({
  target: 'RegExp',
  proto: true,
  forced: regexpExec !== /./.exec
}, {
  exec: regexpExec
});

},{"./_export":18,"./_regexp-exec":58}],97:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var toLength = require('./_to-length');
var advanceStringIndex = require('./_advance-string-index');
var regExpExec = require('./_regexp-exec-abstract');

// @@match logic
require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[MATCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative($match, regexp, this);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      if (!rx.global) return regExpExec(rx, S);
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

},{"./_advance-string-index":3,"./_an-object":4,"./_fix-re-wks":21,"./_regexp-exec-abstract":57,"./_to-length":74}],98:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var toInteger = require('./_to-integer');
var advanceStringIndex = require('./_advance-string-index');
var regExpExec = require('./_regexp-exec-abstract');
var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, O, replaceValue)
        : $replace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative($replace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }
      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

    // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});

},{"./_advance-string-index":3,"./_an-object":4,"./_fix-re-wks":21,"./_regexp-exec-abstract":57,"./_to-integer":72,"./_to-length":74,"./_to-object":75}],99:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var sameValue = require('./_same-value');
var regExpExec = require('./_regexp-exec-abstract');

// @@search logic
require('./_fix-re-wks')('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[SEARCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
    function (regexp) {
      var res = maybeCallNative($search, regexp, this);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regExpExec(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

},{"./_an-object":4,"./_fix-re-wks":21,"./_regexp-exec-abstract":57,"./_same-value":59}],100:[function(require,module,exports){
'use strict';

var isRegExp = require('./_is-regexp');
var anObject = require('./_an-object');
var speciesConstructor = require('./_species-constructor');
var advanceStringIndex = require('./_advance-string-index');
var toLength = require('./_to-length');
var callRegExpExec = require('./_regexp-exec-abstract');
var regexpExec = require('./_regexp-exec');
var fails = require('./_fails');
var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX = 'lastIndex';
var MAX_UINT32 = 0xffffffff;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { RegExp(MAX_UINT32, 'y'); });

// @@split logic
require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  } else {
    internalSplit = $split;
  }

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = defined(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = $min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
});

},{"./_advance-string-index":3,"./_an-object":4,"./_fails":20,"./_fix-re-wks":21,"./_is-regexp":34,"./_regexp-exec":58,"./_regexp-exec-abstract":57,"./_species-constructor":65,"./_to-length":74}],101:[function(require,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export = require('./_export');
var toLength = require('./_to-length');
var context = require('./_string-context');
var ENDS_WITH = 'endsWith';
var $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = context(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    var search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});

},{"./_export":18,"./_fails-is-regexp":19,"./_string-context":68,"./_to-length":74}],102:[function(require,module,exports){
// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var $export = require('./_export');
var context = require('./_string-context');
var INCLUDES = 'includes';

$export($export.P + $export.F * require('./_fails-is-regexp')(INCLUDES), 'String', {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"./_export":18,"./_fails-is-regexp":19,"./_string-context":68}],103:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":37,"./_string-at":67}],104:[function(require,module,exports){
'use strict';
// 21.1.3.25 String.prototype.trim()
require('./_string-trim')('trim', function ($trim) {
  return function trim() {
    return $trim(this, 3);
  };
});

},{"./_string-trim":69}],105:[function(require,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export = require('./_export');
var $includes = require('./_array-includes')(true);

$export($export.P, 'Array', {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

require('./_add-to-unscopables')('includes');

},{"./_add-to-unscopables":2,"./_array-includes":5,"./_export":18}],106:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  }
});

},{"./_export":18,"./_object-to-array":54}],107:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":24,"./_hide":26,"./_iterators":40,"./_object-keys":51,"./_redefine":56,"./_wks":78,"./es6.array.iterator":87}],108:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.array.map");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.object.values");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.array.for-each");

var _require = require('./common'),
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    getInstallerExt = _require.getInstallerExt,
    getOfficialName = _require.getOfficialName,
    getPlatformOrder = _require.getPlatformOrder,
    loadAssetInfo = _require.loadAssetInfo,
    setRadioSelectors = _require.setRadioSelectors,
    sortByProperty = _require.sortByProperty;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant;

var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container'); // When archive page loads, run:

module.exports.load = function () {
  setRadioSelectors();
  loadAssetInfo(variant, jvmVariant, 'releases', undefined, undefined, buildArchiveHTML, function () {
    // if there are no releases (beyond the latest one)...
    // report an error, remove the loading dots
    loading.innerHTML = '';
    errorContainer.innerHTML = "<p>There are no archived releases yet for ".concat(variant, " on the ").concat(jvmVariant, " JVM.\n      See the <a href='./releases.html?variant=").concat(variant, "&jvmVariant=").concat(jvmVariant, "'>Latest release</a> page.</p>");
  });
};

function buildArchiveHTML(aReleases) {
  var releases = [];
  aReleases.forEach(function (aRelease) {
    var publishedAt = moment(aRelease.timestamp);
    var release = {
      release_name: aRelease.release_name,
      release_link: aRelease.release_link,
      dashboard_link: "https://dash.adoptopenjdk.net/version.html?version=".concat(variant) + "&tag=".concat(encodeURIComponent(aRelease.release_name)),
      release_day: publishedAt.format('D'),
      release_month: publishedAt.format('MMMM'),
      release_year: publishedAt.format('YYYY'),
      platforms: {}
    }; // populate 'platformTableRows' with one row per binary for this release...

    aRelease.binaries.forEach(function (aReleaseAsset) {
      var platform = findPlatform(aReleaseAsset); // Skip this asset if its platform could not be matched (see the website's 'config.json')

      if (!platform) {
        return;
      } // Skip this asset if it's not a binary type we're interested in displaying


      var binary_type = aReleaseAsset.binary_type.toUpperCase();

      if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
        return;
      }

      if (!release.platforms[platform]) {
        release.platforms[platform] = {
          official_name: getOfficialName(platform),
          ordinal: getPlatformOrder(platform),
          assets: []
        };
      }

      release.platforms[platform].assets.push({
        type: binary_type,
        extension: 'INSTALLER' === binary_type ? getInstallerExt(platform) : getBinaryExt(platform),
        size: Math.floor(aReleaseAsset.binary_size / 1024 / 1024),
        installer_link: aReleaseAsset.installer_link || undefined,
        installer_extension: getInstallerExt(platform),
        link: aReleaseAsset.binary_link,
        checksum_link: aReleaseAsset.checksum_link
      });
    });
    Object.values(release.platforms).forEach(function (aPlatform) {
      sortByProperty(aPlatform.assets, 'type');
    }); // Converts the `platforms` object to a sorted array

    release.platforms = sortByProperty(release.platforms, 'ordinal');
    releases.push(release);
  }); // Sort releases by name in descending order.
  // The release timestamp can't be relied upon due to out-of-order releases.
  // Example: 'jdk8u191-b12' was released after 'jdk8u192-b12'

  sortByProperty(releases, 'release_name', true);
  var template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('archive-table-body').innerHTML = template({
    releases: releases
  });
  setPagination();
  loading.innerHTML = ''; // remove the loading dots
  // show the archive list and filter box, with fade-in animation

  var archiveList = document.getElementById('archive-list');
  archiveList.className = archiveList.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
}

function setPagination() {
  var container = document.getElementById('pagination-container');
  var archiveTableBody = document.getElementById('archive-table-body');
  $(container).pagination({
    dataSource: Array.from(archiveTableBody.getElementsByClassName('release-row')).map(function (row) {
      return row.outerHTML;
    }),
    pageSize: 5,
    callback: function callback(rows) {
      archiveTableBody.innerHTML = rows.join('');
    }
  });

  if (container.getElementsByTagName('li').length <= 3) {
    container.classList.add('hide');
  }
}

},{"./common":109,"core-js/modules/es6.array.for-each":83,"core-js/modules/es6.array.from":84,"core-js/modules/es6.array.iterator":87,"core-js/modules/es6.array.map":89,"core-js/modules/es6.object.to-string":94,"core-js/modules/es6.regexp.replace":98,"core-js/modules/es6.string.includes":102,"core-js/modules/es6.string.iterator":103,"core-js/modules/es7.array.includes":105,"core-js/modules/es7.object.values":106,"core-js/modules/web.dom.iterable":107}],109:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.array.some");

require("core-js/modules/es6.array.index-of");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.string.ends-with");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.array.map");

require("core-js/modules/es6.array.sort");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.array.is-array");

require("core-js/modules/es6.array.filter");

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.array.for-each");

// prefix for assets (e.g. logo)
var assetPath = './dist/assets/';

var _require = require('../json/config'),
    platforms = _require.platforms,
    variants = _require.variants; // Enables things like 'lookup["X64_MAC"]'


var lookup = {};
platforms.forEach(function (platform) {
  return lookup[platform.searchableName] = platform;
});
var variant = module.exports.variant = getQueryByName('variant') || 'openjdk8';
var jvmVariant = module.exports.jvmVariant = getQueryByName('jvmVariant') || 'hotspot'; // set variable names for menu elements

var menuOpen = document.getElementById('menu-button');
var menuClose = document.getElementById('menu-close');
var menu = document.getElementById('menu-container');

menuOpen.onclick = function () {
  menu.className = menu.className.replace(/(?:^|\s)slideOutLeft(?!\S)/g, ' slideInLeft'); // slide in animation

  menu.className = menu.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated'); // removes initial hidden property, activates animations
};

menuClose.onclick = function () {
  menu.className = menu.className.replace(/(?:^|\s)slideInLeft(?!\S)/g, ' slideOutLeft'); // slide out animation
};

module.exports.getVariantObject = function (variantName) {
  return variants.find(function (variant) {
    return variant.searchableName === variantName;
  });
};

module.exports.findPlatform = function (binaryData) {
  var matchedPlatform = platforms.filter(function (platform) {
    return platform.hasOwnProperty('attributes') && Object.keys(platform.attributes).every(function (attr) {
      return platform.attributes[attr] === binaryData[attr];
    });
  })[0];
  return matchedPlatform === undefined ? null : matchedPlatform.searchableName;
}; // gets the OFFICIAL NAME when you pass in 'searchableName'


module.exports.getOfficialName = function (searchableName) {
  return lookup[searchableName].officialName;
};

module.exports.getPlatformOrder = function (searchableName) {
  return platforms.findIndex(function (platform) {
    return platform.searchableName == searchableName;
  });
};

module.exports.orderPlatforms = function (input) {
  var attr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'thisPlatformOrder';
  return sortByProperty(input, attr);
};

var sortByProperty = module.exports.sortByProperty = function (input, property, descending) {
  var invert = descending ? -1 : 1;

  var sorter = function sorter(a, b) {
    return invert * (a[property] > b[property] ? 1 : a[property] < b[property] ? -1 : 0);
  };

  if (Array.isArray(input)) {
    return input.sort(sorter);
  } else {
    // Preserve the source object key as '_key'
    return Object.keys(input).map(function (_key) {
      return Object.assign(input[_key], {
        _key: _key
      });
    }).sort(sorter);
  }
}; // gets the BINARY EXTENSION when you pass in 'searchableName'


module.exports.getBinaryExt = function (searchableName) {
  return lookup[searchableName].binaryExtension;
}; // gets the INSTALLER EXTENSION when you pass in 'searchableName'


module.exports.getInstallerExt = function (searchableName) {
  return lookup[searchableName].installerExtension;
}; // gets the LOGO WITH PATH when you pass in 'searchableName'


module.exports.getLogo = function (searchableName) {
  return assetPath + lookup[searchableName].logo;
}; // gets the INSTALLATION COMMAND when you pass in 'searchableName'


module.exports.getInstallCommand = function (searchableName) {
  return lookup[searchableName].installCommand;
}; // gets the CHECKSUM COMMAND when you pass in 'searchableName'


module.exports.getChecksumCommand = function (searchableName) {
  return lookup[searchableName].checksumCommand;
}; // gets the CHECKSUM AUTO COMMAND HINT when you pass in 'searchableName'


module.exports.getChecksumAutoCommandHint = function (searchableName) {
  return lookup[searchableName].checksumAutoCommandHint;
}; // gets the CHECKSUM AUTO COMMAND when you pass in 'searchableName'


module.exports.getChecksumAutoCommand = function (searchableName) {
  return lookup[searchableName].checksumAutoCommand;
}; // gets the PATH COMMAND when you pass in 'searchableName'


module.exports.getPathCommand = function (searchableName) {
  return lookup[searchableName].pathCommand;
}; // This function returns an object containing all information about the user's OS.
// The OS info comes from the 'platforms' array, which in turn comes from 'config.json'.
// `platform` comes from `platform.js`, which should be included on the page where `detectOS` is used.


module.exports.detectOS = function () {
  return platforms.find(function (aPlatform) {
    /*global platform*/
    // Workaround for Firefox on macOS which is 32 bit only
    if (platform.os.family == 'OS X') {
      platform.os.architecture = 64;
    }

    return aPlatform.osDetectionString.toUpperCase().includes(platform.os.family.toUpperCase()) && aPlatform.attributes.architecture.endsWith(platform.os.architecture); // 32 or 64 int
  }) || null;
};

function toJson(response) {
  while (typeof response === 'string') {
    try {
      response = JSON.parse(response);
    } catch (e) {
      return null;
    }
  }

  return response;
} // load latest_nightly.json/nightly.json/releases.json/latest_release.json files
// This will first try to load from openjdk<X>-binaries repos and if that fails
// try openjdk<X>-release, i.e will try the following:
// https://github.com/AdoptOpenJDK/openjdk10-binaries/blob/master/latest_release.json
// https://github.com/AdoptOpenJDK/openjdk10-releases/blob/master/latest_release.json


function queryAPI(release, url, openjdkImp, type, errorHandler, handleResponse) {
  if (!url.endsWith('?')) {
    url += '?';
  }

  if (release !== undefined) {
    url += "release=".concat(release, "&");
  }

  if (openjdkImp !== undefined) {
    url += "openjdk_impl=".concat(openjdkImp, "&");
  }

  if (type !== undefined) {
    url += "type=".concat(type, "&");
  }

  loadUrl(url, function (response) {
    if (response === null) {
      errorHandler();
    } else {
      handleResponse(toJson(response), false);
    }
  });
}

module.exports.loadAssetInfo = function (variant, openjdkImp, releaseType, release, type, handleResponse, errorHandler) {
  if (variant === 'amber') {
    variant = 'openjdk-amber';
  }

  var url = "https://api.adoptopenjdk.net/v2/info/".concat(releaseType, "/").concat(variant);
  queryAPI(release, url, openjdkImp, type, errorHandler, handleResponse);
};

module.exports.loadLatestAssets = function (variant, openjdkImp, releaseType, release, type, handleResponse, errorHandler) {
  if (variant === 'amber') {
    variant = 'openjdk-amber';
  }

  var url = "https://api.adoptopenjdk.net/v2/latestAssets/".concat(releaseType, "/").concat(variant);
  queryAPI(release, url, openjdkImp, type, errorHandler, handleResponse);
};

function loadUrl(url, callback) {
  var xobj = new XMLHttpRequest();
  xobj.open('GET', url, true);

  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == '200') {
      // if the status is 'ok', run the callback function that has been passed in.
      callback(xobj.responseText);
    } else if (xobj.status != '200' && // if the status is NOT 'ok', remove the loading dots, and display an error:
    xobj.status != '0') {
      // for IE a cross domain request has status 0, we're going to execute this block fist, than the above as well.
      callback(null);
    }
  };

  xobj.send(null);
} // build the menu twisties


module.exports.buildMenuTwisties = function () {
  var submenus = document.getElementById('menu-content').getElementsByClassName('submenu');

  for (var i = 0; i < submenus.length; i++) {
    var twisty = document.createElement('span');
    var twistyContent = document.createTextNode('>');
    twisty.appendChild(twistyContent);
    twisty.className = 'twisty';
    var thisLine = submenus[i].getElementsByTagName('a')[0];
    thisLine.appendChild(twisty);

    thisLine.onclick = function () {
      this.parentNode.classList.toggle('open');
    };
  }
};

module.exports.setTickLink = function () {
  var ticks = document.getElementsByClassName('tick');

  for (var i = 0; i < ticks.length; i++) {
    ticks[i].addEventListener('click', function (event) {
      var win = window.open('https://en.wikipedia.org/wiki/Technology_Compatibility_Kit', '_blank');

      if (win) {
        win.focus();
      } else {
        alert('New tab blocked - please allow popups.');
      }

      event.preventDefault();
    });
  }
}; // builds up a query string (e.g. "variant=openjdk8&jvmVariant=hotspot")


var makeQueryString = module.exports.makeQueryString = function (params) {
  return Object.keys(params).map(function (key) {
    return key + '=' + params[key];
  }).join('&');
};

function setUrlQuery(params) {
  window.location.search = makeQueryString(params);
}

function getQueryByName(name) {
  var url = window.location.href;
  var regex = new RegExp('[?&]' + name.replace(/[[]]/g, '\\$&') + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

module.exports.persistUrlQuery = function () {
  var links = Array.from(document.getElementsByTagName('a'));
  var link = (window.location.hostname !== 'localhost' ? 'https://' : '') + window.location.hostname;
  links.forEach(function (eachLink) {
    if (eachLink.href.includes(link)) {
      if (eachLink.href.includes('#')) {
        var anchor = '#' + eachLink.href.split('#').pop();
        eachLink.href = eachLink.href.substr(0, eachLink.href.indexOf('#'));

        if (eachLink.href.includes('?')) {
          eachLink.href = eachLink.href.substr(0, eachLink.href.indexOf('?'));
        }

        eachLink.href = eachLink.href + window.location.search + anchor;
      } else {
        eachLink.href = eachLink.href + window.location.search;
      }
    }
  });
};

module.exports.setRadioSelectors = function () {
  var jdkSelector = document.getElementById('jdk-selector');
  var jvmSelector = document.getElementById('jvm-selector');
  var listedVariants = [];

  function createRadioButtons(name, group, variant, element) {
    if (!listedVariants.length || !listedVariants.some(function (aVariant) {
      return aVariant === name;
    })) {
      var btnLabel = document.createElement('label');
      btnLabel.setAttribute('class', 'btn-label');
      var input = document.createElement('input');
      input.setAttribute('type', 'radio');
      input.setAttribute('name', group);
      input.setAttribute('value', name);
      input.setAttribute('class', 'radio-button');
      input.setAttribute('lts', variant.lts);
      btnLabel.appendChild(input);

      if (group === 'jdk') {
        if (variant.lts === true) {
          btnLabel.innerHTML += "<span>".concat(variant.label, " (LTS)</span>");
        } else if (variant.lts === 'latest') {
          btnLabel.innerHTML += "<span>".concat(variant.label, " (Latest)</span>");
        } else {
          btnLabel.innerHTML += "<span>".concat(variant.label, "</span>");
        }
      } else {
        btnLabel.innerHTML += "<span>".concat(variant.jvm, "</span>");
      }

      element.appendChild(btnLabel);
      listedVariants.push(name);
    }
  }

  for (var x = 0; x < variants.length; x++) {
    var splitVariant = variants[x].searchableName.split('-');
    var jdkName = splitVariant[0];
    var jvmName = splitVariant[1];
    createRadioButtons(jdkName, 'jdk', variants[x], jdkSelector);
    createRadioButtons(jvmName, 'jvm', variants[x], jvmSelector);
  }

  var jdkButtons = document.getElementsByName('jdk');
  var jvmButtons = document.getElementsByName('jvm');

  jdkSelector.onchange = function () {
    var jdkButton = Array.from(jdkButtons).find(function (button) {
      return button.checked;
    });
    setUrlQuery({
      variant: jdkButton.value.match(/(openjdk\d+|amber)/)[1],
      jvmVariant: jvmVariant
    });
  };

  jvmSelector.onchange = function () {
    var jvmButton = Array.from(jvmButtons).find(function (button) {
      return button.checked;
    });
    setUrlQuery({
      variant: variant,
      jvmVariant: jvmButton.value.match(/([a-zA-Z0-9]+)/)[1]
    });
  };

  for (var i = 0; i < jdkButtons.length; i++) {
    if (jdkButtons[i].value === variant) {
      jdkButtons[i].setAttribute('checked', 'checked');
      break;
    }
  }

  for (var _i = 0; _i < jvmButtons.length; _i++) {
    if (jvmButtons[_i].value === jvmVariant) {
      jvmButtons[_i].setAttribute('checked', 'checked');

      break;
    }
  }
};

},{"../json/config":116,"core-js/modules/es6.array.filter":80,"core-js/modules/es6.array.find":82,"core-js/modules/es6.array.find-index":81,"core-js/modules/es6.array.for-each":83,"core-js/modules/es6.array.from":84,"core-js/modules/es6.array.index-of":85,"core-js/modules/es6.array.is-array":86,"core-js/modules/es6.array.iterator":87,"core-js/modules/es6.array.map":89,"core-js/modules/es6.array.some":90,"core-js/modules/es6.array.sort":91,"core-js/modules/es6.object.assign":92,"core-js/modules/es6.object.keys":93,"core-js/modules/es6.object.to-string":94,"core-js/modules/es6.regexp.constructor":95,"core-js/modules/es6.regexp.match":97,"core-js/modules/es6.regexp.replace":98,"core-js/modules/es6.regexp.search":99,"core-js/modules/es6.regexp.split":100,"core-js/modules/es6.string.ends-with":101,"core-js/modules/es6.string.includes":102,"core-js/modules/es6.string.iterator":103,"core-js/modules/es7.array.includes":105,"core-js/modules/web.dom.iterable":107}],110:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

var _require = require('./common'),
    buildMenuTwisties = _require.buildMenuTwisties,
    persistUrlQuery = _require.persistUrlQuery;

document.addEventListener('DOMContentLoaded', function () {
  persistUrlQuery();
  buildMenuTwisties(); // '/index.html' --> 'index'
  // NOTE: Browserify requires strings in `require()`, so this is intentionally more explicit than
  // it normally would be.

  switch (window.location.pathname.split('/').pop().replace(/\.html$/i, '')) {
    case '':
    case 'index':
      return require('./index').load();

    case 'archive':
      return require('./archive').load();

    case 'installation':
      return require('./installation').load();

    case 'nightly':
      return require('./nightly').load();

    case 'releases':
      return require('./releases').load();

    case 'testimonials':
      return require('./testimonials').load();
  }
});

},{"./archive":108,"./common":109,"./index":111,"./installation":112,"./nightly":113,"./releases":114,"./testimonials":115,"core-js/modules/es6.regexp.replace":98,"core-js/modules/es6.regexp.split":100}],111:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.array.for-each");

var _require = require('./common'),
    detectOS = _require.detectOS,
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    loadAssetInfo = _require.loadAssetInfo,
    makeQueryString = _require.makeQueryString,
    setRadioSelectors = _require.setRadioSelectors,
    setTickLink = _require.setTickLink;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant; // set variables for all index page HTML elements that will be used by the JS


var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container');
var dlText = document.getElementById('dl-text');
var dlLatest = document.getElementById('dl-latest');
var dlArchive = document.getElementById('dl-archive');
var dlOther = document.getElementById('dl-other');
var dlIcon = document.getElementById('dl-icon');
var dlIcon2 = document.getElementById('dl-icon-2');
var dlVersionText = document.getElementById('dl-version-text'); // When index page loads, run:

module.exports.load = function () {
  setRadioSelectors();
  removeRadioButtons(); // Try to match up the detected OS with a platform from 'config.json'

  var OS = detectOS();

  if (OS) {
    dlText.innerHTML = "Download for <var platform-name>".concat(OS.officialName, "</var>");
  }

  dlText.classList.remove('invisible');

  var handleResponse = function handleResponse(releasesJson) {
    if (!releasesJson || !releasesJson.release_name) {
      return;
    }

    buildHomepageHTML(releasesJson, {}, OS);
  };

  loadAssetInfo(variant, jvmVariant, 'releases', 'latest', undefined, handleResponse, function () {
    errorContainer.innerHTML = "<p>There are no releases available for ".concat(variant, " on the ").concat(jvmVariant, " JVM.\n      Please check our <a href='nightly.html?variant=").concat(variant, "&jvmVariant=").concat(jvmVariant, "' target='blank'>Nightly Builds</a>.</p>");
    loading.innerHTML = ''; // remove the loading dots
  });
};

function removeRadioButtons() {
  var buttons = document.getElementsByClassName('btn-label');

  for (var a = 0; a < buttons.length; a++) {
    if (buttons[a].firstChild.getAttribute('lts') === 'false') {
      buttons[a].style.display = 'none';
    }
  }
}

function buildHomepageHTML(releasesJson, jckJSON, OS) {
  // set the download button's version number to the latest release
  dlVersionText.innerHTML = releasesJson.release_name;
  var assetArray = releasesJson.binaries;
  var matchingFile = null; // if the OS has been detected...

  if (OS) {
    assetArray.forEach(function (eachAsset) {
      // iterate through the assets attached to this release
      var uppercaseFilename = eachAsset.binary_name.toUpperCase();
      var thisPlatform = findPlatform(eachAsset); // firstly, check if a valid searchableName has been returned (i.e. the platform is recognised)...

      if (thisPlatform) {
        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
        var thisBinaryExtension = getBinaryExt(thisPlatform); // get the binary extension associated with this platform

        if (matchingFile == null) {
          if (uppercaseFilename.includes(thisBinaryExtension.toUpperCase())) {
            var uppercaseOSname = OS.searchableName.toUpperCase();

            if (Object.keys(jckJSON).length !== 0) {
              if (jckJSON[releasesJson.tag_name] && jckJSON[releasesJson.tag_name].hasOwnProperty(uppercaseOSname)) {
                document.getElementById('jck-approved-tick').classList.remove('hide');
                setTickLink();
              }
            } // thirdly, check if the user's OS searchableName string matches part of this binary's name (e.g. ...X64_LINUX...)


            if (uppercaseFilename.includes(uppercaseOSname)) {
              matchingFile = eachAsset; // set the matchingFile variable to the object containing this binary
            }
          }
        }
      }
    });
  } // if there IS a matching binary for the user's OS...


  if (matchingFile) {
    if (matchingFile.installer_link) {
      dlLatest.href = matchingFile.installer_link; // set the main download button's link to be the installer's download url
    } else {
      dlLatest.href = matchingFile.binary_link; // set the main download button's link to be the binary's download url

      dlVersionText.innerHTML += " - ".concat(Math.floor(matchingFile.binary_size / 1024 / 1024), " MB");
    }
  } else {
    dlIcon.classList.add('hide'); // hide the download icon on the main button, to make it look less like you're going to get a download immediately

    dlIcon2.classList.remove('hide'); // un-hide an arrow-right icon to show instead

    dlLatest.href = "./releases.html?".concat(makeQueryString({
      variant: variant,
      jvmVariant: jvmVariant
    })); // set the main download button's link to the latest releases page for all platforms.
  } // remove the loading dots, and make all buttons visible, with animated fade-in


  loading.classList.add('hide');
  dlLatest.className = dlLatest.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlOther.className = dlOther.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlArchive.className = dlArchive.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');

  dlLatest.onclick = function () {
    document.getElementById('installation-link').className += ' animated pulse infinite transition-bright';
  }; // animate the main download button shortly after the initial animation has finished.


  setTimeout(function () {
    dlLatest.className = 'dl-button a-button animated pulse';
  }, 1000);
}

},{"./common":109,"core-js/modules/es6.array.for-each":83,"core-js/modules/es6.array.iterator":87,"core-js/modules/es6.object.keys":93,"core-js/modules/es6.object.to-string":94,"core-js/modules/es6.regexp.replace":98,"core-js/modules/es6.string.includes":102,"core-js/modules/es7.array.includes":105,"core-js/modules/web.dom.iterable":107}],112:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.array.last-index-of");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.array.for-each");

var _require = require('./common'),
    detectOS = _require.detectOS,
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    getChecksumCommand = _require.getChecksumCommand,
    getInstallCommand = _require.getInstallCommand,
    getOfficialName = _require.getOfficialName,
    getPathCommand = _require.getPathCommand,
    getPlatformOrder = _require.getPlatformOrder,
    loadAssetInfo = _require.loadAssetInfo,
    orderPlatforms = _require.orderPlatforms,
    setRadioSelectors = _require.setRadioSelectors,
    getChecksumAutoCommandHint = _require.getChecksumAutoCommandHint,
    getChecksumAutoCommand = _require.getChecksumAutoCommand;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant;

var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container');
var platformSelector = document.getElementById('platform-selector');

module.exports.load = function () {
  setRadioSelectors();
  loadAssetInfo(variant, jvmVariant, 'releases', 'latest', undefined, buildInstallationHTML, function () {
    errorContainer.innerHTML = '<p>Error... no installation information has been found!</p>';
    loading.innerHTML = ''; // remove the loading dots
  });
};

function buildInstallationHTML(releasesJson) {
  // create an array of the details for each asset that is attached to a release
  var assetArray = releasesJson.binaries;
  var ASSETARRAY = []; // for each asset attached to this release, check if it's a valid binary, then add a download block for it...

  assetArray.forEach(function (eachAsset) {
    var ASSETOBJECT = {};
    var uppercaseFilename = eachAsset.binary_name.toUpperCase();
    ASSETOBJECT.thisPlatform = findPlatform(eachAsset); // check if the platform name is recognised...

    if (ASSETOBJECT.thisPlatform) {
      ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform) + ' ' + eachAsset.binary_type;
      ASSETOBJECT.thisPlatformType = (ASSETOBJECT.thisPlatform + '-' + eachAsset.binary_type).toUpperCase(); // if the filename contains both the platform name and the matching BINARY extension, add the relevant info to the asset object

      ASSETOBJECT.thisBinaryExtension = getBinaryExt(ASSETOBJECT.thisPlatform);

      if (uppercaseFilename.includes(ASSETOBJECT.thisBinaryExtension.toUpperCase())) {
        ASSETOBJECT.thisPlatformExists = true;
        ASSETOBJECT.thisBinaryLink = eachAsset.binary_link;
        ASSETOBJECT.thisBinaryFilename = eachAsset.binary_name;
        ASSETOBJECT.thisChecksumLink = eachAsset.checksum_link;
        ASSETOBJECT.thisChecksumFilename = eachAsset.binary_name.replace(ASSETOBJECT.thisBinaryExtension, '.sha256.txt');
        ASSETOBJECT.thisUnzipCommand = getInstallCommand(ASSETOBJECT.thisPlatform).replace('FILENAME', ASSETOBJECT.thisBinaryFilename);
        ASSETOBJECT.thisChecksumCommand = getChecksumCommand(ASSETOBJECT.thisPlatform).replace('FILENAME', ASSETOBJECT.thisBinaryFilename); // the check sum auto command hint is always printed,
        // so we just configure with empty string if not present

        ASSETOBJECT.thisChecksumAutoCommandHint = getChecksumAutoCommandHint(ASSETOBJECT.thisPlatform) || ''; // build download sha256 and verify auto command

        var thisChecksumAutoCommand = getChecksumAutoCommand(ASSETOBJECT.thisPlatform);
        var sha256FileName = ASSETOBJECT.thisChecksumLink;
        var separator = sha256FileName.lastIndexOf('/');

        if (separator > -1) {
          sha256FileName = sha256FileName.substring(separator + 1);
        }

        ASSETOBJECT.thisChecksumAutoCommand = thisChecksumAutoCommand.replace(/FILEHASHURL/g, ASSETOBJECT.thisChecksumLink).replace(/FILEHASHNAME/g, sha256FileName).replace(/FILENAME/g, ASSETOBJECT.thisBinaryFilename);
        var dirName = releasesJson.release_name + (eachAsset.binary_type === 'jre' ? '-jre' : '');
        ASSETOBJECT.thisPathCommand = getPathCommand(ASSETOBJECT.thisPlatform).replace('DIRNAME', dirName);
      }

      if (ASSETOBJECT.thisPlatformExists) {
        ASSETARRAY.push(ASSETOBJECT);
      }
    }
  });
  var template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('installation-template').innerHTML = template({
    htmlTemplate: orderPlatforms(ASSETARRAY)
  });
  /*global hljs*/

  hljs.initHighlightingOnLoad();
  setInstallationPlatformSelector(ASSETARRAY);
  attachCopyButtonListeners();
  window.onhashchange = displayInstallPlatform;
  loading.innerHTML = ''; // remove the loading dots

  var installationContainer = document.getElementById('installation-container');
  installationContainer.className = installationContainer.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
}

function attachCopyButtonListeners() {
  document.querySelectorAll('.copy-code-block').forEach(function (codeBlock) {
    var target = codeBlock.querySelector('code.cmd-block');
    codeBlock.querySelector('.copy-code-button').addEventListener('click', function () {
      return copyElementTextContent(target);
    });
  });
}

function displayInstallPlatform() {
  var platformHash = window.location.hash.substr(1).toUpperCase();
  var thisPlatformInstallation = document.getElementById("installation-container-".concat(platformHash));
  unselectInstallPlatform();

  if (thisPlatformInstallation) {
    platformSelector.value = platformHash;
    thisPlatformInstallation.classList.remove('hide');
  } else {
    var currentValues = [];
    Array.from(platformSelector.options).forEach(function (eachOption) {
      currentValues.push(eachOption.value);
    });
    platformSelector.value = 'unknown';
  }
}

function unselectInstallPlatform() {
  var platformInstallationDivs = document.getElementById('installation-container').getElementsByClassName('installation-single-platform');

  for (var i = 0; i < platformInstallationDivs.length; i++) {
    platformInstallationDivs[i].classList.add('hide');
  }
}

function setInstallationPlatformSelector(thisReleasePlatforms) {
  if (!platformSelector) {
    return;
  }

  if (platformSelector.options.length === 1) {
    thisReleasePlatforms.forEach(function (eachPlatform) {
      var op = new Option();
      op.value = eachPlatform.thisPlatformType;
      op.text = eachPlatform.thisOfficialName;
      platformSelector.options.add(op);
    });
  }

  var OS = detectOS();

  if (OS && window.location.hash.length < 1) {
    platformSelector.value = OS.searchableName;
    window.location.hash = platformSelector.value.toLowerCase();
  }

  displayInstallPlatform();

  platformSelector.onchange = function () {
    window.location.hash = platformSelector.value.toLowerCase();
    displayInstallPlatform();
  };
}

function copyElementTextContent(target) {
  var text = target.textContent;
  var input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  alert('Copied to clipboard');
  document.body.removeChild(input);
}

},{"./common":109,"core-js/modules/es6.array.for-each":83,"core-js/modules/es6.array.from":84,"core-js/modules/es6.array.last-index-of":88,"core-js/modules/es6.regexp.replace":98,"core-js/modules/es6.string.includes":102,"core-js/modules/es6.string.iterator":103,"core-js/modules/es7.array.includes":105}],113:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.array.filter");

require("core-js/modules/es6.string.trim");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.array.for-each");

var _require = require('./common'),
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    getOfficialName = _require.getOfficialName,
    getInstallerExt = _require.getInstallerExt,
    loadAssetInfo = _require.loadAssetInfo,
    setRadioSelectors = _require.setRadioSelectors;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant;

var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container');
var tableHead = document.getElementById('table-head');
var tableContainer = document.getElementById('nightly-list');
var nightlyList = document.getElementById('nightly-table');
var searchError = document.getElementById('search-error');
var numberpicker = document.getElementById('numberpicker');
var datepicker = document.getElementById('datepicker'); // When nightly page loads, run:

module.exports.load = function () {
  setRadioSelectors();
  setDatePicker();
  populateNightly(); // run the function to populate the table on the Nightly page.

  numberpicker.onchange = datepicker.onchange = function () {
    setTableRange();
  };
};

function setDatePicker() {
  $(datepicker).datepicker();
  datepicker.value = moment().format('MM/DD/YYYY');
}

function populateNightly() {
  var handleResponse = function handleResponse(response) {
    // Step 1: create a JSON from the XmlHttpRequest response
    var releasesJson = response.reverse(); // if there are releases...

    if (typeof releasesJson[0] !== 'undefined') {
      var files = getFiles(releasesJson);

      if (files.length === 0) {
        return;
      }

      buildNightlyHTML(files);
    }
  };

  loadAssetInfo(variant, jvmVariant, 'nightly', undefined, undefined, handleResponse, function () {
    errorContainer.innerHTML = '<p>Error... no releases have been found!</p>';
    loading.innerHTML = ''; // remove the loading dots
  });
}

function getFiles(releasesJson) {
  var assets = [];
  releasesJson.forEach(function (release) {
    release.binaries.forEach(function (asset) {
      if (/(?:\.tar\.gz|\.zip)$/.test(asset.binary_name) && findPlatform(asset)) {
        assets.push({
          release: release,
          asset: asset
        });
      }
    });
  });
  return assets;
}

function buildNightlyHTML(files) {
  tableHead.innerHTML = "<tr id='table-header'>\n    <th>Platform</th>\n    <th>Type</th>\n    <th>Date</th>\n    <th>Binary</th>\n    <th>Installer</th>\n    <th>Checksum</th>\n    </tr>";
  var NIGHTLYARRAY = []; // for each release...

  files.forEach(function (file) {
    // for each file attached to this release...
    var eachAsset = file.asset;
    var eachRelease = file.release;
    var NIGHTLYOBJECT = {};
    var nameOfFile = eachAsset.binary_name;
    var type = nameOfFile.includes('-jre') ? 'jre' : 'jdk';
    NIGHTLYOBJECT.thisPlatform = findPlatform(eachAsset); // get the searchableName, e.g. MAC or X64_LINUX.
    // secondly, check if the file has the expected file extension for that platform...
    // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)

    NIGHTLYOBJECT.thisBinaryExtension = getBinaryExt(NIGHTLYOBJECT.thisPlatform); // get the file extension associated with this platform

    NIGHTLYOBJECT.thisInstalleExtension = getInstallerExt(NIGHTLYOBJECT.thisPlatform);

    if (nameOfFile.toUpperCase().includes(NIGHTLYOBJECT.thisBinaryExtension.toUpperCase())) {
      // set values ready to be injected into the HTML
      var publishedAt = eachRelease.timestamp;
      NIGHTLYOBJECT.thisReleaseName = eachRelease.release_name.slice(0, 12);
      NIGHTLYOBJECT.thisType = type;
      NIGHTLYOBJECT.thisReleaseDay = moment(publishedAt).format('D');
      NIGHTLYOBJECT.thisReleaseMonth = moment(publishedAt).format('MMMM');
      NIGHTLYOBJECT.thisReleaseYear = moment(publishedAt).format('YYYY');
      NIGHTLYOBJECT.thisGitLink = eachRelease.release_link;
      NIGHTLYOBJECT.thisOfficialName = getOfficialName(NIGHTLYOBJECT.thisPlatform);
      NIGHTLYOBJECT.thisBinaryLink = eachAsset.binary_link;
      NIGHTLYOBJECT.thisBinarySize = Math.floor(eachAsset.binary_size / 1024 / 1024);
      NIGHTLYOBJECT.thisChecksumLink = eachAsset.checksum_link;
      NIGHTLYOBJECT.thisInstallerLink = eachAsset.installer_link || undefined;
      NIGHTLYARRAY.push(NIGHTLYOBJECT);
    }
  });
  var template = Handlebars.compile(document.getElementById('template').innerHTML);
  nightlyList.innerHTML = template({
    htmlTemplate: NIGHTLYARRAY
  });
  setSearchLogic();
  loading.innerHTML = ''; // remove the loading dots
  // show the table, with animated fade-in

  nightlyList.className = nightlyList.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
  setTableRange(); // if the table has a scroll bar, show text describing how to horizontally scroll

  var scrollText = document.getElementById('scroll-text');
  var tableDisplayWidth = document.getElementById('nightly-list').clientWidth;
  var tableScrollWidth = document.getElementById('nightly-list').scrollWidth;

  if (tableDisplayWidth != tableScrollWidth) {
    scrollText.className = scrollText.className.replace(/(?:^|\s)hide(?!\S)/g, '');
  }
}

function setTableRange() {
  var rows = $('#nightly-table tr');
  var selectedDate = moment(datepicker.value, 'MM-DD-YYYY').format();
  var visibleRows = 0;

  for (var i = 0; i < rows.length; i++) {
    var thisDate = rows[i].getElementsByClassName('nightly-release-date')[0].innerHTML;
    var thisDateMoment = moment(thisDate, 'D MMMM YYYY').format();
    var isAfter = moment(thisDateMoment).isAfter(selectedDate);

    if (isAfter || visibleRows >= numberpicker.value) {
      rows[i].classList.add('hide');
    } else {
      rows[i].classList.remove('hide');
      visibleRows++;
    }
  }

  checkSearchResultsExist();
}

function setSearchLogic() {
  // logic for the realtime search box...
  var $rows = $('#nightly-table tr');
  $('#search').keyup(function () {
    var reg = RegExp('^(?=.*' + $.trim($(this).val()).split(/\s+/).join(')(?=.*') + ').*$', 'i');
    $rows.show().filter(function () {
      return !reg.test($(this).text().replace(/\s+/g, ' '));
    }).hide();
    checkSearchResultsExist();
  });
}

function checkSearchResultsExist() {
  var numOfVisibleRows = $('#nightly-table').find('tr:visible').length;

  if (numOfVisibleRows === 0) {
    tableContainer.style.visibility = 'hidden';
    searchError.className = '';
  } else {
    tableContainer.style.visibility = '';
    searchError.className = 'hide';
  }
}

},{"./common":109,"core-js/modules/es6.array.filter":80,"core-js/modules/es6.array.find":82,"core-js/modules/es6.array.for-each":83,"core-js/modules/es6.regexp.constructor":95,"core-js/modules/es6.regexp.replace":98,"core-js/modules/es6.regexp.split":100,"core-js/modules/es6.string.includes":102,"core-js/modules/es6.string.trim":104,"core-js/modules/es7.array.includes":105}],114:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.array.sort");

require("core-js/modules/es6.array.find");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.array.for-each");

var _require = require('./common'),
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    getInstallerExt = _require.getInstallerExt,
    getLogo = _require.getLogo,
    getOfficialName = _require.getOfficialName,
    getPlatformOrder = _require.getPlatformOrder,
    getVariantObject = _require.getVariantObject,
    loadLatestAssets = _require.loadLatestAssets,
    orderPlatforms = _require.orderPlatforms,
    setRadioSelectors = _require.setRadioSelectors,
    setTickLink = _require.setTickLink;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant;

var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container'); // When releases page loads, run:

module.exports.load = function () {
  setRadioSelectors();
  loadLatestAssets(variant, jvmVariant, 'releases', 'latest', undefined, buildLatestHTML, function () {
    errorContainer.innerHTML = "<p>There are no releases available for ".concat(variant, " on the ").concat(jvmVariant, " JVM.\n      Please check our <a href='nightly.html?variant=").concat(variant, "&jvmVariant=").concat(jvmVariant, "' target='blank'>Nightly Builds</a>.</p>");
    loading.innerHTML = ''; // remove the loading dots
  });
};

function buildLatestHTML(releasesJson) {
  // Populate with description
  var variantObject = getVariantObject(variant + '-' + jvmVariant);

  if (variantObject.descriptionLink) {
    document.getElementById('description_header').innerHTML = "What is ".concat(variantObject.description, "?");
    document.getElementById('description_link').innerHTML = 'Find out here';
    document.getElementById('description_link').href = variantObject.descriptionLink;
  } // Array of releases that have binaries we want to display


  var releases = [];
  releasesJson.forEach(function (releaseAsset) {
    var platform = findPlatform(releaseAsset); // Skip this asset if its platform could not be matched (see the website's 'config.json')

    if (!platform) {
      return;
    } // Skip this asset if it's not a binary type we're interested in displaying


    var binary_type = releaseAsset.binary_type.toUpperCase();

    if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
      return;
    } // Get the existing release asset (passed to the template) or define a new one


    var release = releases.find(function (release) {
      return release.platform_name === platform;
    });

    if (!release) {
      release = {
        platform_name: platform,
        platform_official_name: getOfficialName(platform),
        platform_ordinal: getPlatformOrder(platform),
        platform_logo: getLogo(platform),
        release_name: releaseAsset.release_name,
        release_link: releaseAsset.release_link,
        release_datetime: moment(releaseAsset.timestamp).format('YYYY-MM-DD hh:mm:ss'),
        binaries: []
      };
    } // Add the new binary to the release asset


    release.binaries.push({
      type: binary_type,
      extension: getBinaryExt(platform),
      link: releaseAsset.binary_link,
      checksum_link: releaseAsset.checksum_link,
      installer_link: releaseAsset.installer_link || undefined,
      installer_extension: getInstallerExt(platform),
      size: Math.floor(releaseAsset.binary_size / 1024 / 1024)
    }); // We have the first binary, so add the release asset.

    if (release.binaries.length === 1) {
      releases.push(release);
    }
  });
  releases = orderPlatforms(releases, 'platform_ordinal');
  releases.forEach(function (release) {
    release.binaries.sort(function (binaryA, binaryB) {
      return binaryA.type > binaryB.type ? 1 : binaryA.type < binaryB.type ? -1 : 0;
    });
  });
  var templateSelector = Handlebars.compile(document.getElementById('template-selector').innerHTML);
  var templateInfo = Handlebars.compile(document.getElementById('template-info').innerHTML);
  document.getElementById('latest-selector').innerHTML = templateSelector({
    releases: releases
  });
  document.getElementById('latest-info').innerHTML = templateInfo({
    releases: releases
  });

  if (jvmVariant == 'hotspot') {
    document.getElementById('docker_link').href = 'https://hub.docker.com/r/adoptopenjdk/' + variant;
  } else {
    document.getElementById('docker_link').href = 'https://hub.docker.com/r/adoptopenjdk/' + variant + '-' + jvmVariant;
  }

  setTickLink();
  displayLatestPlatform();
  window.onhashchange = displayLatestPlatform;
  loading.innerHTML = ''; // remove the loading dots

  var latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated fadeIn '); // make this section visible (invisible by default), with animated fade-in
}

function displayLatestPlatform() {
  var platformHash = window.location.hash.substr(1).toUpperCase();
  var thisPlatformInfo = document.getElementById("latest-info-".concat(platformHash));

  if (thisPlatformInfo) {
    global.unselectLatestPlatform('keep the hash');
    document.getElementById('latest-selector').classList.add('hide');
    thisPlatformInfo.classList.remove('hide');
  }
}

global.selectLatestPlatform = function (thisPlatform) {
  window.location.hash = thisPlatform.toLowerCase();
};

global.unselectLatestPlatform = function (keephash) {
  if (!keephash) {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }

  var platformButtons = document.getElementById('latest-selector').getElementsByClassName('latest-asset');
  var platformInfoBoxes = document.getElementById('latest-info').getElementsByClassName('latest-info-container');

  for (var i = 0; i < platformButtons.length; i++) {
    platformInfoBoxes[i].classList.add('hide');
  }

  document.getElementById('latest-selector').classList.remove('hide');
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./common":109,"core-js/modules/es6.array.find":82,"core-js/modules/es6.array.for-each":83,"core-js/modules/es6.array.sort":91,"core-js/modules/es6.regexp.replace":98,"core-js/modules/es6.regexp.search":99,"core-js/modules/es6.string.includes":102,"core-js/modules/es7.array.includes":105}],115:[function(require,module,exports){
"use strict";

module.exports.load = function () {
  $('#testimonials').slick({
    dots: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true
  });
};

},{}],116:[function(require,module,exports){
module.exports={
  "variants": [
    {
      "searchableName": "openjdk8-hotspot",
      "officialName": "OpenJDK 8 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 8",
      "lts": true,
      "default": true
    },
    {
      "searchableName": "openjdk8-openj9",
      "officialName": "OpenJDK 8 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 8",
      "lts": true,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk9-hotspot",
      "officialName": "OpenJDK 9 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 9",
      "lts": false
    },
    {
      "searchableName": "openjdk9-openj9",
      "officialName": "OpenJDK 9 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 9",
      "lts": false,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk10-hotspot",
      "officialName": "OpenJDK 10 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 10",
      "lts": false
    },
    {
      "searchableName": "openjdk10-openj9",
      "officialName": "OpenJDK 10 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 10",
      "lts": false,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk11-hotspot",
      "officialName": "OpenJDK 11 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 11",
      "lts": true
    },
    {
      "searchableName": "openjdk11-openj9",
      "officialName": "OpenJDK 11 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 11",
      "lts": true,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk12-hotspot",
      "officialName": "OpenJDK 12 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 12",
      "lts": "latest"
    },
    {
      "searchableName": "openjdk12-openj9",
      "officialName": "OpenJDK 12 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 12",
      "lts": "latest",
      "descriptionLink": "https://www.eclipse.org/openj9"
    }
  ],
  "platforms": [
    {
      "officialName": "Linux x64",
      "searchableName": "X64_LINUX",
      "logo": "linux.png",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "x64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": ".run",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "Linux Mint Debian Fedora FreeBSD Gentoo Haiku Kubuntu OpenBSD Red Hat RHEL SuSE Ubuntu Xubuntu hpwOS webOS Tizen"
    },
    {
      "officialName": "Linux x64 Large Heap",
      "searchableName": "LINUXXL",
      "attributes": {
        "heap_size": "large",
        "os": "linux",
        "architecture": "x64"
      },
      "logo": "linux.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": ".run",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected"
    },
    {
      "officialName": "Windows x32",
      "searchableName": "X32_WIN",
      "attributes": {
        "heap_size": "normal",
        "os": "windows",
        "architecture": "x32"
      },
      "logo": "windows.png",
      "binaryExtension": ".zip",
      "installerExtension": ".msi",
      "installCommand": "Expand-Archive -Path .\\FILENAME -DestinationPath .",
      "pathCommand": "set PATH=%cd%\\DIRNAME\\bin;%PATH%",
      "checksumCommand": "certutil -hashfile FILENAME SHA256",
      "checksumAutoCommandHint": " (the command must be run using Command Prompt in the same directory you download the binary file and requires PowerShell 3.0+)",
      "checksumAutoCommand": "powershell -command \"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  iwr -outf FILEHASHNAME FILEHASHURL\" && powershell \"$CHECKSUMVAR=($(Get-FileHash -Algorithm SHA256 -LiteralPath FILENAME | Format-List -Property Hash | Out-String) -replace \\\"Hash : \\\", \\\"\\\" -replace \\\"`r`n\\\", \\\"\\\"); Select-String -LiteralPath FILEHASHNAME -Pattern $CHECKSUMVAR | Format-List -Property FileName | Out-String\" | find /i \"FILEHASHNAME\">Nul && ( echo \"FILENAME: The SHA-256 fingerprint matches\" ) || ( echo \"FILENAME: The SHA-256 fingerprint does NOT match\" )",
      "osDetectionString": "Windows Win Cygwin Windows Server 2008 R2 / 7 Windows Server 2008 / Vista Windows XP"
    },
    {
      "officialName": "Windows x64",
      "searchableName": "X64_WIN",
      "attributes": {
        "heap_size": "normal",
        "os": "windows",
        "architecture": "x64"
      },
      "logo": "windows.png",
      "binaryExtension": ".zip",
      "installerExtension": ".msi",
      "installCommand": "Expand-Archive -Path .\\FILENAME -DestinationPath .",
      "pathCommand": "set PATH=%cd%\\DIRNAME\\bin;%PATH%",
      "checksumCommand": "certutil -hashfile FILENAME SHA256",
      "checksumAutoCommandHint": " (the command must be run using Command Prompt in the same directory you download the binary file and requires PowerShell 3.0+)",
      "checksumAutoCommand": "powershell -command \"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  iwr -outf FILEHASHNAME FILEHASHURL\" && powershell \"$CHECKSUMVAR=($(Get-FileHash -Algorithm SHA256 -LiteralPath FILENAME | Format-List -Property Hash | Out-String) -replace \\\"Hash : \\\", \\\"\\\" -replace \\\"`r`n\\\", \\\"\\\"); Select-String -LiteralPath FILEHASHNAME -Pattern $CHECKSUMVAR | Format-List -Property FileName | Out-String\" | find /i \"FILEHASHNAME\">Nul && ( echo \"FILENAME: The SHA-256 fingerprint matches\" ) || ( echo \"FILENAME: The SHA-256 fingerprint does NOT match\" )",
      "osDetectionString": "Windows Win Cygwin Windows Server 2008 R2 / 7 Windows Server 2008 / Vista Windows XP"
    },
    {
      "officialName": "Windows x64 Large Heap",
      "searchableName": "X64_WINXL",
      "attributes": {
        "heap_size": "large",
        "os": "windows",
        "architecture": "x64"
      },
      "logo": "windows.png",
      "binaryExtension": ".zip",
      "installerExtension": ".msi",
      "installCommand": "Expand-Archive -Path .\\FILENAME -DestinationPath .",
      "pathCommand": "set PATH=%cd%\\DIRNAME\\bin;%PATH%",
      "checksumCommand": "certutil -hashfile FILENAME SHA256",
      "checksumAutoCommandHint": " (the command must be run using Command Prompt in the same directory you download the binary file and requires PowerShell 3.0+)",
      "checksumAutoCommand": "powershell -command \"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  iwr -outf FILEHASHNAME FILEHASHURL\" && powershell \"$CHECKSUMVAR=($(Get-FileHash -Algorithm SHA256 -LiteralPath FILENAME | Format-List -Property Hash | Out-String) -replace \\\"Hash : \\\", \\\"\\\" -replace \\\"`r`n\\\", \\\"\\\"); Select-String -LiteralPath FILEHASHNAME -Pattern $CHECKSUMVAR | Format-List -Property FileName | Out-String\" | find /i \"FILEHASHNAME\">Nul && ( echo \"FILENAME: The SHA-256 fingerprint matches\" ) || ( echo \"FILENAME: The SHA-256 fingerprint does NOT match\" )",
      "osDetectionString": "Windows Win Cygwin Windows Server 2008 R2 / 7 Windows Server 2008 / Vista Windows XP"
    },
    {
      "officialName": "macOS x64",
      "searchableName": "X64_MAC",
      "attributes": {
        "heap_size": "normal",
        "os": "mac",
        "architecture": "x64"
      },
      "logo": "mac.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": ".pkg",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/Contents/Home/bin:$PATH",
      "checksumCommand": "shasum -a 256 FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "curl -O -L -s FILEHASHURL && shasum -a 256 -c FILEHASHNAME",
      "osDetectionString": "Mac OS X OSX macOS Macintosh"
    },
    {
      "officialName": "macOS x64 Large Heap",
      "searchableName": "MACOSXL",
      "attributes": {
        "heap_size": "large",
        "os": "mac",
        "architecture": "x64"
      },
      "logo": "mac.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": ".pkg",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/Contents/Home/bin:$PATH",
      "checksumCommand": "shasum -a 256 FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "curl -O -L -s FILEHASHURL && shasum -a 256 -c FILEHASHNAME",
      "osDetectionString": "not-to-be-detected"
    },
    {
      "officialName": "Linux s390x",
      "searchableName": "S390X_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "s390x"
      },
      "logo": "s390x.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected"
    },
    {
      "officialName": "Linux ppc64le",
      "searchableName": "PPC64LE_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "ppc64le"
      },
      "logo": "ppc64le.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected"
    },
    {
      "officialName": "Linux aarch64",
      "searchableName": "AARCH64_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "aarch64"
      },
      "logo": "arm.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected"
    },
    {
      "officialName": "Linux arm32",
      "searchableName": "ARM32_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "arm"
      },
      "logo": "arm.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected"
    },
    {
      "officialName": "Solaris sparcv9",
      "searchableName": "SPARCV9_SOLARIS",
      "attributes": {
        "heap_size": "normal",
        "os": "solaris",
        "architecture": "sparcv9"
      },
      "logo": "sparc.jpg",
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "gunzip -c FILENAME | tar xf -",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected"
    },
    {
      "officialName": "Solaris x64",
      "searchableName": "X64_SOLARIS",
      "attributes": {
        "heap_size": "normal",
        "os": "solaris",
        "architecture": "x64"
      },
      "logo": "solaris.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "gunzip -c FILENAME | tar xf -",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected"
    },
    {
      "officialName": "AIX ppc64",
      "searchableName": "PPC64_AIX",
      "attributes": {
        "heap_size": "normal",
        "os": "aix",
        "architecture": "ppc64"
      },
      "logo": "aix.png",
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "gunzip -c FILENAME | tar xf -",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "shasum -a 256 FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "curl -O -L FILEHASHURL && shasum -a 256 -c FILEHASHNAME",
      "osDetectionString": "not-to-be-detected"
    }
  ]
}

},{}]},{},[110]);
