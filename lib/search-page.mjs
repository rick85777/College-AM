/**
 * 「快速检索」页面。
 * 设计约束见 docs/research/04-product-roadmap.md §6 与 09-ai-ia.md §6.3：
 *   1. 不引入推荐/排序算法，顺序固定、可解释；
 *   2. 不用 :has()（国内壳浏览器不支持），不用框架，脚本 <6KB；
 *   3. 关掉 JS 也必须能用 —— 五个栏目里四个是纯静态 HTML，
 *      只有「关键词」依赖 JS，且它退化成指向各列表页的链接。
 */

const TYPE_LABEL = { program: "条目", province: "省级窗口", ai: "AI 入口" };

function timeBucket(list, label, note) {
  return `<div class="qb">
    <div class="qb-h"><span class="n">${list.length}</span> <span class="t">${label}</span></div>
    ${list.length
      ? `<ul class="qb-list">${list
          .map(
            (u) => `<li><a href="p/${u.program.id}.html"><span class="mono d">${u.date.slice(5)}</span>${label === "7 天内" ? `<span class="pill-urgent tag">${u.days} 天后</span>` : ""}${u.program.shortName ?? u.program.name}<span class="tag">${u.label}</span></a></li>`
          )
          .join("")}</ul>`
      : `<p class="qb-empty">${note}</p>`}
  </div>`;
}

export function renderSearchPage(model, { layout, esc }) {
  const { programs, soon7, soon30, soon90, provinceChips, tagIndex, majors, docCount, aiCount } = model;

  const provGroups = provinceChips
    .map(
      (g) => `<div class="prow">
      <span class="pname">${esc(g.program)}</span>
      <span class="pchips">${g.chips
        .map((c) => `<a class="chip" href="provinces.html#pv-${esc(c.pid)}-${esc(c.code)}">${esc(c.province)}</a>`)
        .join("")}</span>
    </div>`
    )
    .join("");

  const tags = tagIndex
    .map(
      (t) => `<div class="tagrow" id="tag-${esc(t.slug)}">
      <span class="tagname">${esc(t.tag)}<span class="n">${t.count}</span></span>
      <span class="taglinks">${t.items.map((i) => `<a href="p/${esc(i.id)}.html">${esc(i.name)}</a>`).join("")}</span>
    </div>`
    )
    .join("");

  const dirs = majors.channels
    .map(
      (c) => `<a class="chip chip-dir" href="m/${esc(c.id)}.html">${esc(c.name)}</a>`
    )
    .join("");

  return layout({
    title: "快速检索 · College-AM",
    description: `${docCount} 条索引（条目 / 省级报名窗口 / AI 入口）的关键词检索、时间、省份、标签与方向五个入口。索引在构建期生成，不上报任何查询。`,
    current: "search.html",
    extraHead: '<script src="assets/quick.js" defer></script>',
    body: `
<section class="hero" style="border-top:0">
  <h1>快速检索</h1>
  <p>五个入口：<b>关键词</b>、<b>时间</b>、<b>省份</b>、<b>标签</b>、<b>方向</b>。索引共 ${docCount} 条——${programs.length} 个条目、${model.provinceWindows} 个省级窗口、${aiCount} 个 AI 入口。</p>
  <p style="color:var(--ink-3);font-size:13px">查询只在你自己的浏览器里跑，不发往服务器，也不记日志——本站没有服务器端逻辑。</p>
</section>

<nav class="qjump" aria-label="栏目跳转">
  <a href="#kw"><b>关键词</b><span>打几个字，跨三类内容一起搜</span></a>
  <a href="#time"><b>按时间</b><span>7 / 30 / 90 天内到期的节点</span></a>
  <a href="#prov"><b>按省份</b><span>${model.provinceWindows} 个报名窗口，逐省</span></a>
  <a href="#tag"><b>按标签</b><span>${tagIndex.length} 个线索，如「保研加分」</span></a>
  <a href="#dir"><b>按方向</b><span>7 个职业出口频道</span></a>
</nav>

<section id="kw">
  <h2>关键词<span class="sub">跨条目 / 省级窗口 / AI 入口</span></h2>
  <div class="qbox">
    <label class="sr-only" for="q">关键词</label>
    <input id="q" class="qinput" type="search" placeholder="试试：软考、江苏、蓝桥杯、保研加分、免费额度" autocomplete="off" enterkeyhint="search" spellcheck="false">
    <div class="qtypes" role="group" aria-label="检索范围">
      <button type="button" class="qtype is-on" data-type="all">全部</button>
      <button type="button" class="qtype" data-type="program">条目</button>
      <button type="button" class="qtype" data-type="province">省级窗口</button>
      <button type="button" class="qtype" data-type="ai">AI 入口</button>
    </div>
    <p class="qhint" id="qhint" role="status" aria-live="polite">输入任意字即可过滤；支持空格分隔多个词（同时满足）。</p>
    <ol class="qresults" id="qresults"></ol>
  </div>
  <noscript>
    <p class="ai-disclaimer">
      关键词检索需要 JavaScript。不开启也能找到全部内容：
      <a href="certs.html">考证列表</a> · <a href="contests.html">竞赛列表</a> ·
      <a href="ai.html">AI 板块</a> · <a href="provinces.html">省级报名窗口</a>。
    </p>
  </noscript>
</section>

<section id="time">
  <h2>按时间<span class="sub">只列已核实的节点</span></h2>
  <div class="qgrid">
    ${timeBucket(soon7, "7 天内", "未来 7 天没有已核实的节点。")}
    ${timeBucket(soon30, "30 天内", "未来 30 天没有已核实的节点。")}
    ${timeBucket(soon90, "90 天内", "未来 90 天没有已核实的节点。")}
  </div>
  <p style="font-size:12.5px;color:var(--ink-3);margin-top:12px">
    为什么这么少：只收已人工核实的日期。官方没公布下一轮，这里就空着——不拿往年的时间填。
  </p>
</section>

<section id="prov">
  <h2>按省份<span class="sub">${model.provinceWindows} 个省级报名窗口</span></h2>
  <p style="font-size:13px;color:var(--ink-2);margin-bottom:14px">
    同一场考试各省报名时间不同，点省份直接跳到逐省表格里那一行。
  </p>
  ${provGroups}
</section>

<section id="tag">
  <h2>按标签<span class="sub">${tagIndex.length} 个标签</span></h2>
  <p style="font-size:13px;color:var(--ink-2);margin-bottom:14px">「保研加分」「含金量高」这类是我们自己打的标记，不是官方说法，仅作筛选线索。</p>
  ${tags}
</section>

<section id="dir">
  <h2>按方向<span class="sub">按职业出口，不按学院</span></h2>
  <div class="chips">${dirs}</div>
</section>

<section>
  <h2>这个索引怎么来的</h2>
  <div class="prov stack">
    <span class="line"><dt>构建期生成</dt> <dd>索引文件 <code>search-index.json</code> 在 <code>npm run build</code> 时由数据生成。页面和索引永远同版本，不会出现「搜到了但点进去 404」。</dd></span>
    <span class="line"><dt>无分词器</dt> <dd>中文检索用去标点后的子串匹配，不引词典、不调远程接口。空格分隔的多个词需要同时命中。</dd></span>
    <span class="line"><dt>顺序固定</dt> <dd>排序规则只有两条：命中标题 &gt; 命中关键词 &gt; 命中正文，同分按名称排。<b>没有个性化，也没有「猜你喜欢」</b>。</dd></span>
    <span class="line"><dt>不记录查询</dt> <dd>没有后端、没有埋点、没有第三方脚本。你在框里打什么都留在本机。</dd></span>
  </div>
</section>`,
  });
}
