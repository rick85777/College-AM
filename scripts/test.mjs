#!/usr/bin/env node
/**
 * 零依赖测试。断言用 node:assert/strict。
 */
import assert from "node:assert/strict";
import { buildCalendar, __internal as icsInternal } from "../lib/ics.mjs";
import { daysUntil, keyDates } from "../lib/load.mjs";
import { validateFile, MANUAL_ONLY_FIELDS } from "../lib/schema.mjs";
import { extractRows, parseWindow } from "./fetch.mjs";
import { validateProvinceSignup } from "../lib/province.mjs";
import { loadAi, validateAi, chars, allItems } from "../lib/ai.mjs";

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

console.log("\n\x1b[1m" + pass + " 通过, " + fail + " 失败\x1b[0m\n");
process.exit(fail > 0 ? 1 : 0);