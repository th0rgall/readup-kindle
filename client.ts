// https://github.com/evanw/esbuild/issues/2631
// maybe related: https://github.com/evanw/esbuild/issues/1147
// import "core-js/actual/object/get-own-property-descriptor";
// import "core-js/actual/object/get-own-property-descriptors";
// import "core-js/actual/reflect/get-own-property-descriptor";
// The above untranspiled ES6 APIs are used in the reader/metad
// Polyfill them!
// used in metadata parser (at least)
//
// import "core-js/actual/array/from";
// import "core-js/actual/array/find";
// // used in parseDocument
// import "core-js/actual/string/ends-with";

// Loaded
import parseDocumentContent from "./client/contentParsing/parseDocumentContent.ts";
import { continueReadingFrom } from "./client/reader.ts";
// import pruneDocument from "./client/contentParsing/pruneDocument.ts";
import Page from "./client/reading/Page.ts";
import Reader from "./client/reading/Reader.ts";
import ArticleLookupResult from "./models/ArticleLookupResult.ts";

// These are loaded via a script tag, inserted before this script tag.
declare global {
  interface Window {
    userArticleResult: ArticleLookupResult;
  }
}

// import createPageParseResult from "./client/reading/createPageParseResult.ts";
// import styleArticleDocument, {
//   createByline,
// } from "./client/reading/styleArticleDocument.ts";

const viewportHeight = $(window).height();
const width = document.body.clientWidth;
$(function () {
  const containerId = "readup-article-container";
  const articleContainer = document.getElementById(containerId);
  // The article container exists!
  if (articleContainer) {
    const progress = $(".readup-progress");
    const controls = $(".readup-reader-controls");
    controls.on("click", function () {
      if ($(this).is(":visible")) {
        $(this).toggle();
      }
    });

    // Capture clicks in the overlay to hack around the text box selection
    $("#readup-overlay").on("click", function (event) {
      const x = event.pageX;
      const y = event.pageY;
      console.log(`${event.pageX}, ${event.pageY}`);
      const containerNode = articleContainer;
      var currentScroll = containerNode.scrollTop;
      const isTopClick = y < viewportHeight / 6;
      if (!isTopClick && controls.is(":visible")) {
        // Hide, but don't scroll
        controls.hide();
      } else if (!isTopClick) {
        // Do pagination
        if (x < width / 2) {
          console.log("previous");
          containerNode.scrollTop = currentScroll - viewportHeight * 0.95;
        } else {
          console.log("next");
          containerNode.scrollTop = currentScroll + viewportHeight * 0.95;
        }
      } else {
        // Show the controls
        controls.toggle();
      }
    });
    // we polyfilled this...
    const userArticle = window.userArticleResult;
    const reader = new Reader((event) => {
      progress.html(event.percentComplete.toFixed(0));
      const data = JSON.stringify({
        readState: event.readStateArray,
        userPageId: userArticle &&
          userArticle.userPage.id,
      });
      $.ajax({
        url: "/api/Extension/CommitReadState",
        method: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data,
      });
    });
    console.log("Constructed reader");

    const contentParseResult = parseDocumentContent({
      // url: documentLocation,
      url: window.location,
    });

    const page = new Page(contentParseResult.primaryTextContainers);
    if (userArticle) {
      console.log("Setting page readState");
      page.setReadState(userArticle.userPage.readState);
    }

    reader.loadPage(page);

    if (page.getBookmarkScrollTop() > window.innerHeight) {
      continueReadingFrom(page, articleContainer, () => {
        console.log("Resuming where left off");
      });
    }
  }
});
