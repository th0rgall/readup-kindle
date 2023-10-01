import { AppProps } from "$fresh/server.ts";
import ClientScripts from "../components/ClientScripts.tsx";

export default function App({ Component }: AppProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>fresh-backend</title>
        {/* Not used for now */}
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="w-full">
        <Component />
        {
          /* For some reason the script is inserted twice in /read/... due to the below, even though this
         layout is supposedly skipped */
        }
        {/* <ClientScripts /> */}
        {
          /* <script src="https://unpkg.com/twind/twind.umd.js"></script>
        <script src="
https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2.4.8/dist/css-vars-ponyfill.min.js
">
        </script> */
        }
      </body>
    </html>
  );
}
