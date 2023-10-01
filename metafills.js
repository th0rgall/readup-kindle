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
            : document.createTextNode(String(argArr[n])),
        );
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
            isNode ? argItem : document.createTextNode(String(argItem)),
          );
        });

        this.insertBefore(docFrag, this.firstChild);
      },
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);
