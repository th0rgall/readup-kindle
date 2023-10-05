import { RouteContext } from "$fresh/server.ts";
import { DOMParser, HTMLDocument } from "deno_dom";
import parseDocumentContent from "../../lib/contentParsing/parseDocumentContent.ts";
import pruneDocument from "../../lib/contentParsing/pruneDocument.ts";
import { apply, css } from "twind/css";
import parseDocumentMetadata from "../../lib/reading/parseDocumentMetadata.ts";
import createPageParseResult from "../../lib/reading/createPageParseResult.ts";
import { rFetch } from "../../lib/readup-api.ts";
import { MWState } from "../_middleware.ts";
import ArticleLookupResult from "../../models/ArticleLookupResult.ts";
import Authors from "../../components/Authors.tsx";
import { Head } from "$fresh/runtime.ts";
import { TITLE } from "../../lib/constants.ts";
import Script from "../../components/Script.tsx";

const articleStyles = (isKindle: boolean) =>
  css([
    // apply`px-6 py-8`,
    {
      // kindle scrollbar hack
      ...(isKindle
        ? {
          height: "1289px",
          overflow: "scroll",
          border: "none",
        }
        : {
          height: "100%",
        }),
      fontFamily: "'Bookerly', serif",
      // "@apply": "pt-2",
      // overflow will only happen when acenstral containers are contained to the screen height
      // not sure where this & is documented, but it works! It's equivalent to a css space
      // :global actually applies globally (unscoped, wherever defined)
      "&": {
        h1: apply`text-2xl font(sans bold)`,
        p: {
          "@apply": "mb-4",
        },
      },
    },
  ]);

const contentStyles = (isKindle: boolean) =>
  css({
    "@apply": `text-xl overflow-y-scroll mx-auto border-none py-8 ${
      isKindle ? "pl-6 pr-1" : "max-w-3xl px-6"
    }`,
  });

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
  const isKindle = ctx.state.isKindle;
  // const randomIndex = Math.floor(Math.random() * JOKES.length);
  // const body = JOKES[randomIndex];
  // return new Response(body);
  const url = new URL(req.url);
  const pageUrl = url.searchParams.get("url") || "";

  const loadError = () =>
    new Response(
      "The article couldn't be loaded! It might be that this publisher blocks proxies.",
      { status: 500 },
    );

  let page: string;
  try {
    const resp = await fetch(pageUrl);
    if (!(resp.status >= 200 && resp.status <= 399)) {
      return loadError();
    }
    page = await resp.text();
  } catch (e) {
    return loadError();
  }
  let document: HTMLDocument | null;

  try {
    document = new DOMParser().parseFromString(page, "text/html");
  } catch (e) {
    return new Response(`The article couldn't be parsed by Deno. ${e}`, {
      status: 500,
    });
  }

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

  let contentRoot: HTMLDivElement;
  let pageInfoResult: ReturnType<typeof createPageParseResult>;

  try {
    const contentParseResult = parseDocumentContent({
      // url: documentLocation,
      url: new URL(pageUrl),
    });

    const parseResult = pruneDocument(contentParseResult);
    contentRoot = parseResult.contentRoot;

    pageInfoResult = createPageParseResult(
      metadataParseResult,
      contentParseResult,
    );
  } catch (e) {
    // return `Readup.ink's parser stumbled upon a bug: ${e}`;
    return new Response(`Readup.ink's parser stumbled upon a bug: ${e}`, {
      status: 500,
    });
  }

  let userArticleResult: ArticleLookupResult | null = null;
  if (ctx.state.hasAuth) {
    // why requests this here, and not on the client?
    // because it's less easy to server the <head> that we just fetched to the client
    // without getting into dirty tricks & <iframe> s (not sure if those are supported)
    const resp = await rFetch(
      "/Extension/GetUserArticle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pageInfoResult),
      },
      ctx,
    );

    userArticleResult = await resp.json();
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

  const articleTitle = userArticleResult?.userArticle.title ||
    metadataParseResult.metadata.article.title;

  return (
    // height: 100% helps us get a JS-scrollable inner container
    // somehow the html/body container couldn't be scrolled
    <>
      <Head>
        <title>{TITLE} | {articleTitle}</title>
      </Head>
      <div class="readup-reader-controls" style={{ display: "none" }}>
        <div class="readup-home">
          <a href="/">← Home</a>
        </div>
        <div class="readup-progress">...</div>
      </div>
      <Script
        code={`window.userArticleResult = ${
          JSON.stringify(userArticleResult)
        };`}
      />
      <div
        id="readup-article-container"
        class={articleStyles(isKindle)}
      >
        <div
          id="readup-article-content"
          class={contentStyles(isKindle)}
        >
          <h1>
            {articleTitle}
          </h1>
          <p class="font-sans">
            {Authors(
              userArticleResult?.userArticle.articleAuthors ||
                metadataParseResult.metadata.article.authors || [],
            )}
          </p>
          <div
            dangerouslySetInnerHTML={{ __html: contentRoot.innerHTML }}
          >
          </div>
        </div>
      </div>
    </>
  );
}
