import { Handlers, PageProps } from "$fresh/server.ts";
import CommunityReads from "../models/CommunityReads.ts";
import { tw } from "twind";
import Article from "../components/Article.tsx";
import ListScaffold from "../components/ListScaffold.tsx";
import { READUP_API_BASE } from "../lib/constants.ts";

interface Data {
  communityReads: CommunityReads;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const response = await fetch(
      `${READUP_API_BASE}/Articles/CommunityReads?maxLength&minLength&pageNumber=1&pageSize=40&sort=0`,
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
  const titleClass = "text-xl mt-3 mb-2";
  return (
    <ListScaffold>
      <h2 class={tw(titleClass)}>AOTD</h2>
      <Article {...aotd}></Article>
      <h2 class={tw(titleClass)}>Contenders</h2>
      {data.communityReads.articles.items.map((a) => (
        <Article {...a} key={a.slug} />
      ))}
    </ListScaffold>
  );
}
