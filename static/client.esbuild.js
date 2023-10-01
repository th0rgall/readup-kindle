(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // client/reading/Reader.ts
  var Reader = class {
    /**
     * @param onCommitReadState a function to handle progress updates from the simulated
     * reader. This will be called frequently as the reader progresses.
     */
    constructor(onCommitReadState) {
      __publicField(this, "_commitInterval");
      __publicField(this, "_isReading", false);
      __publicField(this, "_lastCommitPercentComplete", 0);
      __publicField(this, "_lastReadTimestamp");
      __publicField(this, "_offsetUpdateInterval");
      __publicField(this, "_onCommitReadState");
      __publicField(this, "_page");
      __publicField(this, "_read", () => {
        if (this._isReading) {
          const now = Date.now(), elapsed = now - (this._lastReadTimestamp || now - 300), readWordCount = Math.floor(elapsed / 100);
          for (let i = 0; i < readWordCount; i++) {
            if (!this._page.readWord() && this._page.isRead()) {
              this.stopReading();
              this.commitReadState();
              return;
            }
          }
          this._lastReadTimestamp = now;
          window.setTimeout(this._read, 300);
        }
      });
      this._onCommitReadState = onCommitReadState;
      window.document.addEventListener("visibilitychange", () => {
        if (this._page) {
          if (window.document.hidden) {
            this.stopReading();
          } else {
            this.startReading();
          }
        }
      });
    }
    commitReadState() {
      const readState = this._page.getReadState(), percentComplete = readState.getPercentComplete();
      if (percentComplete > this._lastCommitPercentComplete) {
        const isRead = percentComplete >= 90;
        this._onCommitReadState({
          isCompletionCommit: this._lastCommitPercentComplete < 90 && isRead,
          isRead,
          percentComplete,
          readStateArray: readState.readStateArray
        });
        this._lastCommitPercentComplete = percentComplete;
      }
    }
    startReading() {
      if (!this._isReading && !this._page.isRead()) {
        this._isReading = true;
        this._commitInterval = window.setInterval(() => {
          this.commitReadState();
        }, 3e3);
        this._offsetUpdateInterval = window.setInterval(() => {
          this._page.updateOffset();
        }, 3e3);
        this._read();
      }
    }
    stopReading() {
      if (this._isReading) {
        this._isReading = false;
        this._lastReadTimestamp = null;
        window.clearInterval(this._commitInterval);
        window.clearInterval(this._offsetUpdateInterval);
      }
    }
    loadPage(page) {
      this._page = page;
      console.log("Read start check");
      if (window.document.visibilityState === "visible") {
        console.log("Starting reading");
        this.startReading();
      }
    }
    unloadPage() {
      this.stopReading();
      this._page = null;
      this._lastCommitPercentComplete = 0;
    }
  };

  // client.ts
  var viewportHeight = $(window).height();
  var width = document.body.clientWidth;
  $(document).ready(function() {
    const containerId = "readup-article-container";
    $(`#${containerId}`).click(function(event) {
      const x = event.pageX;
      console.log(`${event.pageX}, ${event.pageY}`);
      const containerNode = $(this).get(0);
      var currentScroll = $(this).scrollTop();
      if (x < width / 2) {
        console.log("previous");
        containerNode.scrollTop = currentScroll - viewportHeight * 0.95;
      } else {
        console.log("next");
        containerNode.scrollTop = currentScroll + viewportHeight * 0.95;
      }
    });
    const docContainer = document.getElementById(containerId);
    if (docContainer) {
      const reader = new Reader((event) => {
        console.log("Hoera!", event);
      });
    }
  });
})();
