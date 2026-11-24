import fs from "node:fs";
import path from "node:path";

const DIST = "dist";

// ---- 内部链接 ----
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = walk(DIST);
let bad = 0, n = 0;
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|data:|javascript:|\/\/|#)/.test(u)) continue;
    n++;
    const t = path.resolve(path.dirname(f), u.split("?")[0]);
    if (!fs.existsSync(t)) { bad++; if (bad <= 10) console.log("  BROKEN " + f + " -> " + u); }
  }
}
console.log("  内部链接 " + n + " 个，断链 " + bad + " 个");

// ---- .ics ----
const icsDir = path.join(DIST, "calendar");
const icsFiles = fs.readdirSync(icsDir).filter((f) => f.endsWith(".ics"));
let icsBad = 0, totalEvents = 0;
for (const f of icsFiles) {
  const t = fs.readFileSync(path.join(icsDir, f), "utf8");
  if (!t.startsWith("BEGIN:VCALENDAR")) { console.log("  BAD start " + f); icsBad++; }
  if (!t.replace(/\r\n$/, "").endsWith("END:VCALENDAR")) { console.log("  BAD end " + f); icsBad++; }
  totalEvents += (t.match(/BEGIN:VEVENT/g) || []).length;
  for (const ln of t.split("\r\n")) {
    if (Buffer.byteLength(ln, "utf8") > 75) { console.log("  FOLD FAIL " + f + " :: " + ln.slice(0, 50)); icsBad++; break; }
  }
  for (const ln of t.split("\r\n")) {
    if (ln && !ln.startsWith(" ") && !/^[A-Z0-9-]+[;:]/.test(ln)) { console.log("  BAD LINE " + f + " :: " + ln.slice(0, 50)); icsBad++; break; }
  }
}
console.log("  .ics " + icsFiles.length + " 个，事件 " + totalEvents + " 条，问题 " + icsBad + " 个");

// ---- sitemap ----
const sm = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
let smBad = 0, smN = 0;
for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  smN++;
  const u = m[1].replace("https://college-am.example/", "");
  const t = path.join(DIST, u || "index.html");
  if (!fs.existsSync(t)) { smBad++; console.log("  SITEMAP 404: " + m[1]); }
}
console.log("  sitemap " + smN + " 条，失效 " + smBad + " 条");

// ---- robots ----
const rb = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
if (!/Sitemap:\s+\S+/.test(rb)) { console.log("  robots 缺少 Sitemap"); smBad++; }

// ---- 页面统计 ----
console.log("  HTML 页面 " + files.length + " 个");

process.exit(bad + icsBad + smBad > 0 ? 1 : 0);