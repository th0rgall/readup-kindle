# Readup Ink - Readup for Kindle

<img src="./docs/img1.jpg" alt="a readupup.ink article page on a Kindle Paperwhite 3" width=300 />
<img src="./docs/img2.jpg" alt="the readupup.ink homepage on a Kindle Paperwhite 3" width=300 />

A minimal readup.org frontend that I built for the browser of my Kindle from
2015, and that I hope to make compatible with more browsers in e-readers.

I’m _really_ enjoying Readup on e-ink.

See it in action on https://readup.ink, which is connected to the main Readup
instance, https://readup.org.

Or, try it out on https://ink.koffiecouques.be - the first alternative Readup
instance!

**It’s not feature-complete, but most basics are there:**

- logging in with your Readup account
- "My Reads" & your own "History"
- the AOTD competition (no AOTD history yet)
- a working read tracker in many articles.

Incidentally, this is also a way to use Readup on Android via a browser!

If you're interested in contributing, or making this work on your e-reader, very
cool! Check [contributing](./CONTRIBUTING.md).

## What doesn't work yet

- Images. For some reason, the (double) parser removes images (see below). The
  Kindle browser is technically capable of displaying them though.
- Reading Readup comments, and replying to them.
- Posting articles.
- Adding articles (on Kindle). I removed this from the "old Kindle mode",
  because you won't actually be typing in article URLs to add on your Kindle,
  will you? The expected flow is that you use Readup on other devices to add
  articles. **Update Aug '24:** you may now use
  [Kindle RSS](https://codeberg.org/thor/kindle-rss) as an article ingestion
  method on Kindle. This GReader API-compatible RSS client can open articles in
  Readup Ink. Check
  [this post](https://indieweb.social/@thorgal/112985093356391338) for a demo.
