import { RouteContext } from "$fresh/server.ts";
import { DOMParser, HTMLDocument } from "deno_dom";
import ArticleLookupResult from "../models/ArticleLookupResult.ts";
import { MWState } from "../routes/_middleware.ts";
import parseDocumentContent from "./contentParsing/parseDocumentContent.ts";
import pruneDocument from "./contentParsing/pruneDocument.ts";
import createPageParseResult from "./reading/createPageParseResult.ts";
import { rFetch } from "./readup-api.ts";
import parseDocumentMetadata from "./reading/parseDocumentMetadata.ts";

const removeElementsWithQuerySelector = (doc: HTMLDocument, selector: string) =>
  Array.from(doc.querySelectorAll(selector)).forEach((e) => e._remove());
// TODO: is this a correct replication?

export default async function getAndRegisterRead(
  pageUrl: string,
  ctx: RouteContext<unknown, MWState>,
) {
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

  const loadError = (msg?: string) => {
    throw new Error(
      msg ??
        "The article couldn't be loaded! It might be that this publisher blocks proxies.",
    );
  };

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
    loadError(`The article couldn't be parsed by Deno. ${e}`);
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
    return loadError(`Readup.ink's parser stumbled upon a bug: ${e}`);
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

  return {
    userArticleResult,
    metadataParseResult,
    contentRoot,
  };
}
