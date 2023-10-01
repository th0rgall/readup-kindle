import { RouteConfig, RouteContext } from "$fresh/server.ts";
import { DOMParser, HTMLDocument } from "deno_dom";
import parseDocumentContent from "../../lib/contentParsing/parseDocumentContent.ts";
import pruneDocument from "../../lib/contentParsing/pruneDocument.ts";
import { apply, tw } from "twind";
import { css } from "twind/css";
import ClientScripts from "../../components/ClientScripts.tsx";

export const config: RouteConfig = {
  skipInheritedLayouts: true, // Skip already inherited layouts
};

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

export default async function Read(req: Request, ctx: RouteContext) {
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

  const contentParseResult = parseDocumentContent({
    // url: documentLocation,
    url: new URL(pageUrl),
  });

  const parseResult = pruneDocument(contentParseResult);
  const contentRoot = parseResult.contentRoot;

  return (
    // height: 100% helps us get a JS-scrollable inner container
    // somehow the html/body container couldn't be scrolled
    <html class="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Readup Article</title>
        {/* Not used for now */}
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="w-full h-full">
        <div
          id="readup-article-container"
          class={tw(articleStyles)}
          dangerouslySetInnerHTML={{ __html: contentRoot.innerHTML }}
        >
        </div>
        <ClientScripts />
      </body>
    </html>
  );
}
