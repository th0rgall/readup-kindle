import { RouteConfig } from "$fresh/server.ts";

export const config: RouteConfig = {
  // This catches all api routes for the middleware. Without this route, the 404 would get triggered.
  // We can also refactor into this page.
  routeOverride: "/api/:action+",
};
