"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(function () {
  var __defProp = Object.defineProperty;
  var __defNormalProp = function __defNormalProp(obj, key, value) {
    return key in obj ? __defProp(obj, key, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: value
    }) : obj[key] = value;
  };
  var __publicField = function __publicField(obj, key, value) {
    __defNormalProp(obj, _typeof(key) !== "symbol" ? key + "" : key, value);
    return value;
  };

  // client/reading/Reader.ts
  var Reader = /*#__PURE__*/function () {
    /**
     * @param onCommitReadState a function to handle progress updates from the simulated
     * reader. This will be called frequently as the reader progresses.
     */
    function Reader(onCommitReadState) {
      var _this = this;
      _classCallCheck(this, Reader);
      __publicField(this, "_commitInterval");
      __publicField(this, "_isReading", false);
      __publicField(this, "_lastCommitPercentComplete", 0);
      __publicField(this, "_lastReadTimestamp");
      __publicField(this, "_offsetUpdateInterval");
      __publicField(this, "_onCommitReadState");
      __publicField(this, "_page");
      __publicField(this, "_read", function () {
        if (_this._isReading) {
          var now = Date.now(),
            elapsed = now - (_this._lastReadTimestamp || now - 300),
            readWordCount = Math.floor(elapsed / 100);
          for (var i = 0; i < readWordCount; i++) {
            if (!_this._page.readWord() && _this._page.isRead()) {
              _this.stopReading();
              _this.commitReadState();
              return;
            }
          }
          _this._lastReadTimestamp = now;
          window.setTimeout(_this._read, 300);
        }
      });
      this._onCommitReadState = onCommitReadState;
      window.document.addEventListener("visibilitychange", function () {
        if (_this._page) {
          if (window.document.hidden) {
            _this.stopReading();
          } else {
            _this.startReading();
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
        var _this2 = this;
        if (!this._isReading && !this._page.isRead()) {
          this._isReading = true;
          this._commitInterval = window.setInterval(function () {
            _this2.commitReadState();
          }, 3e3);
          this._offsetUpdateInterval = window.setInterval(function () {
            _this2._page.updateOffset();
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
        if (window.document.visibilityState === "visible") {
          console.log("Starting reading");
          this.startReading();
        }
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
      var reader = new Reader(function (event) {
        console.log("Hoera!", event);
      });
    }
  });
})();