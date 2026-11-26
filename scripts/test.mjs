#!/usr/bin/env node
/**
 * 零依赖测试。断言用 node:assert/strict。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildCalendar, __internal as icsInternal } from "../lib/ics.mjs";
import { daysUntil, keyDates, readProgramFiles, isPublished } from "../lib/load.mjs";
import { validateFile, MANUAL_ONLY_FIELDS } from "../lib/schema.mjs";
import { extractRows, parseWindow } from "./fetch.mjs";
import { validateProvinceSignup } from "../lib/province.mjs";
import { loadAi, validateAi, chars, allItems } from "../lib/ai.mjs";
import { norm, tokens, buildDocs, search, buildTagIndex, DOC_LABEL } from "../lib/search.mjs";

let pass = 0;
let fail = 0;

function test(name, fn) {
  try {
    fn();
    pass++;
    console.log("  \x1b[32m✓\x1b[0m " + name);
  } catch (e) {
    fail++;
    console.log("  \x1b[31m✗\x1b[0m " + name);
    console.log("      " + e.message.split("\n")[0]);
  }
}

console.log("\n\x1b[1mCollege-AM 测试\x1b[0m\n");

// ---------- ICS ----------
console.log("ICS 生成");

test("生成基础日历，以 CRLF 结尾", () => {
  const s = buildCalendar({ name: "测试", events: [{ uid: "a", start: "2026-12-12", summary: "考试" }], now: new Date("2026-11-24T00:00:00Z") });
  assert.ok(s.startsWith("BEGIN:VCALENDAR"));
  assert.ok(s.endsWith("END:VCALENDAR\r\n"));
  assert.ok(s.includes("DTSTART;VALUE=DATE:20261212"));
});

test("全天事件 DTEND 为次日（RFC 5545 exclusive）", () => {
  assert.equal(icsInternal.nextDay("2026-12-12"), "2026-12-13");
  assert.equal(icsInternal.nextDay("2026-12-31"), "2027-01-01");
  assert.equal(icsInternal.nextDay("2028-02-28"), "2028-02-29");
});

test("每行不超过 75 字节（含折行）", () => {
  const longText = "很长的中文标题".repeat(30);
  const s = buildCalendar({ name: "x", events: [{ uid: "a", start: "2026-01-01", summary: longText }] });
  for (const line of s.split("\r\n")) {
    assert.ok(Buffer.byteLength(line, "utf8") <= 75, "超长行: " + line.slice(0, 20));
  }
});

test("转义逗号、分号、换行", () => {
  assert.equal(icsInternal.esc("a,b;c\nd"), "a\\,b\\;c\\nd");
});

test("包含 VALARM 提醒", () => {
  const s = buildCalendar({ name: "x", events: [{ uid: "a", start: "2026-01-01", summary: "y", alarmDays: [7, 1] }] });
  assert.ok(s.includes("TRIGGER:-P7D"));
  assert.ok(s.includes("TRIGGER:-P1D"));
});

// ---------- 日期 ----------
console.log("\n日期计算");

test("daysUntil 对同一天返回 0", () => {
  const today = new Date(2026, 10, 24);
  assert.equal(daysUntil("2026-11-24", today), 0);
});

test("daysUntil 跨月跨年正确", () => {
  const today = new Date(2026, 10, 24);
  assert.equal(daysUntil("2026-12-12", today), 18);
  assert.equal(daysUntil("2027-01-01", today), 38);
});

test("daysUntil 对过去日期返回负数", () => {
  const today = new Date(2026, 10, 24);
  assert.ok(daysUntil("2026-10-24", today) < 0);
});

// ---------- keyDates ----------
console.log("\n关键节点提取");

test("有 milestones 时优先使用 milestones", () => {
  const ed = { milestones: [{ label: "笔试", date: "2026-06-13", kind: "event" }], eventStart: "2020-01-01" };
  const k = keyDates(ed);
  assert.equal(k.length, 1);
  assert.equal(k[0].label, "笔试");
  assert.equal(k[0].date, "2026-06-13");
});

test("无 milestones 时回退到扁平字段", () => {
  const ed = { signupStart: "2026-03-01", signupEnd: "2026-03-10", eventStart: "2026-06-13" };
  const k = keyDates(ed);
  assert.equal(k.length, 3);
  assert.equal(k[0].label, "报名开始");
});

test("结果按日期排序", () => {
  const ed = { milestones: [{ label: "b", date: "2026-09-01" }, { label: "a", date: "2026-03-01" }] };
  assert.equal(keyDates(ed)[0].label, "a");
});

// ---------- Schema ----------
console.log("\n数据契约");

const validFile = {
  schemaVersion: "0.1.0",
  programs: [{
    id: "x", kind: "cert", name: "测试条目", aliases: ["t"], organizer: "某机构",
    organizerType: "official", level: "national", tags: ["t"],
    majors: [{ id: "all", weight: "core" }],
    officialUrl: "https://example.com/",
    summary: "这是一个用于测试的摘要内容。",
    editions: [{
      id: "x-2026", year: 2026, round: "annual", sourceUrl: "https://example.com/a",
      fetchedAt: "2026-11-24T10:00:00+08:00", trustTier: "L1", reviewState: "human_approved",
    }],
  }],
};

test("合法文件通过校验", () => {
  const { errors } = validateFile(validFile, "test.json");
  assert.deepEqual(errors, []);
});

test("round 用 main 会被拒绝（一年两轮场景）", () => {
  const f = structuredClone(validFile);
  f.programs[0].editions[0].round = "main";
  const { errors } = validateFile(f, "test.json");
  assert.ok(errors.some((e) => e.includes("round")));
});

test("模糊日期（预计3月）被拒绝", () => {
  const f = structuredClone(validFile);
  f.programs[0].editions[0].signupStart = "预计3月";
  const { errors } = validateFile(f, "test.json");
  assert.ok(errors.some((e) => e.includes("signupStart")));
});

test("L4 投稿不得直接发布", () => {
  const f = structuredClone(validFile);
  f.programs[0].editions[0].trustTier = "L4";
  const { errors } = validateFile(f, "test.json");
  assert.ok(errors.some((e) => e.includes("L4")));
});

test("同一 Program 下 year+round 重复会被拒绝", () => {
  const f = structuredClone(validFile);
  f.programs[0].editions.push({ ...f.programs[0].editions[0], id: "x-2026-b" });
  const { errors } = validateFile(f, "test.json");
  assert.ok(errors.some((e) => e.includes("冲突")));
});

test("没有 core 频道关系时给出警告", () => {
  const f = structuredClone(validFile);
  f.programs[0].majors = [{ id: "all", weight: "recommended" }];
  const { warnings } = validateFile(f, "test.json");
  assert.ok(warnings.some((w) => w.includes("core")));
});

test("manual_only 字段清单包含报名与费用", () => {
  for (const f of ["signupStart", "signupEnd", "feeCny", "eventStart"]) {
    assert.ok(MANUAL_ONLY_FIELDS.has(f), f + " 应在 manual_only 中");
  }
});

test("manual_only 不包含标题与链接", () => {
  for (const f of ["name", "organizer", "officialUrl"]) {
    assert.ok(!MANUAL_ONLY_FIELDS.has(f), f + " 不应在 manual_only 中");
  }
});

// ---------- 抓取器解析 ----------
console.log("\n抓取器解析（真实页面结构 fixture）");

const FIXTURE = `
<div class="layui-row listCont selectorg"><div class="layui-col-md3 col1">北京</div><div class="layui-col-md4 col2 timeW">2026-09-11 00:00 ~ 2026-09-17 23:59</div><div class="layui-col-md4 col2 timeW">2026-09-11 00:00 ~ 2026-09-17 23:59</div><div class="layui-col-md1 col2"><a href="javascript:;">进入</a></div></div>
<div class="layui-row listCont selectorg"><div class="layui-col-md3 col1">香港</div><div class="layui-col-md4 col2 timeW">2026-09-01 00:00 ~ 2026-09-18 00:00</div><div class="layui-col-md4 col2 timeW"> ~ </div><div class="layui-col-md1 col2"><a href="javascript:;">进入</a></div></div>
<div style="text-align:center" class="bottomtip">已经到底部</div>
`;

test("能从 layui div 结构解析出省份行（含最后一行）", () => {
  const rows = extractRows(FIXTURE);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][0], "北京");
  assert.equal(rows[1][0], "香港", "最后一行不应被丢弃");
});

test("parseWindow 解析标准时间窗口", () => {
  const w = parseWindow("2026-09-11 00:00 ~ 2026-09-17 23:59");
  assert.deepEqual(w, { start: "2026-09-11", startTime: "00:00", end: "2026-09-17", endTime: "23:59" });
});

test("parseWindow 对空窗口返回 null", () => {
  assert.equal(parseWindow(" ~ "), null);
  assert.equal(parseWindow(""), null);
});

test("parseWindow 对模糊文本返回 null（不猜）", () => {
  assert.equal(parseWindow("待定"), null);
  assert.equal(parseWindow("9月中旬"), null);
});

// ---------- 省级数据 ----------
console.log("\n省级报名数据");

const provRes = await validateProvinceSignup();
test("province-signup.json 通过校验", () => {
  assert.deepEqual(provRes.errors, []);
});

test("两个考试都覆盖 30+ 个省级窗口", () => {
  for (const ed of provRes.data.editions) {
    assert.ok(ed.windows.length >= 30, ed.editionId + " 只有 " + ed.windows.length + " 个");
  }
});

test("省级数据全部来自 L1 官方且已人工审核", () => {
  for (const ed of provRes.data.editions) {
    assert.equal(ed.trustTier, "L1");
    assert.equal(ed.reviewState, "human_approved");
  }
});


// ---------- AI 板块 ----------
console.log("\nAI 板块数据");

const aiData = await loadAi();
const aiRes = validateAi(aiData);

test("data/ai.json 通过校验（0 错误 0 警告）", () => {
  assert.deepEqual(aiRes.errors, []);
  assert.deepEqual(aiRes.warnings, []);
});

test("AI 条目数不少于 100", () => {
  assert.ok(aiRes.stats.items >= 100, "只有 " + aiRes.stats.items + " 条");
});

test("六个分组齐全", () => {
  assert.deepEqual(
    aiRes.groups.map((g) => g.id),
    ["contest", "job", "learn", "stack", "free", "feed"]
  );
});

test("每个条目都有 fit（谁该用/什么时候别用）", () => {
  for (const it of allItems(aiData)) {
    assert.ok(it.fit && it.fit.length >= 12, it.id + " 缺 fit");
  }
});

test("每个条目都标了能否直连与验证日期", () => {
  for (const it of allItems(aiData)) {
    assert.ok(["direct", "vpn", "login"].includes(it.access), it.id + " access 非法");
    assert.match(it.verified, /^\d{4}-\d{2}-\d{2}$/, it.id + " verified 非法");
  }
});

test("需代理条目占比不超过 25%", () => {
  assert.ok(aiRes.stats.vpnRatio <= 0.25, "占比 " + (aiRes.stats.vpnRatio * 100).toFixed(1) + "%");
});

test("适配器：chars 按码点计数", () => {
  assert.equal(chars("中文abc"), 5);
  assert.equal(chars("𠮷"), 1);
});

test("过期的验证日期会被判为 error（>180 天）", () => {
  const bad = JSON.parse(JSON.stringify(aiData));
  bad.groups[0].sections[0].items[0].verified = "2020-01-01";
  const r2 = validateAi(bad);
  assert.ok(r2.errors.some((e) => e.includes("已过期")), "应报过期错误：" + r2.errors.join("; "));
});

test("超过 90 天未复验标 \"待复验\"（warning + _stale）", () => {
  const bad = JSON.parse(JSON.stringify(aiData));
  const days = (n) => { const d = new Date(Date.now() - n * 86400000); return d.toISOString().slice(0, 10); };
  bad.groups[0].sections[0].items[0].verified = days(120);
  bad.groups[0].sections[0].items[1].verified = days(120);
  const r4 = validateAi(bad);
  assert.ok(r4.warnings.some((w) => w.includes("待复验") || w.includes("90 天")), "应报待复验警告：" + r4.warnings.join("; "));
  const it = bad.groups[0].sections[0].items[0];
  assert.equal(it._stale, true, "应标记 _stale");
});

test("fit 过短会被判为 error（<12 字）", () => {
  const bad = JSON.parse(JSON.stringify(aiData));
  bad.groups[0].sections[0].items[0].fit = "能用";
  const r3 = validateAi(bad);
  assert.ok(r3.errors.some((e) => e.includes("fit")), "应报 fit 错误：" + r3.errors.join("; "));
});

// ---------- 快速检索 ----------
console.log("\n快速检索");

const progFiles = await readProgramFiles();
const searchPrograms = [];
for (const { data } of progFiles) {
  for (const p of data.programs) {
    searchPrograms.push({ ...p, editions: p.editions.map((e) => ({ ...e, _published: isPublished(e) })) });
  }
}
const SEARCH_DOCS = buildDocs({ programs: searchPrograms, provinceData: provRes.data, aiGroups: aiData.groups });

test("norm 去标点、去空白、转小写", () => {
  assert.equal(norm("  大学英语四级 / CET-4 "), "大学英语四级cet4");
  assert.equal(norm("蓝桥杯（软件类）"), "蓝桥杯软件类");
  assert.equal(norm("A.I. 工具"), "ai工具");
  assert.equal(norm("ＫＡＧＧＬＥ"), "kaggle");
  assert.equal(norm("week-end~1"), "weekend1");
  assert.equal(norm(null), "");
});

test("tokens 按空白切分并各自归一化", () => {
  assert.deepEqual(tokens("软考  报名"), ["软考", "报名"]);
  assert.deepEqual(tokens("  "), []);
  assert.deepEqual(tokens("CET-4/六级"), ["cet4六级"]);
});

test("索引覆盖三类共 180+ 条", () => {
  assert.ok(SEARCH_DOCS.length >= 180, "只有 " + SEARCH_DOCS.length + " 条");
  const types = new Set(SEARCH_DOCS.map((d) => d.t));
  assert.deepEqual([...types].sort(), ["ai", "program", "province"]);
  for (const t of types) assert.ok(DOC_LABEL[t], t + " 缺标签");
});

test("索引链接指向真实页面与锚点", () => {
  for (const d of SEARCH_DOCS) {
    assert.ok(d.u, d.id + " 缺链接");
    if (d.t === "program") assert.match(d.u, /^p\/[a-z0-9-]+\.html$/);
    if (d.t === "province") assert.match(d.u, /^provinces\.html#pv-[a-z0-9-]+-[A-Za-z0-9]+$/);
    if (d.t === "ai") assert.match(d.u, /^ai\.html#ai-[a-z0-9-]+$/);
  }
});

test("索引里每条都预归一化了 n/nt/k", () => {
  for (const d of SEARCH_DOCS) {
    assert.equal(typeof d.n, "string");
    assert.ok(d.n.length > 0, d.id + " n 为空");
    assert.equal(d.n, norm(d.n), d.id + " n 未归一化");
    assert.equal(d.nt, norm(d.nt));
    assert.equal(d.k, norm(d.k));
  }
});

test("搜索：标题命中排在正文命中前", () => {
  const r = search(SEARCH_DOCS, "软考", 100);
  assert.ok(r.total > 0, "应命中软考");
  assert.ok(r.hits[0].doc.nt.includes("软考"), "第一条应是标题命中：" + r.hits[0].doc.ti);
  const scores = r.hits.map((h) => h.score);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a), "结果未按分数降序");
});

test("搜索：多个词必须同时命中", () => {
  const both = search(SEARCH_DOCS, "江苏 软考", 100);
  assert.equal(both.total, 1, "应只命中江苏软考那一个窗口，实际 " + both.total);
  assert.equal(both.hits[0].doc.id, "ruankao-32");
});

test("搜索：空词与纯标点返回 0 且不报错", () => {
  for (const q of ["", "   ", "/／、，。"]) assert.equal(search(SEARCH_DOCS, q).total, 0, JSON.stringify(q));
});

test("搜索：limit 生效", () => {
  const r = search(SEARCH_DOCS, "软考", 3);
  assert.ok(r.total > 3);
  assert.equal(r.hits.length, 3);
});

test("搜索：不区分大小写与全半角标点", () => {
  assert.equal(search(SEARCH_DOCS, "CET-4").total, search(SEARCH_DOCS, "cet4").total);
  assert.ok(search(SEARCH_DOCS, "kaggle").total > 0);
  assert.equal(search(SEARCH_DOCS, "ＫＡＧＧＬＥ").total, search(SEARCH_DOCS, "kaggle").total, "全角字母应折成半角");
});

test("标签索引：cover 全部标签，slug 唯一且纯 ASCII", () => {
  const idx = buildTagIndex(searchPrograms);
  assert.ok(idx.length >= 20, "只有 " + idx.length + " 个标签");
  const slugs = idx.map((t) => t.slug);
  assert.equal(new Set(slugs).size, slugs.length, "slug 有重复");
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/, "slug 非 ASCII：" + s);
  for (const t of idx) {
    assert.equal(t.count, t.items.length, t.tag + " count 与 items 不符");
    assert.ok(t.count > 0);
  }
  const flat = new Set(searchPrograms.flatMap((p) => p.tags ?? []));
  assert.equal(idx.length, flat.size, "标签数不等");
});

test("浏览器端 quick.js 的归一化与 lib/search.mjs 一致", () => {
  const src = readFileSync(path.join(process.cwd(), "site", "assets", "quick.js"), "utf8");
  const m = src.match(/var PUNCT = (\/.*?\/[gimsuy]*);/);
  assert.ok(m, "quick.js 里找不到 PUNCT 正则");
  const re = new RegExp(m[1].slice(1, m[1].lastIndexOf("/")), "g");
  const cases = ["大学英语四级 / CET-4", "蓝桥杯（软件类）", "A.I. 工具·推荐", "《数模》「美赛」", "  a  b  ", "！？；：", "KAGGLE_平台"];
  for (const c of cases) {
    assert.equal(String(c).toLowerCase().replace(re, ""), norm(c), "归一化不一致：" + c);
  }
});

console.log("\n\x1b[1m" + pass + " 通过, " + fail + " 失败\x1b[0m\n");
process.exit(fail > 0 ? 1 : 0);