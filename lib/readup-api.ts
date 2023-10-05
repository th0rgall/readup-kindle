import type { HandlerContext, RouteContext } from "$fresh/src/server/types.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { MWState } from "../routes/_middleware.ts";
import { READUP_API_BASE } from "./constants.ts";

export const rFetch = (
  route: string,
  init: RequestInit,
  ctx:
    | HandlerContext<unknown, MWState>
    | MiddlewareHandlerContext<MWState>
    | RouteContext<unknown, MWState>,
) => {
  const fullPath = READUP_API_BASE + route;
  // console.log(`Requesting ${fullPath}`);
  return fetch(fullPath, {
    ...init,
    headers: {
      ...init.headers,
      // Required
      "x-readup-client": "web/extension@7.0.2",
      "Cookie": ctx.state.sessionCookie || "",
    },
  });
};
