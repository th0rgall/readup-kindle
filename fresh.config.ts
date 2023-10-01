import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

export default defineConfig({
  hostname: "0.0.0.0",
  plugins: [twindPlugin(twindConfig)],
});
