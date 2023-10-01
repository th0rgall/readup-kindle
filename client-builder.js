import * as esbuild from "esbuild";
import { transformFileSync } from "@babel/core";
import { createWriteStream, unlinkSync, watch, writeFileSync } from "fs";
import browserify from "browserify";

const b = browserify();
b.add("./metafills.js");
// const writableStream = createWriteStream("./out");
const readStream = b.bundle();

const entryFile = "./client.ts";
const esbuildTempFile = "./static/client.esbuild.js";

watch(entryFile, async (eventType, filename) => {
  if (!(filename && eventType === "change")) {
    return;
  }

  const browserifiedMetaFillsPromise = new Promise((resolve, reject) => {
    const chunks = [];
    readStream.on("data", function (chunk) {
      chunks.push(chunk);
    });
    // Send the buffer or you can put it into a var
    readStream.on("end", function () {
      resolve(Buffer.concat(chunks));
      readStream.removeAllListeners();
    });
  });

  writeFileSync(
    "./static/browserify.middle.js",
    await browserifiedMetaFillsPromise,
  );

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

  // Extra stuff!
  const transformedCode =
    ((await browserifiedMetaFillsPromise) + "\n" + babelCode)
      // Prevent SyntaxError: Parse Error
      // .return subscript is not allowed
      .replace(/\.return/g, '["return"]')
      // .replace(/,\)/g, ")")
      .replace(/,(?:\n\s+)?\)/gm, ")");

  writeFileSync(
    "./static/client.js",
    transformedCode,
    "utf-8",
  );
  // unlinkSync(esbuildTempFile);
});
