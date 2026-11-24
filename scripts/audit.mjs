// 构建产物审计：内部链接 / .ics 结构 / sitemap / 移动端溢出
// 溢出检查需要无头浏览器；没有时不阻断，只提示。
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import http from "node:http";

// 注意：不要读 process.env.PORT —— 很多环境会预置它，导致连到无关端口
const PORT = Number(process.env.COLLEGE_AM_PORT || 4173);
const BASE = "http://127.0.0.1:" + PORT;

const DIST = "dist";
let problems = 0;

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html") && !e.name.startsWith("_")) out.push(p);
  }
  return out;
}

const files = walk(DIST);
const rel = (p) => path.relative(DIST, p).replace(/\\/g, "/");

// ---------- 1. 内部链接 ----------
let linkN = 0, linkBad = 0;
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|data:|javascript:|\/\/|#)/.test(u)) continue;
    linkN++;
    const t = path.resolve(path.dirname(f), u.split("?")[0]);
    if (!fs.existsSync(t)) { linkBad++; if (linkBad <= 10) console.log("  ✗ 断链 " + rel(f) + " -> " + u); }
  }
}
console.log("  内部链接  " + linkN + " 个，断链 " + linkBad);
problems += linkBad;

// ---------- 2. .ics ----------
const icsDir = path.join(DIST, "calendar");
const icsFiles = fs.readdirSync(icsDir).filter((f) => f.endsWith(".ics"));
let icsBad = 0, events = 0;
for (const f of icsFiles) {
  const t = fs.readFileSync(path.join(icsDir, f), "utf8");
  if (!t.startsWith("BEGIN:VCALENDAR")) { console.log("  ✗ " + f + " 缺少 VCALENDAR 头"); icsBad++; }
  if (!t.replace(/\r\n$/, "").endsWith("END:VCALENDAR")) { console.log("  ✗ " + f + " 缺少 VCALENDAR 尾"); icsBad++; }
  events += (t.match(/BEGIN:VEVENT/g) || []).length;
  let foldBad = false, lineBad = false;
  for (const ln of t.split("\r\n")) {
    if (!foldBad && Buffer.byteLength(ln, "utf8") > 75) { console.log("  ✗ " + f + " 折行超 75 字节"); foldBad = true; icsBad++; }
    if (!lineBad && ln && !ln.startsWith(" ") && !/^[A-Z0-9-]+[;:]/.test(ln)) { console.log("  ✗ " + f + " 非法行：" + ln.slice(0, 40)); lineBad = true; icsBad++; }
  }
}
console.log("  .ics      " + icsFiles.length + " 个，" + events + " 条事件，问题 " + icsBad);
problems += icsBad;

// ---------- 3. sitemap ----------
const sm = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
let smN = 0, smBad = 0;
for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  smN++;
  const u = m[1].replace(/^https?:\/\/[^/]+\//, "");
  const t = path.join(DIST, u || "index.html");
  if (!fs.existsSync(t)) { console.log("  ✗ sitemap 指向不存在的页面: " + m[1]); smBad++; }
}
const htmlN = files.length;
if (smN < htmlN) { console.log("  ✗ sitemap " + smN + " 条，少于页面数 " + htmlN); smBad++; }
console.log("  sitemap   " + smN + " 条，失效 " + smBad);
problems += smBad;

// ---------- 4. robots ----------
const rb = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
if (!/Sitemap:\s+\S+/.test(rb)) { console.log("  ✗ robots.txt 缺少 Sitemap"); problems++; }

// ---------- 5. PWA ----------
const mfPath = path.join(DIST, "manifest.webmanifest");
const swPath = path.join(DIST, "sw.js");
let pwaBad = 0;
if (!fs.existsSync(mfPath)) { console.log("  ✗ 缺少 manifest.webmanifest"); pwaBad++; }
else {
  let mf = null;
  try { mf = JSON.parse(fs.readFileSync(mfPath, "utf8")); } catch { console.log("  ✗ manifest 不是合法 JSON"); pwaBad++; }
  if (mf) {
    for (const k of ["name", "short_name", "start_url", "display", "icons"]) {
      if (!mf[k]) { console.log("  ✗ manifest 缺字段 " + k); pwaBad++; }
    }
    if (!Array.isArray(mf.icons) || mf.icons.length < 2) { console.log("  ✗ manifest 图标少于 2 个"); pwaBad++; }
    else {
      let has192 = false, has512 = false;
      for (const ic of mf.icons) {
        if (!ic.src) { console.log("  ✗ 图标缺 src"); pwaBad++; continue; }
        if (ic.type === "image/svg+xml") continue;
        if (ic.sizes === "192x192") has192 = true;
        if (ic.sizes === "512x512") has512 = true;
        const p = path.join(DIST, ic.src);
        if (!fs.existsSync(p)) { console.log("  ✗ 图标文件不存在: " + ic.src); pwaBad++; }
        else if (fs.statSync(p).size < 200) { console.log("  ✗ 图标文件过小（可能是坏 PNG）: " + ic.src); pwaBad++; }
      }
      if (!has192 || !has512) { console.log("  ✗ manifest 缺少 192x192 或 512x512 图标"); pwaBad++; }
    }
    if (!mf.theme_color) { console.log("  ✗ manifest 缺 theme_color"); pwaBad++; }
  }
}
if (!fs.existsSync(swPath)) { console.log("  ✗ 缺少 sw.js"); pwaBad++; }
else {
  const sw = fs.readFileSync(swPath, "utf8");
  for (const k of ["install", "activate", "fetch"]) {
    if (!new RegExp("addEventListener\\(\"" + k + "\"").test(sw)) { console.log("  ✗ sw.js 缺少 " + k + " 事件"); pwaBad++; }
  }
  if (!/caches\.open/.test(sw)) { console.log("  ✗ sw.js 未使用 Cache API"); pwaBad++; }
}
// 每个页面都应声明 manifest 与主题色
let noManifest = 0;
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  if (!t.includes('rel="manifest"')) { console.log("  ✗ 页面未声明 manifest: " + rel(f)); noManifest++; }
}
pwaBad += noManifest;
console.log("  PWA       manifest " + (fs.existsSync(mfPath) ? "✓" : "✗") + "，sw.js " + (fs.existsSync(swPath) ? "✓" : "✗") + "，问题 " + pwaBad);
problems += pwaBad;

// ---------- 6. 移动端溢出（可选，需无头浏览器） ----------
const CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const edge = CANDIDATES.find((p) => fs.existsSync(p));

if (!edge) {
  console.log("  移动端    跳过（未找到 Edge，无法做无头测量）");
} else {
  const all = files.map(rel);
  const probe = `<!doctype html><meta charset="utf-8"><body style="font:14px monospace"><div id="out">measuring…</div>
<script>
const pages = ${JSON.stringify(all.filter((p) => p !== "_probe.html"))};
const results = []; let i = 0;
function next(){
  if (i >= pages.length){ document.getElementById('out').textContent = 'R:' + JSON.stringify(results); return; }
  const p = pages[i++]; const fr = document.createElement('iframe');
  fr.style.cssText = 'width:390px;height:600px;border:0;position:absolute;left:-9999px';
  fr.src = '/' + p;
  fr.onload = () => { setTimeout(() => { try {
      const d = fr.contentDocument.documentElement;
      const bad = d.scrollWidth > d.clientWidth + 1;
      results.push(bad ? p + ' OVERFLOW(' + d.scrollWidth + '>' + d.clientWidth + ')' : null);
    } catch (e) { results.push(p + ' ERR'); } fr.remove(); next(); }, 100); };
  document.body.appendChild(fr);
}
next();
</script>`;
  // 探测页必须通过 http 提供，file:// 下 iframe 跨源读不到 contentDocument
  const alive = await new Promise((res) => {
    const req = http.get(BASE + "/index.html", (r) => { r.resume(); res(r.statusCode === 200); });
    req.on("error", () => res(false));
    req.setTimeout(1200, () => { req.destroy(); res(false); });
  });
  const probePath = path.join(DIST, "_probe.html");
  fs.writeFileSync(probePath, probe);
  try {
    if (!alive) throw new Error("本地服务未运行（先 npm run dev）: " + BASE);
    const dom = execFileSync(edge, [
      "--headless=new", "--disable-gpu", "--virtual-time-budget=20000",
      "--window-size=1200,900", "--dump-dom", BASE + "/_probe.html",
    ], { encoding: "utf8", timeout: 120000, stdio: ["ignore", "pipe", "ignore"] });
    const m = dom.match(/R:(\[[^\]]*\])/);
    if (!m) {
      console.log("  移动端    未取到测量结果（跳过）");
    } else {
      const bads = JSON.parse(m[1]).filter(Boolean);
      console.log("  移动端    " + all.length + " 个页面 @390px，溢出 " + bads.length);
      for (const b of bads) console.log("  ✗ " + b);
      problems += bads.length;
    }
  } catch (e) {
    console.log("  移动端    测量失败（跳过）：" + e.message.slice(0, 60));
  } finally {
    fs.rmSync(probePath, { force: true });
  }
}

console.log(problems === 0 ? "\n审计通过。" : "\n审计发现 " + problems + " 个问题。");
process.exit(problems > 0 ? 1 : 0);