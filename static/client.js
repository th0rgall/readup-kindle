(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// These two are meta, because esbuild needs them
require("core-js/actual/object/get-own-property-descriptor");
require("core-js/actual/object/get-own-property-descriptors");

require("core-js/actual/array/from");
require("core-js/actual/array/find");
require("core-js/actual/array/find-index");
require("core-js/actual/array/includes");
require("core-js/actual/string/ends-with");
require("core-js/actual/string/starts-with");
require("core-js/actual/string/includes");
require("core-js/actual/math/sign");

// I just refactored the related DOM code to have Array.from() around the DOM collections
// require("core-js/actual/iterator");
// require("core-js/actual/dom-collections/iterator");
// require("core-js/actual/dom-collections/for-each");
//
require("element-matches-polyfill");
require("classlist-polyfill");
require("element-remove-polyfill");
// Only two uses, which I'll patch. These two didn't work.
// require("element-dataset");
// require("conglomerate-element-dataset");

// https://vanillajstoolkit.com/polyfills/append/
/**
 * ChildNode.append() polyfill
 * https://gomakethings.com/adding-an-element-to-the-end-of-a-set-of-elements-with-vanilla-javascript/
 * @author Chris Ferdinandi
 * @license MIT
 */
(function (elem) {
  // Check if element is a node
  // https://github.com/Financial-Times/polyfill-service
  var isNode = function (object) {
    // DOM, Level2
    if (typeof Node === "function") {
      return object instanceof Node;
    }

    // Older browsers, check if it looks like a Node instance)
    return object &&
      typeof object === "object" &&
      object.nodeName &&
      object.nodeType >= 1 &&
      object.nodeType <= 12;
  };

  // Add append() method to prototype
  for (var i = 0; i < elem.length; i++) {
    if (!window[elem[i]] || "append" in window[elem[i]].prototype) continue;
    window[elem[i]].prototype.append = function () {
      var argArr = Array.prototype.slice.call(arguments);
      var docFrag = document.createDocumentFragment();

      for (var n = 0; n < argArr.length; n++) {
        docFrag.appendChild(
          isNode(argArr[n])
            ? argArr[n]
            : document.createTextNode(String(argArr[n])));
      }

      this.appendChild(docFrag);
    };
  }
})(["Element", "CharacterData", "DocumentType"]);

// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/prepend()/prepend().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty("prepend")) {
      return;
    }
    Object.defineProperty(item, "prepend", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function prepend() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();

        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(
            isNode ? argItem : document.createTextNode(String(argItem)));
        });

        this.insertBefore(docFrag, this.firstChild);
      },
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

},{"classlist-polyfill":2,"core-js/actual/array/find":4,"core-js/actual/array/find-index":3,"core-js/actual/array/from":5,"core-js/actual/array/includes":6,"core-js/actual/math/sign":7,"core-js/actual/object/get-own-property-descriptor":8,"core-js/actual/object/get-own-property-descriptors":9,"core-js/actual/string/ends-with":10,"core-js/actual/string/includes":11,"core-js/actual/string/starts-with":12,"element-matches-polyfill":151,"element-remove-polyfill":152}],2:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20170427
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in window.self) {

// Full polyfill for browsers with no classList support
// Including IE < Edge missing SVGElement.classList
if (!("classList" in document.createElement("_")) 
	|| document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg","g"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (index !== -1) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		// adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
		// modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
		if (ex.number === undefined || ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(window.self));

}

// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	testElement = null;
}());

}

},{}],3:[function(require,module,exports){
'use strict';
var parent = require('../../stable/array/find-index');

module.exports = parent;

},{"../../stable/array/find-index":141}],4:[function(require,module,exports){
'use strict';
var parent = require('../../stable/array/find');

module.exports = parent;

},{"../../stable/array/find":142}],5:[function(require,module,exports){
'use strict';
var parent = require('../../stable/array/from');

module.exports = parent;

},{"../../stable/array/from":143}],6:[function(require,module,exports){
'use strict';
var parent = require('../../stable/array/includes');

module.exports = parent;

},{"../../stable/array/includes":144}],7:[function(require,module,exports){
'use strict';
var parent = require('../../stable/math/sign');

module.exports = parent;

},{"../../stable/math/sign":145}],8:[function(require,module,exports){
'use strict';
var parent = require('../../stable/object/get-own-property-descriptor');

module.exports = parent;

},{"../../stable/object/get-own-property-descriptor":146}],9:[function(require,module,exports){
'use strict';
var parent = require('../../stable/object/get-own-property-descriptors');

module.exports = parent;

},{"../../stable/object/get-own-property-descriptors":147}],10:[function(require,module,exports){
'use strict';
var parent = require('../../stable/string/ends-with');

module.exports = parent;

},{"../../stable/string/ends-with":148}],11:[function(require,module,exports){
'use strict';
var parent = require('../../stable/string/includes');

module.exports = parent;

},{"../../stable/string/includes":149}],12:[function(require,module,exports){
'use strict';
var parent = require('../../stable/string/starts-with');

module.exports = parent;

},{"../../stable/string/starts-with":150}],13:[function(require,module,exports){
'use strict';
require('../../modules/es.array.find-index');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'findIndex');

},{"../../internals/entry-unbind":50,"../../modules/es.array.find-index":130}],14:[function(require,module,exports){
'use strict';
require('../../modules/es.array.find');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'find');

},{"../../internals/entry-unbind":50,"../../modules/es.array.find":131}],15:[function(require,module,exports){
'use strict';
require('../../modules/es.string.iterator');
require('../../modules/es.array.from');
var path = require('../../internals/path');

module.exports = path.Array.from;

},{"../../internals/path":107,"../../modules/es.array.from":132,"../../modules/es.string.iterator":139}],16:[function(require,module,exports){
'use strict';
require('../../modules/es.array.includes');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Array', 'includes');

},{"../../internals/entry-unbind":50,"../../modules/es.array.includes":133}],17:[function(require,module,exports){
'use strict';
require('../../modules/es.math.sign');
var path = require('../../internals/path');

module.exports = path.Math.sign;

},{"../../internals/path":107,"../../modules/es.math.sign":134}],18:[function(require,module,exports){
'use strict';
require('../../modules/es.object.get-own-property-descriptor');
var path = require('../../internals/path');

var Object = path.Object;

var getOwnPropertyDescriptor = module.exports = function getOwnPropertyDescriptor(it, key) {
  return Object.getOwnPropertyDescriptor(it, key);
};

if (Object.getOwnPropertyDescriptor.sham) getOwnPropertyDescriptor.sham = true;

},{"../../internals/path":107,"../../modules/es.object.get-own-property-descriptor":135}],19:[function(require,module,exports){
'use strict';
require('../../modules/es.object.get-own-property-descriptors');
var path = require('../../internals/path');

module.exports = path.Object.getOwnPropertyDescriptors;

},{"../../internals/path":107,"../../modules/es.object.get-own-property-descriptors":136}],20:[function(require,module,exports){
'use strict';
require('../../modules/es.string.ends-with');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('String', 'endsWith');

},{"../../internals/entry-unbind":50,"../../modules/es.string.ends-with":137}],21:[function(require,module,exports){
'use strict';
require('../../modules/es.string.includes');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('String', 'includes');

},{"../../internals/entry-unbind":50,"../../modules/es.string.includes":138}],22:[function(require,module,exports){
'use strict';
require('../../modules/es.string.starts-with');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('String', 'startsWith');

},{"../../internals/entry-unbind":50,"../../modules/es.string.starts-with":140}],23:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');
var tryToString = require('../internals/try-to-string');

var $TypeError = TypeError;

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw $TypeError(tryToString(argument) + ' is not a function');
};

},{"../internals/is-callable":75,"../internals/try-to-string":124}],24:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');

var $String = String;
var $TypeError = TypeError;

module.exports = function (argument) {
  if (typeof argument == 'object' || isCallable(argument)) return argument;
  throw $TypeError("Can't set " + $String(argument) + ' as a prototype');
};

},{"../internals/is-callable":75}],25:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');
var create = require('../internals/object-create');
var defineProperty = require('../internals/object-define-property').f;

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] === undefined) {
  defineProperty(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create(null)
  });
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

},{"../internals/object-create":93,"../internals/object-define-property":95,"../internals/well-known-symbol":129}],26:[function(require,module,exports){
'use strict';
var isObject = require('../internals/is-object');

var $String = String;
var $TypeError = TypeError;

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw $TypeError($String(argument) + ' is not an object');
};

},{"../internals/is-object":79}],27:[function(require,module,exports){
'use strict';
var bind = require('../internals/function-bind-context');
var call = require('../internals/function-call');
var toObject = require('../internals/to-object');
var callWithSafeIterationClosing = require('../internals/call-with-safe-iteration-closing');
var isArrayIteratorMethod = require('../internals/is-array-iterator-method');
var isConstructor = require('../internals/is-constructor');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var createProperty = require('../internals/create-property');
var getIterator = require('../internals/get-iterator');
var getIteratorMethod = require('../internals/get-iterator-method');

var $Array = Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
module.exports = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var IS_CONSTRUCTOR = isConstructor(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this === $Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = getIterator(O, iteratorMethod);
    next = iterator.next;
    result = IS_CONSTRUCTOR ? new this() : [];
    for (;!(step = call(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = lengthOfArrayLike(O);
    result = IS_CONSTRUCTOR ? new this(length) : $Array(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};

},{"../internals/call-with-safe-iteration-closing":32,"../internals/create-property":42,"../internals/function-bind-context":54,"../internals/function-call":56,"../internals/get-iterator":63,"../internals/get-iterator-method":62,"../internals/is-array-iterator-method":73,"../internals/is-constructor":76,"../internals/length-of-array-like":88,"../internals/to-object":119}],28:[function(require,module,exports){
'use strict';
var toIndexedObject = require('../internals/to-indexed-object');
var toAbsoluteIndex = require('../internals/to-absolute-index');
var lengthOfArrayLike = require('../internals/length-of-array-like');

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

},{"../internals/length-of-array-like":88,"../internals/to-absolute-index":115,"../internals/to-indexed-object":116}],29:[function(require,module,exports){
'use strict';
var bind = require('../internals/function-bind-context');
var uncurryThis = require('../internals/function-uncurry-this');
var IndexedObject = require('../internals/indexed-object');
var toObject = require('../internals/to-object');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var arraySpeciesCreate = require('../internals/array-species-create');

var push = uncurryThis([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod = function (TYPE) {
  var IS_MAP = TYPE === 1;
  var IS_FILTER = TYPE === 2;
  var IS_SOME = TYPE === 3;
  var IS_EVERY = TYPE === 4;
  var IS_FIND_INDEX = TYPE === 6;
  var IS_FILTER_REJECT = TYPE === 7;
  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var boundFunction = bind(callbackfn, that);
    var length = lengthOfArrayLike(self);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

module.exports = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod(7)
};

},{"../internals/array-species-create":31,"../internals/function-bind-context":54,"../internals/function-uncurry-this":60,"../internals/indexed-object":70,"../internals/length-of-array-like":88,"../internals/to-object":119}],30:[function(require,module,exports){
'use strict';
var isArray = require('../internals/is-array');
var isConstructor = require('../internals/is-constructor');
var isObject = require('../internals/is-object');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');
var $Array = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array : C;
};

},{"../internals/is-array":74,"../internals/is-constructor":76,"../internals/is-object":79,"../internals/well-known-symbol":129}],31:[function(require,module,exports){
'use strict';
var arraySpeciesConstructor = require('../internals/array-species-constructor');

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

},{"../internals/array-species-constructor":30}],32:[function(require,module,exports){
'use strict';
var anObject = require('../internals/an-object');
var iteratorClose = require('../internals/iterator-close');

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};

},{"../internals/an-object":26,"../internals/iterator-close":83}],33:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

module.exports = function (exec, SKIP_CLOSING) {
  try {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

},{"../internals/well-known-symbol":129}],34:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

var toString = uncurryThis({}.toString);
var stringSlice = uncurryThis(''.slice);

module.exports = function (it) {
  return stringSlice(toString(it), 8, -1);
};

},{"../internals/function-uncurry-this":60}],35:[function(require,module,exports){
'use strict';
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var isCallable = require('../internals/is-callable');
var classofRaw = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var $Object = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};

},{"../internals/classof-raw":34,"../internals/is-callable":75,"../internals/to-string-tag-support":122,"../internals/well-known-symbol":129}],36:[function(require,module,exports){
'use strict';
var hasOwn = require('../internals/has-own-property');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var definePropertyModule = require('../internals/object-define-property');

module.exports = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

},{"../internals/has-own-property":66,"../internals/object-define-property":95,"../internals/object-get-own-property-descriptor":96,"../internals/own-keys":106}],37:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

var MATCH = wellKnownSymbol('match');

module.exports = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (error1) {
    try {
      regexp[MATCH] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (error2) { /* empty */ }
  } return false;
};

},{"../internals/well-known-symbol":129}],38:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

},{"../internals/fails":53}],39:[function(require,module,exports){
'use strict';
// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
module.exports = function (value, done) {
  return { value: value, done: done };
};

},{}],40:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"../internals/create-property-descriptor":41,"../internals/descriptors":45,"../internals/object-define-property":95}],41:[function(require,module,exports){
'use strict';
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],42:[function(require,module,exports){
'use strict';
var toPropertyKey = require('../internals/to-property-key');
var definePropertyModule = require('../internals/object-define-property');
var createPropertyDescriptor = require('../internals/create-property-descriptor');

module.exports = function (object, key, value) {
  var propertyKey = toPropertyKey(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};

},{"../internals/create-property-descriptor":41,"../internals/object-define-property":95,"../internals/to-property-key":121}],43:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');
var definePropertyModule = require('../internals/object-define-property');
var makeBuiltIn = require('../internals/make-built-in');
var defineGlobalProperty = require('../internals/define-global-property');

module.exports = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable(value)) makeBuiltIn(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};

},{"../internals/define-global-property":44,"../internals/is-callable":75,"../internals/make-built-in":89,"../internals/object-define-property":95}],44:[function(require,module,exports){
'use strict';
var global = require('../internals/global');

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

module.exports = function (key, value) {
  try {
    defineProperty(global, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global[key] = value;
  } return value;
};

},{"../internals/global":65}],45:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});

},{"../internals/fails":53}],46:[function(require,module,exports){
'use strict';
var documentAll = typeof document == 'object' && document.all;

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var IS_HTMLDDA = typeof documentAll == 'undefined' && documentAll !== undefined;

module.exports = {
  all: documentAll,
  IS_HTMLDDA: IS_HTMLDDA
};

},{}],47:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var isObject = require('../internals/is-object');

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};

},{"../internals/global":65,"../internals/is-object":79}],48:[function(require,module,exports){
'use strict';
module.exports = typeof navigator != 'undefined' && String(navigator.userAgent) || '';

},{}],49:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var userAgent = require('../internals/engine-user-agent');

var process = global.process;
var Deno = global.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

module.exports = version;

},{"../internals/engine-user-agent":48,"../internals/global":65}],50:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = function (CONSTRUCTOR, METHOD) {
  return uncurryThis(global[CONSTRUCTOR].prototype[METHOD]);
};

},{"../internals/function-uncurry-this":60,"../internals/global":65}],51:[function(require,module,exports){
'use strict';
// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

},{}],52:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIn = require('../internals/define-built-in');
var defineGlobalProperty = require('../internals/define-global-property');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var isForced = require('../internals/is-forced');

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  }
};

},{"../internals/copy-constructor-properties":36,"../internals/create-non-enumerable-property":40,"../internals/define-built-in":43,"../internals/define-global-property":44,"../internals/global":65,"../internals/is-forced":77,"../internals/object-get-own-property-descriptor":96}],53:[function(require,module,exports){
'use strict';
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

},{}],54:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this-clause');
var aCallable = require('../internals/a-callable');
var NATIVE_BIND = require('../internals/function-bind-native');

var bind = uncurryThis(uncurryThis.bind);

// optional / simple context binding
module.exports = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"../internals/a-callable":23,"../internals/function-bind-native":55,"../internals/function-uncurry-this-clause":59}],55:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

},{"../internals/fails":53}],56:[function(require,module,exports){
'use strict';
var NATIVE_BIND = require('../internals/function-bind-native');

var call = Function.prototype.call;

module.exports = NATIVE_BIND ? call.bind(call) : function () {
  return call.apply(call, arguments);
};

},{"../internals/function-bind-native":55}],57:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var hasOwn = require('../internals/has-own-property');

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

},{"../internals/descriptors":45,"../internals/has-own-property":66}],58:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var aCallable = require('../internals/a-callable');

module.exports = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};

},{"../internals/a-callable":23,"../internals/function-uncurry-this":60}],59:[function(require,module,exports){
'use strict';
var classofRaw = require('../internals/classof-raw');
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis(fn);
};

},{"../internals/classof-raw":34,"../internals/function-uncurry-this":60}],60:[function(require,module,exports){
'use strict';
var NATIVE_BIND = require('../internals/function-bind-native');

var FunctionPrototype = Function.prototype;
var call = FunctionPrototype.call;
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

module.exports = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call.apply(fn, arguments);
  };
};

},{"../internals/function-bind-native":55}],61:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var isCallable = require('../internals/is-callable');

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global[namespace]) : global[namespace] && global[namespace][method];
};

},{"../internals/global":65,"../internals/is-callable":75}],62:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof');
var getMethod = require('../internals/get-method');
var isNullOrUndefined = require('../internals/is-null-or-undefined');
var Iterators = require('../internals/iterators');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR)
    || getMethod(it, '@@iterator')
    || Iterators[classof(it)];
};

},{"../internals/classof":35,"../internals/get-method":64,"../internals/is-null-or-undefined":78,"../internals/iterators":87,"../internals/well-known-symbol":129}],63:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var aCallable = require('../internals/a-callable');
var anObject = require('../internals/an-object');
var tryToString = require('../internals/try-to-string');
var getIteratorMethod = require('../internals/get-iterator-method');

var $TypeError = TypeError;

module.exports = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (aCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
  throw $TypeError(tryToString(argument) + ' is not iterable');
};

},{"../internals/a-callable":23,"../internals/an-object":26,"../internals/function-call":56,"../internals/get-iterator-method":62,"../internals/try-to-string":124}],64:[function(require,module,exports){
'use strict';
var aCallable = require('../internals/a-callable');
var isNullOrUndefined = require('../internals/is-null-or-undefined');

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};

},{"../internals/a-callable":23,"../internals/is-null-or-undefined":78}],65:[function(require,module,exports){
(function (global){(function (){
'use strict';
var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || this || Function('return this')();

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],66:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var toObject = require('../internals/to-object');

var hasOwnProperty = uncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};

},{"../internals/function-uncurry-this":60,"../internals/to-object":119}],67:[function(require,module,exports){
'use strict';
module.exports = {};

},{}],68:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');

module.exports = getBuiltIn('document', 'documentElement');

},{"../internals/get-built-in":61}],69:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');
var createElement = require('../internals/document-create-element');

// Thanks to IE8 for its funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});

},{"../internals/descriptors":45,"../internals/document-create-element":47,"../internals/fails":53}],70:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var classof = require('../internals/classof-raw');

var $Object = Object;
var split = uncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) === 'String' ? split(it, '') : $Object(it);
} : $Object;

},{"../internals/classof-raw":34,"../internals/fails":53,"../internals/function-uncurry-this":60}],71:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var isCallable = require('../internals/is-callable');
var store = require('../internals/shared-store');

var functionToString = uncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

module.exports = store.inspectSource;

},{"../internals/function-uncurry-this":60,"../internals/is-callable":75,"../internals/shared-store":111}],72:[function(require,module,exports){
'use strict';
var NATIVE_WEAK_MAP = require('../internals/weak-map-basic-detection');
var global = require('../internals/global');
var isObject = require('../internals/is-object');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var hasOwn = require('../internals/has-own-property');
var shared = require('../internals/shared-store');
var sharedKey = require('../internals/shared-key');
var hiddenKeys = require('../internals/hidden-keys');

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError = global.TypeError;
var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn(it, STATE)) throw TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

},{"../internals/create-non-enumerable-property":40,"../internals/global":65,"../internals/has-own-property":66,"../internals/hidden-keys":67,"../internals/is-object":79,"../internals/shared-key":110,"../internals/shared-store":111,"../internals/weak-map-basic-detection":128}],73:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};

},{"../internals/iterators":87,"../internals/well-known-symbol":129}],74:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof-raw');

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) === 'Array';
};

},{"../internals/classof-raw":34}],75:[function(require,module,exports){
'use strict';
var $documentAll = require('../internals/document-all');

var documentAll = $documentAll.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
module.exports = $documentAll.IS_HTMLDDA ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};

},{"../internals/document-all":46}],76:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');
var classof = require('../internals/classof');
var getBuiltIn = require('../internals/get-built-in');
var inspectSource = require('../internals/inspect-source');

var noop = function () { /* empty */ };
var empty = [];
var construct = getBuiltIn('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec = uncurryThis(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  switch (classof(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
module.exports = !construct || fails(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

},{"../internals/classof":35,"../internals/fails":53,"../internals/function-uncurry-this":60,"../internals/get-built-in":61,"../internals/inspect-source":71,"../internals/is-callable":75}],77:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;

},{"../internals/fails":53,"../internals/is-callable":75}],78:[function(require,module,exports){
'use strict';
// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
module.exports = function (it) {
  return it === null || it === undefined;
};

},{}],79:[function(require,module,exports){
'use strict';
var isCallable = require('../internals/is-callable');
var $documentAll = require('../internals/document-all');

var documentAll = $documentAll.all;

module.exports = $documentAll.IS_HTMLDDA ? function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it) || it === documentAll;
} : function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};

},{"../internals/document-all":46,"../internals/is-callable":75}],80:[function(require,module,exports){
'use strict';
module.exports = false;

},{}],81:[function(require,module,exports){
'use strict';
var isObject = require('../internals/is-object');
var classof = require('../internals/classof-raw');
var wellKnownSymbol = require('../internals/well-known-symbol');

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) === 'RegExp');
};

},{"../internals/classof-raw":34,"../internals/is-object":79,"../internals/well-known-symbol":129}],82:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var isCallable = require('../internals/is-callable');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

var $Object = Object;

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};

},{"../internals/get-built-in":61,"../internals/is-callable":75,"../internals/object-is-prototype-of":100,"../internals/use-symbol-as-uid":126}],83:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var anObject = require('../internals/an-object');
var getMethod = require('../internals/get-method');

module.exports = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject(iterator);
  try {
    innerResult = getMethod(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject(innerResult);
  return value;
};

},{"../internals/an-object":26,"../internals/function-call":56,"../internals/get-method":64}],84:[function(require,module,exports){
'use strict';
var IteratorPrototype = require('../internals/iterators-core').IteratorPrototype;
var create = require('../internals/object-create');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var setToStringTag = require('../internals/set-to-string-tag');
var Iterators = require('../internals/iterators');

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};

},{"../internals/create-property-descriptor":41,"../internals/iterators":87,"../internals/iterators-core":86,"../internals/object-create":93,"../internals/set-to-string-tag":109}],85:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var call = require('../internals/function-call');
var IS_PURE = require('../internals/is-pure');
var FunctionName = require('../internals/function-name');
var isCallable = require('../internals/is-callable');
var createIteratorConstructor = require('../internals/iterator-create-constructor');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var setPrototypeOf = require('../internals/object-set-prototype-of');
var setToStringTag = require('../internals/set-to-string-tag');
var createNonEnumerableProperty = require('../internals/create-non-enumerable-property');
var defineBuiltIn = require('../internals/define-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var Iterators = require('../internals/iterators');
var IteratorsCore = require('../internals/iterators-core');

var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    }

    return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (!isCallable(CurrentIteratorPrototype[ITERATOR])) {
          defineBuiltIn(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (!IS_PURE && CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return call(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
  }
  Iterators[NAME] = defaultIterator;

  return methods;
};

},{"../internals/create-non-enumerable-property":40,"../internals/define-built-in":43,"../internals/export":52,"../internals/function-call":56,"../internals/function-name":57,"../internals/is-callable":75,"../internals/is-pure":80,"../internals/iterator-create-constructor":84,"../internals/iterators":87,"../internals/iterators-core":86,"../internals/object-get-prototype-of":99,"../internals/object-set-prototype-of":104,"../internals/set-to-string-tag":109,"../internals/well-known-symbol":129}],86:[function(require,module,exports){
'use strict';
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');
var isObject = require('../internals/is-object');
var create = require('../internals/object-create');
var getPrototypeOf = require('../internals/object-get-prototype-of');
var defineBuiltIn = require('../internals/define-built-in');
var wellKnownSymbol = require('../internals/well-known-symbol');
var IS_PURE = require('../internals/is-pure');

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype[ITERATOR].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable(IteratorPrototype[ITERATOR])) {
  defineBuiltIn(IteratorPrototype, ITERATOR, function () {
    return this;
  });
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

},{"../internals/define-built-in":43,"../internals/fails":53,"../internals/is-callable":75,"../internals/is-object":79,"../internals/is-pure":80,"../internals/object-create":93,"../internals/object-get-prototype-of":99,"../internals/well-known-symbol":129}],87:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"dup":67}],88:[function(require,module,exports){
'use strict';
var toLength = require('../internals/to-length');

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};

},{"../internals/to-length":118}],89:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var isCallable = require('../internals/is-callable');
var hasOwn = require('../internals/has-own-property');
var DESCRIPTORS = require('../internals/descriptors');
var CONFIGURABLE_FUNCTION_NAME = require('../internals/function-name').CONFIGURABLE;
var inspectSource = require('../internals/inspect-source');
var InternalStateModule = require('../internals/internal-state');

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var $String = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var stringSlice = uncurryThis(''.slice);
var replace = uncurryThis(''.replace);
var join = uncurryThis([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn = module.exports = function (value, name, options) {
  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\)/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
    defineProperty(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn(function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');

},{"../internals/descriptors":45,"../internals/fails":53,"../internals/function-name":57,"../internals/function-uncurry-this":60,"../internals/has-own-property":66,"../internals/inspect-source":71,"../internals/internal-state":72,"../internals/is-callable":75}],90:[function(require,module,exports){
'use strict';
// `Math.sign` method implementation
// https://tc39.es/ecma262/#sec-math.sign
// eslint-disable-next-line es/no-math-sign -- safe
module.exports = Math.sign || function sign(x) {
  var n = +x;
  // eslint-disable-next-line no-self-compare -- NaN check
  return n === 0 || n !== n ? n : n < 0 ? -1 : 1;
};

},{}],91:[function(require,module,exports){
'use strict';
var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
module.exports = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};

},{}],92:[function(require,module,exports){
'use strict';
var isRegExp = require('../internals/is-regexp');

var $TypeError = TypeError;

module.exports = function (it) {
  if (isRegExp(it)) {
    throw $TypeError("The method doesn't accept regular expressions");
  } return it;
};

},{"../internals/is-regexp":81}],93:[function(require,module,exports){
'use strict';
/* global ActiveXObject -- old IE, WSH */
var anObject = require('../internals/an-object');
var definePropertiesModule = require('../internals/object-define-properties');
var enumBugKeys = require('../internals/enum-bug-keys');
var hiddenKeys = require('../internals/hidden-keys');
var html = require('../internals/html');
var documentCreateElement = require('../internals/document-create-element');
var sharedKey = require('../internals/shared-key');

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};

},{"../internals/an-object":26,"../internals/document-create-element":47,"../internals/enum-bug-keys":51,"../internals/hidden-keys":67,"../internals/html":68,"../internals/object-define-properties":94,"../internals/shared-key":110}],94:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var V8_PROTOTYPE_DEFINE_BUG = require('../internals/v8-prototype-define-bug');
var definePropertyModule = require('../internals/object-define-property');
var anObject = require('../internals/an-object');
var toIndexedObject = require('../internals/to-indexed-object');
var objectKeys = require('../internals/object-keys');

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
};

},{"../internals/an-object":26,"../internals/descriptors":45,"../internals/object-define-property":95,"../internals/object-keys":102,"../internals/to-indexed-object":116,"../internals/v8-prototype-define-bug":127}],95:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');
var V8_PROTOTYPE_DEFINE_BUG = require('../internals/v8-prototype-define-bug');
var anObject = require('../internals/an-object');
var toPropertyKey = require('../internals/to-property-key');

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"../internals/an-object":26,"../internals/descriptors":45,"../internals/ie8-dom-define":69,"../internals/to-property-key":121,"../internals/v8-prototype-define-bug":127}],96:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var call = require('../internals/function-call');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var createPropertyDescriptor = require('../internals/create-property-descriptor');
var toIndexedObject = require('../internals/to-indexed-object');
var toPropertyKey = require('../internals/to-property-key');
var hasOwn = require('../internals/has-own-property');
var IE8_DOM_DEFINE = require('../internals/ie8-dom-define');

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
};

},{"../internals/create-property-descriptor":41,"../internals/descriptors":45,"../internals/function-call":56,"../internals/has-own-property":66,"../internals/ie8-dom-define":69,"../internals/object-property-is-enumerable":103,"../internals/to-indexed-object":116,"../internals/to-property-key":121}],97:[function(require,module,exports){
'use strict';
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};

},{"../internals/enum-bug-keys":51,"../internals/object-keys-internal":101}],98:[function(require,module,exports){
'use strict';
// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;

},{}],99:[function(require,module,exports){
'use strict';
var hasOwn = require('../internals/has-own-property');
var isCallable = require('../internals/is-callable');
var toObject = require('../internals/to-object');
var sharedKey = require('../internals/shared-key');
var CORRECT_PROTOTYPE_GETTER = require('../internals/correct-prototype-getter');

var IE_PROTO = sharedKey('IE_PROTO');
var $Object = Object;
var ObjectPrototype = $Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
module.exports = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
  var object = toObject(O);
  if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object ? ObjectPrototype : null;
};

},{"../internals/correct-prototype-getter":38,"../internals/has-own-property":66,"../internals/is-callable":75,"../internals/shared-key":110,"../internals/to-object":119}],100:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

module.exports = uncurryThis({}.isPrototypeOf);

},{"../internals/function-uncurry-this":60}],101:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var hasOwn = require('../internals/has-own-property');
var toIndexedObject = require('../internals/to-indexed-object');
var indexOf = require('../internals/array-includes').indexOf;
var hiddenKeys = require('../internals/hidden-keys');

var push = uncurryThis([].push);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};

},{"../internals/array-includes":28,"../internals/function-uncurry-this":60,"../internals/has-own-property":66,"../internals/hidden-keys":67,"../internals/to-indexed-object":116}],102:[function(require,module,exports){
'use strict';
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};

},{"../internals/enum-bug-keys":51,"../internals/object-keys-internal":101}],103:[function(require,module,exports){
'use strict';
var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

},{}],104:[function(require,module,exports){
'use strict';
/* eslint-disable no-proto -- safe */
var uncurryThisAccessor = require('../internals/function-uncurry-this-accessor');
var anObject = require('../internals/an-object');
var aPossiblePrototype = require('../internals/a-possible-prototype');

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

},{"../internals/a-possible-prototype":24,"../internals/an-object":26,"../internals/function-uncurry-this-accessor":58}],105:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var isCallable = require('../internals/is-callable');
var isObject = require('../internals/is-object');

var $TypeError = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  throw $TypeError("Can't convert object to primitive value");
};

},{"../internals/function-call":56,"../internals/is-callable":75,"../internals/is-object":79}],106:[function(require,module,exports){
'use strict';
var getBuiltIn = require('../internals/get-built-in');
var uncurryThis = require('../internals/function-uncurry-this');
var getOwnPropertyNamesModule = require('../internals/object-get-own-property-names');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var anObject = require('../internals/an-object');

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};

},{"../internals/an-object":26,"../internals/function-uncurry-this":60,"../internals/get-built-in":61,"../internals/object-get-own-property-names":97,"../internals/object-get-own-property-symbols":98}],107:[function(require,module,exports){
'use strict';
var global = require('../internals/global');

module.exports = global;

},{"../internals/global":65}],108:[function(require,module,exports){
'use strict';
var isNullOrUndefined = require('../internals/is-null-or-undefined');

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (isNullOrUndefined(it)) throw $TypeError("Can't call method on " + it);
  return it;
};

},{"../internals/is-null-or-undefined":78}],109:[function(require,module,exports){
'use strict';
var defineProperty = require('../internals/object-define-property').f;
var hasOwn = require('../internals/has-own-property');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwn(target, TO_STRING_TAG)) {
    defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};

},{"../internals/has-own-property":66,"../internals/object-define-property":95,"../internals/well-known-symbol":129}],110:[function(require,module,exports){
'use strict';
var shared = require('../internals/shared');
var uid = require('../internals/uid');

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

},{"../internals/shared":112,"../internals/uid":125}],111:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var defineGlobalProperty = require('../internals/define-global-property');

var SHARED = '__core-js_shared__';
var store = global[SHARED] || defineGlobalProperty(SHARED, {});

module.exports = store;

},{"../internals/define-global-property":44,"../internals/global":65}],112:[function(require,module,exports){
'use strict';
var IS_PURE = require('../internals/is-pure');
var store = require('../internals/shared-store');

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.32.2',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.32.2/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

},{"../internals/is-pure":80,"../internals/shared-store":111}],113:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var toString = require('../internals/to-string');
var requireObjectCoercible = require('../internals/require-object-coercible');

var charAt = uncurryThis(''.charAt);
var charCodeAt = uncurryThis(''.charCodeAt);
var stringSlice = uncurryThis(''.slice);

var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString(requireObjectCoercible($this));
    var position = toIntegerOrInfinity(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};

},{"../internals/function-uncurry-this":60,"../internals/require-object-coercible":108,"../internals/to-integer-or-infinity":117,"../internals/to-string":123}],114:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = require('../internals/engine-v8-version');
var fails = require('../internals/fails');
var global = require('../internals/global');

var $String = global.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});

},{"../internals/engine-v8-version":49,"../internals/fails":53,"../internals/global":65}],115:[function(require,module,exports){
'use strict';
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};

},{"../internals/to-integer-or-infinity":117}],116:[function(require,module,exports){
'use strict';
// toObject with fallback for non-array-like ES3 strings
var IndexedObject = require('../internals/indexed-object');
var requireObjectCoercible = require('../internals/require-object-coercible');

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};

},{"../internals/indexed-object":70,"../internals/require-object-coercible":108}],117:[function(require,module,exports){
'use strict';
var trunc = require('../internals/math-trunc');

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};

},{"../internals/math-trunc":91}],118:[function(require,module,exports){
'use strict';
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

},{"../internals/to-integer-or-infinity":117}],119:[function(require,module,exports){
'use strict';
var requireObjectCoercible = require('../internals/require-object-coercible');

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return $Object(requireObjectCoercible(argument));
};

},{"../internals/require-object-coercible":108}],120:[function(require,module,exports){
'use strict';
var call = require('../internals/function-call');
var isObject = require('../internals/is-object');
var isSymbol = require('../internals/is-symbol');
var getMethod = require('../internals/get-method');
var ordinaryToPrimitive = require('../internals/ordinary-to-primitive');
var wellKnownSymbol = require('../internals/well-known-symbol');

var $TypeError = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
module.exports = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw $TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

},{"../internals/function-call":56,"../internals/get-method":64,"../internals/is-object":79,"../internals/is-symbol":82,"../internals/ordinary-to-primitive":105,"../internals/well-known-symbol":129}],121:[function(require,module,exports){
'use strict';
var toPrimitive = require('../internals/to-primitive');
var isSymbol = require('../internals/is-symbol');

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};

},{"../internals/is-symbol":82,"../internals/to-primitive":120}],122:[function(require,module,exports){
'use strict';
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';

},{"../internals/well-known-symbol":129}],123:[function(require,module,exports){
'use strict';
var classof = require('../internals/classof');

var $String = String;

module.exports = function (argument) {
  if (classof(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return $String(argument);
};

},{"../internals/classof":35}],124:[function(require,module,exports){
'use strict';
var $String = String;

module.exports = function (argument) {
  try {
    return $String(argument);
  } catch (error) {
    return 'Object';
  }
};

},{}],125:[function(require,module,exports){
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');

var id = 0;
var postfix = Math.random();
var toString = uncurryThis(1.0.toString);

module.exports = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};

},{"../internals/function-uncurry-this":60}],126:[function(require,module,exports){
'use strict';
/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

module.exports = NATIVE_SYMBOL
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

},{"../internals/symbol-constructor-detection":114}],127:[function(require,module,exports){
'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});

},{"../internals/descriptors":45,"../internals/fails":53}],128:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var isCallable = require('../internals/is-callable');

var WeakMap = global.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));

},{"../internals/global":65,"../internals/is-callable":75}],129:[function(require,module,exports){
'use strict';
var global = require('../internals/global');
var shared = require('../internals/shared');
var hasOwn = require('../internals/has-own-property');
var uid = require('../internals/uid');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var USE_SYMBOL_AS_UID = require('../internals/use-symbol-as-uid');

var Symbol = global.Symbol;
var WellKnownSymbolsStore = shared('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!hasOwn(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
      ? Symbol[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

},{"../internals/global":65,"../internals/has-own-property":66,"../internals/shared":112,"../internals/symbol-constructor-detection":114,"../internals/uid":125,"../internals/use-symbol-as-uid":126}],130:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $findIndex = require('../internals/array-iteration').findIndex;
var addToUnscopables = require('../internals/add-to-unscopables');

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-findindex -- testing
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND_INDEX);

},{"../internals/add-to-unscopables":25,"../internals/array-iteration":29,"../internals/export":52}],131:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $find = require('../internals/array-iteration').find;
var addToUnscopables = require('../internals/add-to-unscopables');

var FIND = 'find';
var SKIPS_HOLES = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-find -- testing
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
$({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables(FIND);

},{"../internals/add-to-unscopables":25,"../internals/array-iteration":29,"../internals/export":52}],132:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var from = require('../internals/array-from');
var checkCorrectnessOfIteration = require('../internals/check-correctness-of-iteration');

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

},{"../internals/array-from":27,"../internals/check-correctness-of-iteration":33,"../internals/export":52}],133:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var $includes = require('../internals/array-includes').includes;
var fails = require('../internals/fails');
var addToUnscopables = require('../internals/add-to-unscopables');

// FF99+ bug
var BROKEN_ON_SPARSE = fails(function () {
  // eslint-disable-next-line es/no-array-prototype-includes -- detection
  return !Array(1).includes();
});

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('includes');

},{"../internals/add-to-unscopables":25,"../internals/array-includes":28,"../internals/export":52,"../internals/fails":53}],134:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var sign = require('../internals/math-sign');

// `Math.sign` method
// https://tc39.es/ecma262/#sec-math.sign
$({ target: 'Math', stat: true }, {
  sign: sign
});

},{"../internals/export":52,"../internals/math-sign":90}],135:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var fails = require('../internals/fails');
var toIndexedObject = require('../internals/to-indexed-object');
var nativeGetOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var DESCRIPTORS = require('../internals/descriptors');

var FORCED = !DESCRIPTORS || fails(function () { nativeGetOwnPropertyDescriptor(1); });

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$({ target: 'Object', stat: true, forced: FORCED, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
  }
});

},{"../internals/descriptors":45,"../internals/export":52,"../internals/fails":53,"../internals/object-get-own-property-descriptor":96,"../internals/to-indexed-object":116}],136:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var DESCRIPTORS = require('../internals/descriptors');
var ownKeys = require('../internals/own-keys');
var toIndexedObject = require('../internals/to-indexed-object');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var createProperty = require('../internals/create-property');

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
$({ target: 'Object', stat: true, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    var keys = ownKeys(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty(result, key, descriptor);
    }
    return result;
  }
});

},{"../internals/create-property":42,"../internals/descriptors":45,"../internals/export":52,"../internals/object-get-own-property-descriptor":96,"../internals/own-keys":106,"../internals/to-indexed-object":116}],137:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var toLength = require('../internals/to-length');
var toString = require('../internals/to-string');
var notARegExp = require('../internals/not-a-regexp');
var requireObjectCoercible = require('../internals/require-object-coercible');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');
var IS_PURE = require('../internals/is-pure');

// eslint-disable-next-line es/no-string-prototype-endswith -- safe
var nativeEndsWith = uncurryThis(''.endsWith);
var slice = uncurryThis(''.slice);
var min = Math.min;

var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('endsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG = !IS_PURE && !CORRECT_IS_REGEXP_LOGIC && !!function () {
  var descriptor = getOwnPropertyDescriptor(String.prototype, 'endsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.endsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.endswith
$({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = toString(requireObjectCoercible(this));
    notARegExp(searchString);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = that.length;
    var end = endPosition === undefined ? len : min(toLength(endPosition), len);
    var search = toString(searchString);
    return nativeEndsWith
      ? nativeEndsWith(that, search, end)
      : slice(that, end - search.length, end) === search;
  }
});

},{"../internals/correct-is-regexp-logic":37,"../internals/export":52,"../internals/function-uncurry-this-clause":59,"../internals/is-pure":80,"../internals/not-a-regexp":92,"../internals/object-get-own-property-descriptor":96,"../internals/require-object-coercible":108,"../internals/to-length":118,"../internals/to-string":123}],138:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var notARegExp = require('../internals/not-a-regexp');
var requireObjectCoercible = require('../internals/require-object-coercible');
var toString = require('../internals/to-string');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');

var stringIndexOf = uncurryThis(''.indexOf);

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
$({ target: 'String', proto: true, forced: !correctIsRegExpLogic('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~stringIndexOf(
      toString(requireObjectCoercible(this)),
      toString(notARegExp(searchString)),
      arguments.length > 1 ? arguments[1] : undefined
    );
  }
});

},{"../internals/correct-is-regexp-logic":37,"../internals/export":52,"../internals/function-uncurry-this":60,"../internals/not-a-regexp":92,"../internals/require-object-coercible":108,"../internals/to-string":123}],139:[function(require,module,exports){
'use strict';
var charAt = require('../internals/string-multibyte').charAt;
var toString = require('../internals/to-string');
var InternalStateModule = require('../internals/internal-state');
var defineIterator = require('../internals/iterator-define');
var createIterResultObject = require('../internals/create-iter-result-object');

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: toString(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
});

},{"../internals/create-iter-result-object":39,"../internals/internal-state":72,"../internals/iterator-define":85,"../internals/string-multibyte":113,"../internals/to-string":123}],140:[function(require,module,exports){
'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this-clause');
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;
var toLength = require('../internals/to-length');
var toString = require('../internals/to-string');
var notARegExp = require('../internals/not-a-regexp');
var requireObjectCoercible = require('../internals/require-object-coercible');
var correctIsRegExpLogic = require('../internals/correct-is-regexp-logic');
var IS_PURE = require('../internals/is-pure');

// eslint-disable-next-line es/no-string-prototype-startswith -- safe
var nativeStartsWith = uncurryThis(''.startsWith);
var stringSlice = uncurryThis(''.slice);
var min = Math.min;

var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('startsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG = !IS_PURE && !CORRECT_IS_REGEXP_LOGIC && !!function () {
  var descriptor = getOwnPropertyDescriptor(String.prototype, 'startsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.startsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.startswith
$({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = toString(requireObjectCoercible(this));
    notARegExp(searchString);
    var index = toLength(min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = toString(searchString);
    return nativeStartsWith
      ? nativeStartsWith(that, search, index)
      : stringSlice(that, index, index + search.length) === search;
  }
});

},{"../internals/correct-is-regexp-logic":37,"../internals/export":52,"../internals/function-uncurry-this-clause":59,"../internals/is-pure":80,"../internals/not-a-regexp":92,"../internals/object-get-own-property-descriptor":96,"../internals/require-object-coercible":108,"../internals/to-length":118,"../internals/to-string":123}],141:[function(require,module,exports){
'use strict';
var parent = require('../../es/array/find-index');

module.exports = parent;

},{"../../es/array/find-index":13}],142:[function(require,module,exports){
'use strict';
var parent = require('../../es/array/find');

module.exports = parent;

},{"../../es/array/find":14}],143:[function(require,module,exports){
'use strict';
var parent = require('../../es/array/from');

module.exports = parent;

},{"../../es/array/from":15}],144:[function(require,module,exports){
'use strict';
var parent = require('../../es/array/includes');

module.exports = parent;

},{"../../es/array/includes":16}],145:[function(require,module,exports){
'use strict';
var parent = require('../../es/math/sign');

module.exports = parent;

},{"../../es/math/sign":17}],146:[function(require,module,exports){
'use strict';
var parent = require('../../es/object/get-own-property-descriptor');

module.exports = parent;

},{"../../es/object/get-own-property-descriptor":18}],147:[function(require,module,exports){
'use strict';
var parent = require('../../es/object/get-own-property-descriptors');

module.exports = parent;

},{"../../es/object/get-own-property-descriptors":19}],148:[function(require,module,exports){
'use strict';
var parent = require('../../es/string/ends-with');

module.exports = parent;

},{"../../es/string/ends-with":20}],149:[function(require,module,exports){
'use strict';
var parent = require('../../es/string/includes');

module.exports = parent;

},{"../../es/string/includes":21}],150:[function(require,module,exports){
'use strict';
var parent = require('../../es/string/starts-with');

module.exports = parent;

},{"../../es/string/starts-with":22}],151:[function(require,module,exports){
if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
    };
}

},{}],152:[function(require,module,exports){
(function(arr) {
  arr.forEach(function(item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

},{}]},{},[1]);

"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
(function () {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = function __defNormalProp(obj, key, value) {
    return key in obj ? __defProp(obj, key, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: value
    }) : obj[key] = value;
  };
  var __spreadValues = function __spreadValues(a, b) {
    for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols) {
      var _iterator = _createForOfIteratorHelper(__getOwnPropSymbols(b)),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var prop = _step.value;
          if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    return a;
  };
  var __spreadProps = function __spreadProps(a, b) {
    return __defProps(a, __getOwnPropDescs(b));
  };
  var __publicField = function __publicField(obj, key, value) {
    __defNormalProp(obj, _typeof(key) !== "symbol" ? key + "" : key, value);
    return value;
  };

  // client/contentParsing/TextContainerDepthGroup.ts
  var TextContainerDepthGroup = /*#__PURE__*/function () {
    function TextContainerDepthGroup(depth) {
      _classCallCheck(this, TextContainerDepthGroup);
      __publicField(this, "_depth");
      __publicField(this, "_members");
      __publicField(this, "_wordCount", 0);
      this._depth = depth;
      for (var _len = arguments.length, members = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        members[_key - 1] = arguments[_key];
      }
      this._members = members;
      this._wordCount = members.reduce(function (sum, member) {
        return sum += member.wordCount;
      }, 0);
    }
    _createClass(TextContainerDepthGroup, [{
      key: "add",
      value: function add(container) {
        var member = this._members.find(function (member2) {
          return member2.containerElement === container.containerElement;
        });
        if (member) {
          member.mergeContent(container);
        } else {
          this._members.push(container);
        }
        this._wordCount += container.wordCount;
      }
    }, {
      key: "depth",
      get: function get() {
        return this._depth;
      }
    }, {
      key: "members",
      get: function get() {
        return this._members;
      }
    }, {
      key: "wordCount",
      get: function get() {
        return this._wordCount;
      }
    }]);
    return TextContainerDepthGroup;
  }();

  // client/contentParsing/TraversalPathSearchResult.ts
  var TraversalPathSearchResult = /*#__PURE__*/function () {
    function TraversalPathSearchResult(textContainer, paths) {
      _classCallCheck(this, TraversalPathSearchResult);
      __publicField(this, "_textContainer");
      __publicField(this, "_paths");
      __publicField(this, "_preferredPath");
      this._textContainer = textContainer;
      this._paths = paths;
    }
    _createClass(TraversalPathSearchResult, [{
      key: "getPreferredPath",
      value: function getPreferredPath() {
        if (!this._preferredPath) {
          this._preferredPath = this._paths.sort(function (a, b) {
            return a.wordCount !== b.wordCount ? b.wordCount - a.wordCount : a.hops - b.hops;
          })[0];
        }
        return this._preferredPath;
      }
    }, {
      key: "textContainer",
      get: function get() {
        return this._textContainer;
      }
    }]);
    return TraversalPathSearchResult;
  }();

  // client/contentParsing/TraversalPath.ts
  var TraversalPath = /*#__PURE__*/function () {
    function _TraversalPath(_ref) {
      var hops = _ref.hops,
        frequency = _ref.frequency,
        wordCount = _ref.wordCount;
      _classCallCheck(this, _TraversalPath);
      __publicField(this, "_hops");
      __publicField(this, "_frequency");
      __publicField(this, "_wordCount");
      this._hops = hops;
      this._frequency = frequency;
      this._wordCount = wordCount;
    }
    _createClass(_TraversalPath, [{
      key: "add",
      value: function add(_ref2) {
        var frequency = _ref2.frequency,
          wordCount = _ref2.wordCount;
        return new _TraversalPath({
          hops: this._hops,
          frequency: this._frequency + frequency,
          wordCount: this._wordCount + wordCount
        });
      }
    }, {
      key: "frequency",
      get: function get() {
        return this._frequency;
      }
    }, {
      key: "hops",
      get: function get() {
        return this._hops;
      }
    }, {
      key: "wordCount",
      get: function get() {
        return this._wordCount;
      }
    }]);
    return _TraversalPath;
  }();

  // client/contentParsing/ContentContainer.ts
  var ContentContainer = /*#__PURE__*/function () {
    function ContentContainer(containerLineage, contentLineages) {
      _classCallCheck(this, ContentContainer);
      __publicField(this, "_containerLineage", []);
      __publicField(this, "_contentLineages", []);
      this._containerLineage = containerLineage;
      this._contentLineages = contentLineages;
    }
    _createClass(ContentContainer, [{
      key: "containerElement",
      get: function get() {
        return this._containerLineage.length ? this._containerLineage[this._containerLineage.length - 1] : null;
      }
    }, {
      key: "containerLineage",
      get: function get() {
        return this._containerLineage;
      }
    }, {
      key: "contentLineages",
      get: function get() {
        return this._contentLineages;
      }
    }]);
    return ContentContainer;
  }();

  // client/contentParsing/ImageContainer.ts
  var ImageContainer = /*#__PURE__*/function (_ContentContainer) {
    _inherits(ImageContainer, _ContentContainer);
    var _super = _createSuper(ImageContainer);
    function ImageContainer(containerLineage, contentLineages, caption, credit) {
      var _this;
      _classCallCheck(this, ImageContainer);
      _this = _super.call(this, containerLineage, contentLineages);
      __publicField(_assertThisInitialized(_this), "_caption");
      __publicField(_assertThisInitialized(_this), "_credit");
      _this._caption = caption;
      _this._credit = credit;
      return _this;
    }
    _createClass(ImageContainer, [{
      key: "caption",
      get: function get() {
        return this._caption;
      }
    }, {
      key: "credit",
      get: function get() {
        return this._credit;
      }
    }]);
    return ImageContainer;
  }(ContentContainer);

  // client/contentParsing/GraphEdge.ts
  var GraphEdge = /* @__PURE__ */function (GraphEdge2) {
    GraphEdge2[GraphEdge2["None"] = 0] = "None";
    GraphEdge2[GraphEdge2["Left"] = 1] = "Left";
    GraphEdge2[GraphEdge2["Right"] = 2] = "Right";
    return GraphEdge2;
  }(GraphEdge || {});
  var GraphEdge_default = GraphEdge;

  // client/contentParsing/TextContainer.ts
  var TextContainer = /*#__PURE__*/function (_ContentContainer2) {
    _inherits(TextContainer, _ContentContainer2);
    var _super2 = _createSuper(TextContainer);
    function TextContainer(containerLineage, contentLineages, wordcount) {
      var _this2;
      _classCallCheck(this, TextContainer);
      _this2 = _super2.call(this, containerLineage, contentLineages);
      __publicField(_assertThisInitialized(_this2), "_wordCount");
      _this2._wordCount = wordcount;
      return _this2;
    }
    _createClass(TextContainer, [{
      key: "mergeContent",
      value: function mergeContent(container) {
        var _this$_contentLineage;
        (_this$_contentLineage = this._contentLineages).push.apply(_this$_contentLineage, _toConsumableArray(container._contentLineages));
        this._wordCount += container.wordCount;
      }
    }, {
      key: "wordCount",
      get: function get() {
        return this._wordCount;
      }
    }]);
    return TextContainer;
  }(ContentContainer);

  // client/contentParsing/utils.ts
  function buildLineage(_ref3) {
    var ancestor = _ref3.ancestor,
      descendant = _ref3.descendant;
    var lineage = [descendant];
    while (lineage[0] !== ancestor) {
      lineage.unshift(lineage[0].parentElement);
    }
    return lineage;
  }
  var attributeWordRegex = /[A-Z]?[a-z]+/g;
  function findWordsInAttributes(element) {
    return (
      // searching other attributes such as data-* and src can lead to too many false positives of blacklisted words
      ("".concat(element.id, " ").concat(element.classList.value).match(attributeWordRegex) || []).map(function (word) {
        return word.toLowerCase();
      })
    );
  }
  var wordRegex = /\S+/g;
  function getWordCount(node) {
    return (node.textContent.match(wordRegex) || []).length;
  }
  var blockElementNodeNames = ["ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "DETAILS", "DIALOG", "DD", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HGROUP", "HR", "LI", "MAIN", "NAV", "OL", "P", "PRE", "SECTION", "TABLE", "UL"];
  function isBlockElement(node) {
    return blockElementNodeNames.includes(node.nodeName);
  }
  function isElement(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  }
  function isImageContainerElement(node) {
    return node.nodeName === "FIGURE" || node.nodeName === "IMG" || node.nodeName === "PICTURE";
  }
  function isValidImgElement(imgElement) {
    return imgElement.naturalWidth <= 1 && imgElement.naturalHeight <= 1 || imgElement.naturalWidth >= 200 && imgElement.naturalHeight >= 100 || imgElement.naturalWidth >= 100 && imgElement.naturalHeight >= 200;
  }
  function zipContentLineages(containers) {
    return zipLineages(containers.reduce(function (lineages, container) {
      return lineages.concat(container.contentLineages);
    }, []));
  }
  function zipLineages(lineages) {
    return lineages.reduce(function (depths, lineage) {
      lineage.forEach(function (node, index) {
        if (!depths[index].includes(node)) {
          depths[index].push(node);
        }
      });
      return depths;
    }, Array.from(new Array(Math.max.apply(Math, _toConsumableArray(lineages.map(function (lineage) {
      return lineage.length;
    }))))).map(function () {
      return [];
    }));
  }

  // client/contentParsing/figureContent.ts
  function getChildNodesTextContent(element) {
    var text = "";
    for (var _i = 0, _Array$from = Array.from(element.childNodes); _i < _Array$from.length; _i++) {
      var child = _Array$from[_i];
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      }
    }
    return text;
  }
  function isValidContent(element, config) {
    return !config.nodeNameBlacklist.some(function (nodeName) {
      return element.nodeName === nodeName;
    }) && (config.nodeNameWhitelist.some(function (nodeName) {
      return element.nodeName === nodeName || !!element.getElementsByTagName(nodeName).length;
    }) || !getChildNodesTextContent(element).trim()) && !findWordsInAttributes(element).some(function (word) {
      return config.attributeBlacklist.includes(word);
    }) && (element.nodeName === "IMG" ? isValidImgElement(element) : true);
  }

  // client/contentParsing/configuration/Config.ts
  var Config = /*#__PURE__*/function () {
    function Config(universal, publisher, contentSearchRootElement) {
      _classCallCheck(this, Config);
      __publicField(this, "_textContainerSearch");
      __publicField(this, "_textContainerFilter");
      __publicField(this, "_imageContainerSearch");
      __publicField(this, "_imageContainerFilter");
      __publicField(this, "_imageContainerMetadata");
      __publicField(this, "_imageContainerContent");
      __publicField(this, "_textContainerSelection");
      __publicField(this, "_contentSearchRootElementSelector");
      __publicField(this, "_transpositions");
      __publicField(this, "_wordCountTraversalPathSearchLimitMultiplier");
      __publicField(this, "_imageStrategy");
      this._textContainerFilter = universal.textContainerFilter;
      this._imageContainerMetadata = universal.imageContainerMetadata;
      this._imageContainerContent = universal.imageContainerContent;
      this._textContainerSelection = universal.textContainerSelection;
      this._wordCountTraversalPathSearchLimitMultiplier = universal.wordCountTraversalPathSearchLimitMultiplier;
      if (publisher) {
        if (publisher.textContainerSearch) {
          this._textContainerSearch = __spreadProps(__spreadValues({}, universal.textContainerSearch), {
            selectorBlacklist: universal.textContainerSearch.selectorBlacklist.concat(publisher.textContainerSearch.selectorBlacklist || [])
          });
        } else {
          this._textContainerSearch = universal.textContainerSearch;
        }
        if (publisher.textContainerFilter) {
          this._textContainerFilter = __spreadProps(__spreadValues({}, universal.textContainerFilter), {
            attributeFullWordBlacklist: universal.textContainerFilter.attributeFullWordBlacklist.concat(publisher.textContainerFilter.attributeFullWordBlacklist || []),
            attributeFullWordWhitelist: publisher.textContainerFilter.attributeFullWordWhitelist || [],
            blacklistSelectors: universal.textContainerFilter.blacklistSelectors.concat(publisher.textContainerFilter.blacklistSelectors || [])
          });
        } else {
          this._textContainerFilter = __spreadProps(__spreadValues({}, universal.textContainerFilter), {
            attributeFullWordWhitelist: []
          });
        }
        if (publisher.imageContainerSearch) {
          this._imageContainerSearch = __spreadProps(__spreadValues({}, universal.imageContainerSearch), {
            selectorBlacklist: universal.imageContainerSearch.selectorBlacklist.concat(publisher.imageContainerSearch.selectorBlacklist || [])
          });
        } else {
          this._imageContainerSearch = universal.imageContainerSearch;
        }
        if (publisher.imageContainerFilter) {
          this._imageContainerFilter = __spreadProps(__spreadValues({}, universal.imageContainerFilter), {
            attributeFullWordBlacklist: universal.imageContainerFilter.attributeFullWordBlacklist.concat(publisher.imageContainerFilter.attributeFullWordBlacklist || []),
            attributeFullWordWhitelist: publisher.imageContainerFilter.attributeFullWordWhitelist || [],
            blacklistSelectors: universal.imageContainerFilter.blacklistSelectors.concat(publisher.imageContainerFilter.blacklistSelectors || [])
          });
        } else {
          this._imageContainerFilter = __spreadProps(__spreadValues({}, universal.imageContainerFilter), {
            attributeFullWordWhitelist: []
          });
        }
        this._contentSearchRootElementSelector = publisher.contentSearchRootElementSelector;
        if (publisher.transpositions) {
          this._transpositions = publisher.transpositions.map(function (rule) {
            var parentElement = document.querySelector(rule.parentElementSelector),
              elements = rule.elementSelectors.reduce(function (elements2, selector) {
                return elements2.concat(Array.from(document.querySelectorAll(selector)));
              }, []);
            if (parentElement && elements.length) {
              return {
                elements: elements,
                lineage: buildLineage({
                  ancestor: contentSearchRootElement,
                  descendant: parentElement
                })
              };
            } else {
              return null;
            }
          }).filter(function (rule) {
            return !!rule;
          });
        } else {
          this._transpositions = [];
        }
        this._imageStrategy = publisher.imageStrategy;
      } else {
        this._textContainerSearch = universal.textContainerSearch;
        this._textContainerFilter = __spreadProps(__spreadValues({}, universal.textContainerFilter), {
          attributeFullWordWhitelist: []
        });
        this._imageContainerSearch = universal.imageContainerSearch;
        this._imageContainerFilter = __spreadProps(__spreadValues({}, universal.imageContainerFilter), {
          attributeFullWordWhitelist: []
        });
        this._transpositions = [];
      }
    }
    _createClass(Config, [{
      key: "textContainerSearch",
      get: function get() {
        return this._textContainerSearch;
      }
    }, {
      key: "textContainerFilter",
      get: function get() {
        return this._textContainerFilter;
      }
    }, {
      key: "imageContainerSearch",
      get: function get() {
        return this._imageContainerSearch;
      }
    }, {
      key: "imageContainerFilter",
      get: function get() {
        return this._imageContainerFilter;
      }
    }, {
      key: "imageContainerMetadata",
      get: function get() {
        return this._imageContainerMetadata;
      }
    }, {
      key: "imageContainerContent",
      get: function get() {
        return this._imageContainerContent;
      }
    }, {
      key: "textContainerSelection",
      get: function get() {
        return this._textContainerSelection;
      }
    }, {
      key: "contentSearchRootElementSelector",
      get: function get() {
        return this._contentSearchRootElementSelector;
      }
    }, {
      key: "transpositions",
      get: function get() {
        return this._transpositions;
      }
    }, {
      key: "wordCountTraversalPathSearchLimitMultiplier",
      get: function get() {
        return this._wordCountTraversalPathSearchLimitMultiplier;
      }
    }, {
      key: "imageStrategy",
      get: function get() {
        return this._imageStrategy;
      }
    }]);
    return Config;
  }();

  // client/contentParsing/configuration/configs.ts
  var configs_default = {
    universal: {
      textContainerSearch: {
        additionalContentNodeNameBlacklist: ["ASIDE", "FOOTER", "HEADER"],
        additionalContentMaxDepthDecrease: 1,
        additionalContentMaxDepthIncrease: 1,
        descendantNodeNameBlacklist: ["FORM"],
        nodeNameBlacklist: ["BUTTON", "FIGURE", "FORM", "HEAD", "IFRAME", "NAV", "NOSCRIPT", "PICTURE", "PRE", "SCRIPT", "STYLE", "svg"],
        selectorBlacklist: ['[itemprop="author"], [itemprop="datePublished"]']
      },
      textContainerFilter: {
        attributeFullWordBlacklist: ["ad", "carousel", "gallery", "related", "share", "subscribe", "subscription"],
        attributeWordPartBlacklist: ["byline", "caption", "comment", "download", "interlude", "image", "meta", "newsletter", "photo", "promo", "pullquote", "recirc", "video"],
        blacklistSelectors: [],
        regexBlacklist: [/^\[[^\]]+\]$/],
        singleSentenceOpenerBlacklist: ["\u25BA", "click here", "check out", "don't miss", "listen to", "read more", "related article:", "sign up for", "sponsored:", "this article appears in", "watch:"]
      },
      imageContainerSearch: {
        descendantNodeNameBlacklist: ["FORM", "IFRAME"],
        nodeNameBlacklist: ["FORM", "HEAD", "IFRAME", "NAV", "SCRIPT", "STYLE"],
        selectorBlacklist: []
      },
      imageContainerFilter: {
        attributeFullWordBlacklist: ["ad", "related", "share", "subscribe", "subscription"],
        attributeWordPartBlacklist: ["interlude", "newsletter", "promo", "recirc", "video"],
        blacklistSelectors: []
      },
      imageContainerMetadata: {
        contentRegexBlacklist: [/audm/i],
        contentRegexWhitelist: [],
        captionSelectors: ["figcaption", '[class*="caption"i]', '[itemProp*="caption"i]', '[itemProp*="description"i]'],
        creditSelectors: ['[class*="credit"i]', '[class*="source"i]', '[itemProp*="copyrightHolder"i]'],
        imageWrapperAttributeWordParts: ["image", "img", "photo"]
      },
      imageContainerContent: {
        nodeNameBlacklist: ["BUTTON"],
        nodeNameWhitelist: ["IMG", "META", "PICTURE", "SOURCE"],
        attributeBlacklist: ["expand", "icon", "share"]
      },
      textContainerSelection: {
        nodeNameWhitelist: ["ASIDE", "BLOCKQUOTE", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "OL", "P", "PRE", "TABLE", "UL"],
        ancestorNodeNameBlacklist: ["BLOCKQUOTE", "LI", "P"]
      },
      wordCountTraversalPathSearchLimitMultiplier: 0.75
    },
    publishers: [{
      hostname: "ablogtowatch.com",
      textContainerSearch: {
        selectorBlacklist: [".ablog-adlabel"]
      }
    }, {
      hostname: "99u.adobe.com",
      textContainerFilter: {
        attributeFullWordBlacklist: ["blockquote"]
      }
    }, {
      hostname: "aljazeera.com",
      contentSearchRootElementSelector: "div.main-article-body"
    }, {
      hostname: "bloomberg.com",
      preprocessor: function preprocessor() {
        var _a;
        var featureBodyScript = document.querySelector('script[data-component-props="FeatureBody"]'),
          featureBodyElement = document.querySelector('[data-component-root="FeatureBody"]');
        if (!featureBodyScript || !featureBodyElement) {
          return;
        }
        var featureBodyData;
        try {
          featureBodyData = JSON.parse(featureBodyScript.textContent);
        } catch (e) {
          return;
        }
        var copyContainer = (_a = Array.from(featureBodyElement.children).find(function (child) {
          return child.classList.contains("body-copy") || child.classList.contains("fence-body");
        })) != null ? _a : featureBodyElement;
        copyContainer.innerHTML = featureBodyData.body;
      }
    }, {
      hostname: "bostonglobe.com",
      transpositions: [{
        elementSelectors: [".article > .lead > *"],
        parentElementSelector: ".article > .body"
      }]
    }, {
      hostname: "cnbc.com",
      contentSearchRootElementSelector: ".ArticleBody-articleBody"
    }, {
      hostname: "cnn.com",
      transpositions: [{
        elementSelectors: [".el__leafmedia--sourced-paragraph > .zn-body__paragraph", ".l-container > .zn-body__paragraph:not(.zn-body__footer)", ".l-container > .zn-body__paragraph > h3"],
        parentElementSelector: ".zn-body__read-all"
      }]
    }, {
      hostname: "gizmodo.com",
      imageStrategy: 1 /* GizmodoImgUrl */
    }, {
      hostname: "abcnews.go.com",
      textContainerSearch: {
        selectorBlacklist: ['[class*="insert"]']
      }
    }, {
      hostname: "governing.com",
      imageStrategy: 2 /* GoverningImgSrcCorrection */
    }, {
      hostname: "hackaday.com",
      contentSearchRootElementSelector: 'div[itemprop="articleBody"]'
    }, {
      hostname: "huffpost.com",
      transpositions: [{
        elementSelectors: ['#entry-text [data-rapid-subsec="paragraph"] > :not([data-rapid-subsec="paragraph"])'],
        parentElementSelector: "#entry-text"
      }]
    }, {
      hostname: "insider.com",
      imageStrategy: 8 /* PostLoadImgTag */
    }, {
      hostname: "invisionapp.com",
      imageContainerSearch: {
        selectorBlacklist: ['div[class^="TweetQuotecomponent"]']
      }
    }, {
      hostname: "longreads.com",
      textContainerSearch: {
        selectorBlacklist: [".in-story"]
      }
    }, {
      hostname: "junkyardofthemind.com",
      contentSearchRootElementSelector: 'div[data-layout-label="Post Body"]'
    }, {
      hostname: "medium.com",
      textContainerFilter: {
        attributeFullWordWhitelist: ["ad"]
      },
      imageStrategy: 4 /* MediumScaleUp */
    }, {
      hostname: "devblogs.microsoft.com",
      contentSearchRootElementSelector: "article"
    }, {
      hostname: "nationalreview.com",
      contentSearchRootElementSelector: "div.article-content"
    }, {
      hostname: "newyorker.com",
      textContainerSearch: {
        selectorBlacklist: [".persistent-top"]
      },
      transpositions: [{
        elementSelectors: ["inline-embed p"],
        parentElementSelector: ".article__body"
      }]
    }, {
      hostname: "nymag.com",
      contentSearchRootElementSelector: ".article-content"
    }, {
      hostname: "nytimes.com",
      transpositions: [{
        elementSelectors: [".story-body-1 > .story-body-text"],
        parentElementSelector: ".story-body-2"
      }],
      imageStrategy: 7 /* NytFigureMulti */,
      textContainerSearch: {
        selectorBlacklist: ['[id*="ad"], .epkadsg3, .etfikam0, .ez3869y0']
      },
      imageContainerSearch: {
        selectorBlacklist: ['[id*="ad"], .epkadsg3, .etfikam0, .ez3869y0']
      }
    }, {
      hostname: "politico.com",
      imageContainerSearch: {
        selectorBlacklist: [".social-tools"]
      }
    }, {
      hostname: "qsrmagazine.com",
      contentSearchRootElementSelector: ".post"
    }, {
      hostname: "raptitude.com",
      contentSearchRootElementSelector: ".entry-content"
    }, {
      hostname: "article-test.dev.readup.org",
      transpositions: [{
        elementSelectors: [".lead"],
        parentElementSelector: ".lead + div"
      }],
      imageStrategy: 8 /* PostLoadImgTag */
    }, {
      hostname: "sciencedaily.com",
      transpositions: [{
        elementSelectors: ["p.lead"],
        parentElementSelector: "div#text"
      }]
    }, {
      hostname: "sinocism.com",
      textContainerFilter: {
        blacklistSelectors: [function () {
          var footer = Array.from(document.getElementsByTagName("p")).find(function (element) {
            return element.textContent.toLowerCase().startsWith("this week\u2019s issues of sinocism");
          });
          if (footer) {
            return [footer].concat(_toConsumableArray(Array.from(footer.parentElement.children).filter(function (sibling) {
              return footer.compareDocumentPosition(sibling) & Node.DOCUMENT_POSITION_FOLLOWING;
            })));
          }
          return [];
        }]
      }
    }, {
      hostname: "taosnews.com",
      contentSearchRootElementSelector: '[itemprop="articleBody"]'
    }, {
      hostname: "techcrunch.com",
      contentSearchRootElementSelector: ".article-content"
    }, {
      hostname: "techrepublic.com",
      textContainerFilter: {
        blacklistSelectors: [function () {
          var footer = Array.from(document.getElementsByTagName("h2")).find(function (element) {
            return element.textContent.toLowerCase().startsWith("also see");
          });
          if (footer && footer.nextElementSibling) {
            return [footer, footer.nextElementSibling];
          }
          return [];
        }]
      }
    }, {
      hostname: "theatlantic.com",
      contentSearchRootElementSelector: ".article-body",
      transpositions: [{
        elementSelectors: [".article-body > section > div > p"],
        parentElementSelector: ".article-body > section:last-of-type"
      }],
      imageContainerSearch: {
        selectorBlacklist: [".callout"]
      },
      textContainerSearch: {
        selectorBlacklist: [".c-nudge__spacing-container"]
      },
      textContainerFilter: {
        blacklistSelectors: [function () {
          var relatedVideo = Array.from(document.querySelectorAll("p > strong")).find(function (strong) {
            return strong.textContent.trim().toLowerCase() === "related video";
          });
          if (relatedVideo) {
            return [relatedVideo.parentElement];
          }
          return [];
        }]
      }
    }, {
      hostname: "thecorrespondent.com",
      textContainerSearch: {
        selectorBlacklist: [".contentitem-infocard__toggle-icon", ".contentitem-sidenote__note"]
      }
    }, {
      hostname: "thecut.com",
      contentSearchRootElementSelector: '[itemprop="articleBody"]',
      textContainerSearch: {
        selectorBlacklist: ["aside"]
      }
    }, {
      hostname: "thedailybeast.com",
      contentSearchRootElementSelector: "article.Body"
    }, {
      hostname: "theguardian.com",
      textContainerSearch: {
        selectorBlacklist: [".contributions__epic"]
      }
    }, {
      hostname: "thenewatlantis.com",
      textContainerSearch: {
        selectorBlacklist: ['.author, .epigraph, [style*="BellMT"], h2']
      },
      imageContainerSearch: {
        selectorBlacklist: ['[style*="BellMT"]']
      }
    }, {
      hostname: "theverge.com",
      contentSearchRootElementSelector: ".c-entry-content",
      textContainerSearch: {
        selectorBlacklist: ["aside"]
      }
    }, {
      hostname: "variety.com",
      contentSearchRootElementSelector: "article.c-content"
    }, {
      hostname: "vice.com",
      contentSearchRootElementSelector: ".article__body"
    }, {
      hostname: "washingtonpost.com",
      imageStrategy: 10 /* WashingtonPostScaleUp */,
      textContainerSearch: {
        selectorBlacklist: [".pg-navigation", ".pg-article-bottom", ".utility-bar", '[data-qa="article-body-ad"]', ".hide-for-print", ".annotation-details"]
      },
      textContainerFilter: {
        attributeFullWordBlacklist: ["helper", "interstitial"]
      },
      transpositions: [{
        elementSelectors: ["article header#pg-content p.pg-body-copy"],
        parentElementSelector: "article .article-body"
      }],
      imageContainerSearch: {
        selectorBlacklist: [".annotation-details"]
      }
    }, {
      hostname: "wired.com",
      textContainerFilter: {
        attributeFullWordBlacklist: ["inset"],
        blacklistSelectors: [function () {
          var footer = Array.from(document.getElementsByTagName("h3")).find(function (element) {
            return element.textContent.toLowerCase().startsWith("more great wired stories");
          });
          if (footer && footer.nextElementSibling) {
            return [footer, footer.nextElementSibling];
          }
          return [];
        }]
      },
      imageContainerSearch: {
        selectorBlacklist: [".inset"]
      }
    }, {
      hostname: "finance.yahoo.com",
      contentSearchRootElementSelector: 'article[itemprop="articleBody"]',
      transpositions: [{
        elementSelectors: ['div[class*="readmore"] p'],
        parentElementSelector: 'article[itemprop="articleBody"] div[class~="canvas-body"]'
      }]
    }, {
      hostname: "gsd.harvard.edu",
      contentSearchRootElementSelector: 'div[class~="article-body"]'
    }, {
      hostname: "news.harvard.edu",
      textContainerFilter: {
        attributeFullWordBlacklist: ["explore"]
      }
    }, {
      hostname: "nih.gov",
      contentSearchRootElementSelector: "#maincontent",
      textContainerSearch: {
        selectorBlacklist: [".goto", ".largeobj-link"]
      },
      textContainerFilter: {
        blacklistSelectors: [function () {
          var footer = Array.from(document.getElementsByTagName("h2")).find(function (element) {
            return element.textContent === "Footnotes";
          });
          if (footer && footer.parentElement.classList.contains("sec")) {
            return Array.from(footer.parentElement.parentElement.children).filter(function (element) {
              return footer.parentElement === element || footer.parentElement.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING;
            }).reduce(function (elements, element) {
              return elements.concat(Array.from(element.querySelectorAll("*")));
            }, []);
          }
          return [];
        }]
      },
      transpositions: [{
        elementSelectors: [".sec > .sec > *", ".sec > .table > *", ".sec > .table > .caption > *", ".sec > .table > * > table", ".sec > .table > .tblwrap-foot > *"],
        parentElementSelector: "#maincontent .sec + .sec"
      }]
    }, {
      hostname: "hackster.io",
      contentSearchRootElementSelector: "#story"
    }, {
      hostname: "dark-mountain.net",
      transpositions: [{
        elementSelectors: [".entry-content > div > .component--drop-cap", ".entry-content > div > p"],
        parentElementSelector: ".entry-content"
      }]
    }, {
      hostname: "mcsweeneys.net",
      contentSearchRootElementSelector: ".article-body"
    }, {
      hostname: "churchofjesuschrist.org",
      transpositions: [{
        elementSelectors: [".body-block > p", ".body-block > section:first-of-type > header > h2"],
        parentElementSelector: ".body-block > section:first-of-type"
      }]
    }, {
      hostname: "quantamagazine.org",
      imageStrategy: 9 /* QuantaScriptTemplate */,
      imageContainerSearch: {
        selectorBlacklist: [".post__sidebar"]
      }
    }, {
      hostname: "dailymail.co.uk",
      contentSearchRootElementSelector: 'div[itemprop="articleBody"]',
      textContainerSearch: {
        selectorBlacklist: [".art-insert"]
      }
    }, {
      hostname: "lrb.co.uk",
      transpositions: [{
        elementSelectors: [".article-body > .dropcap"],
        parentElementSelector: "#article-body"
      }]
    }, {
      hostname: "telegraph.co.uk",
      transpositions: [{
        elementSelectors: ['#mainBodyArea > div[class$="Par"] > *'],
        parentElementSelector: "#mainBodyArea > .body"
      }]
    }, {
      hostname: "nautil.us",
      contentSearchRootElementSelector: '[itemprop="articleBody"]',
      imageStrategy: 5 /* NautilusHostSwap */,
      textContainerSearch: {
        selectorBlacklist: [".pull-quote"]
      },
      imageContainerSearch: {
        selectorBlacklist: [".reco"]
      }
    }]
  };

  // client/contentParsing/configuration/PublisherConfig.ts
  function findPublisherConfig(configs, hostname) {
    return configs.find(function (config) {
      return hostname.endsWith(config.hostname);
    });
  }

  // client/contentParsing/parseDocumentContent.ts
  var singleSentenceRegex = /^[^.!?]+[.!?'"]*$/;
  var recircRegex = /^[^:]+:.+$/;
  function findDescendantsMatchingQuerySelectors(element, selectors) {
    return selectors.map(function (selector) {
      return element.querySelectorAll(selector);
    }).reduce(function (elements, element2) {
      return elements.concat(Array.from(element2));
    }, []);
  }
  function searchUpLineage(lineage, test) {
    for (var i = lineage.length - 1; i >= 0; i--) {
      var ancestor = lineage[i];
      if (test(ancestor, i)) {
        return ancestor;
      }
    }
    return null;
  }
  function selectElements(arg0) {
    if (Array.isArray(arg0)) {
      return arg0.reduce(function (elements, selector) {
        return elements.concat(selectElements(selector));
      }, []);
    }
    if (typeof arg0 === "string") {
      return Array.from(document.querySelectorAll(arg0));
    }
    return arg0();
  }
  function areContainerAttributesValid(element, config) {
    var words = findWordsInAttributes(element);
    return !words.some(function (word) {
      return (config.attributeFullWordBlacklist.includes(word) || config.attributeWordPartBlacklist.some(function (wordPart) {
        return word.includes(wordPart);
      })) && !words.some(function (word2) {
        return config.attributeFullWordWhitelist.includes(word2);
      });
    });
  }
  function isImageContainerMetadataValid(image, config) {
    var meta = (image.caption || "") + " " + (image.credit || "");
    return !(config.contentRegexBlacklist.some(function (regex) {
      return regex.test(meta);
    }) && !config.contentRegexWhitelist.some(function (regex) {
      return regex.test(meta);
    }));
  }
  function isTextContentValid(block, config) {
    var links = block.getElementsByTagName("a");
    if (!links.length) {
      return true;
    }
    if (links.length === 1 && links[0].textContent === block.textContent && block.textContent.toUpperCase() === block.textContent) {
      return false;
    }
    var trimmedContent = block.textContent.trim();
    if (config.regexBlacklist.some(function (regex) {
      return regex.test(trimmedContent);
    })) {
      return false;
    }
    var singleSentenceMatch = trimmedContent.match(singleSentenceRegex);
    if (singleSentenceMatch) {
      if (recircRegex.test(trimmedContent)) {
        return false;
      }
      var lowercasedContent = trimmedContent.toLowerCase();
      return !config.singleSentenceOpenerBlacklist.some(function (opener) {
        return lowercasedContent.startsWith(opener);
      });
    }
    return true;
  }
  function shouldSearchForContent(element, config) {
    if (config.nodeNameBlacklist.some(function (nodeName) {
      return element.nodeName === nodeName;
    })) {
      return false;
    }
    return !config.selectorBlacklist.some(function (selector) {
      return element.matches(selector);
    });
  }
  var findTextContainers = function () {
    function findClosestTextContainerElement(lineage, config) {
      return searchUpLineage(lineage, function (ancestor, index) {
        return isElement(ancestor) && config.nodeNameWhitelist.includes(ancestor.nodeName) && !lineage.slice(0, index).some(function (ancestor2) {
          return config.ancestorNodeNameBlacklist.includes(ancestor2.nodeName);
        });
      });
    }
    function addTextNode(node, lineage, config, containers) {
      var containerElement = findClosestTextContainerElement(lineage, config.textContainerSelection);
      if (containerElement && !config.textContainerSearch.descendantNodeNameBlacklist.some(function (nodeName) {
        return !!containerElement.getElementsByTagName(nodeName).length;
      })) {
        var containerLineage;
        var transpositionRule = config ? config.transpositions.find(function (rule) {
          return rule.elements.some(function (element) {
            return element === containerElement;
          });
        }) : null;
        if (transpositionRule) {
          containerLineage = transpositionRule.lineage.concat(containerElement);
        } else {
          containerLineage = lineage.slice(0, lineage.indexOf(containerElement) + 1);
        }
        var textContainer = new TextContainer(containerLineage, [lineage.concat(node)], getWordCount(node)),
          existingContainer = containers.find(function (container) {
            return container.containerElement === containerElement;
          });
        if (existingContainer) {
          existingContainer.mergeContent(textContainer);
        } else {
          containers.push(textContainer);
        }
      }
    }
    return function (node, lineage, config) {
      var containers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      if (isElement(node) && (!lineage.length || shouldSearchForContent(node, config.textContainerSearch))) {
        var childLineage = lineage.concat(node);
        for (var _i2 = 0, _Array$from2 = Array.from(node.childNodes); _i2 < _Array$from2.length; _i2++) {
          var child = _Array$from2[_i2];
          if (child.nodeType === Node.TEXT_NODE) {
            addTextNode(child, childLineage, config, containers);
          } else {
            findTextContainers(child, childLineage, config, containers);
          }
        }
      }
      return containers;
    };
  }();
  function groupTextContainersByDepth(containers) {
    return containers.reduce(function (depthGroups, container) {
      var containerDepth = container.containerLineage.length,
        existingGroup = depthGroups.find(function (group) {
          return group.depth === containerDepth;
        });
      if (existingGroup) {
        existingGroup.add(container);
      } else {
        depthGroups.push(new TextContainerDepthGroup(containerDepth, container));
      }
      return depthGroups;
    }, []);
  }
  function findTraversalPaths(group) {
    return group.members.map(function (member, index, members) {
      var peers = members.filter(function (potentialPeer) {
          return potentialPeer !== member;
        }),
        paths = [new TraversalPath({
          hops: 0,
          frequency: 1,
          wordCount: member.wordCount
        })];
      var _loop = function _loop() {
        var containerLineageIndex = group.depth - i,
          foundPeers = peers.filter(function (peer) {
            return peer.containerLineage[containerLineageIndex] === member.containerLineage[containerLineageIndex];
          });
        if (foundPeers.length) {
          paths.push(new TraversalPath({
            hops: i * 2,
            frequency: foundPeers.length,
            wordCount: foundPeers.reduce(function (sum, peer) {
              return sum += peer.wordCount;
            }, 0)
          }));
          foundPeers.forEach(function (peer) {
            peers.splice(peers.indexOf(peer), 1);
          });
        }
      };
      for (var i = 1; i <= group.depth && peers.length; i++) {
        _loop();
      }
      return new TraversalPathSearchResult(member, paths);
    });
  }
  var findImageContainers = function () {
    function getVisibleText(elements) {
      for (var _i3 = 0, _Array$from3 = Array.from(elements); _i3 < _Array$from3.length; _i3++) {
        var element = _Array$from3[_i3];
        if (element instanceof HTMLElement) {
          var text = element.innerText.trim();
          if (text) {
            return text;
          }
        }
      }
      return null;
    }
    function addFigureContent(element, config) {
      var contentElements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      if (isValidContent(element, config)) {
        contentElements.push(element);
        for (var _i4 = 0, _Array$from4 = Array.from(element.children); _i4 < _Array$from4.length; _i4++) {
          var child = _Array$from4[_i4];
          addFigureContent(child, config, contentElements);
        }
      }
      return contentElements;
    }
    function addImage(element, lineage, config, images) {
      if (shouldSearchForContent(element, config.imageContainerSearch) && !config.imageContainerSearch.descendantNodeNameBlacklist.some(function (nodeName) {
        return !!element.getElementsByTagName(nodeName).length;
      })) {
        var imgElements = Array.from(element.nodeName === "IMG" ? [element] : element.getElementsByTagName("img")),
          validImgElements = imgElements.filter(function (element2) {
            return isValidImgElement(element2);
          });
        if (!imgElements.length || validImgElements.length) {
          var containerElement;
          var contentElements;
          switch (element.nodeName) {
            case "PICTURE":
              containerElement = element;
              contentElements = Array.from(element.children).filter(function (child) {
                return child.nodeName === "SOURCE" || child.nodeName === "META" || child.nodeName === "IMG";
              });
              break;
            case "FIGURE":
              containerElement = element;
              contentElements = [];
              for (var _i5 = 0, _Array$from5 = Array.from(element.children); _i5 < _Array$from5.length; _i5++) {
                var child = _Array$from5[_i5];
                addFigureContent(child, config.imageContainerContent, contentElements);
              }
              break;
            case "IMG":
              containerElement = element;
              contentElements = [element];
              break;
          }
          var metaSearchRoot = searchUpLineage(lineage, function (ancestor, index) {
            if (index === 0) {
              return false;
            }
            var parent = lineage[index - 1];
            return (parent.previousElementSibling || parent.nextElementSibling) && !findWordsInAttributes(parent).some(function (word) {
              return config.imageContainerMetadata.imageWrapperAttributeWordParts.some(function (part) {
                return word.includes(part);
              });
            });
          }) || element;
          images.push(new ImageContainer(containerElement ? lineage.concat(containerElement) : [], contentElements.map(function (child) {
            return lineage.concat(buildLineage({
              descendant: child,
              ancestor: element
            }));
          }), getVisibleText(findDescendantsMatchingQuerySelectors(metaSearchRoot, config.imageContainerMetadata.captionSelectors)), getVisibleText(findDescendantsMatchingQuerySelectors(metaSearchRoot, config.imageContainerMetadata.creditSelectors))));
        }
      }
    }
    return function (node, lineage, edge, searchArea, config) {
      var images = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];
      if (isElement(node) && shouldSearchForContent(node, config.imageContainerSearch)) {
        var childLineage = lineage.concat(node);
        findChildren(node, lineage.length, edge, searchArea).forEach(function (result) {
          if (isImageContainerElement(result.node)) {
            addImage(result.node, childLineage, config, images);
          } else {
            findImageContainers(result.node, childLineage, result.edge, searchArea, config, images);
          }
        });
      }
      return images;
    };
  }();
  var findPreformattedTextContainers = function () {
    function createTextNodeLineages(element, elementLineage) {
      var lineages = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      for (var _i6 = 0, _Array$from6 = Array.from(element.childNodes); _i6 < _Array$from6.length; _i6++) {
        var child = _Array$from6[_i6];
        if (isElement(child)) {
          createTextNodeLineages(child, elementLineage.concat(child), lineages);
        } else if (child.nodeType === Node.TEXT_NODE) {
          lineages.push(elementLineage.concat(child));
        }
      }
      return lineages;
    }
    return function (node, lineage, edge, searchArea) {
      var containers = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
      if (isElement(node)) {
        var childLineage = lineage.concat(node);
        findChildren(node, lineage.length, edge, searchArea).forEach(function (result) {
          if (result.node.nodeName === "PRE") {
            var containerLineage = childLineage.concat(result.node);
            containers.push(new TextContainer(containerLineage, createTextNodeLineages(result.node, containerLineage), getWordCount(result.node)));
          } else {
            findPreformattedTextContainers(result.node, childLineage, result.edge, searchArea, containers);
          }
        });
      }
      return containers;
    };
  }();
  function findAdditionalPrimaryTextContainers(node, lineage, edge, searchArea, potentialContainers, blacklist, config) {
    var additionalContainers = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [];
    if (isElement(node) && !config.additionalContentNodeNameBlacklist.includes(node.nodeName) && shouldSearchForContent(node, config) && !blacklist.includes(node)) {
      findChildren(node, lineage.length, edge, searchArea).forEach(function (result) {
        var matchingContainer;
        if (isElement(result.node) && (matchingContainer = potentialContainers.find(function (container) {
          return container.containerElement === result.node;
        }))) {
          if (!blacklist.some(function (wrapper) {
            return wrapper === result.node || result.node.contains(wrapper);
          })) {
            additionalContainers.push(matchingContainer);
          }
        } else {
          findAdditionalPrimaryTextContainers(result.node, [node].concat(_toConsumableArray(lineage)), result.edge, searchArea, potentialContainers, blacklist, config, additionalContainers);
        }
      });
    }
    return additionalContainers;
  }
  function findChildren(parent, depth, edge, searchArea) {
    var children = Array.from(parent.childNodes);
    if (edge !== GraphEdge_default.None && depth < searchArea.length - 1) {
      var childrenLineageDepthGroup = searchArea[depth + 1];
      var firstSearchableChildIndex, lastSearchableChildIndex;
      if (edge & GraphEdge_default.Left) {
        firstSearchableChildIndex = children.findIndex(function (child) {
          return childrenLineageDepthGroup.includes(child);
        });
      }
      if (edge & GraphEdge_default.Right) {
        lastSearchableChildIndex = children.length - 1 - children.reverse().findIndex(function (child) {
          return childrenLineageDepthGroup.includes(child);
        });
        children.reverse();
      }
      return children.filter(function (_, index) {
        return (firstSearchableChildIndex != null ? index >= firstSearchableChildIndex : true) && (lastSearchableChildIndex != null ? index <= lastSearchableChildIndex : true);
      }).map(function (child, index, children2) {
        var childEdge = GraphEdge_default.None;
        if (edge & GraphEdge_default.Left && index === 0) {
          childEdge |= GraphEdge_default.Left;
        }
        if (edge & GraphEdge_default.Right && index === children2.length - 1) {
          childEdge |= GraphEdge_default.Right;
        }
        return {
          node: child,
          edge: childEdge
        };
      });
    }
    return children.map(function (child) {
      return {
        node: child,
        edge: GraphEdge_default.None
      };
    });
  }
  function parseDocumentContent(params) {
    var publisherConfig = findPublisherConfig(configs_default.publishers, params.url.hostname);
    if (publisherConfig == null ? void 0 : publisherConfig.preprocessor) {
      publisherConfig.preprocessor();
    }
    var contentSearchRootElement;
    if (publisherConfig && publisherConfig.contentSearchRootElementSelector) {
      contentSearchRootElement = document.querySelector(publisherConfig.contentSearchRootElementSelector);
    }
    if (!contentSearchRootElement) {
      contentSearchRootElement = document.body;
    }
    var config = new Config(configs_default.universal, publisherConfig, contentSearchRootElement);
    var blacklistedTextContainerElements = selectElements(config.textContainerFilter.blacklistSelectors);
    var textContainers = findTextContainers(contentSearchRootElement, [], config).filter(function (container) {
      return container.wordCount > 0 && !blacklistedTextContainerElements.some(function (element) {
        return element === container.containerElement;
      }) && isTextContentValid(container.containerElement, config.textContainerFilter);
    });
    var attributeFilteredTextContainers = textContainers.filter(function (container) {
      return areContainerAttributesValid(container.containerElement, config.textContainerFilter);
    });
    if (attributeFilteredTextContainers.length / textContainers.length > 0.5) {
      textContainers = attributeFilteredTextContainers;
    }
    var textContainerDepthGroups = groupTextContainersByDepth(textContainers);
    var depthGroupWithMostWords = textContainerDepthGroups.sort(function (a, b) {
      return b.wordCount - a.wordCount;
    })[0];
    var traversalPathSearchResults = findTraversalPaths(depthGroupWithMostWords);
    var preferredPathHopCountGroups = traversalPathSearchResults.reduce(function (groups, result) {
      var group = groups.find(function (group2) {
        return group2.preferredPathHopCount === result.getPreferredPath().hops;
      });
      if (group) {
        group.searchResults.push(result);
        group.wordCount += result.textContainer.wordCount;
      } else {
        groups.push({
          preferredPathHopCount: result.getPreferredPath().hops,
          searchResults: [result],
          wordCount: result.textContainer.wordCount
        });
      }
      return groups;
    }, []);
    var selectedPreferredPathHopCountGroups = preferredPathHopCountGroups.sort(function (a, b) {
      return b.wordCount - a.wordCount;
    }).reduce(function (selectedGroups, group) {
      if (selectedGroups.reduce(function (sum, group2) {
        return sum + group2.wordCount;
      }, 0) < depthGroupWithMostWords.wordCount * config.wordCountTraversalPathSearchLimitMultiplier) {
        selectedGroups.push(group);
      }
      return selectedGroups;
    }, []);
    var primaryTextContainerSearchResults = selectedPreferredPathHopCountGroups.reduce(function (results, group) {
      return results.concat(group.searchResults);
    }, []);
    var excludedSearchResults = traversalPathSearchResults.filter(function (result) {
      return !primaryTextContainerSearchResults.includes(result);
    });
    if (excludedSearchResults.length) {
      var primaryTextContainerElementMetadata = primaryTextContainerSearchResults.reduce(function (groups, result) {
        var group = groups.find(function (group2) {
          return group2.nodeName === result.textContainer.containerElement.nodeName;
        });
        if (group) {
          group.searchResults.push(result);
          group.wordCount += result.textContainer.wordCount;
        } else {
          groups.push({
            nodeName: result.textContainer.containerElement.nodeName,
            searchResults: [result],
            wordCount: result.textContainer.wordCount
          });
        }
        return groups;
      }, []).sort(function (a, b) {
        return b.wordCount - a.wordCount;
      })[0];
      if (primaryTextContainerElementMetadata.nodeName === "P") {
        primaryTextContainerSearchResults = primaryTextContainerSearchResults.concat(excludedSearchResults.filter(function (result) {
          return result.textContainer.containerElement.nodeName === primaryTextContainerElementMetadata.nodeName;
        }));
      }
    }
    var primaryTextRootNode = primaryTextContainerSearchResults[0].textContainer.containerLineage[primaryTextContainerSearchResults[0].textContainer.containerLineage.length - Math.max(Math.max.apply(Math, _toConsumableArray(primaryTextContainerSearchResults.map(function (result) {
      return result.getPreferredPath().hops;
    }))) / 2, 1)];
    var searchArea = zipContentLineages(primaryTextContainerSearchResults.map(function (result) {
      return result.textContainer;
    })).slice(buildLineage({
      ancestor: contentSearchRootElement,
      descendant: primaryTextRootNode
    }).length - 1);
    var blacklistedImageContainerElements = selectElements(config.imageContainerFilter.blacklistSelectors);
    var imageContainers = findImageContainers(primaryTextRootNode, [], GraphEdge_default.Left | GraphEdge_default.Right, searchArea, config).filter(function (container) {
      return !blacklistedImageContainerElements.some(function (element) {
        return element === container.containerElement;
      }) && areContainerAttributesValid(container.containerElement, config.imageContainerFilter) && isImageContainerMetadataValid(container, config.imageContainerMetadata);
    });
    var preformattedTextContainers = findPreformattedTextContainers(primaryTextRootNode, [], GraphEdge_default.Left | GraphEdge_default.Right, searchArea);
    var additionalPrimaryTextContainers = findAdditionalPrimaryTextContainers(primaryTextRootNode, [], GraphEdge_default.Left | GraphEdge_default.Right, searchArea, textContainerDepthGroups.filter(function (group) {
      return group.depth !== depthGroupWithMostWords.depth && group.depth >= depthGroupWithMostWords.depth - config.textContainerSearch.additionalContentMaxDepthDecrease && group.depth <= depthGroupWithMostWords.depth + config.textContainerSearch.additionalContentMaxDepthIncrease;
    }).reduce(function (containers, group) {
      return containers.concat(group.members);
    }, []).concat(traversalPathSearchResults.filter(function (result) {
      return !primaryTextContainerSearchResults.includes(result);
    }).map(function (result) {
      return result.textContainer;
    })), imageContainers.map(function (container) {
      return container.containerElement;
    }), config.textContainerSearch).filter(function (container) {
      return isTextContentValid(container.containerElement, config.textContainerFilter);
    });
    return {
      contentSearchRootElement: contentSearchRootElement,
      depthGroupWithMostWords: depthGroupWithMostWords,
      primaryTextContainerSearchResults: primaryTextContainerSearchResults,
      additionalPrimaryTextContainers: additionalPrimaryTextContainers,
      primaryTextRootNode: primaryTextRootNode,
      primaryTextContainers: primaryTextContainerSearchResults.map(function (result) {
        return result.textContainer;
      }).concat(additionalPrimaryTextContainers),
      imageContainers: imageContainers,
      preformattedTextContainers: preformattedTextContainers
    };
  }

  // client/reading/ReadState.ts
  var ReadState = /*#__PURE__*/function () {
    function _ReadState(data) {
      _classCallCheck(this, _ReadState);
      __publicField(this, "_state");
      __publicField(this, "_wordCount");
      __publicField(this, "_wordsRead");
      if (data[0] instanceof _ReadState) {
        var readStates = data;
        this._state = readStates[0]._state.slice();
        for (var i = 1; i < readStates.length; i++) {
          if (Math.sign(readStates[i]._state[0]) === Math.sign(this._state[this._state.length - 1])) {
            this._state[this._state.length - 1] += readStates[i]._state[0];
            if (readStates[i]._state.length > 1) {
              this._state = this._state.concat(readStates[i]._state.slice(1));
            }
          } else {
            this._state = this._state.concat(readStates[i]._state);
          }
        }
      } else {
        this._state = data;
      }
      this._updateCountCache();
    }
    _createClass(_ReadState, [{
      key: "_updateCountCache",
      value: function _updateCountCache() {
        this._wordCount = 0;
        this._wordsRead = 0;
        for (var i = 0; i < this._state.length; i++) {
          this._wordCount += Math.abs(this._state[i]);
          if (this._state[i] > 0) {
            this._wordsRead += this._state[i];
          }
        }
      }
    }, {
      key: "getPercentComplete",
      value: function getPercentComplete() {
        return this._wordsRead * 100 / this._wordCount;
      }
    }, {
      key: "isComplete",
      value: function isComplete() {
        return this._wordsRead === this._wordCount;
      }
    }, {
      key: "readWord",
      value: function readWord() {
        if (!this.isComplete()) {
          if (this._state[0] === -1) {
            this._state.splice(0, 1);
            if (this._state[0]) {
              this._state[0]++;
            } else {
              this._state[0] = 1;
            }
          } else {
            if (this._state[0] > 0) {
              this._state[0]++;
            } else {
              this._state.unshift(1);
            }
            if (this._state[1] === -1) {
              this._state.splice(1, 1);
              if (this._state.length >= 2) {
                this._state[0] += this._state.splice(1, 1)[0];
              }
            } else {
              this._state[1]++;
            }
          }
          this._wordsRead++;
          return true;
        }
        return false;
      }
    }, {
      key: "slice",
      value: function slice(startIndex, count) {
        var index = 0,
          skipCount = 0,
          takeCount = 0,
          state = [],
          segAbsVal,
          segSign;
        while (skipCount + Math.abs(this._state[index]) <= startIndex) {
          skipCount += Math.abs(this._state[index++]);
        }
        while (takeCount !== count) {
          segAbsVal = Math.min(Math.abs(this._state[index]) - (startIndex - skipCount), count - takeCount);
          segSign = Math.sign(this._state[index]);
          if (segSign === Math.sign(state[state.length - 1])) {
            state[state.length - 1] += segSign * segAbsVal;
          } else {
            state.push(segSign * segAbsVal);
          }
          skipCount += startIndex - skipCount;
          takeCount += segAbsVal;
          index++;
        }
        return new _ReadState(state);
      }
    }, {
      key: "wordCount",
      get: function get() {
        return this._wordCount;
      }
    }, {
      key: "wordsRead",
      get: function get() {
        return this._wordsRead;
      }
    }, {
      key: "readStateArray",
      get: function get() {
        return this._state;
      }
    }]);
    return _ReadState;
  }();

  // client/reading/Line.ts
  var Line = /*#__PURE__*/function () {
    function Line(top, height, readState) {
      _classCallCheck(this, Line);
      __publicField(this, "_top");
      __publicField(this, "_readState");
      this._top = top;
      this._readState = readState;
    }
    _createClass(Line, [{
      key: "isRead",
      value: function isRead() {
        return this._readState.isComplete();
      }
    }, {
      key: "readWord",
      value: function readWord() {
        var result = this._readState.readWord();
        return result;
      }
    }, {
      key: "readState",
      get: function get() {
        return this._readState;
      }
    }, {
      key: "top",
      get: function get() {
        return this._top;
      }
    }]);
    return Line;
  }();

  // client/reading/ContentElement.ts
  var ContentElement = /*#__PURE__*/function () {
    function ContentElement(element, wordCount) {
      _classCallCheck(this, ContentElement);
      __publicField(this, "_element");
      __publicField(this, "_lineHeight");
      __publicField(this, "_wordCount");
      __publicField(this, "_lines");
      __publicField(this, "_contentOffset");
      __publicField(this, "_contentRect");
      __publicField(this, "_isDebugging", false);
      __publicField(this, "_debugElements", []);
      this._element = element;
      this._contentOffset = this._getContentOffset();
      this._contentRect = this._getContentRect();
      this.setLineHeight();
      this._wordCount = wordCount;
      this._setLines(new ReadState([-this._wordCount]));
    }
    _createClass(ContentElement, [{
      key: "_createListItemOrSpanElement",
      value: function _createListItemOrSpanElement() {
        var nodeName;
        if (this._element.nodeName === "OL" || this._element.nodeName === "UL") {
          nodeName = "li";
        } else {
          nodeName = "span";
        }
        return document.createElement(nodeName);
      }
    }, {
      key: "isLineReadable",
      value: function isLineReadable(line) {
        return this._contentRect.top + line.top >= window.pageYOffset && this._contentRect.top + line.top <= window.innerHeight + window.pageYOffset && !line.isRead();
      }
      /**
       * Calculates the number of Lines presented to the article viewer in this ContentElement,
       * and stores their geometrical properties and individual reading states in Line objects.
       */
    }, {
      key: "_setLines",
      value: function _setLines(readState) {
        var lineCount = Math.max(1, Math.floor(this._contentRect.height / this._lineHeight)),
          minWordsPerLine = Math.floor(this._wordCount / lineCount),
          remainder = this._wordCount % lineCount;
        this._lines = [];
        for (var i = 0, wordCount = 0; i < lineCount; i++) {
          var lineWordCount = minWordsPerLine + (remainder > 0 ? remainder - --remainder : 0);
          this._lines.push(new Line(this._lineHeight * i, this._lineHeight, readState.slice(wordCount, lineWordCount)));
          wordCount += lineWordCount;
        }
        this._syncDebugDisplay();
      }
      /**
       * Gets the offsets of the content of this element relative to its parent
       * element, caused by any applied CSS border and/or padding properties.
       */
    }, {
      key: "_getContentOffset",
      value: function _getContentOffset() {
        var computedStyle = window.getComputedStyle(this._element);
        var border = {
          top: parseInt(computedStyle.borderTopWidth),
          right: parseInt(computedStyle.borderRightWidth),
          bottom: parseInt(computedStyle.borderBottomWidth),
          left: parseInt(computedStyle.borderLeftWidth)
        };
        var padding = {
          top: parseInt(computedStyle.paddingTop),
          right: parseInt(computedStyle.paddingRight),
          bottom: parseInt(computedStyle.paddingBottom),
          left: parseInt(computedStyle.paddingLeft)
        };
        return {
          top: border.top + padding.top,
          right: border.right + padding.right,
          bottom: border.bottom + padding.bottom,
          left: border.left + padding.left
        };
      }
      /**
       * Gets the offset of this ContentElement relative to the viewport, taking into
       * account any border widths or padding that the element itself might have.
       */
    }, {
      key: "_getContentRect",
      value: function _getContentRect() {
        var rect = this._element.getBoundingClientRect();
        return {
          top: window.pageYOffset + rect.top + this._contentOffset.top,
          left: rect.left + this._contentOffset.left,
          width: rect.width - (this._contentOffset.left + this._contentOffset.right),
          height: rect.height - (this._contentOffset.top + this._contentOffset.bottom)
        };
      }
    }, {
      key: "_syncDebugDisplay",
      value: function _syncDebugDisplay() {
        var _this3 = this;
        if (!this._isDebugging) {
          return;
        }
        var lineCount = this._lines.length,
          debugElementCount = this._debugElements.length;
        if (lineCount > debugElementCount) {
          for (var i = 0; i < lineCount - debugElementCount; i++) {
            var newDebugElement = this._createListItemOrSpanElement();
            if (newDebugElement.nodeName === "LI") {
              newDebugElement.style.listStyle = "none";
            }
            newDebugElement.style.position = "absolute";
            newDebugElement.style.left = "0";
            newDebugElement.style.right = "0";
            newDebugElement.style.height = this._lineHeight + "px";
            newDebugElement.style.boxShadow = "inset 0 0 0 2px lime";
            this._element.appendChild(newDebugElement);
            this._debugElements.push(newDebugElement);
          }
        } else if (lineCount < debugElementCount) {
          var deleteCount = debugElementCount - lineCount;
          this._debugElements.splice(this._lines.length - deleteCount, deleteCount).forEach(function (deletedDebugElement) {
            deletedDebugElement.remove();
          });
        }
        this._lines.forEach(function (line, index) {
          var debugElement = _this3._debugElements[index],
            percentComplete = line.readState.getPercentComplete();
          debugElement.style.top = line.top + "px";
          debugElement.style.backgroundImage = "linear-gradient(to right, rgba(0, 255, 0, 0.5) ".concat(percentComplete, "%, transparent ").concat(percentComplete, "%)");
        });
      }
    }, {
      key: "setLineHeight",
      value: function setLineHeight() {
        var testElement = this._createListItemOrSpanElement();
        if (testElement.nodeName === "LI") {
          testElement.style.display = "inline";
        }
        testElement.style.whiteSpace = "pre";
        testElement.innerHTML = "&nbsp;\n&nbsp";
        this._element.appendChild(testElement);
        var clientRects = testElement.getClientRects();
        var lineHeight;
        if (clientRects.length) {
          lineHeight = clientRects[clientRects.length - 1].top - clientRects[0].top;
        }
        testElement.remove();
        this._lineHeight = lineHeight || this._contentRect.height || 1;
      }
      /**
       * Updates the internal representation of the offset of this ContentElement
       * relative to its viewport, in case it has changed.
       * Also recalculates the lines of this ContentElement.
       */
    }, {
      key: "updateOffset",
      value: function updateOffset() {
        var contentRect = this._getContentRect();
        if (contentRect.top !== this._contentRect.top || contentRect.left !== this._contentRect.left || contentRect.width !== this._contentRect.width || contentRect.height !== this._contentRect.height) {
          this._contentRect = contentRect;
          this._setLines(this.getReadState());
        }
      }
    }, {
      key: "toggleVisualDebugging",
      value: function toggleVisualDebugging() {
        if (this._isDebugging = !this._isDebugging) {
          this._element.style.position = "relative";
          this._element.style.boxShadow = "0 0 0 2px green";
          this._debugElements.forEach(function (element) {
            element.style.display = "block";
          });
          this._syncDebugDisplay();
        } else {
          this._element.style.boxShadow = "";
          this._debugElements.forEach(function (element) {
            element.style.display = "none";
          });
        }
      }
    }, {
      key: "isReadable",
      value: function isReadable() {
        var _this4 = this;
        return this._lines.some(function (line) {
          return _this4.isLineReadable(line);
        });
      }
    }, {
      key: "readWord",
      value: function readWord() {
        var _this5 = this;
        var line = this._lines.find(function (line2) {
          return _this5.isLineReadable(line2);
        });
        if (line) {
          var wordRead = line.readWord();
          if (wordRead) {
            this._syncDebugDisplay();
          }
          return wordRead;
        }
        return false;
      }
    }, {
      key: "getReadState",
      value: function getReadState() {
        return new ReadState(this._lines.map(function (line) {
          return line.readState;
        }));
      }
    }, {
      key: "setReadState",
      value: function setReadState(readState) {
        this._setLines(readState);
      }
    }, {
      key: "isRead",
      value: function isRead() {
        return !this._lines.some(function (line) {
          return !line.isRead();
        });
      }
    }, {
      key: "element",
      get: function get() {
        return this._element;
      }
    }, {
      key: "lines",
      get: function get() {
        return this._lines;
      }
    }, {
      key: "offsetTop",
      get: function get() {
        return this._contentRect.top;
      }
    }, {
      key: "wordCount",
      get: function get() {
        return this._wordCount;
      }
    }]);
    return ContentElement;
  }();

  // client/reading/Page.ts
  function countTextNodeWords(element) {
    var wordCount = 0;
    for (var _i7 = 0, _Array$from7 = Array.from(element.childNodes); _i7 < _Array$from7.length; _i7++) {
      var childNode = _Array$from7[_i7];
      if (childNode.nodeType === Node.TEXT_NODE) {
        wordCount += getWordCount(childNode);
      } else if (isElement(childNode)) {
        wordCount += countTextNodeWords(childNode);
      }
    }
    return wordCount;
  }
  function findContentElements(element) {
    var contentElements = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var containsTextNodeContent = false,
      containsBlockElement = false;
    for (var _i8 = 0, _Array$from8 = Array.from(element.childNodes); _i8 < _Array$from8.length; _i8++) {
      var child = _Array$from8[_i8];
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length) {
        containsTextNodeContent = true;
      } else if (isBlockElement(child)) {
        containsBlockElement = true;
      }
    }
    if (containsTextNodeContent || !containsBlockElement) {
      contentElements.push(new ContentElement(element, countTextNodeWords(element)));
    } else {
      for (var _i9 = 0, _Array$from9 = Array.from(element.children); _i9 < _Array$from9.length; _i9++) {
        var _child = _Array$from9[_i9];
        findContentElements(_child, contentElements);
      }
    }
    return contentElements;
  }
  var Page = /*#__PURE__*/function () {
    function Page(primaryTextContainers) {
      _classCallCheck(this, Page);
      __publicField(this, "_contentEls");
      this._contentEls = primaryTextContainers.reduce(function (contentElements, textContainer) {
        return contentElements.concat(findContentElements(textContainer.containerElement));
      }, []).sort(function (a, b) {
        return a.offsetTop - b.offsetTop;
      });
    }
    _createClass(Page, [{
      key: "setReadState",
      value: function setReadState(readStateArray) {
        var readState = new ReadState(readStateArray);
        var wordCount = 0;
        this._contentEls.forEach(function (block) {
          var wordsAvailable = readState.wordCount - wordCount;
          if (wordsAvailable >= block.wordCount) {
            block.setReadState(readState.slice(wordCount, block.wordCount));
          } else if (wordsAvailable > 0) {
            block.setReadState(new ReadState([readState.slice(wordCount, wordsAvailable), new ReadState([-(block.wordCount - wordsAvailable)])]));
          } else {
            block.setReadState(new ReadState([-block.wordCount]));
          }
          wordCount += block.wordCount;
        });
        return this;
      }
    }, {
      key: "getReadState",
      value: function getReadState() {
        return new ReadState(this._contentEls.map(function (b) {
          return b.getReadState();
        }));
      }
    }, {
      key: "updateLineHeight",
      value: function updateLineHeight() {
        this._contentEls.forEach(function (element) {
          element.setLineHeight();
        });
      }
    }, {
      key: "updateOffset",
      value: function updateOffset() {
        this._contentEls.forEach(function (block) {
          return block.updateOffset();
        });
      }
    }, {
      key: "isRead",
      value: function isRead() {
        return !this._contentEls.some(function (block) {
          return !block.isRead();
        });
      }
    }, {
      key: "readWord",
      value: function readWord() {
        var block = this._contentEls.find(function (block2) {
          return block2.isReadable();
        });
        if (block) {
          return block.readWord();
        }
        return false;
      }
    }, {
      key: "getBookmarkScrollTop",
      value: function getBookmarkScrollTop() {
        this.updateOffset();
        var readState = this.getReadState();
        var lastReadLine = this._contentEls.reduce(function (lines, paragraph) {
          return lines.concat(paragraph.lines);
        }, []).reduce(function (searchableLines, line) {
          if (searchableLines.reduce(function (sum, line2) {
            return sum + line2.readState.wordCount;
          }, 0) < readState.wordsRead) {
            return searchableLines.concat(line);
          }
          return searchableLines;
        }, []).reverse().find(function (line) {
          return line.readState.wordsRead > 0;
        });
        if (lastReadLine) {
          return Math.max(0, this._contentEls.find(function (paragraph) {
            return paragraph.lines.includes(lastReadLine);
          }).offsetTop + lastReadLine.top - window.innerHeight);
        }
        return 0;
      }
    }, {
      key: "toggleVisualDebugging",
      value: function toggleVisualDebugging() {
        this._contentEls.forEach(function (block) {
          return block.toggleVisualDebugging();
        });
      }
    }, {
      key: "elements",
      get: function get() {
        return this._contentEls;
      }
    }]);
    return Page;
  }();

  // client/reading/Reader.ts
  var Reader = /*#__PURE__*/function () {
    /**
     * @param onCommitReadState a function to handle progress updates from the simulated
     * reader. This will be called frequently as the reader progresses.
     */
    function Reader(onCommitReadState) {
      var _this6 = this;
      _classCallCheck(this, Reader);
      __publicField(this, "_commitInterval");
      __publicField(this, "_isReading", false);
      __publicField(this, "_lastCommitPercentComplete", 0);
      __publicField(this, "_lastReadTimestamp");
      __publicField(this, "_offsetUpdateInterval");
      __publicField(this, "_onCommitReadState");
      __publicField(this, "_page");
      __publicField(this, "_read", function () {
        if (_this6._isReading) {
          var now = Date.now(),
            elapsed = now - (_this6._lastReadTimestamp || now - 300),
            readWordCount = Math.floor(elapsed / 100);
          for (var i = 0; i < readWordCount; i++) {
            if (!_this6._page.readWord() && _this6._page.isRead()) {
              _this6.stopReading();
              _this6.commitReadState();
              return;
            }
          }
          _this6._lastReadTimestamp = now;
          window.setTimeout(_this6._read, 300);
        }
      });
      this._onCommitReadState = onCommitReadState;
      window.document.addEventListener("visibilitychange", function () {
        if (_this6._page) {
          if (window.document.hidden) {
            _this6.stopReading();
          } else {
            _this6.startReading();
          }
        }
      });
    }
    _createClass(Reader, [{
      key: "commitReadState",
      value: function commitReadState() {
        var readState = this._page.getReadState(),
          percentComplete = readState.getPercentComplete();
        if (percentComplete > this._lastCommitPercentComplete) {
          var isRead = percentComplete >= 90;
          this._onCommitReadState({
            isCompletionCommit: this._lastCommitPercentComplete < 90 && isRead,
            isRead: isRead,
            percentComplete: percentComplete,
            readStateArray: readState.readStateArray
          });
          this._lastCommitPercentComplete = percentComplete;
        }
      }
    }, {
      key: "startReading",
      value: function startReading() {
        var _this7 = this;
        if (!this._isReading && !this._page.isRead()) {
          this._isReading = true;
          this._commitInterval = window.setInterval(function () {
            _this7.commitReadState();
          }, 3e3);
          this._offsetUpdateInterval = window.setInterval(function () {
            _this7._page.updateOffset();
          }, 3e3);
          this._read();
        }
      }
    }, {
      key: "stopReading",
      value: function stopReading() {
        if (this._isReading) {
          this._isReading = false;
          this._lastReadTimestamp = null;
          window.clearInterval(this._commitInterval);
          window.clearInterval(this._offsetUpdateInterval);
        }
      }
    }, {
      key: "loadPage",
      value: function loadPage(page) {
        this._page = page;
        console.log("Read start check");
        console.log("Starting reading");
        this.startReading();
      }
    }, {
      key: "unloadPage",
      value: function unloadPage() {
        this.stopReading();
        this._page = null;
        this._lastCommitPercentComplete = 0;
      }
    }]);
    return Reader;
  }();

  // client/reading/utils.ts
  var absoluteUrlRegex = /^(https?:)?\/{2}(?!\/)/;
  function getElementAttribute(element, selector) {
    return element ? selector(element) : null;
  }
  function matchGetAbsoluteUrl(protocol, url) {
    if (url) {
      var match = url.match(absoluteUrlRegex);
      if (match) {
        if (!match[1]) {
          return protocol.replace(/:$/, "") + ":" + url;
        } else {
          return url;
        }
      }
    }
    return null;
  }
  function getWords(text) {
    return text && text.match(/\S+/g) || [];
  }

  // client/reading/parseElementMicrodata.ts
  var valueMap = {
    a: "href",
    img: "src",
    link: "href",
    meta: "content",
    object: "data",
    time: "datetime"
  };
  var itemTypeRegExp = /schema\.org\/(.+)/;
  function isScopeElement(element) {
    return element.hasAttribute("itemscope") || element.hasAttribute("itemtype");
  }
  function getElementValue(element) {
    var tagName = element.tagName.toLowerCase();
    return valueMap.hasOwnProperty(tagName) ? element.getAttribute(valueMap[tagName]) : element.textContent;
  }
  function getElementType(element, isTopLevel) {
    var type = {};
    if (element.hasAttribute("itemtype")) {
      if (isTopLevel) {
        type["@context"] = "http://schema.org";
      }
      var itemType = element.getAttribute("itemtype"),
        match = itemType.match(itemTypeRegExp);
      if (match && match.length === 2) {
        type["@type"] = match[1];
      } else {
        type["@type"] = itemType;
      }
    }
    return type;
  }
  function mergeValue(properties, value, scope) {
    properties.forEach(function (property) {
      if (scope.hasOwnProperty(property)) {
        if (scope[property] instanceof Array) {
          scope[property].push(value);
        } else {
          scope[property] = [scope[property], value];
        }
      } else {
        scope[property] = value;
      }
    });
    return value;
  }
  function parseElementMicrodata(element) {
    var topLevelTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var scope = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (scope && element.hasAttribute("itemprop")) {
      var properties = getWords(element.getAttribute("itemprop"));
      if (isScopeElement(element)) {
        scope = mergeValue(properties, getElementType(element), scope);
      } else if (!element.hasAttribute("itemid")) {
        mergeValue(properties, getElementValue(element), scope);
      }
    } else if (isScopeElement(element)) {
      topLevelTypes.push(scope = getElementType(element, true));
    }
    for (var i = 0; i < element.children.length; i++) {
      parseElementMicrodata(element.children[i], topLevelTypes, scope);
    }
    return topLevelTypes;
  }
  var parseElementMicrodata_default = parseElementMicrodata;

  // client/reading/parseSchema.ts
  function first(value, map) {
    var retValue = value instanceof Array ? value[0] : value;
    return map && retValue ? map(retValue) : retValue;
  }
  function many(value, map) {
    var retValue = value instanceof Array ? value : value ? [value] : [];
    return map ? retValue.map(map) : retValue;
  }
  function processKeywords(keywords) {
    var tags = [];
    if (keywords) {
      if (Array.isArray(keywords)) {
        var _iterator2 = _createForOfIteratorHelper(keywords),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var element = _step2.value;
            tags.push.apply(tags, _toConsumableArray(processKeywords(element)));
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      } else if (typeof keywords === "string") {
        tags.push.apply(tags, _toConsumableArray(keywords.split(",")));
      }
    }
    return tags;
  }
  function parseSchema(topLevelTypes) {
    var data = topLevelTypes.find(function (type) {
      return type.hasOwnProperty("@type") && (type["@type"].endsWith("Article") || type["@type"] === "BlogPosting");
    });
    if (data) {
      var firstImage = first(data.image);
      return {
        url: first(data.url),
        article: {
          title: first(data.headline) || first(data.name),
          source: first(data.publisher || data.sourceOrganization || data.provider, function (x) {
            return {
              name: first(x.name),
              url: first(x.url)
            };
          }) || {},
          datePublished: first(data.datePublished),
          dateModified: first(data.dateModified),
          authors: many(data.author || data.creator, function (x) {
            return {
              name: first(x.name),
              url: first(x.url)
            };
          }),
          section: first(data.articleSection) || first(data.printSection),
          description: first(data.description),
          tags: processKeywords(data.keywords),
          pageLinks: [],
          imageUrl: firstImage ? typeof firstImage === "string" || _typeof(firstImage) === "object" ? typeof firstImage === "string" ? firstImage : firstImage.contentUrl || firstImage.url : null : null
        }
      };
    }
    return null;
  }
  var parseSchema_default = parseSchema;

  // client/reading/parseMiscMetadata.ts
  function parseAuthors() {
    var metaElements = document.querySelectorAll('meta[name="author"]');
    if (metaElements.length) {
      return Array.from(metaElements).map(function (element) {
        return {
          name: element.content
        };
      });
    }
    var microdataElements = document.querySelectorAll('[itemprop="author"]');
    if (microdataElements.length) {
      return Array.from(microdataElements).map(function (element) {
        return {
          name: element.textContent
        };
      });
    }
    return [];
  }
  function parseMiscMetadata(documentLocation) {
    var articleTitleElements = document.querySelectorAll("article h1");
    return {
      url: documentLocation.href.split(/\?|#/)[0],
      article: {
        title: articleTitleElements.length === 1 ? articleTitleElements[0].textContent.trim() : document.title,
        source: {
          url: matchGetAbsoluteUrl(documentLocation.protocol, getElementAttribute(document.querySelector('link[rel="publisher"]'), function (e) {
            return e.href;
          })) || documentLocation.protocol + "//" + documentLocation.hostname
        },
        description: getElementAttribute(document.querySelector('meta[name="description"]'), function (e) {
          return e.content;
        }),
        authors: parseAuthors(),
        tags: [],
        pageLinks: [],
        imageUrl: getElementAttribute(document.querySelector('meta[name="twitter:image"]'), function (e) {
          return e.content;
        })
      }
    };
  }

  // client/reading/parseOpenGraph.ts
  function findMetaElementContent(property, elements) {
    return getElementAttribute(elements.find(function (e) {
      return e.getAttribute("property") === property;
    }), function (e) {
      return e.content;
    });
  }
  function parseOpenGraph(documentLocation) {
    var elements = Array.from(document.getElementsByTagName("meta"));
    if (/article/i.test(findMetaElementContent("og:type", elements))) {
      return {
        url: findMetaElementContent("og:url", elements),
        article: {
          title: findMetaElementContent("og:title", elements),
          source: {
            name: findMetaElementContent("og:site_name", elements)
          },
          datePublished: findMetaElementContent("article:published_time", elements),
          dateModified: findMetaElementContent("article:modified_time", elements),
          authors: elements.filter(function (e) {
            return e.getAttribute("property") === "article:author";
          }).map(function (e) {
            var url = matchGetAbsoluteUrl(documentLocation.protocol, e.content);
            return url ? {
              url: url
            } : {
              name: e.content
            };
          }),
          section: findMetaElementContent("article:section", elements),
          description: findMetaElementContent("og:description", elements),
          tags: elements.filter(function (e) {
            return e.getAttribute("property") === "article:tag";
          }).map(function (e) {
            return e.content;
          }),
          pageLinks: [],
          imageUrl: findMetaElementContent("og:image", elements)
        }
      };
    }
    return null;
  }
  var parseOpenGraph_default = parseOpenGraph;

  // client/reading/parseDocumentMetadata.ts
  var emptyResult = {
    url: null,
    article: {
      title: null,
      source: {},
      authors: [],
      tags: [],
      pageLinks: []
    }
  };
  function first2(propSelector, filterOrResults, results) {
    var filter;
    if (filterOrResults instanceof Array) {
      filter = function filter(value) {
        return !!value;
      };
      results = filterOrResults;
    } else {
      filter = filterOrResults;
    }
    return results.map(propSelector).find(filter);
  }
  function most(propSelector, filterOrResults, results) {
    var filter;
    if (filterOrResults instanceof Array) {
      results = filterOrResults;
    } else {
      filter = filterOrResults;
    }
    var values = results.map(propSelector);
    if (filter) {
      values = values.filter(function (values2) {
        return values2.every(filter);
      });
    }
    return values.sort(function (a, b) {
      return b.length - a.length;
    })[0];
  }
  function merge(schema, misc, openGraph) {
    var orderedResults = [schema, openGraph, misc];
    return {
      url: misc.url,
      article: {
        title: first2(function (x) {
          return x.article.title;
        }, orderedResults),
        source: first2(function (x) {
          return x.article.source;
        }, function (x) {
          return !!x.name;
        }, orderedResults),
        datePublished: first2(function (x) {
          return x.article.datePublished;
        }, orderedResults),
        dateModified: first2(function (x) {
          return x.article.dateModified;
        }, orderedResults),
        authors: most(function (x) {
          return x.article.authors;
        }, function (x) {
          return !!x.name;
        }, orderedResults),
        section: first2(function (x) {
          return x.article.section;
        }, orderedResults),
        description: first2(function (x) {
          return x.article.description;
        }, orderedResults),
        tags: most(function (x) {
          return x.article.tags;
        }, orderedResults),
        pageLinks: most(function (x) {
          return x.article.pageLinks;
        }, orderedResults),
        imageUrl: first2(function (x) {
          return x.article.imageUrl;
        }, [misc, openGraph, schema])
      }
    };
  }
  var articleElementAttributeBlacklistRegex = /((^|\W)comments?($|\W))/i;
  function parseDocumentMetadata(params) {
    var isArticle = false;
    var misc = parseMiscMetadata(params.url);
    if (Array.from(document.getElementsByTagName("article")).filter(function (element) {
      return !(articleElementAttributeBlacklistRegex.test(element.id) || articleElementAttributeBlacklistRegex.test(element.classList.value));
    }).length === 1) {
      isArticle = true;
    }
    var openGraph = parseOpenGraph_default(params.url);
    if (openGraph) {
      isArticle = true;
    } else {
      openGraph = emptyResult;
    }
    var schema;
    var script = document.querySelector('script[type="application/ld+json"]');
    if (script && script.textContent) {
      var cdataMatch = script.textContent.match(/^\s*\/\/<!\[CDATA\[([\s\S]*)\/\/\]\]>\s*$/);
      try {
        if (cdataMatch) {
          schema = parseSchema_default([JSON.parse(cdataMatch[1])]);
        } else {
          schema = parseSchema_default([JSON.parse(script.textContent)]);
        }
      } catch (ex) {}
    }
    if (schema) {
      isArticle = true;
    } else if (schema = parseSchema_default(parseElementMicrodata_default(document.documentElement))) {
      isArticle = true;
    } else {
      schema = emptyResult;
    }
    return {
      isArticle: isArticle,
      metadata: merge(schema, misc, openGraph)
    };
  }

  // client.ts
  var viewportHeight = $(window).height();
  var width = document.body.clientWidth;
  $(document).ready(function () {
    var containerId = "readup-article-container";
    $("#".concat(containerId)).click(function (event) {
      var x = event.pageX;
      console.log("".concat(event.pageX, ", ").concat(event.pageY));
      var containerNode = $(this).get(0);
      var currentScroll = $(this).scrollTop();
      if (x < width / 2) {
        console.log("previous");
        containerNode.scrollTop = currentScroll - viewportHeight * 0.95;
      } else {
        console.log("next");
        containerNode.scrollTop = currentScroll + viewportHeight * 0.95;
      }
    });
    var docContainer = document.getElementById(containerId);
    if (docContainer) {
      var userArticle = window.userArticleResult;
      docContainer.prepend();
      var progress = $("<div><div>").addClass("readup-progress");
      var reader = new Reader(function (event) {
        progress.html(event.percentComplete.toFixed(0));
        var data = JSON.stringify({
          readState: event.readStateArray,
          userPageId: userArticle && userArticle.userPage.id
        });
        $.ajax({
          url: "/api/Extension/CommitReadState",
          method: "POST",
          dataType: "json",
          contentType: "application/json; charset=utf-8",
          data: data
        }).done(function (d) {
          return console.log("OK", d);
        }).fail(function (e) {
          return console.error("No", e);
        });
      });
      console.log("Constructed reader");
      var metadataParseResult = parseDocumentMetadata({
        // url: documentLocation,
        url: window.location
      });
      var contentParseResult = parseDocumentContent({
        // url: documentLocation,
        url: window.location
      });
      var page = new Page(contentParseResult.primaryTextContainers);
      $(document.createElement("link")).attr({
        href: "/styles.css",
        type: "text/css",
        rel: "stylesheet"
      }).appendTo("head");
      $("body").append(progress);
      if (userArticle) {
        console.log("Setting page readState");
        page.setReadState(userArticle.userPage.readState);
      }
      reader.loadPage(page);
    }
  });
})();