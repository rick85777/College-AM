#!/usr/bin/env node
// 外链存活检查：实测 data/ai.json 里每个地址今天能不能打开，并把结果回写到 verified。
//
// 为什么要有这个脚本：AI 板块的卡片上写着"2026-11-24 验证"，那是本脚本最后一次实测的时间。
// 这一列只有脚本能写——手写的日期等于没有。超 90 天未复验会在页面上标"待复验"，
// 超 180 天直接让构建失败（见 lib/ai.mjs）。
//
// 用法：
//   node scripts/check-ai-links.mjs            实测并回写 verified
//   node scripts/check-ai-links.mjs --dry-run  只报告，不写文件
//   node scripts/check-ai-links.mjs --limit 10 只测前 10 条（调试用）
//
// 只有 HTTP 2xx/3xx 才算活着。打不开的不改 verified——它本来就该慢慢变旧，然后被标出来。

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AI_FILE = path.join(ROOT, "data", "ai.json");

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const LIMIT = (() => {
  const i = args.indexOf("--limit");
  return i >= 0 ? Number(args[i + 1]) : Infinity;
})();

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const CONCURRENCY = 8;
const TIMEOUT_MS = 15000;

/** 用 curl 兜底：某些站点的 TLS 链在 Node 里过不了（缺中间证书），curl 能过 */
function curlProbe(url) {
  return new Promise((resolve) => {
    // --ssl-no-revoke：Windows 上用 schannel 时吊销检查经常直接失败，与站点无关
    execFile(
      "curl",
      ["-s", "-o", process.platform === "win32" ? "NUL" : "/dev/null", "-w", "%{http_code}",
       "-L", "--ipv4", "--max-time", "15", "--ssl-no-revoke", "-A", UA, url],
      { timeout: TIMEOUT_MS + 5000 },
      (err, stdout) => {
        if (err && !stdout) return resolve({ ok: false, status: 0, via: "curl", err: "exec" });
        const code = Number(String(stdout).trim()) || 0;
        resolve({ ok: code >= 200 && code < 400, status: code, via: "curl" });
      }
    );
  });
}

async function fetchProbe(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*" },
    });
    return { ok: res.status >= 200 && res.status < 400, status: res.status, via: "fetch" };
  } catch (e) {
    return { ok: false, status: 0, via: "fetch", err: e.name };
  }
}

async function probe(url) {
  const a = await fetchProbe(url);
  if (a.ok) return a;
  // fetch 失败时用 curl 再试一次：Node 的 TLS 栈比系统严，会误杀部分国内站点；
  // 并且强制 --ipv4（本机 IPv6 路由常常是坏的，curl 会先试 AAAA 然后干等到超时）
  const b = await curlProbe(url);
  if (b.ok) return b;
  // 第三次机会：跨境的偶发抖动很常见，隔 1.5 秒再来一遍
  await new Promise((r) => setTimeout(r, 1500));
  const c = await curlProbe(url);
  return c.ok ? c : { ok: false, status: c.status || b.status || a.status, via: "fetch+curl×2" };
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

const raw = JSON.parse(fs.readFileSync(AI_FILE, "utf8"));
const items = [];
for (const g of raw.groups) for (const s of g.sections) for (const it of s.items) items.push(it);

const targets = items.slice(0, LIMIT);
const stamp = today();

console.log("\n检查 " + targets.length + " 个地址" + (DRY ? "（dry-run，不写文件）" : "") + "…\n");

let cursor = 0;
let done = 0;
const dead = [];
const alive = [];

async function worker() {
  while (cursor < targets.length) {
    const it = targets[cursor++];
    const r = await probe(it.url);
    done++;
    process.stdout.write("\r  进度 " + done + "/" + targets.length);
    if (r.ok) {
      alive.push({ it, r });
      if (!DRY) it.verified = stamp;
    } else {
      dead.push({ it, r });
    }
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker));
process.stdout.write("\r".padEnd(24) + "\r");

console.log("  活着  " + alive.length + " 个");
console.log("  打不开 " + dead.length + " 个");

if (dead.length) {
  console.log("\n打不开的（不改 verified，让它自然变旧并被标出来）：");
  for (const { it, r } of dead) {
    console.log("  ✗ " + it.id + "  [" + (r.status || "超时") + "]  " + it.url);
  }
}

if (!DRY) {
  // 只改 verified，其余原样写回；顺手刷新 updatedAt
  raw.updatedAt = stamp;
  fs.writeFileSync(AI_FILE, JSON.stringify(raw, null, 2) + "\n");
  console.log("\n已回写 " + alive.length + " 条 verified → " + stamp);
} else {
  console.log("\n（dry-run，未写文件）");
}

// 连续全部打不开说明是本机网络问题，不是条目问题——用非 0 退出码区分
if (dead.length === targets.length && targets.length > 0) {
  console.log("\n所有地址都打不开，先检查本机网络（这是环境问题，不是数据问题）。\n");
  process.exit(2);
}
