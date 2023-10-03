// https://github.com/evanw/esbuild/issues/2631
// maybe related: https://github.com/evanw/esbuild/issues/1147
// import "core-js/actual/object/get-own-property-descriptor";
// import "core-js/actual/object/get-own-property-descriptors";
// import "core-js/actual/reflect/get-own-property-descriptor";
// The below untranspiled ES6 APIs are used in the reader/metad
// Polyfill them!
// used in metadata parser (at least)
//
// import "core-js/actual/array/from";
// import "core-js/actual/array/find";
// // used in parseDocument
// import "core-js/actual/string/ends-with";

import parseDocumentContent from "./client/contentParsing/parseDocumentContent.ts";
// import pruneDocument from "./client/contentParsing/pruneDocument.ts";
import Page from "./client/reading/Page.ts";
import Reader from "./client/reading/Reader.ts";
// import createPageParseResult from "./client/reading/createPageParseResult.ts";
import parseDocumentMetadata from "./client/reading/parseDocumentMetadata.ts";
// import styleArticleDocument, {
//   createByline,
// } from "./client/reading/styleArticleDocument.ts";

const viewportHeight = $(window).height();
const width = document.body.clientWidth;
$(document).ready(function () {
  //   $("p").first().html(`h: ${viewportHeight}\n`);
  //   document.documentElement.scrollTop = "300px";
  const containerId = "readup-article-container";
  $(`#${containerId}`).click(function (event) {
    //   This works, so the touch event does happen
    // $("p").first().remove();
    const x = event.pageX;
    // const y = event.pageY;
    console.log(`${event.pageX}, ${event.pageY}`);
    const containerNode = $(this).get(0);
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

  const docContainer = document.getElementById(containerId);
  if (docContainer) {
    // we polyfilled this...
    const userArticle = window.userArticleResult;
    docContainer.prepend();
    const progress = $("<div><div>").addClass("readup-progress");
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
      //.done((d) => console.log("OK", d)).fail((e) => console.error("No", e));
      // eventPageApi;
      //   .commitReadState(
      //     {
      //       readState: event.readStateArray,
      //       userPageId: userPage.id,
      //     },
      //     event.isCompletionCommit,
      //   )
      //   .then((articleIn) => {
      //     renderUserArticle(articleIn);
      //     // updateUserArticle(article);
      //   })
      //   // TODO PROXY EXT: native messagingContext has ProblemDetails here
      //   .catch((error) => console.error(error));
    });
    console.log("Constructed reader");

    const metadataParseResult = parseDocumentMetadata({
      // url: documentLocation,
      url: window.location,
    });

    const contentParseResult = parseDocumentContent({
      // url: documentLocation,
      url: window.location,
    });

    // without the prune step, no separate styles get added
    // const parseResult = pruneDocument(contentParseResult);
    // const contentRoot = parseResult.contentRoot;
    // const scrollRoot = parseResult.scrollRoot;

    // PROXY EXT NOTE: userScrollContainer was true in web. Needed?
    // styleArticleDocument({
    //   header: {
    //     // title: metadataParseResult.metadata.article.title,
    //     title: "Test!",
    //     //
    //     // byline: createByline(metadataParseResult.metadata.article.authors),
    //     byline: createByline([{ name: "Author 1" }]),
    //   },
    //   transitionElement: document.documentElement,
    //   // completeTransition works on the <html> element,
    //   // which results in a longer flash in dark mode (0 opacity = white)
    //   // TODO: target the body in this styleArticleDocument, instead of in this file?
    //   // completeTransition: true
    // });

    // const pageInfoResult = createPageParseResult(
    //   metadataParseResult,
    //   contentParseResult,
    // );
    // $.ajax({
    //   url: "/api/Extension/GetUserArticle",
    //   method: "POST",
    //   dataType: "json",
    //   contentType: "application/json; charset=utf-8",
    //   data: JSON.stringify(pageInfoResult),
    // }).done(function (data) {
    //   console.log("data ", data);
    const page = new Page(contentParseResult.primaryTextContainers);
    // Readup has removed our styles 🤷‍♂️ re-add
    $(document.createElement("link")).attr({
      href: "/styles.css",
      type: "text/css",
      rel: "stylesheet",
    }).appendTo("head");
    $("body").append(progress);
    if (userArticle) {
      console.log("Setting page readState");
      page.setReadState(userArticle.userPage.readState);
    }
    reader.loadPage(page);
    // });
  }
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
