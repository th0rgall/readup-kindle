// import "core-js/actual/error";

// import parseDocumentContent from "./client/contentParsing/parseDocumentContent.ts";
// import pruneDocument from "./client/contentParsing/pruneDocument.ts";
// import Page from "./client/reading/Page.ts";
import Reader from "./client/reading/Reader.ts";
// import parseDocumentMetadata from "./client/reading/parseDocumentMetadata.ts";
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
    const reader = new Reader((event) => {
      console.log("Hoera!", event);
      // eventPageApi
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

    // const metadataParseResult = parseDocumentMetadata({
    //   // url: documentLocation,
    //   url: window.location,
    // });

    // const contentParseResult = parseDocumentContent({
    //   // url: documentLocation,
    //   url: window.location,
    // });

    // const parseResult = pruneDocument(contentParseResult);
    // const contentRoot = parseResult.contentRoot;
    // const scrollRoot = parseResult.scrollRoot;

    // // PROXY EXT NOTE: userScrollContainer was true in web. Needed?
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

    // const page = new Page(contentParseResult.primaryTextContainers);
    // // page.setReadState(result.userPage.readState);
    // reader.loadPage(page);
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
