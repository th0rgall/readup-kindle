import { RouteConfig, RouteContext } from "$fresh/server.ts";
import { DOMParser, HTMLDocument } from "deno_dom";
import parseDocumentContent from "../../lib/contentParsing/parseDocumentContent.ts";
import pruneDocument from "../../lib/contentParsing/pruneDocument.ts";
import { apply, tw } from "twind";
import { css } from "twind/css";
import ClientScripts from "../../components/ClientScripts.tsx";
import ContentElement from "../../lib/reading/ContentElement.ts";
import { isBlockElement } from "../../lib/contentParsing/utils.ts";
import { findContentElements } from "../../lib/reading/Page.ts";
import parseDocumentMetadata from "../../lib/reading/parseDocumentMetadata.ts";
import createPageParseResult from "../../lib/reading/createPageParseResult.ts";
import { rFetch } from "../../lib/readup-api.ts";
import { MWState } from "../_middleware.ts";
import ArticleLookupResult from "../../models/ArticleLookupResult.ts";
import Authors from "../../components/Authors.tsx";

const articleStyles = [
  "px-6 py-8",
  css({
    "height": "100%",
    "overflow-y": "scroll",
    "overflow": "scroll",
    ":global": {
      p: apply`mb-4`,
      // p: {
      //   marginBottom: "2rem",
      // },
    },
  }),
];

const removeElementsWithQuerySelector = (doc: HTMLDocument, selector: string) =>
  Array.from(doc.querySelectorAll(selector)).forEach((e) => e._remove());
// TODO: is this a correct replication?

const querySelectorsForElementsToRemove = [
  'script:not([type="application/json+ld"])',
  // 'link[rel="preload"][as="script"]',
  // 'link[rel="preload"][as="style"]',
  // 'link[rel="preload"][as="font"]',
  'link[rel="preload"]',
  "iframe",
  "style",
  'link[rel="stylesheet"]',
  'meta[name="viewport"]',
];

export default async function Read(
  req: Request,
  ctx: RouteContext<unknown, MWState>,
) {
  // const randomIndex = Math.floor(Math.random() * JOKES.length);
  // const body = JOKES[randomIndex];
  // return new Response(body);
  const url = new URL(req.url);
  const pageUrl = url.searchParams.get("url") || "";
  const page = await fetch(pageUrl).then((r) => r.text());
  const document = new DOMParser().parseFromString(page, "text/html");

  // Clean doc
  // Remove scripts
  // document
  //   ?.querySelectorAll("script")
  //   .forEach((e) => e.parentNode?.removeChild(e));

  querySelectorsForElementsToRemove.forEach((qs) =>
    removeElementsWithQuerySelector(document!, qs)
  );

  globalThis.document = document;

  const metadataParseResult = parseDocumentMetadata({
    url: new URL(pageUrl),
    // url: window.location,
  });

  const contentParseResult = parseDocumentContent({
    // url: documentLocation,
    url: new URL(pageUrl),
  });

  const parseResult = pruneDocument(contentParseResult);
  const contentRoot = parseResult.contentRoot;

  const pageInfoResult = createPageParseResult(
    metadataParseResult,
    contentParseResult,
  );

  let userArticleResult: ArticleLookupResult | null = null;
  if (ctx.state.hasAuth) {
    // why requests this here, and not on the client?
    // because it's less easy to server the <head> that we just fetched to the client
    // without getting into dirty tricks & <iframe> s (not sure if those are supported)
    userArticleResult = await rFetch(
      "/Extension/GetUserArticle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageInfoResult),
      },
      ctx,
    ).then((r) => r.json());
    // userArticleResult = await r.text();
  }
  // console.log(userArticleResult);

  // This is, unwrapped, what the Page() & Reader() actually expect
  // const contentEls = contentParseResult.primaryTextContainers
  //   .reduce<ContentElement[]>(
  //     (contentElements, textContainer) =>
  //       contentElements.concat(
  //         findContentElements(textContainer.containerElement),
  //       ),
  //     [],
  //   )
  //   .sort((a, b) => a.offsetTop - b.offsetTop);

  // for (const e of contentEls) {
  //   e.element.classList.add("rce");
  // }

  return (
    // height: 100% helps us get a JS-scrollable inner container
    // somehow the html/body container couldn't be scrolled
    <>
      <div class="readup-progress"></div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.userArticleResult = ${
            JSON.stringify(userArticleResult)
          };`,
        }}
      >
      </script>
      <div id="readup-article-container" class={tw(articleStyles)}>
        <>
          <h1>
            {userArticleResult?.userArticle.title ||
              metadataParseResult.metadata.article.title}
          </h1>
          <p>
            {Authors(
              userArticleResult?.userArticle.articleAuthors ||
                metadataParseResult.metadata.article.authors || [],
            )}
          </p>
        </>
        <div
          dangerouslySetInnerHTML={{ __html: contentRoot.innerHTML }}
        />
      </div>
    </>
  );
}
