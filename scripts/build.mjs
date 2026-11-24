#!/usr/bin/env node
/**
 * 静态站生成器。零依赖。
 * 输入：data/  |  输出：dist/
 */
import { mkdir, writeFile, rm, readFile, cp } from "node:fs/promises";
import zlib from "node:zlib";
import path from "node:path";
import { readProgramFiles, readMajors, flatten, isPublished, keyDates, daysUntil } from "../lib/load.mjs";
import { buildCalendar } from "../lib/ics.mjs";
import { validateProvinceSignup } from "../lib/province.mjs";
import { loadAi } from "../lib/ai.mjs";
import { renderAiPage } from "../lib/ai-page.mjs";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE = path.join(ROOT, "site");
const NOW = new Date();
const BUILD_STAMP = NOW.toISOString();

// ---------------- 工具 ----------------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const KIND_LABEL = { cert: "考证", contest: "竞赛", job: "招聘" };
const LEVEL_LABEL = { international: "国际", national: "国家级", provincial: "省级", school: "校级" };
const TIER_LABEL = { L1: "L1 官方", L2: "L2 半官方", L3: "L3 媒体", L4: "L4 投稿" };
const WEIGHT_LABEL = { core: "必看", recommended: "推荐", adjacent: "沾边" };

function fmtDate(d) {
  if (!d) return "未公布";
  const [y, m, day] = d.split("-");
  return y + " 年 " + Number(m) + " 月 " + Number(day) + " 日";
}

function fmtRange(d, end) {
  if (!d) return "未公布";
  if (!end || end === d) return fmtDate(d);
  const [y1, m1, d1] = d.split("-");
  const [y2, m2, d2] = end.split("-");
  if (y1 === y2 && m1 === m2) return y1 + " 年 " + Number(m1) + " 月 " + Number(d1) + "-" + Number(d2) + " 日";
  if (y1 === y2) return y1 + " 年 " + Number(m1) + " 月 " + Number(d1) + " 日 - " + Number(m2) + " 月 " + Number(d2) + " 日";
  return fmtDate(d) + " - " + fmtDate(end);
}

function fmtShort(d) {
  if (!d) return "—";
  const [, m, day] = d.split("-");
  return Number(m) + "/" + Number(day);
}

function fmtStamp(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
}

function layout({ title, description, body, current = "", base = "" }) {
  const nav = [
    ["index.html", "首页"],
    ["calendar.html", "日历"],
    ["certs.html", "考证"],
    ["contests.html", "竞赛"],
    ["ai.html", "AI"],
    ["majors.html", "专业频道"],
    ["zhaopin.html", "招聘跳转"],
    ["provinces.html", "省级窗口"],
    ["sources.html", "数据来源"],
  ];
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf9f6">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#13181b">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="${base}assets/style.css">
<link rel="alternate" type="text/calendar" title="College-AM 全部日程" href="${base}calendar/all.ics">
<link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
<link rel="manifest" href="${base}manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="College-AM">
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="brand" href="${base}index.html"><span class="dot"></span>College-AM</a>
    <nav class="nav">
      ${nav.map(([href, label]) => `<a href="${base}${href}"${current === href ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
    </nav>
  </div>
</header>
<main class="wrap">
${body}
</main>
${footer(base)}
<script>
if ("serviceWorker" in navigator) {
  addEventListener("load", () => navigator.serviceWorker.register("${base}sw.js").catch(() => {}));
}
</script>
</body>
</html>`;
}

function footer(base) {
  return `<footer>
  <div class="wrap">
    <div><strong>College-AM</strong> · 大学生考证与竞赛时间轴 · 开源项目（AGPL-3.0）</div>
    <div style="margin-top:6px">
      <a href="${base}sources.html">数据来源与可信等级</a> ·
      <a href="${base}about.html">关于与免责声明</a> ·
      <a href="${base}calendar/all.ics">订阅全部日程 (.ics)</a> ·
      <a href="https://github.com/college-am/college-am">GitHub</a>
    </div>
    <div class="disclaimer">
      本站只做信息索引与原文跳转，<strong>不转载公告全文、不提供报名代理、不接收简历、不参与任何招聘流程</strong>。
      所有报名时间、费用、报考资格均以官方原文与本校通知为准。发现错误请
      <a href="${base}about.html#fix">提交更正</a>，我们 24 小时内响应。
    </div>
    <div style="margin-top:10px;font-family:var(--mono);font-size:11.5px">构建于 ${BUILD_STAMP} · 共 ${STATS.programs} 个条目 / ${STATS.editions} 个届次</div>
  </div>
</footer>`;
}

// ---------------- 数据准备 ----------------
const files = await readProgramFiles();
const majors = await readMajors();
const provinceRes = await validateProvinceSignup(ROOT);
if (provinceRes.errors.length) {
  console.error("省级报名数据校验失败：");
  for (const e of provinceRes.errors) console.error("  " + e);
  process.exit(1);
}
const provinceData = provinceRes.data;
const rows = flatten(files);

// 只发布已审核的
const published = rows.filter((r) => isPublished(r.edition));

// 计算每个条目的"下一个关键日期"
function nextMilestone(edition) {
  const dates = keyDates(edition).filter((d) => daysUntil(d.date, NOW) >= 0);
  return dates[0] ?? null;
}

const programs = [];
for (const { data } of files) {
  for (const p of data.programs) {
    const eds = p.editions.map((e) => ({ ...e, _published: isPublished(e) }));
    programs.push({ ...p, editions: eds });
  }
}

// 哪些条目会有 .ics 文件：必须有已发布届次，且至少一个未来（或 30 天内）的节点
const PROGRAMS_WITH_ICS = new Set();
for (const p of programs) {
  for (const e of p.editions) {
    if (!e._published) continue;
    if (keyDates(e).some((k) => daysUntil(k.date, NOW) >= -30)) {
      PROGRAMS_WITH_ICS.add(p.id);
      break;
    }
  }
}

const STATS = {
  programs: programs.length,
  editions: rows.length,
  publishedEditions: published.length,
  pendingEditions: rows.length - published.length,
};

// 未来 120 天的关键节点
const upcoming = [];
for (const r of published) {
  for (const k of keyDates(r.edition)) {
    const d = daysUntil(k.date, NOW);
    if (d >= 0 && d <= 400) {
      upcoming.push({ ...k, days: d, program: r.program, edition: r.edition });
    }
  }
}
upcoming.sort((a, b) => a.date.localeCompare(b.date));

// 过去 12 个月内已经结束的节点，按月分组（用于"看清一年两轮的节奏"）
const past = [];
for (const r of published) {
  for (const k of keyDates(r.edition)) {
    const d = daysUntil(k.date, NOW);
    if (d < 0 && d >= -365) {
      past.push({ ...k, days: d, program: r.program, edition: r.edition });
    }
  }
}
past.sort((a, b) => b.date.localeCompare(a.date));
const pastMonths = [];
for (const u of past) {
  const key = u.date.slice(0, 7);
  let m = pastMonths.find((x) => x.key === key);
  if (!m) {
    m = { key, label: u.date.slice(0, 4) + " 年 " + Number(u.date.slice(5, 7)) + " 月", items: [] };
    pastMonths.push(m);
  }
  m.items.push(u);
}

const soon = upcoming.filter((u) => u.days <= 60);

// ---------------- 页面：首页 ----------------
const heroBody = `
<section class="hero" style="border-top:0">
  <h1>别错过任何一个<br>报名截止日。</h1>
  <p>College-AM 把四六级、计算机等级、教资、软考、数模、国创赛这些散落在 6 个不同官网里的关键日期，收进一份可以订阅的日历。</p>
  <p style="color:var(--ink-3);font-size:13.5px;margin-top:10px">
    每条都标注来源链接、抓取时间与可信等级。不写"预计"，不猜日期——官方没公布就显示"未公布"。<br>
    <strong style="color:var(--ink-2)">连"同一场考试各省报名时间差 67 天"这种事，也逐省列出来了。</strong>
  </p>
  <div class="cta">
    <a class="btn primary" href="calendar/all.ics">订阅全部日程 (.ics)</a>
    <a class="btn" href="calendar.html">看看日历 →</a>
  </div>
  <div class="meta">最后构建 ${BUILD_STAMP.slice(0, 10)} · ${STATS.programs} 个条目 · ${STATS.publishedEditions} 个已核实届次</div>
</section>
`;

// 计算省级报名窗口的差异幅度（用于首页卖点）
const provinceHighlights = (provinceData?.editions ?? []).map((ed) => {
  const prog = programs.find((p) => p.id === ed.programId);
  const ws = ed.windows;
  if (!ws.length) return null;
  const starts = ws.map((w) => w.start).sort();
  const spread = Math.round((new Date(starts[starts.length - 1]) - new Date(starts[0])) / 86400000);
  return { prog, count: ws.length, earliest: starts[0], latest: starts[starts.length - 1], spread };
}).filter(Boolean);

const provinceTeaser = provinceHighlights.length
  ? `
<section>
  <h2>最容易被忽略的信息差<span class="sub">各省报名时间不一样</span></h2>
  ${provinceHighlights
    .map(
      (h) => `<a class="card" href="provinces.html" style="display:block;margin-bottom:10px">
      <div class="row">
        <span class="name">${esc(h.prog.name)}</span>
        <span class="date">${h.count} 个省</span>
      </div>
      <div class="desc">
        最早的省 <strong>${h.earliest}</strong> 就开始，最晚的省 <strong>${h.latest}</strong> 才开始——
        <strong style="color:var(--accent)">同一场考试，报名起点相差 ${h.spread} 天</strong>。
        只看全国通知，会直接错过。
      </div>
    </a>`
    )
    .join("")}
  <p style="margin-top:6px;font-size:13px"><a href="provinces.html">查看逐省完整表格 →</a></p>
</section>`
  : "";

const soonBody = soon.length
  ? `
<section>
  <h2>即将到期<span class="sub">未来 60 天 · 共 ${soon.length} 个节点</span></h2>
  <div class="countdown">
    ${soon
      .slice(0, 12)
      .map(
        (u) => `<a class="cd-item ${u.days <= 7 ? "urgent" : u.days <= 30 ? "soon" : ""}" href="p/${u.program.id}.html">
      <div class="cd-days"><span class="n">${u.days}</span><span class="u">天后</span></div>
      <div class="cd-main">
        <div class="t">${esc(u.program.name)}<span class="tag" style="margin-left:8px">${u.label}</span></div>
        <div class="s">${esc(u.program.organizer)} · ${LEVEL_LABEL[u.program.level] ?? ""}</div>
      </div>
      <div class="cd-when">${u.end && u.end !== u.date ? u.date + " ~ " + u.end : u.date}</div>
    </a>`
      )
      .join("")}
  </div>
  ${soon.length > 12 ? `<p style="margin-top:12px;font-size:13px"><a href="calendar.html">查看全部 ${upcoming.length} 个节点 →</a></p>` : ""}
</section>`
  : `
<section>
  <h2>即将到期</h2>
  <div class="empty">未来 60 天暂无已核实的报名或考试节点。日历会在官方发布后更新。</div>
</section>
`;

const channelsBody = `
<section>
  <h2>按你的方向看<span class="sub">按职业出口划分，不是按学院</span></h2>
  <div class="channels">
    ${majors.channels
      .map((c) => {
        const list = programs.filter((p) => p.majors.some((m) => m.id === c.id && m.weight === "core"));
        return `<a class="channel" href="m/${c.id}.html">
        <div class="n">${esc(c.name)}</div>
        <div class="c">${list.length} 个必看条目</div>
        <div class="i">${esc(c.intro)}</div>
      </a>`;
      })
      .join("")}
  </div>
</section>
`;

const recentBody = `
<section>
  <h2>全部条目<span class="sub">${programs.length} 个</span></h2>
  <div class="list two">
    ${programs
      .slice()
      .sort((a, b) => {
        const na = a.editions.map(nextMilestone).filter(Boolean)[0];
        const nb = b.editions.map(nextMilestone).filter(Boolean)[0];
        if (na && nb) return na.date.localeCompare(nb.date);
        return na ? -1 : nb ? 1 : 0;
      })
      .map((p) => {
        const nm = p.editions.map(nextMilestone).filter(Boolean)[0];
        const pub = p.editions.filter((e) => e._published).length;
        return `<a class="card" href="p/${p.id}.html">
        <div class="row">
          <span class="name">${esc(p.name)}</span>
          <span class="date">${nm ? fmtShort(nm.date) : "—"}</span>
        </div>
        <div class="desc">${esc(p.summary.slice(0, 54))}${p.summary.length > 54 ? "…" : ""}</div>
        <div class="tags">
          <span class="tag accent">${KIND_LABEL[p.kind]}</span>
          ${p.tags.slice(0, 2).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
          ${pub === 0 ? '<span class="tag warn">待核实</span>' : ""}
        </div>
      </a>`;
      })
      .join("")}
  </div>
</section>
`;

const indexHtml = layout({
  title: "College-AM · 大学生考证与竞赛时间轴",
  description: "把散落在 6 个官网的四六级、计算机等级、教资、软考、数模、国创赛关键日期，收进一份可订阅的日历。每条都有来源链接与可信等级。",
  body: heroBody + soonBody + provinceTeaser + channelsBody + recentBody,
});

// ---------------- 页面：列表页 ----------------
function listPage(kind, title, description) {
  const list = programs.filter((p) => p.kind === kind);
  list.sort((a, b) => a.name.localeCompare(b.name, "zh"));
  return layout({
    title: title + " · College-AM",
    description,
    current: kind === "cert" ? "certs.html" : "contests.html",
    body: `
<section class="hero" style="border-top:0;padding-bottom:16px">
  <h1>${esc(title)}</h1>
  <p>${esc(description)}</p>
</section>
<section>
  <div class="list two">
  ${list
    .map((p) => {
      const nm = p.editions
        .filter((e) => e._published)
        .map((e) => keyDates(e).find((d) => daysUntil(d.date, NOW) >= 0))
        .filter(Boolean)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      return `<a class="card" href="p/${p.id}.html">
      <div class="row"><span class="name">${esc(p.name)}</span><span class="date">${nm ? fmtShort(nm.date) : "—"}</span></div>
      <div class="desc">${esc(p.summary.slice(0, 60))}${p.summary.length > 60 ? "…" : ""}</div>
      <div class="tags">
        <span class="tag">${esc(p.organizer)}</span>
        ${p.tags.slice(0, 2).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
      </div>
    </a>`;
    })
    .join("")}
  </div>
</section>`,
  });
}

// ---------------- 页面：专业频道 ----------------
function majorPage(c) {
  const core = programs.filter((p) => p.majors.some((m) => m.id === c.id && m.weight === "core"));
  const rec = programs.filter((p) => p.majors.some((m) => m.id === c.id && m.weight === "recommended"));
  const adj = programs.filter((p) => p.majors.some((m) => m.id === c.id && m.weight === "adjacent"));

  const renderList = (arr, emptyText) =>
    arr.length
      ? `<div class="list two">${arr
          .map(
            (p) => `<a class="card" href="../p/${p.id}.html">
        <div class="row"><span class="name">${esc(p.name)}</span><span class="date">${KIND_LABEL[p.kind]}</span></div>
        <div class="desc">${esc(p.summary.slice(0, 56))}${p.summary.length > 56 ? "…" : ""}</div>
      </a>`
          )
          .join("")}</div>`
      : `<div class="empty">${emptyText}</div>`;

  return layout({
    title: c.name + " 该关注什么 · College-AM",
    description: c.intro,
    base: "../",
    current: "majors.html",
    body: `
<div class="detail-head">
  <h1>${esc(c.name)}</h1>
  <p class="sub">${esc(c.intro)}</p>
  <p style="color:var(--ink-3);font-size:13px;margin-top:10px">
    别名：${c.aliases.map(esc).join(" · ")}
  </p>
</div>
<section>
  <h2>必看<span class="sub">${core.length} 个 · 本方向绕不开的</span></h2>
  ${renderList(core, "这个方向暂时还没有标记为必看的条目。")}
</section>
<section>
  <h2>推荐<span class="sub">${rec.length} 个</span></h2>
  ${renderList(rec, "暂无推荐条目。")}
</section>
${adj.length ? `<section><h2>沾边<span class="sub">${adj.length} 个</span></h2>${renderList(adj, "")}</section>` : ""}
<section>
  <h2>订阅这个方向</h2>
  <p style="font-size:13.5px;color:var(--ink-2)">把这个频道的关键日期导入手机日历，到点自动提醒。</p>
  <div class="cta"><a class="btn primary" href="../calendar/major-${c.id}.ics">订阅 .ics</a></div>
</section>`,
  });
}

// ---------------- 页面：条目详情 ----------------
function programPage(p) {
  const eds = p.editions
    .filter((e) => e._published)
    .sort((a, b) => (b.year - a.year) || a.round.localeCompare(b.round));
  const pendingEds = p.editions.filter((e) => !e._published);

  const current = eds[0];
  const nm = current ? nextMilestone(current) : null;

  const rowsHtml = eds
    .map((e) => {
      const dates = keyDates(e);
      return `<tr>
      <td class="mono">${e.year} ${e.round === "h1" ? "上半年" : e.round === "h2" ? "下半年" : e.round === "annual" ? "年度" : "特别批次"}</td>
      <td>${dates.length ? dates.map((d) => `<div style="margin-bottom:4px"><span class="mono">${fmtRange(d.date, d.end)}</span> <span class="tag">${d.label}</span></div>`).join("") : '<span style="color:var(--ink-3)">未公布</span>'}</td>
      <td>${e.feeCny === 0 ? "免费" : e.feeCny != null ? e.feeCny + " 元" : '<span style="color:var(--ink-3)">以官方为准</span>'}</td>
      <td>${e.reviewState === "human_approved" ? '<span class="state approved">已核实</span>' : '<span class="state pending">待核实</span>'}</td>
    </tr>`;
    })
    .join("");

  const majorsHtml = p.majors
    .map((m) => {
      const c = majors.channels.find((x) => x.id === m.id);
      return `<a class="tag accent" href="../m/${m.id}.html">${esc(c?.name ?? m.id)} · ${WEIGHT_LABEL[m.weight]}</a>`;
    })
    .join(" ");

  return layout({
    title: p.name + " · College-AM",
    description: p.summary,
    base: "../",
    body: `
<div class="detail-head">
  <h1>${esc(p.name)}</h1>
  <p class="sub">${esc(p.summary)}</p>
  <div class="cta">
    ${PROGRAMS_WITH_ICS.has(p.id) ? `<a class="btn primary" href="../calendar/p-${p.id}.ics">订阅此条目 (.ics)</a>` : ""}
    <a class="btn" href="${esc(p.officialUrl)}" target="_blank" rel="noopener nofollow">前往官网站 ↗</a>
  </div>
</div>

<section>
  <h2>关键日期</h2>
  ${eds.length ? `<table class="timeline"><thead><tr><th>届次</th><th>日期</th><th>费用</th><th>状态</th></tr></thead><tbody>${rowsHtml}</tbody></table>` : '<div class="empty">尚未有已核实的届次信息。</div>'}
  ${pendingEds.length ? `<p style="margin-top:12px;font-size:13px;color:var(--warn)">另有 ${pendingEds.length} 个届次待人工核实，核实前不展示具体日期。</p>` : ""}
</section>

<section>
  <h2>信息来源</h2>
  ${eds
    .map(
      (e) => `<div class="prov${e.reviewState === "human_approved" ? "" : " draft"}" style="margin-bottom:10px">
    <span class="line"><dt>来源</dt> <dd>${esc(p.organizer)} ｜ <span class="tag ${e.trustTier === "L1" ? "accent" : "warn"}">${TIER_LABEL[e.trustTier]}</span></dd></span>
    <span class="line"><dt>原文</dt> <dd><a href="${esc(e.noticeUrl ?? e.sourceUrl)}" target="_blank" rel="noopener nofollow">${esc(e.noticeUrl ?? e.sourceUrl)} ↗</a></dd></span>
    <span class="line"><dt>抓取时间</dt> <dd>${fmtStamp(e.fetchedAt)} (UTC+8)</dd></span>
    <span class="line"><dt>人工复核</dt> <dd>${e.verifiedAt ? fmtStamp(e.verifiedAt) : "未复核"}</dd></span>
    <span class="line"><dt>可信等级</dt> <dd>${e.reviewState === "human_approved" ? "A · 官方原文直证" : "待核验 · 请以官方原文为准"}</dd></span>
  </div>`
    )
    .join("")}
</section>

<section>
  <h2>适用方向</h2>
  <div style="display:flex;gap:8px;flex-wrap:wrap">${majorsHtml}</div>
</section>

${current?.notes?.length ? `<section><h2>说明</h2><ul style="font-size:13.5px;color:var(--ink-2);padding-left:20px;margin:0">${current.notes.map((n) => "<li style='margin-bottom:6px'>" + esc(n) + "</li>").join("")}</ul></section>` : ""}

<section>
  <h2>发现信息有误？</h2>
  <p style="font-size:13.5px;color:var(--ink-2)">本站每条信息都保留了官方原文链接。如果你发现日期或费用与官方不符，请附上官方链接提交更正，我们 24 小时内处理。</p>
  <div class="cta"><a class="btn" href="https://github.com/college-am/college-am/issues/new?template=data-error.yml&title=[纠错]+" target="_blank" rel="noopener">提交更正 ↗</a></div>
</section>`,
  });
}

// ---------------- 页面：日历 ----------------
const calEvents = [];
for (const r of published) {
  for (const k of keyDates(r.edition)) {
    const d = daysUntil(k.date, NOW);
    if (d < -30) continue; // 30 天前的旧事件不再进日历
    calEvents.push({
      uid: r.edition.id + "-" + k.kind,
      start: k.date,
      summary: "【" + k.label + "】" + r.program.name,
      description: r.program.organizer + "\n官网：" + r.program.officialUrl + "\n来源：" + (r.edition.noticeUrl ?? r.edition.sourceUrl) + "\n可信等级：" + r.edition.trustTier + (r.edition.reviewState === "human_approved" ? "（已人工核实）" : "（待核实）"),
      url: r.edition.noticeUrl ?? r.edition.sourceUrl,
      alarmDays: k.kind === "signup_end" ? [7, 3, 1] : k.kind === "event_start" ? [7, 1] : [1],
    });
  }
}

const calendarPage = layout({
  title: "日历 · College-AM",
  description: "按月份查看所有考证与竞赛的关键日期，支持导出 .ics 订阅到手机日历。",
  current: "calendar.html",
  body: `
<section class="hero" style="border-top:0">
  <h1>日历</h1>
  <p>已核实的全部关键日期，按月排列。<b>灰色是已经过去的</b>，保留是为了让你看清一年两轮的节奏。订阅后到点自动提醒，不用记。</p>
  <div class="cta">
    <a class="btn primary" href="calendar/all.ics">订阅全部 (.ics)</a>
    <a class="btn" href="calendar/signup-only.ics">只订阅报名截止</a>
  </div>
</section>

<section>
  <h2>即将到来<span class="sub">${upcoming.length} 个节点</span></h2>
  <div class="countdown">
  ${upcoming
    .slice(0, 80)
    .map(
      (u) => `<a class="cd-item ${u.days <= 7 ? "urgent" : u.days <= 30 ? "soon" : ""}" href="p/${u.program.id}.html">
    <div class="cd-days"><span class="n">${u.days}</span><span class="u">天后</span></div>
    <div class="cd-main">
      <div class="t">${esc(u.program.name)}<span class="tag" style="margin-left:8px">${u.label}</span></div>
      <div class="s">${esc(u.program.organizer)}</div>
    </div>
    <div class="cd-when">${u.date}</div>
  </a>`
    )
    .join("")}
  </div>
</section>

${pastMonths.length === 0 ? "" : `
<section>
  <h2>已经结束<span class="sub">过去 12 个月，${past.length} 个节点</span></h2>
  <p style="margin:-6px 0 14px;font-size:13px;color:var(--ink-3)">为什么保留：四六级、NCRE、教资都是一年两轮——看完上一轮的时间点，才知道下一轮大概什么时候开始报名。</p>
  ${pastMonths
    .map(
      (m) => `
  <h3 style="font-size:13px;color:var(--ink-3);font-weight:600;margin:20px 0 8px;letter-spacing:.04em">${m.label}</h3>
  <div class="countdown past">
  ${m.items
    .map(
      (u) => `<a class="cd-item past" href="p/${u.program.id}.html">
    <div class="cd-days"><span class="n">${u.date.slice(8, 10)}</span><span class="u">${u.date.slice(5, 7)} 月</span></div>
    <div class="cd-main">
      <div class="t">${esc(u.program.name)}<span class="tag" style="margin-left:8px">${u.label}</span></div>
      <div class="s">${esc(u.program.organizer)}</div>
    </div>
    <div class="cd-when">已结束</div>
  </a>`
    )
    .join("")}
  </div>`
    )
    .join("")}
</section>`}
`,
});


// ---------------- 招聘跳转（只做外链索引，绝不做投递闭环） ----------------
// 合规依据见 docs/research/02-source-reliability.md §4.3：
// 《网络招聘服务管理规定》——提供投递/简历/撮合才需人力资源服务许可证；
// 本站只做<a>跳转，页面上物理不存在站内简历表单。
const JOB_PORTALS = [
  {
    group: "官方 / 政策性",
    note: "国家平台，岗位信息由高校与用人单位直接上报，真实性最高。",
    links: [
      { name: "国家大学生就业服务平台", url: "https://www.ncss.cn/", who: "教育部", desc: "原 24365 平台。省级、校级就业网可按学校切换，校招主渠道。" },
      { name: "国聘", url: "https://www.iguopin.com/", who: "国务院国资委等", desc: "央企、国企、事业单位校招与社会招聘的集中发布口。" },
      { name: "中国研究生招生信息网", url: "https://yz.chsi.com.cn/", who: "教育部", desc: "考研报名、调剂、招生简章的唯一官方入口。不是招聘，但属于同一条升学路径。" },
    ],
  },
  {
    group: "商业平台",
    note: "岗位量大、更新快，但信息质量由平台方把持，本站不对其内容负责。",
    links: [
      { name: "前程无忧", url: "https://www.51job.com/", who: "前程无忧", desc: "校招与社招并行，宣讲会信息较全。" },
      { name: "BOSS 直聘", url: "https://www.zhipin.com/", who: "看准科技", desc: "直接与用人方沟通，适合找实习。" },
      { name: "实习僧", url: "https://www.shixiseng.com/", who: "实习僧", desc: "大学生实习与校招为主，互联网岗位集中。" },
      { name: "应届生求职网", url: "https://www.yingjiesheng.com/", who: "应届生求职网", desc: "校招笔试面试经验与时间线整理。" },
    ],
  },
];


// ---------------- 页面：招聘跳转 ----------------
function zhaopinPage() {
  return layout({
    title: "招聘与升学跳转 · College-AM",
    description: "只做跳转，不做投递。国家大学生就业服务平台、国聘、研招网等官方入口，以及主流商业招聘平台。",
    current: "zhaopin.html",
    body: `
<section class="hero">
  <h1>招聘跳转</h1>
  <p>这里<b>只有链接，没有投递表单</b>。所有岗位信息、简历投递都在原站完成——我们不收集简历、不代收职位、不参与撮合。</p>
  <div class="cta">
    <a class="btn primary" href="certs.html">看考证时间 →</a>
    <a class="btn" href="contests.html">看竞赛时间 →</a>
  </div>
  <div class="meta">为什么只做外链：见页面底部「合规说明」</div>
</section>

${JOB_PORTALS.map(
  (g) => `
<section>
  <h2>${esc(g.group)}</h2>
  <p style="margin:-6px 0 14px;font-size:13px;color:var(--ink-3)">${esc(g.note)}</p>
  <div class="list two">
  ${g.links
    .map(
      (l) => `<a class="card" href="${esc(l.url)}" target="_blank" rel="noopener nofollow" style="display:block">
      <div class="row">
        <span class="name">${esc(l.name)} ↗</span>
      </div>
      <div class="desc">${esc(l.desc)}</div>
      <div style="margin-top:8px"><span class="tag">${esc(l.who)}</span></div>
    </a>`
    )
    .join("")}
  </div>
</section>`
).join("")}

<section>
  <h2>合规说明</h2>
  <div class="prov">
    <span class="line"><dt>为什么没有投递按钮</dt> <dd>《网络招聘服务管理规定》（人社部令第 44 号）规定，从事网络招聘服务（发布招聘信息、撮合、代收简历）需取得<strong>人力资源服务许可证</strong>。本站只做外链跳转，不提供上述任何一项，因此不构成该许可事项。</dd></span>
    <span class="line"><dt>我们不做什么</dt> <dd>不收集简历 · 不代收职位 · 不做站内申请 · 不做付费发岗 · 不撮合面试</dd></span>
    <span class="line"><dt>你能做什么</dt> <dd>点进去，在原站完成一切操作。遇到可疑岗位，请以原站与用人单位官方渠道为准。</dd></span>
  </div>
</section>

<section>
  <h2>更实际的一条建议</h2>
  <p style="font-size:13.5px;color:var(--ink-2);line-height:1.85">
    校招真正的信息差不在"哪个平台"，而在<b>你学校就业信息网发布的第一批定向宣讲</b>。
    先去 <a href="https://www.ncss.cn/" target="_blank" rel="noopener nofollow">ncss.cn</a> 找到你学校的就业网入口，把它设成浏览器书签——
    这比在任何聚合站刷新都有效。
  </p>
</section>`,
  });
}

// ---------------- 页面：AI 板块（做聚合，不做推荐） ----------------
// 依据 docs/research/09-ai-ia.md：109 条 / 6 组 / 21 节，9 个必填字段。
// 渲染逻辑抽到 lib/ai-page.mjs，数据与校验在 data/ai.json + lib/ai.mjs。
const AI = await loadAi();
const aiHtml = renderAiPage(AI, { layout, esc });

// ---------------- 页面：数据来源 ----------------
const sourcesPage = layout({
  title: "数据来源与可信等级 · College-AM",
  description: "本站所有信息的来源清单、可信等级、抓取时间与失效状态。这是判断本站是否可信的唯一依据。",
  current: "sources.html",
  body: `
<section class="hero" style="border-top:0">
  <h1>数据来源</h1>
  <p>这一页是本站可信度的全部依据。每一条信息都能追溯到一个官方页面，并标明了抓取时间与人工复核状态。</p>
</section>

<section>
  <h2>可信等级如何划分</h2>
  <table class="timeline">
    <thead><tr><th>等级</th><th>定义</th><th>采信规则</th></tr></thead>
    <tbody>
      <tr><td class="mono">L1 官方</td><td>主办方 / 主管部委一手发布口</td><td>唯一可直接支撑"报名时间/费用/考试日期"的层级</td></tr>
      <tr><td class="mono">L2 半官方</td><td>高校教务处、省级考试院</td><td>只能佐证，不能单独定案，必须回链 L1</td></tr>
      <tr><td class="mono">L3 媒体</td><td>可信媒体报道</td><td>仅作线索，不作事实来源</td></tr>
      <tr><td class="mono">L4 投稿</td><td>用户纠错与补充</td><td>永不作为唯一来源，必须由 L1/L2 背书</td></tr>
    </tbody>
  </table>
</section>

<section>
  <h2>信源清单<span class="sub">${files.length} 个数据文件 / ${programs.length} 个条目</span></h2>
  <table class="timeline">
    <thead><tr><th>条目</th><th>主办方</th><th>等级</th><th>最近抓取</th><th>状态</th></tr></thead>
    <tbody>
    ${programs
      .map((p) => {
        const e = p.editions.find((x) => x._published) ?? p.editions[0];
        const st = p.editions.some((x) => x._published) ? "已核实" : "待核实";
        return `<tr>
        <td><a href="p/${p.id}.html">${esc(p.name)}</a></td>
        <td>${esc(p.organizer)}</td>
        <td><span class="tag ${e.trustTier === "L1" ? "accent" : "warn"}">${e.trustTier}</span></td>
        <td class="mono">${fmtStamp(e.fetchedAt).slice(0, 10)}</td>
        <td>${st === "已核实" ? '<span class="state approved">已核实</span>' : '<span class="state pending">待核实</span>'}</td>
      </tr>`;
      })
      .join("")}
    </tbody>
  </table>
</section>

<section>
  <h2>我们明确不做的事</h2>
  <ul style="font-size:13.5px;color:var(--ink-2);padding-left:20px;line-height:1.9">
    <li><strong>不转载公告全文</strong>：只保留标题、自写摘要（≤120 字）与原文链接。</li>
    <li><strong>不镜像附件</strong>：考试大纲、职位表等 PDF 一律只存外链。</li>
    <li><strong>不提供报名代理</strong>：所有报名都在官方系统完成。</li>
    <li><strong>不收录个人信息</strong>：获奖名单、录用公示类内容一律只做外链，绝不入库。</li>
    <li><strong>不做全自动发布</strong>：报名起止、费用、报考资格这些字段永远需要人工确认。</li>
  </ul>
</section>`,
});

// ---------------- 页面：关于 ----------------
const aboutPage = layout({
  title: "关于 · College-AM",
  description: "College-AM 是一个开源的大学生考证与竞赛信息索引项目。",
  current: "about.html",
  body: `
<section class="hero" style="border-top:0">
  <h1>关于 College-AM</h1>
  <p>一个把散落的考证与竞赛关键日期收进一份日历的开源项目。</p>
</section>

<section>
  <h2>为什么做这个</h2>
  <p>"我这个专业，未来三个月有哪些证和比赛要报名？"——这个问题，现在要跳 6 个互不相通的官网才能回答：中国教育考试网（四六级/计算机/教资）、软考官网、人事考试网、学信网、本校教务处、以及各个主办方官网。</p>
  <p>College-AM 只做一件事：把这些日期结构化，做成一份可以订阅的日历，并且让每一条都能点回官方原文。</p>
</section>

<section>
  <h2>三条原则</h2>
  <h3>1. 宁可显示"未公布"，也不猜日期</h3>
  <p>官方没写日期，我们就显示"未公布"。绝不根据往年规律推算一个看起来合理的日期——那是最容易误导人的。</p>
  <h3>2. 每条信息都能追溯到源头</h3>
  <p>每个条目都带来源链接、抓取时间、可信等级、人工复核时间。你可以自己点进去核对。</p>
  <h3>3. 只做索引，不做闭环</h3>
  <p>不转载全文、不代理报名、不收简历、不做投递。我们只负责告诉你"什么时候、去哪报"，剩下的事在官网完成。</p>
</section>

<section id="fix">
  <h2>发现错误？</h2>
  <p>请带上官方链接提交更正。核实为错会在 24 小时内下架该字段，并记录更正日志。</p>
  <div class="cta">
    <a class="btn" href="https://github.com/college-am/college-am/issues/new?template=data-error.yml" target="_blank" rel="noopener">提交更正 ↗</a>
    <a class="btn" href="https://github.com/college-am/college-am" target="_blank" rel="noopener">GitHub ↗</a>
  </div>
</section>

<section>
  <h2>技术</h2>
  <p>零运行时依赖：Node.js 标准库生成静态站与 .ics 文件。数据是纯 JSON，放在 Git 仓库里，每一条改动都有 diff 可查。</p>
  <p>协议：代码 AGPL-3.0，数据 CC BY-SA 4.0。</p>
</section>`,
});

const majorsIndexPage = layout({
  title: "专业频道 · College-AM",
  description: "按职业出口划分，不是按学院。每个频道列出本方向必看与推荐的考证与竞赛。",
  current: "majors.html",
  body: `
<section class="hero" style="border-top:0">
  <h1>专业频道</h1>
  <p>我们不按学院划分，而是按<strong>职业出口</strong>。因为多数学校的"信息工程学院"就是"计算机学院"改个名，按学院切会出现 3 个 90% 重复的空页。</p>
</section>
<section>
  <div class="channels">
  ${majors.channels
    .map((c) => {
      const core = programs.filter((p) => p.majors.some((m) => m.id === c.id && m.weight === "core")).length;
      const all = programs.filter((p) => p.majors.some((m) => m.id === c.id)).length;
      return `<a class="channel" href="m/${c.id}.html">
      <div class="n">${esc(c.name)}</div>
      <div class="c">${core} 个必看 · ${all} 个相关</div>
      <div class="i">${esc(c.intro)}</div>
    </a>`;
    })
    .join("")}
  </div>
</section>`,
});

// ---------------- 页面：省级报名时间 ----------------
function provincesPage() {
  const blocks = provinceData.editions.map((ed) => {
    const prog = programs.find((p) => p.id === ed.programId);
    if (!prog) return "";
    const ws = [...ed.windows].sort((a, b) => (a.start + a.startTime).localeCompare(b.start + b.startTime));
    const earliest = ws[0];
    const latest = ws.reduce((m, w) => (w.start > m.start ? w : m), ws[0]);
    const spread = Math.round(
      (new Date(latest.start + "T00:00:00") - new Date(earliest.start + "T00:00:00")) / 86400000
    );

    return `<div style="margin-bottom:36px">
      <h3 style="margin-top:0">${esc(prog.name)}<span class="sub" style="font-weight:400;color:var(--ink-3);font-size:13px;margin-left:8px">${ws.length} 个省级窗口</span></h3>
      <p style="font-size:13.5px;color:var(--ink-2);margin-bottom:12px">
        最早的省份 <strong>${esc(earliest.province)}</strong> ${earliest.start} 开始，最晚的 <strong>${esc(latest.province)}</strong> ${latest.start} 才开始——
        <strong style="color:var(--accent)">同一个考试，各省报名起点最多相差 ${spread} 天</strong>。这就是为什么"看全国通知"没用，必须看本省。
      </p>
      <table class="timeline">
        <thead><tr><th>省份</th><th>报名开始</th><th>报名截止</th><th>备注</th></tr></thead>
        <tbody>
        ${ws
          .map(
            (w) => `<tr>
          <td>${esc(w.province)}</td>
          <td class="mono">${w.start} ${w.startTime ?? ""}</td>
          <td class="mono">${w.end} ${w.endTime ?? ""}</td>
          <td style="font-size:12px;color:var(--ink-3)">${esc(w.extra ?? "")}</td>
        </tr>`
          )
          .join("")}
        </tbody>
      </table>
      <p style="font-size:12.5px;color:var(--ink-3);margin-top:8px">
        来源：<a href="${esc(ed.sourceUrl)}" target="_blank" rel="noopener nofollow">${esc(ed.sourceUrl)}</a> ·
        ${ed.trustTier} · 抓取 ${fmtStamp(ed.fetchedAt).slice(0, 10)}
      </p>
    </div>`;
  });

  return layout({
    title: "省级报名时间 · College-AM",
    description: "同一场考试，各省报名时间能差两个月。这里是逐省的真实报名窗口，全部来自官方原文表格。",
    current: "provinces.html",
    body: `
<section class="hero" style="border-top:0">
  <h1>省级报名时间</h1>
  <p>四六级、计算机等级、软考这些"全国统一考试"，<strong>报名时间从来不是全国统一的</strong>——各省考试院自己定。</p>
  <p style="color:var(--ink-2);font-size:14px">
    下面是逐省的真实窗口，全部来自官方原文的表格。看完你就明白为什么"看全国通知"会错过报名。
  </p>
</section>
<section>
  ${blocks.join("")}
</section>
<section>
  <h2>说明</h2>
  <ul style="font-size:13.5px;color:var(--ink-2);padding-left:20px;line-height:1.9">
    <li>表中的日期与时间是官方公告原文，未做任何推算或补全。</li>
    <li>部分省份有第二段补报名窗口，已在"备注"列标注。</li>
    <li>四六级（CET）不在此表：官方明确"各考点报名时间不同"，连省级统一时间都没有，只能看本校通知。</li>
    <li>缺哪个省，就是还没核实到——不猜。</li>
  </ul>
</section>`,
  });
}

// ---------------- 输出 ----------------
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await mkdir(path.join(DIST, "p"), { recursive: true });
await mkdir(path.join(DIST, "m"), { recursive: true });
await mkdir(path.join(DIST, "calendar"), { recursive: true });
await mkdir(path.join(DIST, "assets"), { recursive: true });

await cp(path.join(SITE, "assets", "style.css"), path.join(DIST, "assets", "style.css"));

// favicon
await writeFile(
  path.join(DIST, "assets", "favicon.svg"),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1f6f5c"/><path d="M9 22V11l7 7 7-7v11" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
);

// ---------------- PWA ----------------
const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#1f6f5c"/><path d="M144 352V160l112 112 112-112v192" stroke="#fff" stroke-width="42" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** SVG 不便作 PWA 图标，这里手写一个 192x192 与 512x512 的 PNG（纯色底 + 白色 M 折线太复杂，用纯色圆角 + 字母块） */
function makeIconPng(size) {
  const px = size;
  const raw = Buffer.alloc((px * 3 + 1) * px);
  const BG = [31, 111, 92];      // #1f6f5c 品牌绿，铺满整块（maskable 需要满版）
  const FG = [255, 255, 255];
  const cx = px / 2, cy = px / 2;

  // "M" 几何：落在 maskable 安全区（中心 80% 直径圆）内
  const safe = px * 0.5 * 0.78;
  const top = cy - safe * 0.60, bot = cy + safe * 0.60;
  const halfW = safe * 0.62;
  const lx = cx - halfW, rx2 = cx + halfW;
  const stroke = px * 0.075;

  for (let y = 0; y < px; y++) {
    raw[y * (px * 3 + 1)] = 0;
    for (let x = 0; x < px; x++) {
      const o = y * (px * 3 + 1) + 1 + x * 3;
      let white = false;
      if (y >= top && y <= bot) {
        // 两条竖干
        if (Math.abs(x - lx) <= stroke / 2 || Math.abs(x - rx2) <= stroke / 2) white = true;
        // 中间 V（只看上半段）
        const t = (y - top) / (bot - top);
        if (t < 0.62) {
          const spread = halfW * (t / 0.62);
          if (Math.abs(x - (cx - halfW + spread)) <= stroke / 2) white = true;
          if (Math.abs(x - (cx + halfW - spread)) <= stroke / 2) white = true;
        }
      }
      const c = white ? FG : BG;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
    return t;
  })();
  const crc32 = (buf) => { let c = -1; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const t = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(px, 0); ihdr.writeUInt32BE(px, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0)),
  ]);
}

await writeFile(
  path.join(DIST, "manifest.webmanifest"),
  JSON.stringify({
    name: "College-AM · 大学生考证与竞赛时间轴",
    short_name: "College-AM",
    description: "四六级、计算机等级、教资、软考、数模、国创赛的关键日期，含逐省报名窗口。每条都有官方原文链接。",
    lang: "zh-CN",
    start_url: "./index.html",
    scope: "./",
    display: "standalone",
    background_color: "#13181b",
    theme_color: "#1f6f5c",
    icons: [
      { src: "assets/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      { src: "assets/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  }, null, 2)
);

await writeFile(path.join(DIST, "assets", "icon-192.png"), makeIconPng(192));
await writeFile(path.join(DIST, "assets", "icon-512.png"), makeIconPng(512));

// Service Worker：先网后缓存（stale-while-revalidate），离线时回落到缓存
await writeFile(
  path.join(DIST, "sw.js"),
  `const CACHE = "college-am-v1";
const PRECACHE = ["./", "./index.html", "./assets/style.css", "./calendar.html", "./provinces.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
`
);

const pages = [
  ["index.html", indexHtml],
  ["calendar.html", calendarPage],
  ["certs.html", listPage("cert", "考证", "学历之外的硬通货。每个条目都标注了报名与考试时间，以及官方原文链接。")],
  ["contests.html", listPage("contest", "竞赛", "对保研、求职真正有用的比赛。按含金量与专业相关度筛选，只收官方主办方。")],
  ["ai.html", aiHtml],
  ["majors.html", majorsIndexPage],
  ["provinces.html", provincesPage()],
  ["zhaopin.html", zhaopinPage()],
  ["sources.html", sourcesPage],
  ["about.html", aboutPage],
];

for (const [name, html] of pages) {
  await writeFile(path.join(DIST, name), html);
}

for (const p of programs) {
  await writeFile(path.join(DIST, "p", p.id + ".html"), programPage(p));
}

for (const c of majors.channels) {
  await writeFile(path.join(DIST, "m", c.id + ".html"), majorPage(c));
}

// ---- .ics 文件 ----
let icsCount = 0;
const fullIcs = buildCalendar({
  name: "College-AM 全部日程",
  description: "大学生考证与竞赛关键日期（报名截止 / 开考）。来源见每条事件描述。",
  events: calEvents,
  now: NOW,
});
await writeFile(path.join(DIST, "calendar", "all.ics"), fullIcs);
icsCount++;

const signupOnly = buildCalendar({
  name: "College-AM 报名截止",
  description: "只包含报名截止日期。",
  events: calEvents.filter((e) => e.summary.startsWith("【报名截止】")),
  now: NOW,
});
await writeFile(path.join(DIST, "calendar", "signup-only.ics"), signupOnly);
icsCount++;

for (const p of programs) {
  const evs = calEvents.filter((e) => e.uid.startsWith(p.id + "-") || e.uid.includes(p.id));
  const evs2 = [];
  for (const ed of p.editions.filter((e) => e._published)) {
    for (const k of keyDates(ed)) {
      if (daysUntil(k.date, NOW) < -30) continue;
      evs2.push({
        uid: ed.id + "-" + k.kind,
        start: k.date,
        summary: "【" + k.label + "】" + p.name,
        description: p.organizer + "\n官网：" + p.officialUrl + "\n来源：" + (ed.noticeUrl ?? ed.sourceUrl),
        url: ed.noticeUrl ?? ed.sourceUrl,
        alarmDays: k.kind === "signup_end" ? [7, 3, 1] : [7, 1],
      });
    }
  }
  if (evs2.length) {
    await writeFile(
      path.join(DIST, "calendar", "p-" + p.id + ".ics"),
      buildCalendar({ name: p.name, description: p.summary, events: evs2, now: NOW })
    );
    icsCount++;
  }
}

for (const c of majors.channels) {
  const evs = [];
  for (const p of programs) {
    if (!p.majors.some((m) => m.id === c.id)) continue;
    for (const ed of p.editions.filter((e) => e._published)) {
      for (const k of keyDates(ed)) {
        if (daysUntil(k.date, NOW) < -30) continue;
        evs.push({
          uid: ed.id + "-" + k.kind,
          start: k.date,
          summary: "【" + k.label + "】" + p.name,
          description: p.organizer + "\n" + p.officialUrl,
          url: ed.noticeUrl ?? ed.sourceUrl,
          alarmDays: k.kind === "signup_end" ? [7, 3, 1] : [7, 1],
        });
      }
    }
  }
  if (evs.length) {
    await writeFile(
      path.join(DIST, "calendar", "major-" + c.id + ".ics"),
      buildCalendar({ name: c.name + " · College-AM", description: c.intro, events: evs, now: NOW })
    );
    icsCount++;
  }
}

// ---- robots / sitemap ----
const SITE_ORIGIN = "https://college-am.example"; // 部署时替换为真实域名
await writeFile(path.join(DIST, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: " + SITE_ORIGIN + "/sitemap.xml\n");
const urls = [
  "",
  "calendar.html",
  "certs.html",
  "contests.html",
  "ai.html",
  "majors.html",
  "zhaopin.html",
  "provinces.html",
  "sources.html",
  "about.html",
  ...majors.channels.map((c) => "m/" + c.id + ".html"),
  ...programs.map((p) => "p/" + p.id + ".html"),
];
await writeFile(
  path.join(DIST, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => "  <url><loc>https://college-am.example/" + u + "</loc></url>").join("\n") +
    "\n</urlset>\n"
);

console.log("✓ 构建完成");
console.log("  页面      " + (pages.length + programs.length + majors.channels.length) + " 个");
console.log("  .ics      " + icsCount + " 个");
console.log("  事件      " + calEvents.length + " 条");
console.log("  输出      dist/");