import { MiddlewareHandlerContext } from "$fresh/server.ts";

export interface MWState {
  hasAuth: boolean;
  sessionCookie: string;
  // will be added later
  // should be typed better; like RootState and AppState
  ua: string | null;
  isKindle: boolean;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<MWState>,
) {
  const cookie = req.headers.get("Cookie");
  if (cookie) {
    // TODO: actually check the cookie?
    ctx.state.hasAuth = true;
    ctx.state.sessionCookie = cookie;
  }
  const resp = await ctx.next();
  return resp;
}
