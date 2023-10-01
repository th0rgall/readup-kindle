import { LayoutContext } from "$fresh/server.ts";
import { tw } from "twind/css";
import { UAParser } from "npm:ua-parser-js@2.0.0-alpha.3";
import ClientScripts from "../components/ClientScripts.tsx";

// deno-lint-ignore require-await
export default async function App(req: Request, ctx: LayoutContext) {
  const ua = req.headers.get("User-Agent");
  const { browser, device } = UAParser(ua);
  const isReadPage = ctx.route.startsWith("/read");
  // Pass UA down
  ctx.state.ua = ua;
  return (
    <html
      className={tw([
        {
          kindle: browser.name === "Kindle" || device.vendor === "Kindle",
        },
        // Behavior for the /read container
        isReadPage && "h-full",
      ])}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>fresh-backend</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class={tw(["w-full", isReadPage && "h-full"])}>
        <ctx.Component />
        {isReadPage && <ClientScripts />}
      </body>
    </html>
  );
}
