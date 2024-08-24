Before we start: the code is fairly messy, since it was hacked together quickly
during a few evenings and weekends as a proof-of-concept.

If you want to contribute something, no need to worry too much about code
quality for now!

## Setup

Copy `.env.sample` to `.env`, changing to your target Readup domain if required
(the default is readup.org).

Now start a dev server:

```
deno task start
```

## Good to know

The project is split into two parts:

1. **Deno Fresh server (backend)**:
   - Check `deno.json` & [Deno Fresh docs](https://fresh.deno.dev/) on how to
     get started.
   - We're notably _not_ using
     [client-side interactive islands](https://fresh.deno.dev/docs/concepts/islands)
     for now, because it would probably be a headache to transpile that JS to
     work on very old Kindle browsers.
   - For styling, we're using
     [Twind v0.x](https://twind.dev/handbook/introduction.html), once the Deno
     Fresh default,
     [but currently disavowed](https://fresh.deno.dev/docs/examples/migrating-to-tailwind#why-did-fresh-use-twind-instead-of-tailwind-css)
     in favor of "proper Tailwind". I can't keep up.

2. **Client-side JS, built with node.js**:
   - is solely used to build the main client-side script, mostly relying on
     jQuery.
   - This is why we also have a `package.json` folder in the same repository.
   - [client.ts](./client.ts) is the entry point of the main client-side script.
   - The entrypoint is built by [client-builder.js](./client-builder.js) (with
     some transpiling & polyfilling steps) into
     [static/index.js](static/index.js). The build steps are needed to ensure it
     will run on the severely limited JS engine of the Kindle.
   - **We're committing the built client script output**, so that the Deno
     server can easily deploy the Deno code, without bothering with building the
     clientscript too.
   - _This also makes it possible to work on the Deno project without ever
     building the client-side script._

Further:

- It may be helpful to review my documentation on the Kindle Paperwhite 3 web
  browser: https://thorgalle.me/notes/documentation-for-the-kindle-browser/
- The server outputs different HTML depending on whether the client is a Kindle,
  or not. It detects this
  [via the HTTP User-Agent header](https://thorgalle.me/notes/documentation-for-the-kindle-browser/#about-the-kindle-webkit-browser)
  in `_app.tsx`. For example, _only_ on Kindle;
  - It massively inflates the CSS font-size.
  - It applies a funky hack by adding certain styles & HTML structures
    ([see hack](https://github.com/th0rgall/kindle-browser-tests/blob/main/tests/scrollbar/hide-scrollbar-overflow-width.html))
    to hide the scroll bar

  These hacks work for my Kindle Paperwhite 3 (2015), but may not look great on
  your specific Kindle. Maybe we can distinguish yours via another specific User
  Agent? And apply different styles? Feel free to experiment!

  In Aug '24,
  [@deephdave confirmed](https://indieweb.social/@thorgal/113017303769518471)
  that Readup Ink in "normal mode" works fine on a Kindle Paperwhite from 2021.

## What's interesting about how this works, technically

... compared to the [reallyreadit/web](https://github.com/reallyreadit/web), the
original Readup (web) client.

1. **Architecture**: the regular Readup stack generally relies on privileged
   _client-side_ web requests to fetch article content from websites. On the iOS
   & desktop apps, this happens with native platform HTTP clients. On the web,
   this happens with a web extension that has extensive permissions to fetch
   websites on behalf of the user.

   It's a little inconvenient, but also nice that it works this way, because:
   1. Readup's API server works like a minimal search engine, it doesn't store
      or republish article content, which is legally dubious in terms of
      copyright, and would also require (much) more storage resources & logic.
      It only stores metadata.
   2. It offloads network traffic to clients.

   This doesn't work on a Kindle however, because Kindles' browser doesn't have
   web extensions, or a way to tap into native platform code out-of-the-box.

   The only viable alternative is **proxying**: articles are always fetched on
   demand by the Readup Ink server. It _looks_ similar to
   scraping/storing/republishing, because the Readup Ink serves the content, but
   it technically is not. If the publisher removes the article, readup.ink can
   also not access it anymore.
2. **Almost full SSR:** To reduce JS runtime load on the weak Kindle browser &
   data to be loaded, the Readup article parser also runs on the Readup Ink
   server (**pass 1**), before sending article text back to the Kindle. In this
   process, it manages to lose `<img>` elements somehow, that's an open bug, but
   maybe I like it this way.

   The Kindle still does a second pass of parsing client-side, with the same
   code, because it was hard to extract that code from the read tracker code,
   which _has_ to run client-side 😏 It works fast enough though.
