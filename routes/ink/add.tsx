import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import getAndRegisterRead from "../../lib/reading.ts";
import { inputClass, labelClass } from "../../lib/style.ts";
import { MWState } from "../_middleware.ts";

async function processRequestFor(
  url: string | undefined,
  ctx: FreshContext<MWState, any, any>,
) {
  if (!url) {
    return new Response("Trying to add an empty URL");
  }
  try {
    const { userArticleResult } = await getAndRegisterRead(url, ctx);
    const slug = userArticleResult?.userArticle.slug;
    return new Response("", {
      status: 303,
      headers: {
        Location: `/read/${slug}?url=${
          encodeURIComponent(userArticleResult?.userArticle.url || "")
        }`,
      },
    });
  } catch (e) {
    return new Response(e, { status: 500 });
  }
}

export const handler: Handlers<any, MWState> = {
  async POST(req, ctx) {
    const form = await req.formData();
    const url = form.get("url")?.toString();
    return await processRequestFor(url, ctx);
    // const { userArticleResult, metadataParseResult, contentRoot } = result;
    // return new Response("OK maybe");
  },
  async GET(req, ctx) {
    const reqUrl = new URL(req.url);
    const url = reqUrl.searchParams.get("url");
    if (url) {
      return await processRequestFor(url, ctx);
    }
    return ctx.render();
  },
};

export default function Add() {
  return (
    <div class="px-6 py-4 max-w-3xl mx-auto justify-center">
      <form method="POST">
        <label class={labelClass} htmlFor="url">URL</label>
        <input class={inputClass} type="text" name="url" id="url" />
      </form>
    </div>
  );
}
