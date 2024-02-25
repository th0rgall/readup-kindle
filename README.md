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

If you're interested in contributing, or making this work on your e-reader, very
cool! Check [contributing](./CONTRIBUTING.md).

## What doesn't work yet

- Images. For some reason, the (double) parser removes images (see below). The
  Kindle is technically capable of displaying them though.
- Posting articles: this would be cool to add.
- Adding articles (on Kindle). I removed this from the Kindle, because you won't
  actually be typing in article URLs to add on your Kindle, will you? The
  expected flow is that you use Readup on other devices to add articles.
