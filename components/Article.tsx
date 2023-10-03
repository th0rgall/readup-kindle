import { JSX } from "preact";
import UserArticle from "../models/UserArticle.ts";
import { css } from "twind/css";
import { tw } from "twind";
import { grey } from "../lib/style.ts";
import Authors from "./Authors.tsx";

export default function Article(
  {
    title,
    description,
    articleAuthors,
    aotdContenderRank,
    firstPoster,
    source,
    slug,
    url,
  }: UserArticle,
): JSX.Element {
  return (
    <article class="">
      <div class={tw`ml-6 ${grey} text(sm)`}>
        Scout: {firstPoster}
      </div>
      <a
        class={`block relative mb-2 p-2 border(2 black) rounded no-underline ${
          css({ textDecoration: "none !important" })
        }`}
        href={`/read/${slug}?url=${encodeURIComponent(url)}`}
      >
        {aotdContenderRank > 0
          ? (
            <span
              class={`absolute -left-1 ${
                tw(css({ top: "-1rem", left: "-0.5rem" }))
              } rounded-full bg-white border(1 black) w-6 h-6 text-center`}
            >
              {aotdContenderRank}
            </span>
          )
          : null}
        <h2 class="text-lg font-semibold">
          {title}
        </h2>
        <div class="text-base">
          {source && `${source} · `}
          {Authors(articleAuthors)}
        </div>
        <p class="text-sm">{description?.substring(0, 300)}</p>
      </a>
    </article>
  );
}
