#!/usr/bin/env node
/**
 * 极简静态服务器。零依赖。
 *   node scripts/dev.mjs [port]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const ROOT = path.join(process.cwd(), "dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ics": "text/calendar; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    let file = path.join(ROOT, urlPath);
    // 防目录穿越
    if (!file.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    let s;
    try {
      s = await stat(file);
    } catch {
      // 尝试 .html 后缀（/about -> /about.html）
      if (!path.extname(file)) {
        const alt = file + ".html";
        try {
          s = await stat(alt);
          file = alt;
        } catch {
          res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("404 Not Found");
          return;
        }
      } else {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("404 Not Found");
        return;
      }
    }
    if (s.isDirectory()) {
      file = path.join(file, "index.html");
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(body);
  } catch (e) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" }).end("500 " + e.message);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("College-AM dev server");
  console.log("  http://127.0.0.1:" + PORT + "/");
  console.log("  按 Ctrl+C 停止");
});
