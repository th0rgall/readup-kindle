import { Handlers, PageProps } from "$fresh/server.ts";
import CommunityReads from "../models/CommunityReads.ts";
import { css } from "twind/css";
import Article from "../components/Article.tsx";
import { grey } from "../lib/style.ts";
import ListScaffold from "../components/ListScaffold.tsx";

interface Data {
  communityReads: CommunityReads;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const response = await fetch(
      "https://api.readup.org/Articles/CommunityReads?maxLength&minLength&pageNumber=1&pageSize=40&sort=0",
      {
        headers: new Headers({
          "Cookie": req.headers.get("Cookie") || "",
        }),
      },
    );

    return await ctx.render({ communityReads: await response.json() });
  },
};

export default function Listing({ data }: PageProps<Data>) {
  const aotd = data.communityReads.aotd;
  return (
    <ListScaffold>
      <h2 class="text-xlm mb-1">AOTD</h2>
      <Article {...aotd}></Article>
      <h2 class="text-xl mb-1">Contenders</h2>
      {data.communityReads.articles.items.map((a) => (
        <Article {...a} key={a.slug} />
      ))}
    </ListScaffold>
  );
}
