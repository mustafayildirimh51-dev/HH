import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = 4174;
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profile = join(root, ".chrome-profile");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const safePath = normalize(decodeURIComponent(pathname)).replace(/^([/\\]|(\.\.[/\\])+)+/, "");
    const content = await readFile(join(root, safePath));
    response.writeHead(200, { "content-type": types[extname(safePath)] ?? "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

await mkdir(profile, { recursive: true });
await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

for (const [name, size] of [
  ["desktop", "1440,1200"],
  ["mobile", "390,1200"],
]) {
  const out = join(root, `${name}.png`);
  const result = spawnSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-crash-reporter",
      "--disable-crashpad",
      "--no-sandbox",
      "--hide-scrollbars",
      `--user-data-dir=${profile}`,
      `--window-size=${size}`,
      `--screenshot=${out}`,
      `http://127.0.0.1:${port}`,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    server.close();
    process.exit(result.status ?? 1);
  }
}

server.close();
console.log("Visual verification screenshots saved: desktop.png, mobile.png");
