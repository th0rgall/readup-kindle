"use strict";

var viewportHeight = $(window).height();
var width = document.body.clientWidth;
$(document).ready(function () {
  //   $("p").first().html(`h: ${viewportHeight}\n`);
  //   document.documentElement.scrollTop = "300px";
  $("#readup-article-container").click(function (event) {
    //   This works, so the touch event does happen
    // $("p").first().remove();
    var x = event.pageX;
    // const y = event.pageY;
    console.log("".concat(event.pageX, ", ").concat(event.pageY));
    var containerNode = $(this).get(0);
    var currentScroll = $(this).scrollTop();
    if (x < width / 2) {
      console.log("previous");
      containerNode.scrollTop = currentScroll - viewportHeight * 0.95;
    } else {
      console.log("next");
      //   const currentScroll = $("html").scrollTop();
      //   console.log(currentScroll);
      //   Only works in modern
      //   $("html").scrollTop(currentScroll + viewportHeight);
      //   maybe works
      //   $("html").animate({ scrollTop: currentScroll + viewportHeight });
      //   nope
      //   document.documentElement.scrollTop = currentScroll + viewportHeight;
      //   works in midori, not on kindle
      // var currentScroll = $("body").scrollTop();
      // document.body.scrollTop = currentScroll + viewportHeight;
      //   window.scroll(0, currentScroll + viewportHeight);
      //   nope, undefined error probabs
      //   document.scrollingElement.scrollTop = currentScroll + viewportHeight;
      containerNode.scrollTop = currentScroll + viewportHeight * 0.95;
    }
  });
});
// $.ajax({
//   // can't use template strings - sometimes? confusing.
//   // babel may be useful for just that
//   url: `http://${window.location.host}/api/doc`,
//   success: (result) =>
//     $("#app").html("<strong>" + result + "</strong> degrees"),
//   error: (a, status, text) => {
//     $("#app").html("<strong>" + status + "</strong> degrees");
//   },
// });
