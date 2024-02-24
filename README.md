# Readup Ink - Readup for Kindle

<img src="https://media.discordapp.net/attachments/917433643796946967/1208196656391262218/IMG_6375.jpg?ex=65e267d2&is=65cff2d2&hm=35da5f43fcb184a412e6cbb94d1f963e4e3e531673060e46d332300bb4b4528e&=&format=webp&width=788&height=1050" alt="a readupup.ink article page on a Kindle Paperwhite 3" width=300 />
<img src="https://media.discordapp.net/attachments/917433643796946967/1208196657318199316/IMG_6376.jpg?ex=65e267d2&is=65cff2d2&hm=7206115d99af05b2e730257b4f9b84083a1ddfa6273c6d1f5ec6f7c202879567&=&format=webp&width=788&height=1050" alt="the readupup.ink homepage on a Kindle Paperwhite 3" width=300 />

A minimal readup.org frontend that I built for the browser of my Kindle
from 2015.

I’m really enjoying Readup on e-ink.

See it in action on https://readup.ink/, which is connected to the main
https://readup.org/ API.

Or, try it out on https://ink.koffiecouques.be/ - the first non-original Readup
instance.

**It’s not feature-complete, but most basics are there:**

- logging in with your Readup account
- seeing My Reads & your History
- the AOTD competition (no AOTD history yet)
- a working read tracker in many articles.

Incidentally, this is also a way to use Readup.org on Android via a browser.

If it notices a Kindle User-Agent, it will apply a bunch of JS/CSS hacks to make
it look OK on Kindle (like: massively inflating font-size). This might not work
with your specific Kindle.

## What doesn't work yet

- Images. For some reason, the (double) parser removes images (see below). The
  Kindle is technically capable of displaying them though.
- Posting articles: this would be cool to add.
- Adding articles (on Kindle). I removed this from the Kindle, because you won't
  actually be typing in article URLs to add on your Kindle, will you? The
  expected flow is that you use Readup on other devices to add articles.

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
3. The Kindle client-side JS is transpiled through a convoluted pipeline of Core
   JS & other polyfills, Browserify, and esbuild, to make the JS-writing process
   a little less painful.

## Built using

- [Deno Fresh](https://fresh.deno.dev/), to try out something new.
- Using Twind v0.x, which
  [Deno Fresh has now disavowed](https://fresh.deno.dev/docs/examples/migrating-to-tailwind#why-did-fresh-use-twind-instead-of-tailwind-css)
  in favor of "proper Tailwind". I can't keep up.
