import * as esbuild from "esbuild";
import { transformFileSync } from "@babel/core";
import { unlinkSync, watch, writeFileSync } from "fs";

const entryFile = "./client.ts";
const esbuildTempFile = "./static/client.esbuild.js";

watch(entryFile, async (eventType, filename) => {
  if (!(filename && eventType === "change")) {
    return;
  }

  //  Esbuild does:
  // - bundling!!
  // - stripping TS
  // - const -> var
  // - async -> promises (I think)
  const esbuildResult = await esbuild.build(
    {
      entryPoints: ["./client.ts"],
      bundle: true,
      // https://esbuild.github.io/content-types/#es5
      // https://esbuild.github.io/content-types/#javascript
      platform: "browser",
      format: "iife",
      target: "es2015",
      // target: "ie11",
      outfile: esbuildTempFile,
    },
  );

  // Babel does:
  // - convert template strings to .concat()
  // - convert arrow functions to function()
  const { code: babelCode } = transformFileSync(esbuildTempFile);
  writeFileSync("./static/client.js", babelCode, "utf-8");
  // unlinkSync(esbuildTempFile);
});
