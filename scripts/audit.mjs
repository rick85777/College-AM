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
// 站点可能部署在域名根，也可能部署在仓库子路径（GitHub Pages 的 /<repo>/）。
// 所以按路径段从长到短试，第一个文件真实存在的，就是站内相对路径。
const locPath = (url) => {
  const full = url.replace(/^https?:\/\/[^/]+\//, "");
  const segs = full.split("/");
  for (let i = 0; i <= segs.length; i++) {
    const rel = segs.slice(i).join("/");
    if (fs.existsSync(path.join(DIST, rel || "index.html"))) return rel;
  }
  return full;
};
for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  smN++;
  const u = locPath(m[1]);
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


// ---------- 6. AI 板块 ----------
// 依据 docs/research/09-ai-ia.md §5：条目上限、必填字段、可核查性三件套
const aiPath = path.join(DIST, "ai.html");
let aiBad = 0;
if (!fs.existsSync(aiPath)) { console.log("  ✗ 缺少 ai.html"); aiBad++; }
else {
  const ai = fs.readFileSync(aiPath, "utf8");
  const bytes = fs.statSync(aiPath).size;
  // 体积红线：102 条目标 <130KB；目前 109 条
  if (bytes > 130 * 1024) { console.log("  ✗ ai.html 体积 " + (bytes / 1024).toFixed(1) + "KB，超过 130KB 红线"); aiBad++; }
  const secN = (ai.match(/<section id="/g) || []).length;
  if (secN !== 6) { console.log("  ✗ ai.html 分区数为 " + secN + "，应为 6"); aiBad++; }
  const cardN = (ai.match(/class="card ai-card"/g) || []).length;
  if (cardN < 100) { console.log("  ✗ ai.html 条目仅 " + cardN + " 条（<100）"); aiBad++; }
  // 每条都必须有 fit（「谁该用/什么时候别用」），这是全案最重要的一行
  const fitN = (ai.match(/class="ai-fit"/g) || []).length;
  if (fitN !== cardN) { console.log("  ✗ fit 行 " + fitN + " 条，与条目数 " + cardN + " 不一致"); aiBad++; }
  // 每条都必须标出实测验证日期
  const verN = (ai.match(/ 验证<\/span>/g) || []).length;
  if (verN < cardN) { console.log("  ✗ 验证日期仅 " + verN + " 处，少于条目数 " + cardN); aiBad++; }
  // 每条都必须有 access 标记（能直连是实测结论，不能默认）
  const accN = (ai.match(/data-access="/g) || []).length;
  if (accN !== cardN) { console.log("  ✗ access 标记 " + accN + " 处，与条目数 " + cardN + " 不一致"); aiBad++; }
  // 折叠详情必须与 <a> 同级（interactive content 约束）
  if (!/<details class="ai-more"/.test(ai)) { console.log("  ✗ 缺少 </details> 折叠详情块"); aiBad++; }
  // 站外链接必须带 noopener
  const extLinks = (ai.match(/<a [^>]*href="https?:[^"]*"[^>]*>/g) || []);
  const noRel = extLinks.filter((a) => /target="_blank"/.test(a) && !/rel="[^"]*noopener/.test(a));
  if (noRel.length) { console.log("  ✗ " + noRel.length + " 个外链缺 rel=noopener"); aiBad++; }
  console.log("  AI 板块   " + (bytes / 1024).toFixed(1) + "KB，" + secN + " 分区 / " + cardN + " 条，fit " + fitN + "，问题 " + aiBad);
}
if (aiBad) console.log("  （ai.html 缺失或异常，先 npm run build）");
problems += aiBad;

// ---------- 7. 快速检索 ----------
// 五个栏目 + 构建期索引。索引与页面必须同版本，否则会出现「搜得到但点进去 404」。
let qBad = 0;
const qPage = path.join(DIST, "search.html");
const qIndex = path.join(DIST, "search-index.json");
const qJs = path.join(DIST, "assets", "quick.js");
if (!fs.existsSync(qPage)) { console.log("  ✗ 缺少 search.html"); qBad++; }
else {
  const qh = fs.readFileSync(qPage, "utf8");
  const secs = [...qh.matchAll(/<section id="([a-z]+)"/g)].map((m) => m[1]);
  const want = ["kw", "time", "prov", "tag", "dir"];
  if (JSON.stringify(secs) !== JSON.stringify(want)) {
    console.log("  ✗ search.html 分区为 [" + secs.join(",") + "]，应为 [" + want.join(",") + "]");
    qBad++;
  }
  if (!/assets\/quick\.js/.test(qh)) { console.log("  ✗ search.html 未引入 quick.js"); qBad++; }
  if (!/<noscript>/.test(qh)) { console.log("  ✗ search.html 缺 <noscript> 降级（无 JS 时无法检索）"); qBad++; }
  const qExt = (qh.match(/<a [^>]*href="https?:[^"]*"[^>]*>/g) || []);
  const qNoRel = qExt.filter((a) => /target="_blank"/.test(a) && !/rel="[^"]*noopener/.test(a));
  if (qNoRel.length) { console.log("  ✗ search.html 有 " + qNoRel.length + " 个外链缺 rel=noopener"); qBad++; }
}
if (!fs.existsSync(qJs)) { console.log("  ✗ 缺少 assets/quick.js"); qBad++; }
else {
  const jsBytes = fs.statSync(qJs).size;
  // 红线 6KB：这个文件是首屏阻塞资源，膨胀会拖慢检索
  if (jsBytes > 6 * 1024) { console.log("  ✗ quick.js " + (jsBytes / 1024).toFixed(1) + "KB，超过 6KB 红线"); qBad++; }
}
if (!fs.existsSync(qIndex)) { console.log("  ✗ 缺少 search-index.json"); qBad++; }
else {
  let docs = null;
  try { docs = JSON.parse(fs.readFileSync(qIndex, "utf8")); }
  catch { console.log("  ✗ search-index.json 不是合法 JSON"); qBad++; }
  if (docs) {
    if (!Array.isArray(docs)) { console.log("  ✗ search-index.json 顶层不是数组"); qBad++; }
    else {
      if (docs.length < 180) { console.log("  ✗ 索引仅 " + docs.length + " 条（<180）"); qBad++; }
      const byType = {};
      let broken = 0, noAnchor = 0;
      const htmlCache = new Map();
      const readCache = (f) => {
        if (!htmlCache.has(f)) htmlCache.set(f, fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);
        return htmlCache.get(f);
      };
      for (const d of docs) {
        byType[d.t] = (byType[d.t] || 0) + 1;
        if (!d.t || !d.id || !d.ti || !d.u || typeof d.n !== "string" || !d.n) { broken++; continue; }
        const [file, frag] = d.u.split("#");
        const target = readCache(path.join(DIST, file));
        if (target === null) { broken++; continue; }
        if (frag && target.indexOf('id="' + frag + '"') === -1) noAnchor++;
      }
      if (broken) { console.log("  ✗ 索引有 " + broken + " 条指向不存在的页面或字段不全"); qBad++; }
      if (noAnchor) { console.log("  ✗ 索引有 " + noAnchor + " 条锚点在目标页里找不到（会跳到页顶）"); qBad++; }
      const typeStr = Object.keys(byType).sort().map((k) => k + " " + byType[k]).join(" / ");
      console.log("  检索页    search.html 五栏，索引 " + docs.length + " 条（" + typeStr + "），问题 " + qBad);
    }
  }
}
if (qBad) console.log("  （search.html 缺失或异常，先 npm run build）");
problems += qBad;

// ---------- 8. 移动端溢出（可选，需无头浏览器） ----------
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