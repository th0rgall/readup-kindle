import { RouteContext } from "$fresh/server.ts";
import { apply, css } from "twind/css";
import { MWState } from "../_middleware.ts";
import Authors from "../../components/Authors.tsx";
import { Head } from "$fresh/runtime.ts";
import { TITLE } from "../../lib/constants.ts";
import Script from "../../components/Script.tsx";
import getAndRegisterRead from "../../lib/reading.ts";

export default async function Read(
  req: Request,
  ctx: RouteContext<unknown, MWState>,
) {
  const isKindle = ctx.state.isKindle;
  const url = new URL(req.url);
  const pageUrl = url.searchParams.get("url") || "";

  let result;
  try {
    result = await getAndRegisterRead(pageUrl, ctx);
  } catch (e) {
    return new Response(e, { status: 500 });
  }

  const { userArticleResult, metadataParseResult, contentRoot } = result;

  const articleTitle = userArticleResult?.userArticle.title ||
    metadataParseResult.metadata.article.title;

  const articleStyles = css([
    // apply`px-6 py-8`,
    {
      // kindle scrollbar hack
      ...(isKindle
        ? {
          height: "1289px",
          overflow: "scroll",
          border: "none",
          // the below is important for the overlay hack
          position: "relative",
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

  const contentStyles = css({
    // Kindle note: applying `overflow-y-scroll` here:
    // - fixes the "selected text container" edges all articles get
    // - ... but in some articles, cuts out the entire right half!
    // - the "overlay hack" seems to be a more reliable workaround
    "@apply": `text-xl mx-auto border-none py-8 ${
      isKindle ? "pl-6 pr-1" : "max-w-3xl px-6"
    }`,
  });

  const overlayStyles = apply`absolute h-full w-full inset-0`;

  return (
    // height: 100% helps us get a JS-scrollable inner container
    // somehow the html/body container couldn't be scrolled
    <>
      <Head>
        <title>{TITLE} | {articleTitle}</title>
      </Head>
      <Script
        code={`window.userArticleResult = ${
          JSON.stringify(userArticleResult)
        };`}
      />
      <div
        id="readup-article-container"
        class={articleStyles}
      >
        <div
          id="readup-article-content"
          class={contentStyles}
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
      {
        /*
        This overlay serves to capture clicks intended for the text below
        it prevents the text container from being "selected", which gives it a border.
       */
      }
      {isKindle && <div id="readup-overlay" class={overlayStyles}></div>}
      <div class="readup-reader-controls" style={{ display: "none" }}>
        <div class="readup-home">
          <a href="/">← Home</a>
        </div>
        <div class="readup-progress">...</div>
      </div>
    </>
  );
}
