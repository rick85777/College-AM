/**
 * AI 板块页面渲染。
 * 独立成文件的原因：这张页面是本项目里唯一"条目最多、结构最深"的一页，
 * 混在 build.mjs 里会让构建脚本难以阅读（build.mjs 已 1200+ 行）。
 * 字段规范与信息架构见 docs/research/09-ai-ia.md。
 */

const ACCESS_BADGE = {
  direct: { text: "国内可直连", cls: "accent" },
  vpn: { text: "需代理", cls: "warn" },
  login: { text: "需登录", cls: "" },
};

const COST_BADGE = { free: "免费", freemium: "部分免费", paid: "付费" };

const GROUP_SUB = {
  contest: "现在能报什么",
  job: "本科生的入口",
  learn: "按能做什么分",
  stack: "用什么跑",
  free: "钱从哪来",
  feed: "每天跟什么",
};

function badges(it) {
  const out = [];
  const a = ACCESS_BADGE[it.access];
  if (a) out.push(`<span class="tag ${a.cls}">${a.text}</span>`);
  if (it._stale) out.push('<span class="tag warn">待复验</span>');
  out.push(`<span class="tag">${it.verified} 验证</span>`);
  const c = COST_BADGE[it.cost];
  if (c) out.push(`<span class="tag">${c}</span>`);
  if (it.kind === "aggregator") out.push('<span class="tag warn">第三方整理</span>');
  return out.join("");
}

function card(esc, it) {
  const tags = Array.isArray(it.tags) ? it.tags : [];
  const hasMore = Boolean(it.note) || tags.length > 0;
  const more = hasMore
    ? `
  <details class="ai-more">
    <summary>坑点与方向</summary>
    <p>${it.note ? esc(it.note) : ""}${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</p>
  </details>`
    : "";
  return `
<li class="ai-item" id="ai-${esc(it.id)}" data-access="${esc(it.access)}">
  <a class="card ai-card" href="${esc(it.url)}" target="_blank" rel="noopener nofollow">
    <span class="row">
      <span class="name">${esc(it.name)}</span>
      <span class="ai-org">${esc(it.org)}</span>
    </span>
    <span class="desc">${esc(it.desc)}</span>
    <span class="ai-fit">${esc(it.fit)}</span>
    <span class="ai-badges">${badges(it)}</span>
  </a>${more}
</li>`;
}

function section(esc, s) {
  const disclaimer = s.disclaimer ? `\n  <p class="ai-disclaimer">${esc(s.disclaimer)}</p>` : "";
  return `
  <h3 id="${esc(s.id)}">${esc(s.title)}<span class="sub">${s.items.length}</span></h3>
  <ul class="ai-list">
${s.items.map((it) => card(esc, it)).join("")}
  </ul>${disclaimer}`;
}

function groupSection(esc, g, prev, next) {
  const count = g.sections.reduce((n, s) => n + s.items.length, 0);
  const jumps =
    g.sections.length > 1
      ? `
  <p class="ai-sections">本组 ${g.sections.length} 节：${g.sections
          .map((s) => `<a href="#${esc(s.id)}">${esc(s.title.replace(/（.*?）/g, ""))}</a>`)
          .join(" · ")}</p>`
      : "";
  const nav = [prev ? `<a href="#${esc(prev.id)}">← ${esc(prev.title)}</a>` : "", next ? `<a href="#${esc(next.id)}">${esc(next.title)} →</a>` : ""]
    .filter(Boolean)
    .join("　");
  return `
<section id="${esc(g.id)}">
  <h2>${esc(g.title)}<span class="sub">${count} 个入口 · ${g.sections.length} 节</span></h2>
  <p class="ai-note">${esc(g.note)}</p>${jumps}
${g.sections.map((s) => section(esc, s)).join("")}
  <p class="ai-jump">${nav}</p>
</section>`;
}

export function renderAiPage(AI, { layout, esc }) {
  const { groups, stats } = AI;
  const withSections = groups.filter((g) => g.sections && g.sections.length);
  const vpnItems = stats.vpn;

  const toc = `
<nav class="channels" aria-label="AI 板块分组目录">
${withSections
    .map((g) => {
      const count = g.sections.reduce((n, s) => n + s.items.length, 0);
      return `  <a class="channel" href="#${esc(g.id)}">
    <div class="n">${esc(g.title)}</div>
    <div class="c">${count} 条 · ${g.sections.length} 节</div>
    <div class="i">${esc(GROUP_SUB[g.id] ?? "")}</div>
  </a>`;
    })
    .join("")}
</nav>`;

  const toggle =
    vpnItems > 0
      ? `
<input type="checkbox" id="hide-vpn" class="ai-toggle-input">
<label for="hide-vpn" class="ai-toggle">隐藏需代理的条目（${vpnItems} 条）</label>`
      : "";

  const sections = withSections
    .map((g, i) => groupSection(esc, g, withSections[i - 1], withSections[i + 1]))
    .join("");

  const body = `
<section class="hero">
  <h1>AI 板块</h1>
  <p>${stats.items} 个入口，每条写明<b>谁该用、什么时候别用</b>，并标注<b>能否直连</b>与<b>最后验证日期</b>。没有"猜你喜欢"，没有算法排序——顺序是固定的人工排序。</p>
  <div class="cta">
    <a class="btn primary" href="#contest">从赛事开始 →</a>
    <a class="btn" href="#learn">学习路径</a>
    <a class="btn" href="#free">免费额度</a>
  </div>
  <div class="meta">${stats.groups} 组 / ${stats.sections} 节 / ${stats.items} 条；其中需代理 ${stats.vpn} 条（${(stats.vpnRatio * 100).toFixed(1)}%）</div>
</section>

${toc}
${toggle}
${sections}

<section>
  <h2>为什么不做"AI 推荐"</h2>
  <div class="prov stack">
    <span class="line"><dt>冷启动没有数据</dt> <dd>推荐系统依赖用户画像与行为数据。本站第一天的用户数是 0，任何"个性化"都只能靠猜——猜错的成本是用户从此不再信任所有条目。</dd></span>
    <span class="line"><dt>黑箱破坏可核查性</dt> <dd>本站的全部价值在于"每个日期都能点回官方原文"。一旦排序由模型决定而无法解释，这个前提就不成立了。</dd></span>
    <span class="line"><dt>AI 更适合放在后台</dt> <dd>字段抽取、实体归一、变更摘要——这些是 AI 该做的事，用户看不见，但决定了数据质量。前台不需要它。</dd></span>
  </div>
</section>

<section>
  <h2>这些条目怎么维护</h2>
  <div class="prov stack">
    <span class="line"><dt>每条都有验证日期</dt> <dd>徽标上的日期是 <code>scripts/check-ai-links.mjs</code> 最后一次实测这个地址能打开的时间。<b>只有脚本能写这一列，人不能手改</b>——手改的日期等于没有。</dd></span>
    <span class="line"><dt>超 90 天标"待复验"</dt> <dd>超过 90 天没复验，卡片上会多一个黄色"待复验"徽标；超过 180 天，构建直接失败。失效的条目不会静默消失，会移到"暂时打不开"并附替代入口。</dd></span>
    <span class="line"><dt>能直连是实测结果</dt> <dd>"国内可直连"不是声称，是构建环境里 curl 实测的结果。需代理的条目一律标黄，并可用上方开关一键隐藏。</dd></span>
    <span class="line"><dt>第三方整理会标出来</dt> <dd>凡是"别人整理的东西"都带"第三方整理"警示徽标（本页共 ${stats.aggregators} 条）。它会过期、会漏、会有立场——点进去之后仍然要自己核对一次原始来源。</dd></span>
  </div>
</section>

<section>
  <h2>赛事截止日期在哪里看</h2>
  <p style="font-size:13.5px;color:var(--ink-2);line-height:1.85">
    AI 赛事的截止日期<b>不进主日历</b>。原因很实际：一个赛事从发布到截止常常只有 3 周，而主日历的数据是人工核实后才发布的，
    两者节奏对不上——勉强合并只会让主日历里塞满来不及核实的日期。要看当期赛题，请直接点上面的平台入口。
  </p>
</section>`;

  return layout({
    title: "AI 板块 · College-AM",
    description: `${stats.items} 个 AI 赛事、岗位、学习路径、工具链、免费额度与信息源入口，每条标注能否直连与最后验证日期。不做推荐算法。`,
    current: "ai.html",
    body,
  });
}
