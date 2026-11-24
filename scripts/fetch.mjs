#!/usr/bin/env node
/**
 * 抓取器（v0.1，只支持 1 个源）。
 *
 * 设计原则（来自红队评审的修正）：
 *   1. 静态优先 —— bm.ruankao.org.cn 是纯静态 HTML 表格，不需要浏览器
 *   2. 只产出「候选变更」到 data/review-queue.json，绝不直接改主数据
 *   3. 报名时间属于 manual_only 字段，必须人工确认后才合并
 *   4. 抓不到就记 dead_letter，不猜、不补
 *
 *   node scripts/fetch.mjs            # 抓取并生成候选变更
 *   node scripts/fetch.mjs --dry-run  # 只抓取，不写文件
 */

import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const REVIEW_QUEUE = path.join(ROOT, "data", "review-queue.json");
const DRY_RUN = process.argv.includes("--dry-run");

const SOURCE = {
  id: "ruankao-bm",
  programId: "ruankao",
  editionId: "ruankao-2026-h2",
  url: "https://bm.ruankao.org.cn/",
  tier: "L1",
  fetchMode: "static",
  // 关键：抓取器必须声明自己期望的字段，缺字段即模板失效
  expectFields: ["province", "start", "end"],
  minRows: 25,
};

/**
 * 提取省级报名行。
 *
 * 目标站点（bm.ruankao.org.cn）的实际结构不是 <table>，是 layui 的 div 栅格：
 *   <div class="layui-row listCont selectorg">
 *     <div class="layui-col-md3 col1">北京</div>
 *     <div class="layui-col-md4 col2 timeW">2026-09-11 00:00 ~ 2026-09-17 23:59</div>   <- 报名
 *     <div class="layui-col-md4 col2 timeW">2026-09-11 00:00 ~ 2026-09-17 23:59</div>   <- 缴费
 *     <div class="layui-col-md1 col2"><a …>进入</a></div>
 *   </div>
 */
function extractRows(html) {
  const rows = [];
  // 用 split 而不是正则边界：最后一行后面不是另一个 listCont，而是 bottomtip
  const chunks = html.split('<div class="layui-row listCont');
  for (const chunk of chunks.slice(1)) {
    const nameMatch = chunk.match(/<div class="[^"]*col1"[^>]*>([\s\S]*?)<\/div>/i);
    if (!nameMatch) continue;
    const name = nameMatch[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!name) continue;
    const timeCells = [...chunk.matchAll(/<div class="[^"]*col2[^"]*timeW"[^>]*>([\s\S]*?)<\/div>/gi)].map((x) =>
      x[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim()
    );
    rows.push([name, timeCells[0] ?? "", timeCells[1] ?? ""]);
  }
  return rows;
}

/** 读取当前页面选中的考试批次（用于确认抓到的是不是最新批次） */
function currentBatch(html) {
  const m = html.match(/<option selected="selected"[^>]*>([^<]+)<\/option>/);
  return m ? m[1].trim() : null;
}

/** "2026-09-11 00:00 ~ 2026-09-17 23:59" -> { start, end } */
function parseWindow(text) {
  if (!text) return null;
  const m = text.match(/(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2})?\s*~\s*(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2})?/);
  if (!m) return null;
  return { start: m[1], startTime: m[2] ?? null, end: m[3], endTime: m[4] ?? null };
}

const PROVINCE_NAMES = new Set([
  "北京","天津","河北","山西","内蒙古","辽宁","吉林","黑龙江","上海","江苏","浙江","安徽","福建","江西","山东",
  "河南","湖北","湖南","广东","广西","海南","重庆","四川","贵州","云南","西藏","陕西","甘肃","青海","宁夏","新疆","新疆兵团","香港","澳门",
]);

async function fetchSource() {
  const started = Date.now();
  const res = await fetch(SOURCE.url, {
    headers: {
      "user-agent": "College-AM/0.1 (+https://github.com/college-am/college-am; low-frequency static indexer)",
      "accept-language": "zh-CN,zh;q=0.9",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const html = await res.text();
  return { html, status: res.status, elapsedMs: Date.now() - started, bytes: html.length };
}

function parse(html) {
  const rows = extractRows(html);
  const parsed = [];
  const skipped = [];

  for (const cells of rows) {
    // 目标结构：[机构名称, 报名有效时间, 缴费时间, 入口]
    if (cells.length < 2) continue;
    const name = cells[0].replace(/\s+/g, "");
    if (!PROVINCE_NAMES.has(name)) continue;

    const win = parseWindow(cells[1]);
    if (!win) {
      skipped.push({ province: name, reason: "无法解析报名时间", raw: cells[1] });
      continue;
    }
    parsed.push({ province: name, ...win, payText: cells[2] ?? null });
  }

  return { parsed, skipped, totalRows: rows.length };
}

export { extractRows, parseWindow, PROVINCE_NAMES, currentBatch };

async function main() {
  console.log("\n\x1b[1mCollege-AM 抓取器\x1b[0m\n");
  console.log("  源      " + SOURCE.url);
  console.log("  模式    " + SOURCE.fetchMode + "（静态 HTML，无需浏览器）");
  console.log("  等级    " + SOURCE.tier);
  console.log("");

  let fetched;
  try {
    fetched = await fetchSource();
  } catch (e) {
    console.log("  \x1b[31m✗ 抓取失败\x1b[0m " + e.message);
    console.log("  → 按设计：失败即进 dead_letter，不重试、不猜数据。\n");
    process.exit(1);
  }

  console.log("  HTTP    " + fetched.status + " · " + fetched.bytes + " bytes · " + fetched.elapsedMs + "ms");

  const batch = currentBatch(fetched.html);
  console.log("  批次    " + (batch ?? "未识别"));
  const { parsed, skipped, totalRows } = parse(fetched.html);
  console.log("  解析    " + totalRows + " 行 → " + parsed.length + " 个省级窗口, " + skipped.length + " 个跳过");
  console.log("");

  // ---- 守卫：模板失效检测 ----
  const guards = [];
  if (parsed.length < SOURCE.minRows) {
    guards.push(`rows_below_min: 只解析到 ${parsed.length} 行，期望 ≥${SOURCE.minRows}。页面很可能改版。`);
  }
  if (skipped.length > parsed.length * 0.2) {
    guards.push(`parse_failure_rate: ${skipped.length}/${parsed.length + skipped.length} 行解析失败，超过 20% 阈值。`);
  }

  if (guards.length) {
    console.log("  \x1b[33m! 模板告警\x1b[0m");
    for (const g of guards) console.log("      " + g);
    console.log("  → 本次抓取结果不写入候选队列，等人工修模板。\n");
    process.exit(2);
  }

  // ---- 与库内数据做字段级 diff ----
  const current = JSON.parse(await readFile(path.join(ROOT, "data", "province-signup.json"), "utf8"));
  const edition = current.editions.find((e) => e.editionId === SOURCE.editionId);
  const byProvince = new Map((edition?.windows ?? []).map((w) => [w.province, w]));

  const changes = [];
  const added = [];
  const unchanged = [];

  for (const p of parsed) {
    const old = byProvince.get(p.province);
    if (!old) {
      added.push(p);
      continue;
    }
    const diffs = [];
    if (old.start !== p.start) diffs.push({ field: "start", old: old.start, new: p.start });
    if (old.end !== p.end) diffs.push({ field: "end", old: old.end, new: p.end });
    if ((old.startTime ?? null) !== p.startTime) diffs.push({ field: "startTime", old: old.startTime ?? null, new: p.startTime });
    if ((old.endTime ?? null) !== p.endTime) diffs.push({ field: "endTime", old: old.endTime ?? null, new: p.endTime });
    if (diffs.length) changes.push({ province: p.province, diffs });
    else unchanged.push(p.province);
  }

  const missing = [...byProvince.keys()].filter((k) => !parsed.some((p) => p.province === k));

  console.log("\n  \x1b[1m字段级 diff\x1b[0m");
  console.log("    未变化    " + unchanged.length + " 个省");
  console.log("    有变化    " + (changes.length ? "\x1b[33m" + changes.length + "\x1b[0m" : "0") + " 个省");
  console.log("    新出现    " + (added.length ? "\x1b[33m" + added.length + "\x1b[0m" : "0") + " 个省");
  console.log("    已消失    " + (missing.length ? "\x1b[31m" + missing.length + "\x1b[0m" : "0") + " 个省");

  for (const c of changes.slice(0, 10)) {
    console.log("      \x1b[33m~\x1b[0m " + c.province + ": " + c.diffs.map((d) => d.field + " " + d.old + " → " + d.new).join(", "));
  }
  for (const a of added.slice(0, 5)) {
    console.log("      \x1b[33m+\x1b[0m " + a.province + " (" + a.start + " ~ " + a.end + ")");
  }
  for (const m of missing.slice(0, 5)) {
    console.log("      \x1b[31m-\x1b[0m " + m);
  }

  if (!changes.length && !added.length && !missing.length) {
    console.log("\n  \x1b[32m✓ 无变更\x1b[0m —— 只更新 last_seen_at，不产生版本。\n");
    if (!DRY_RUN) {
      const q = { generatedAt: new Date().toISOString(), source: SOURCE.id, status: "no_change", changes: [], added: [], missing: [] };
      await writeFile(REVIEW_QUEUE, JSON.stringify(q, null, 2) + "\n");
    }
    return;
  }

  // ---- 写入候选队列（不是主数据！）----
  const queue = {
    generatedAt: new Date().toISOString(),
    source: SOURCE.id,
    sourceUrl: SOURCE.url,
    programId: SOURCE.programId,
    editionId: SOURCE.editionId,
    status: "needs_review",
    reason:
      "报名时间属于 manual_only 字段（见 lib/schema.mjs），必须人工确认后才可合并进 data/province-signup.json。",
    changes,
    added,
    missing,
    guards,
    stats: { parsed: parsed.length, unchanged: unchanged.length },
  };

  if (DRY_RUN) {
    console.log("\n  (--dry-run: 不写文件)\n");
    return;
  }

  await writeFile(REVIEW_QUEUE, JSON.stringify(queue, null, 2) + "\n");
  console.log("\n  → 已写入 \x1b[1mdata/review-queue.json\x1b[0m，等待人工审核。");
  console.log("     审核方式：逐条核对官方页面，确认后手工修改 data/province-signup.json 并更新 fetchedAt。\n");
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
if (isDirectRun) {
  main().catch((e) => {
    console.error("抓取器异常：" + e.message);
    process.exit(1);
  });
}