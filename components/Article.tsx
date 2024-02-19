import { JSX } from "preact";
import UserArticle from "../models/UserArticle.ts";
import { css } from "twind/css";
import { tw } from "twind";
import { grey } from "../lib/style.ts";
import Authors from "./Authors.tsx";
import { State } from "../routes/_app.tsx";
import { calculateEstimatedReadTime } from "../lib/calculate.ts";
import { formatCountable, truncateText } from "../lib/format.ts";
import { READUP_HOST } from "../lib/constants.ts";

export type Options = {
  showDescription?: boolean;
};

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
    readCount,
    showDescription = true,
    commentCount,
    wordCount,
    percentComplete,
  }: UserArticle & Options,
): JSX.Element {
  const boxClass =
    `block relative w-full mb-2 px-3 pt-3 pb-1 border(1 gray-500) rounded no-underline ${
      css({ textDecoration: "none !important" })
    }`;
  const href = `/read/${slug}?url=${encodeURIComponent(url)}`;
  const readTime = calculateEstimatedReadTime(wordCount);
  const normalizedReadTime = Math.min(readTime, 60);
  const inner = (
    <>
      {aotdContenderRank > 0
        ? (
          <span
            class={`absolute -left-1 ${
              tw(css({ top: "-1rem", left: "-0.5rem " }))
            } rounded-full bg-white border(1 black) w-6 h-6 text-center`}
          >
            {aotdContenderRank}
          </span>
        )
        : null}
      <h2 class="text-xl font-semibold leading-6 font-serif">
        {title}
      </h2>
      <div class="text-sm">
        {source}
        {source && articleAuthors.length > 0 && ` · `}
        {Authors(articleAuthors)}
        {` · `}
        {readTime} min.
      </div>
      {showDescription && (
        <p class="text(sm gray-700)">{truncateText(description, 150)}</p>
      )}
      <div>
        <span class="font-bold" style={{ letterSpacing: 6 }}>
          {"·".repeat(normalizedReadTime * (percentComplete / 100))}
        </span>
        <span class="text(gray-700) font(light)" style={{ letterSpacing: 6 }}>
          {"·".repeat(normalizedReadTime * (1 - (percentComplete / 100)))}
        </span>
      </div>
    </>
  );

  return (
    <State.Consumer>
      {({ isKindle }) => (
        <article class="">
          {firstPoster
            ? (
              <div
                class={tw`${
                  aotdContenderRank > 0 && "ml-6"
                } mb-0.5 ${grey} text(sm)`}
              >
                <a
                  href={`${READUP_HOST}/@${firstPoster}`}
                  target="_blank"
                  class="underline hover:no-underline"
                >
                  {firstPoster}
                </a>
                <span class="">
                  {" "} · {readCount} {formatCountable(readCount, "read")}
                </span>
                {commentCount > 0 &&
                  (
                    <span>
                      {" "} · {commentCount}{" "}
                      {formatCountable(commentCount, "comment")}
                    </span>
                  )}
              </div>
            )
            : null}
          {/* Work around kindle underlining all links */}
          {isKindle ? <div class={boxClass} data-href={href}>{inner}</div> : (
            <a
              class={boxClass}
              href={href}
            >
              {inner}
            </a>
          )}
        </article>
      )}
    </State.Consumer>
  );
}
