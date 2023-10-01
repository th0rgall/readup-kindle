import { Handlers, PageProps } from "$fresh/server.ts";
import CommunityReads from "../models/CommunityReads.ts";
import { css } from "twind/css";
import Article from "../components/Article.tsx";
import UserArticle from "../models/UserArticle.ts";
import PageResult from "../models/PageResult.ts";
import ListScaffold from "../components/ListScaffold.tsx";

export default async function MyReads(req: Request, ctx: RouteContext) {
  // forward headers
  const myReads = await fetch(
    "https://api.readup.org/Articles/ListStarred?pageNumber=1&minLength&maxLength",
    {
      headers: new Headers({
        "Cookie": req.headers.get("Cookie") || "",
      }),
    },
  ).then((r) => r.json()) as PageResult<UserArticle>;

  return (
    <ListScaffold>
      <h2 class="text-xl mb-1">My Reads</h2>
      {myReads.items.map((a) => <Article {...a} key={a.slug} />)}
    </ListScaffold>
  );
}
