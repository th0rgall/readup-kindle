"use strict";

(function () {
  // client.ts
  var viewportHeight = $(window).height();
  var width = document.body.clientWidth;
  $(document).ready(function () {
    $("#readup-article-container").click(function (event) {
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
  });
})();