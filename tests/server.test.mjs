import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

let server;
let origin;
before(async () => {
  server = spawn(
    process.execPath,
    [fileURLToPath(new URL("../server.mjs", import.meta.url))],
    {
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  origin = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(
      () => reject(new Error("Server startup timed out")),
      5000,
    );
    server.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    server.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited: ${code}`));
    });
    server.stdout.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/Local:\s+(http:\/\/localhost:\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
  });
});
after(async () => {
  if (server && server.exitCode === null) {
    const stopped = once(server, "exit");
    server.kill("SIGTERM");
    await stopped;
  }
});

for (const entry of [
  "/",
  "/index.html",
  "/swinglab/",
  "/swinglab/index.html",
]) {
  test(`${entry}: HTML and all referenced local resources load with their correct types`, async () => {
    const pageUrl = new URL(entry, origin);
    const response = await fetch(pageUrl);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /^text\/html/);
    const html = await response.text();
    const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((value) => !value.startsWith("#") && !value.startsWith("https:"));
    const uniqueUrls = new Set(
      references.map((value) => new URL(value, pageUrl).href),
    );
    assert(
      uniqueUrls.size >= 6,
      "Must check CSS, JS, logos and both content images",
    );
    const expectedTypes = {
      css: "text/css",
      js: "text/javascript",
      svg: "image/svg+xml",
      png: "image/png",
    };
    for (const url of uniqueUrls) {
      const asset = await fetch(url);
      assert.equal(asset.status, 200, url);
      assert(
        asset.headers
          .get("content-type")
          .startsWith(expectedTypes[url.split(".").at(-1)]),
        url,
      );
      assert.equal(asset.headers.get("x-content-type-options"), "nosniff");
      assert((await asset.arrayBuffer()).byteLength > 0, url);
    }
  });
}
test("Project URL without trailing slash redirects before resolving relative assets", async () => {
  const response = await fetch(`${origin}/swinglab?preview=1`, {
    redirect: "manual",
  });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "/swinglab/?preview=1");
});
test("Missing assets and private files return 404 instead of HTML", async () => {
  for (const prefix of ["", "/swinglab"]) {
    for (const path of [
      "/missing.css",
      "/assets/missing.png",
      "/package.json",
      "/server.mjs",
      "/.git/config",
      "/assets/%2e%2e%2fserver.mjs",
    ]) {
      const response = await fetch(`${origin}${prefix}${path}`);
      assert.equal(response.status, 404, path);
      assert.match(response.headers.get("content-type"), /^text\/plain/);
    }
  }
});
test("Preview responses do not retain stale assets", async () => {
  const response = await fetch(`${origin}/swinglab/styles.css`);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
