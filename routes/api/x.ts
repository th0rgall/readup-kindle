import { RouteConfig } from "$fresh/server.ts";

export const config: RouteConfig = {
  routeOverride: "/api/:action+",
};
