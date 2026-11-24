# AIHOT 聚合接入方案：合规边界、技术落地与可跳转入口清单

> 实测口径：本文所有 URL 于 **2026-11-24** 用 PowerShell Invoke-WebRequest（UA = Chrome/131）逐个访问，记录 HTTP 状态码、Content-Type、字节数。未访问成功的一律标 ❌ 并写明原因，不做推测。
> 一句话结论前置：**用户原话「能直接跳转的那种」本身就是最合规的形态**——纯外链不触发 AIHOT 公开使用规则的任何一条授权要求。下面的分析是为了证明这一点，而不是为了找理由多做。

---

## 0. 结论前置

| 问题 | 判断 |
|---|---|
| 只做外链跳转，要不要授权？ | **不要**。超链接既不是"访问"，也不是"调用/缓存/同步/展示/分析 AIHOT 内容"，不落入规则第 1 条的适用对象 |
| 把标题摘要抓进本站静态页，算什么？ | 取决于**量**与**是否替代**。全量 50 条持续更新 ≈ 第 4 条的"批量公开再分发"；5 条一次性快照 ≈ 第 6 条允许的"合理引用"，但属灰区 |
| 只在构建时抓 5 条渲染静态页，边界在哪？ | 灰区。安全做法是**先发报备邮件并拿到明确回复再用**；规则第 2 条明确"收到申请或正在沟通不等于已经授权" |
| 推荐哪档？ | **保守档：纯外链 + RSS 订阅引导**。0 抓取、0 缓存、0 授权依赖 |
| 绝对不能做 | 见 §5，共 9 条 |

---

## 1. AIHOT 提供什么（实测入口清单）

站点共 924 个信源、64.7 万条动态、217 期日报（[about](https://aihot.news/about) 页面自述）。导航实测可用的独立页面如下，**全部 HTTP 200**：

### 1.1 内容入口（最适合做跳转卡片）

| 名称 | URL | 内容 | 建议 |
|---|---|---|---|
| 精选（首页） | https://aihot.news/ | 每日 AI 精选动态 | ✅ 主入口 |
| 全部 AI 动态 | https://aihot.news/all | 全量资讯流，可按分类筛选 | ✅ |
| 热点榜 | https://aihot.news/hot | 过去 48h 被多信源共同讨论的事件 | ✅ 学生最关心"发生了什么" |
| AI 日报 | https://aihot.news/daily | 每日 08:00（北京时间）精编 | ✅ |
| 日报存档 | https://aihot.news/daily/archive | 历史日报归档（实测 294KB，含往期列表） | ✅ |
| AI 周报 | https://aihot.news/weekly | 每周一 10:00 发布 | 可选 |
| AI 月报 | https://aihot.news/monthly | 每月 1 日 10:30 发布 | 可选 |
| 主题 | https://aihot.news/topics | 38 个主题（公司/技术方向/内容类型） | ✅ 见 §1.4 |

### 1.2 模型榜系列（对学生选模型、比价最实用）

| 名称 | URL | 内容 |
|---|---|---|
| 模型榜 | https://aihot.news/leaderboard | 93 个模型、48 项第三方评测折算的综合分 |
| API 价格对比 | https://aihot.news/leaderboard/prices | 每百万 Token 输入/输出/缓存价，美元附原价 |
| 评测来源 | https://aihot.news/leaderboard/sources | 每项评测测什么、怎么更新 |
| 排序怎么算 | https://aihot.news/leaderboard/rules | 折算方法与权重 |
| 分类榜 | https://aihot.news/leaderboard/category/coding · /reasoning · /knowledge | 编程 / 推理 / 知识，实测三个均 200 |

### 1.3 工具与元信息

| 名称 | URL | 说明 |
|---|---|---|
| **Token 羊毛（免费额度）** | https://aihot.news/free-tokens | 现在能免费领的大模型额度，按官方价折人民币，写清门槛与核实日期。**这是全站对大学生最实用的一页** |
| 重置监控 | https://aihot.news/resets | Codex 额度重置日历 |
| Codex / Antigravity / Claude / Grok Bot 重置 | /codex-reset · /antigravity-reset · /claude-reset · /grok-bot-reset | 四个独立页，均 200 |
| Agent 接入 | https://aihot.news/agent | Skill / MCP / RSS / API 四选一，四个 tab 均 200 |
| 关于 | https://aihot.news/about | 作者、工作方式、924 信源明细 |
| 更新日志 | https://aihot.news/changelog | 功能变更记录 |
| 反馈 | https://aihot.news/feedback | 纠错与来源方下架申请入口 |
| 公开使用规则 / 隐私说明 | /terms · /privacy | 合规依据原文 |

### 1.4 主题页（38 个，实测全部 200）

对 AI 板块最相关的 8 个：/topics/agent（智能体）、/topics/coding（AI 编码）、/topics/reasoning（推理）、/topics/multimodal（多模态）、/topics/open-source（开源生态）、/topics/model-releases（模型发布）、/topics/tutorials（教程实践）、/topics/benchmarks（评测基准）。
其余 30 个含 openai / anthropic / google / deepseek / qwen / kimi / minimax / zhipu / xai / meta / microsoft / nvidia / hugging-face / cursor / openrouter / image-gen / video / voice / embodied / on-device / engineering / data-training / safety / mcp / product-updates / papers / opinions / trends / industry / policy。

### 1.5 机器可读入口（本次全部复核）

| 入口 | URL | 实测 |
|---|---|---|
| 精选摘要 RSS | https://aihot.news/feed.xml | 200，**50 条**，51,382 字节，ttl=30 |
| 全文 RSS | https://aihot.news/feed/full.xml | 200，50 条，77,586 字节，含 content:encoded（仅可再分发来源） |
| 全部动态 RSS | https://aihot.news/feed/all.xml | 200，50 条 |
| 日报 RSS | https://aihot.news/feed/daily.xml | 200，**30 条**，ttl=30 |
| 周报 / 月报 RSS | /feed/weekly.xml · /feed/monthly.xml | 200，12 / 6 条，ttl=180 / 360 |
| 分类 RSS | /feed/category/tip.xml | 200，9 条 |
| Agent 说明（Markdown） | https://aihot.news/api/v1/agent | 200，text/markdown |
| 最近资讯 JSON | https://aihot.news/api/v1/items | 200，字段：id/title/summary/source/links/publishedAt/discoveredAt/category/score/selected/reason/**attribution** |
| 热点 JSON | https://aihot.news/api/v1/hot-topics | 200，10 条，含 storyPublicId |
| 日报 JSON | https://aihot.news/api/v1/dailies/latest | 200 |
| OpenAPI 规范 | https://aihot.news/openapi-v1.json | 200，OpenAPI 3.1，版本 2.0.0 |
| llms.txt | https://aihot.news/llms.txt | 200，19,703 字节 |
| robots.txt / sitemap | /robots.txt · /sitemap.xml | 200 / 200 |

**❌ 不存在、不要引用的路径**（实测 404）：/models、/topic、/favorites、/collections、/monitor、/reset-monitor、/archive、/legacy、/subscribe、/sources、/api/v1/hot、/api/v1/daily、/api/v1/items/{id}、/openapi.json。
**/selected 实测 301 → /**（重定向到首页，不是独立页面）。

### 1.6 两个容易踩的坑

1. **/api/mcp 是 POST 的 Streamable HTTP**，GET 返回 405——不是坏链，是协议特性，不要当失效入口。
2. **旧接口 /api/public/* 已于 2026-10-31 停服**（规则第 10 条与 llms.txt 均写明），任何仍用旧地址的教程都已过期。

### 1.7 robots.txt 的态度（重要）

AIHOT 的 robots.txt 有明确倾向：**对 AI 爬虫全放行**（GPTBot / ClaudeBot / PerplexityBot / OAI-SearchBot 等单独成组，Allow: /api/v1/、Allow: /api/mcp），同时对商业 SEO 采集器（SemrushBot、AhrefsBot、MJ12bot 等）Disallow: /。

但要分清两件事：**robots 是抓取许可，规则（terms）是使用许可**。robots 放行只说明"你可以来抓"，不等于"你可以随便用"——规则第 1 条末句已经把这点写死：*"无需登录或 API Key，并不表示可以直接把它做成镜像、转售或对外商业服务。"*

---

## 2. 规则原文与逐条判断

依据 [aihot.news/terms](https://aihot.news/terms)，**公开使用规则 v1.1，生效 2026-09-30**，运营主体北京虚实空际文化科技有限公司。

### 2.1 College-AM 属于哪一类使用者

规则第 2 条定义了五种场景。College-AM 是 **AGPL-3.0 开源、不收费、无广告、无赞助、不向客户交付、服务对象是大学生与开源社区**，逐条对照：

| 第 2 条场景 | 定义 | College-AM 是否符合 |
|---|---|---|
| 个人非商业 | 学习/研究/兴趣/小工具，不以营利、客户交付、广告、赞助、**导流**或组织业务为目的 | 部分符合（但是多人项目，非个人） |
| **公益非商业** | 不收费、不接受商业赞助、不向客户交付，**且成果主要服务教育、研究、公益或开源社区** | **✅ 符合**（教育 + 开源社区，无商业赞助） |
| 组织内部使用 | 仅同一组织成员内部使用 | ❌ 不符合（是公开网站） |
| 外部商业使用 | 直接或间接服务于收费、广告、赞助、**导流**、客户交付、会员、销售、融资 | ❌ 不符合（不做导流变现） |

**判断：按规则原文，College-AM 落在第 3 条第 2 项的"公益非商业"范围，可以免费使用，不需要申请。**

⚠️ 但有一个必须自己守住的前提：**第 2 条把"导流"列进了"营利目的"**。这意味着一旦 College-AM 未来加广告位、做联盟返佣、或把 AIHOT 内容当作给自己的引流钩子变现，身份立刻从"公益非商业"滑向"外部商业使用"。**开源 + 公益不是免死金牌，是必须持续满足的条件。**

### 2.2 四种做法分别属于什么

| 做法 | 规则依据 | 判断 |
|---|---|---|
| **A. 纯外链跳转** | 第 1 条界定的适用对象是"访问、调用、缓存、同步、展示或分析 AIHOT 内容的行为" | **超链接不属于其中任何一项**。不复制、不缓存、不展示内容，只是提供一个指向公开页面的地址 → **不适用规则，不需要任何授权** |
| **B. 教用户订阅 RSS** | 同上；订阅行为由用户自己的阅读器发起，与本站无关 | **不需要授权**。本站只是给出 aihot.news/feed.xml 这个地址 |
| **C. 构建时抓 5 条渲染静态页** | 第 3 条第 2 项（公益非商业可免费使用）+ 第 6 条第 3 项（合理引用）+ 第 4 条第 3 项（批量公开再分发需授权） | **灰区**。5 条不是"批量"、静态快照不是"公开镜像"，倾向落在允许范围；但第 4 条末句警告"只展示摘要不能代替授权"，说明对方把"展示摘要"视为需要单独判断的行为 → **建议先报备** |
| **D. 前端 JS 直连 API** | 第 4 条第 2 项（代理接口、机器可读能力）+ 第 5 条第 1 项（不得绕过限流） | **不建议**。技术可行（见 §3），但每个访客的浏览器都会打 AIHOT 一次，等于把本站的流量变成对方的请求量，接近"代理接口"；且用户量大时必然触发 429 |

### 2.3 关键条款原文（可直接引用）

- **第 3 条第 2 项**：*"学校、研究机构、公益组织或开源社区开展不收费、不接受商业赞助、不向客户交付的公益非商业项目"* → 属于可以直接免费使用的情况。
- **第 3 条第 4 项**：*"为上述允许用途进行与运行、离线阅读、去重和可靠性直接相关的合理私有缓存或内部同步"* → 允许缓存，但限定"私有"。
- **第 4 条第 3 项**：*"公开镜像、换皮站、白标产品、批量公开再分发，或以 AIHOT 的持续数据供给替代本站的公开服务"* → 这四项都要事先书面授权。
- **第 4 条末段**：*"接口公开、无需 API Key、项目暂时免费、处于测试期或只展示摘要，都不能代替授权"* → **这一句是 C 方案必须报备的直接理由**。
- **第 5 条第 2 项**：*"不得删除、隐藏或伪造响应中的来源、canonical、署名、权利或规则信息，也不得暗示获得 AIHOT 官方背书、合作或独家授权"*。
- **第 6 条第 2 项**：*"仅标注「数据来源：AIHOT」不代表已取得授权"* → 署名不能替代授权，但反过来，**没有授权时更不能省掉署名**。
- **第 6 条第 4 项**：*"未经同意，请不要使用 AIHOT、运营主体的商号、Logo、视觉素材，或用「官方」「合作伙伴」「认证」「独家」等说法进行宣传"* → **不要用它的 Logo，不要说"合作/官方"**。
- **第 7 条**：*"不要把临时缓存变成历史数据库、公开副本或可向第三方导出的数据包"* → 禁止自建 AIHOT 历史库。
- **第 8 条**：*"Skill 包或示例代码随附的 MIT 等开源许可证，只覆盖许可证明确对应的代码和文档文件，不覆盖 AIHOT 服务、数据库、数据输出、品牌"* → **MIT 是代码许可，不是数据许可**。这点最容易被误读：引擎开源 ≠ 内容开源。

---

## 3. 四种技术方案对比

| 维度 | A 纯外链 | B RSS 引导 | C 构建时抓取 | D 运行时 API |
|---|---|---|---|---|
| **实现方式** | 静态卡片，a 标签直跳 | A + 一段"复制这个地址到你的阅读器"说明 | build 时拉 /feed.xml，取前 5 条渲染 | 前端 fetch https://aihot.news/api/v1/items |
| **实现难度** | ★☆☆☆☆ 半天 | ★☆☆☆☆ 半天 | ★★★☆☆ 2–3 天（含失败降级） | ★★☆☆☆ 1 天（但坑在后面） |
| **是否需要授权** | **否** | **否** | **建议先报备** | **否，但不推荐**（见下） |
| **数据新鲜度** | 实时（用户跳到原站看最新） | 实时 | **取决于构建频率**：每次部署更新一次 | 60 秒（受 s-maxage=60 限制） |
| **AIHOT 宕机时** | 链接点不开，但页面本身完全正常 | 同 A | **构建失败**，需降级跳过该区块 | **区块空白**，需 catch 后隐藏 |
| **维护成本** | 0（一年检查一次链接是否 404） | 0 | 中（RSS 结构变动、构建超时、失败重试） | 高（429 处理、CORS 变化、字段兼容） |
| **合规风险** | **0** | **0** | 低但存在（灰区） | 中（近似代理接口） |

**技术实测补充**：

- CORS 实测 Access-Control-Allow-Origin: *（/api/v1/items 与 /api/v1/agent/* 均如此），说明 **D 方案技术上确实能跑通**——但这恰恰是要克制的理由：能跑通不等于该跑。
- 缓存策略实测 Cache-Control: public, must-revalidate, max-age=60, s-maxage=60，带 ETag。**如果真要做 D，必须带 If-None-Match，否则每次都是 200 全量传输。**
- 限流：官方文档写明 *"同一 IP 每分钟超过约 60 次会收到 429，按 Retry-After 等待"*。
- 官方对"写程序做定时同步"的建议是改用 JSON 接口 openapi-v1.json，UA 用 aihot-api/2.0.0；**不要伪造浏览器 UA**（第 5 条禁止伪造 UA 规避限制）。

---

## 4. 落地建议

### 4.1 选哪档

**选 A + B（保守档），不做 C，不做 D。**

三条理由：

1. **用户的原话就是 A**。"能直接跳转的那种"——用户要的是入口，不是内容。做 C 是在解决一个用户没提出的问题。
2. **C 的收益/成本比很差**。为了让用户在本站多看 5 条标题，要付出：报备邮件 + 等回复 + build 依赖外部服务 + RSS 结构变更时维护。而点击跳转过去，用户看到的是 50 条 + 全部历史 + 交互式筛选。
3. **C 有一个硬阻塞**：规则第 2 条写明*"收到申请或正在沟通不等于已经授权"*。这意味着**报备期间不能上线**，得等对方明确回复。对一个开源 MVP，把上线时间挂在一个外部方的邮箱回复上，不划算。

> 如果将来一定要做 C，正确姿势是：**先发邮件到 agent@virxact.com 报备 → 拿到明确书面回复 → 再实现**；同时实现时必须用 JSON 接口而非抓 HTML、UA 诚实标注 college-am/0.1、只取 5 条、每条带 attribution 与 links.aihot、构建失败时整个区块静默隐藏。

### 4.2 页面怎么放

在 /ai 页面新增第四个区块 **「AI 资讯（外链）」**，放在"AI 赛事 / AI 岗位 / AI 课程与工具"之后。结构沿用现有 AI_GROUPS 的卡片样式（scripts/build.mjs 第 682 行 AI_GROUPS），只增加一组：

| 卡片 | 标题 | 一句话说明（建议文案） | 链接 |
|---|---|---|---|
| 1 | AIHOT 精选 ↗ | 每天从 900+ 信源里挑出的 AI 动态，卡兹克出品 | https://aihot.news/ |
| 2 | AI 热点榜 ↗ | 过去 48 小时大家都在讨论什么 | https://aihot.news/hot |
| 3 | AI 日报 ↗ | 每天早 8 点一期，一期看完昨天 | https://aihot.news/daily |
| 4 | **Token 羊毛 ↗** | 现在能免费领的大模型额度，写清了门槛和截止 | https://aihot.news/free-tokens |
| 5 | 模型榜与 API 价格 ↗ | 93 个模型的实测排名 + 每百万 Token 多少钱 | https://aihot.news/leaderboard |
| 6 | 主题追踪 ↗ | 按公司、技术方向追最新动态 | https://aihot.news/topics |
| 7 | RSS 订阅 ↗ | 把 https://aihot.news/feed.xml 加进你的阅读器，本站之外也能追 | https://aihot.news/feed.xml |

卡片 4（Token 羊毛）和卡片 5（模型榜）是**只有 AIHOT 有、且对大学生特别有用**的两项——前者直接是钱，后者是选模型时的客观依据。这两个的点击率大概率高于首页。

### 4.3 文案规范

**可以写**：
- 「AIHOT 是数字生命卡兹克出品的 AI 资讯站，点击前往」
- 「内容与版权归 AIHOT 及其来源方所有」
- 「本站仅提供入口索引，不转载其内容」

**不可以写**：
- ❌「AIHOT 官方合作」「AIHOT 认证」「独家」
- ❌「本站 AI 资讯由 AIHOT 提供」
- ❌ 使用 AIHOT 的 Logo 或视觉素材
- ❌「数据来源：AIHOT」（在纯外链场景下这句话反而暗示了不存在的数据关系）

### 4.4 免责声明（放在区块底部，小字）

> 本节为外部网站入口索引。AIHOT（aihot.news）由数字生命卡兹克独立运营，与本站无隶属或合作关系；其内容、版权与可用性由该站及其来源方负责。点击将离开本站。

三条信息缺一不可：**① 外部索引的性质；② 无合作关系（对应第 6 条第 4 项）；③ 责任归属**。

### 4.5 顺带建议：把 AIHOT 的引擎当参考，别当依赖

KKKKhazix/AIHOT 是 MIT 开源的（本次实测 api.github.com/repos/KKKKhazix/AIHOT：**11,347 star**、license=MIT、pushed 2026-11-24、未归档）。对 College-AM 来说，它的价值是**架构参考**（六种信源适配器、预筛→打分→聚簇的流水线），不是数据来源。这两件事在规则第 8 条里被明确切开：*"MIT 等开源许可证只覆盖代码和文档文件，不覆盖 AIHOT 服务、数据库、数据输出、品牌"*。

---

## 5. 绝对不能做的事（9 条）

1. **不要把 AIHOT 的条目落库成自己的历史数据库。** 第 7 条：不得"把临时缓存变成历史数据库、公开副本或可向第三方导出的数据包"。
2. **不要做全量镜像或换皮站。** 第 4 条第 3 项，须书面授权。
3. **不要批量搬运标题/摘要做"本站 AI 资讯"频道。** 第 4 条第 2、3 项。
4. **不要用 AIHOT 的 Logo、商号做视觉标识。** 第 6 条第 4 项。
5. **不要声称"官方合作""认证""独家"。** 第 5 条第 2 项 + 第 6 条第 4 项。
6. **不要让前端直连 API 当后端用。** 第 4 条第 2 项（代理接口）+ 第 5 条第 1 项（限流）。
7. **不要伪造 User-Agent、轮换 IP、拆分请求规避限流。** 第 5 条第 5 项。
8. **不要在无授权情况下把 AIHOT 数据用于模型训练/微调/评测/RAG 并对外提供。** 第 4 条第 4 项。
9. **不要删改响应里的 attribution / canonical。** 第 5 条第 2 项。即使拿到授权，这条也依然适用。

---

## 6. 明确写"未验证"的部分

| 项目 | 状态 | 说明 |
|---|---|---|
| 报备邮件的实际回复时效与口径 | ❌ 未验证 | 未发信，无法知道对方对"5 条静态快照"的具体态度 |
| /api/v1/selected/changes | ⚠️ 部分 | 实测 409（缺 cursor 参数，属预期行为），未做完整增量流程验证 |
| /api/mcp 的 MCP 协议交互 | ❌ 未验证 | GET 返回 405（正常，是 POST-only），未做 MCP 客户端握手 |
| 各主题页内容质量 | ⚠️ 部分 | 仅验证 38 个 URL 均 200，未逐页评估内容 |
| /daily/{date} 历史日期边界 | ⚠️ 部分 | 验证 /daily/2026-11-23 200，未测更早日期 |
| 长期链接稳定性 | ❌ 未验证 | 规则第 10 条承诺"RSS URL 与 GUID 长期稳定"，但站点处于快速迭代期（11 月内多次改版），需每季度复查 |

> 规则第 10 条值得单独注意：*"AIHOT 是公益项目，基础公开服务会尽力保持稳定，但无法保证永不中断、永不出错或永久提供相同容量"*。**这意味着 College-AM 不能把 AIHOT 当成基础设施依赖**——即使做 C，也必须有"抓取失败就整块隐藏"的降级路径。
