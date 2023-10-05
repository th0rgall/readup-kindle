import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { rFetch } from "../../lib/readup-api.ts";
import { MWState } from "../_middleware.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<MWState>,
) {
  // console.log(`Forwarding ${req.url}`);
  const woProtocol = req.url.replace(/^(https?:)?\/\//, "");
  const fullPath = woProtocol.slice(
    woProtocol.indexOf("/"),
  );
  // Remove /api
  const targetPath = fullPath.slice("/api".length);
  return await rFetch(targetPath, {
    headers: {
      "Content-Type": "application/json",
    },
    method: req.method,
    body: req.body,
  }, ctx);
}
