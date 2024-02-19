import { Handlers, PageProps } from "$fresh/server.ts";
import getAndRegisterRead from "../../lib/reading.ts";
import { rFetch } from "../../lib/readup-api.ts";
import { inputClass, labelClass } from "../../lib/style.ts";
import { MWState } from "../_middleware.ts";

export const handler: Handlers<any, MWState> = {
  async POST(req, ctx) {
    const form = await req.formData();
    const url = form.get("url")?.toString();
    console.log(url);

    let result;
    try {
      result = await getAndRegisterRead(url, ctx);
    } catch (e) {
      return new Response(e, { status: 500 });
    }

    const { userArticleResult, metadataParseResult, contentRoot } = result;

    return new Response("OK maybe");
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
