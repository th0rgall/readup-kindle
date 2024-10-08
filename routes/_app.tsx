import { LayoutContext } from "$fresh/server.ts";
import { tw } from "twind/css";
import { UAParser } from "npm:ua-parser-js@2.0.0-alpha.3";
import ClientScripts from "../components/ClientScripts.tsx";
import { createContext } from "preact";
import { MWState } from "./_middleware.ts";
import { TITLE } from "../lib/constants.ts";
import Script from "../components/Script.tsx";

export const State = createContext<
  MWState
>({
  isKindle: false,
  hasAuth: false,
  ua: null,
  sessionCookie: "",
});

// deno-lint-ignore require-await
export default async function App(
  req: Request,
  ctx: LayoutContext<unknown, MWState>,
) {
  const ua = req.headers.get("User-Agent");
  const { browser, device } = UAParser(ua);

  const isReadPage = ctx.route.startsWith("/read");
  const isLoginPage = ctx.route === "/login";
  const isIndexPage = ctx.route === "/";
  const isMyReadsPage = ctx.route === "/myreads";

  // Old Paperwhite 2015 Kindle UA:
  // Paperwhite 2021 with this UA:
  // Mozilla/5.0 (X11; U; Linux armv7l like Android; en-us) AppleWebKit/531.2+ (KHTML, Like Gecko) Version/5.0 Safari/533.2+ Kindle/3.0+
  // const isKindle = (browser.name === "Kindle" || device.vendor === "Kindle")
  const cookie = req.headers.get("Cookie");
  const isKindle = cookie?.includes("isOldKindle=1") || false;

  // Kindle reading in pagination mode
  const isKindlePageReader = isReadPage && isKindle;
  const isGeneralFullscreen = isKindlePageReader || isLoginPage;

  // Ensure state can be accessed without props
  // Pass UA down
  ctx.state.ua = ua;
  ctx.state.isKindle = isKindle;

  // Access state from MW
  const { hasAuth, sessionCookie } = ctx.state;
  return (
    <State.Provider value={{ ua, isKindle, hasAuth, sessionCookie }}>
      <html
        className={[
          {
            kindle: isKindle,
            reader: isReadPage,
          },
          // Behavior for the /read container
          // only on kindle: we want the enire container to be 100% height
          // because we need an non-html non-boyd scroll container to control its
          // for pagination)
          isGeneralFullscreen && "h-full",
          // Kindle hide scroll bar hack
          isKindlePageReader && "overflow-hidden",
        ]}
      >
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{TITLE}</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body
          // Kindle hide scroll bar hack
          style={isKindlePageReader
            ? { height: "1260px", width: "104%", overflow: "hidden" }
            : {}}
          class={!isKindlePageReader
            ? tw(["w-full", isLoginPage && "h-full"])
            : undefined}
        >
          <ctx.Component />
          <script src="//code.jquery.com/jquery-3.7.1.min.js"></script>
          {isReadPage && <ClientScripts />}
          {isKindle && (
            <Script code={await Deno.readTextFile("./client/index.js")} />
          )}
        </body>
      </html>
    </State.Provider>
  );
}
