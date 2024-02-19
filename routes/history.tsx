import Article from "../components/Article.tsx";
import UserArticle from "../models/UserArticle.ts";
import PageResult from "../models/PageResult.ts";
import ListPageScaffold from "../components/ListPageScaffold.tsx";
import { READUP_API_BASE } from "../lib/constants.ts";
import { RouteContext } from "$fresh/server.ts";

export default async function MyReads(req: Request, ctx: RouteContext) {
  // forward headers
  const myReads = await fetch(
    `${READUP_API_BASE}/Articles/ListHistory?pageNumber=1&minLength&maxLength`,
    {
      headers: new Headers({
        "Cookie": req.headers.get("Cookie") || "",
      }),
    },
  ).then((r) => r.json()) as PageResult<UserArticle>;

  return (
    <ListPageScaffold ctx={ctx}>
      {myReads.items.map((a) => <Article {...a} key={a.slug} />)}
    </ListPageScaffold>
  );
}
