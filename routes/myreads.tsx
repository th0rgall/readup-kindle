import Article from "../components/Article.tsx";
import UserArticle from "../models/UserArticle.ts";
import PageResult from "../models/PageResult.ts";
import ListPageScaffold from "../components/ListPageScaffold.tsx";

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
    <ListPageScaffold ctx={ctx}>
      {myReads.items.map((a) => <Article {...a} key={a.slug} />)}
    </ListPageScaffold>
  );
}
