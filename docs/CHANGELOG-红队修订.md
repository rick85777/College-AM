# 变更日志：按红队评审修订执行口径

> 依据：`docs/research/05-redteam-review.md`（M1-M7 / 建议修正 1-7）
> 状态：**这是本项目的最终执行口径**。01-05 五份报告为研究留档，若与本文冲突，以本文为准。

---

## M1｜置信度公式统一（02 与 03 互斥）

**问题**：02 §1 立规矩"L2 ≤ 75"，§5.3 公式 `0.40×层级 + 0.30×抽取 + 0.20×一致 + 0.10×稳定`，当 L2=70、其余满分时得 **28+30+20+10=88**，自破上限。03 §1.1 又是另一套五因子（40/25/20/10/5），同一份 L2 数据可得 **94**，且阈值从 85/60 改成 85/70。三份口径两个阈值，工程上无法同时实现。

**最终口径（唯一实现）**：

```
raw_score = 40 × tier_score        // L1=1.0, L2=0.85, L3=0.6, L4=0.3
          + 25 × completeness      // 必填 8 字段非 null 占比
          + 20 × parse_quality     // rule=1.0, llm_with_evidence=0.8, llm=0.5
          + 10 × cross_source      // 第二源一致=1.0, 仅单源=0.5, 有冲突=0
          +  5 × freshness         // 30 天内=1.0，每超 30 天减 0.2

score = min(raw_score, TIER_CAP[tier])   // TIER_CAP = { L1: 100, L2: 75, L3: 50, L4: 40 }
```

**判定阈值（统一）**：
| score | 处置 |
|---|---|
| ≥ 85 **且** 无 manual_only 字段 | 自动发布，标"已核验" |
| 70-84 | 进人工队列（可批量通过），页面显示"待核验" |
| < 70 | **不发布**，只进候选池 |

> **删除** 02 §5.3 的重复公式定义。02 的层级上限改为上述 `TIER_CAP` clamp，不再单独表述。

---

## M2｜"十类禁止自动化" vs "≥85 自动发布"——用字段白名单硬拦截

**问题**：02 §6 明写报名起止、费用、考试日期、报考资格、晋级规则"只能人工录入"；03 只把"截止日+费用"强制入队，**考试日期、报考资格、政策优惠、晋级规则仍可凭 100 分自动发布**。且 02 §5.1 的 A 级要求"L1 直证 **且** 第二独立源一致"，而多数考试公告只有一个发布口——按 02 规则关键字段永远停在"待核验"。

**最终口径**：

1. **新增字段级标记 `manual_only: boolean`**，在 Publish 环节硬拦截，**与置信度完全解耦**（不是"分数高就能发"，而是"这个字段根本不允许自动发"）。

```sql
-- 迁移
ALTER TABLE program_editions
  ADD COLUMN manual_only_fields text[] DEFAULT '{}';

-- Publish 守卫（伪代码）
IF changed_field = ANY(edition.manual_only_fields)
   AND edition.review_state <> 'human_approved' THEN
   -> 写入 review_queue，不更新主表
```

2. **manual_only 字段清单**（写进 `config/field-policy.ts`，随代码走 Git）：

| 字段 | 是否 manual_only | 理由 |
|---|---|---|
| `signup_start` / `signup_end` | ✅ **是** | CET 明确"各考点报名时间不同"，全国统一时间不存在 |
| `fee_cny` / `fee_note` | ✅ **是** | 分省定价、逐年调整、常在附件表格里 |
| `event_start` / `event_dates` | ✅ **是** | 可能延期、分批 |
| `eligibility`（报考资格） | ✅ **是** | 错判一条让人白准备一年 |
| `policy_benefits`（政策优惠） | ✅ **是** | 单独划线/免试/加分，规则逐年改 |
| `competition_rules`（晋级规则） | ✅ **是** | 组委会临时调整频繁 |
| `name` / `organizer` / `official_url` / `aliases` | ❌ 否 | 标题与入口可自动同步 |
| `published_at` / `source_url` / `fetched_at` | ❌ 否 | 元数据天然可靠 |

3. **"双源交叉"改为"同源二次校验"**（红队 §5 的关键修正）：

```
原规则（不可执行）：L1 直证 AND 至少 1 个独立源一致 -> 才可发布
   -> 现实：CET/软考/教资官方只有一个发布口，第二源不存在
   -> 后果：首页"正在报名"长期为空

新规则（可执行）：原文快照 + 附件哈希 + 发布日变更检测 + 强制跳转官方原文
   -> 置信度不再决定"发不发"，只决定"标不标【待核验】"
   -> manual_only 字段永远走人工，其他字段可自动同步
```

---

## M3｜研招网：子域 robots 分开测，降为 L2 半自动

**问题**：02 §4 判 chsi"禁抓考研资讯"，§2 却把 `yz.chsi.com.cn/kyzx/...` 正文页标 ✅ 可抓；03 更把它列为主干源。实测：`/kyzx/` 的 Disallow 属于 **www 主域**，`yz.chsi.com.cn/robots.txt` 返回 **404（无 robots）**。

**最终口径**：
- **"没有 robots" ≠ 授权**。robots.txt 缺失只表示"未禁止"，不表示许可。
- 研招网降为 **L2 半自动**：**只抓静态正文页**（如 `yz.chsi.com.cn/kyzx/jybzc/...html`），**不碰列表接口**（列表由 XHR 拉取，绕接口 = 绕 robots）。
- 每个子域的 robots **单独测试并记录**到 `sources.yaml` 的 `robots_ok` 字段，不得用主域结论覆盖子域。

---

## M4｜覆盖率与成本：按 33 个已验证源重算，不按 120 个拍脑袋

**问题**：02 §3 给"60% 静态 / 20% 无头 / 20% 不可抓"，但 §2 的 33 行里只有 2 行标 ❌；把"200 但全站禁抓"的挑战杯、雅思、托福算进去，真正可自动抓的约 **22 行（≈67%）**。而 03 又按"120 个源"算 1 万页/月、110 元/月，其中 87 个源**没有任何清单**。

**最终口径**：

| 项 | 旧（拍脑袋） | 新（按已验证源） |
|---|---|---|
| 源总数 | 120 | **33（已验证）/ 其余列待验证** |
| 页面量 | 1.5 万页/月 | **≈ 4,000 页/月** |
| 服务器 | 含在 110 元 | **≈ 60 元/月**（2C4G 轻量） |
| LLM 调用 | 含在 110 元 | **≈ 18 元/月**（DeepSeek，按 4,000 页 × 20% 触发 LLM） |
| **合计** | **110 元/月** | **≈ 80 元/月** |
| 人工 | 4-6 小时/周 | **4-6 小时/周（不变，瓶颈在人不在机）** |

> **缺口必须写进 README**：不可抓或高成本的那几类（挑战杯、雅思、托福、CPA 报名、研招目录）**恰好是需求最集中的**。这决定了产品必须接受"覆盖不完整"，且要在 UI 上明示"本平台未覆盖 X"。

---

## M5｜去重阈值：0.86 会误合并，提到 0.93 并加门控

**问题**：`score = 0.50×name + 0.30×org + 0.20×year`。同主办方同年份时 org+year = 0.5 满分，**阈值 0.86 只需 name ≥ 0.72 就自动合并**——蓝桥杯软件类/电子类、软考各资格、教资笔试/面试会被并成一条。03 却写"0.86 约等于只差届次"，结论与公式不符。

**最终口径**：

```
score = 0.50 × name_sim + 0.30 × org_sim + 0.20 × year_sim

门控（gate，不满足直接新建，不进相似度计算）：
  - year 必须相等（差 1 年以内可进灰区）
  - org 相似度 < 0.6 -> 直接新建

阈值：
  - score >= 0.93        -> 自动合并
  - 0.85 <= score < 0.93 -> 人工确认
  - score < 0.85         -> 新建

强制人审（无论分数）：
  - 同 organizer + 同 year + 不同 name -> 一律人审
    （覆盖：蓝桥杯软件类/电子类、软考各资格、教资笔试/面试）
```

**合并可逆**：保留 `merged_into` 字段，**不物理删除**，误合并可一键回滚。

---

## M6｜DDL 唯一键：`round DEFAULT 'main'` 与"一年两轮"冲突

**问题**：`CONSTRAINT edition_uniq UNIQUE (program_id, year, round)` 且 `round DEFAULT 'main'`。CET、NCRE、教资每年两轮，**第二轮写入即违反唯一约束**。

**最终口径**（二选一，推荐 A）：

```sql
-- A（推荐）：round 语义化
ALTER TABLE program_editions
  ALTER COLUMN round SET DEFAULT 'h1';
ALTER TABLE program_editions
  ADD CONSTRAINT round_chk CHECK (round IN ('h1','h2','annual','special'));

-- B（备选）：把 signup_start 并入唯一键
ALTER TABLE program_editions DROP CONSTRAINT edition_uniq;
ALTER TABLE program_editions
  ADD CONSTRAINT edition_uniq UNIQUE (program_id, year, round, signup_start);
```

> 注意：B 方案在 `signup_start` 为 NULL 时唯一性失效（PostgreSQL 默认 NULL 不等于 NULL），须改用 `COALESCE(signup_start, '1900-01-01')` 或部分唯一索引。**所以推荐 A。**

---

## M7｜双许可与 DCO 互斥，改 CLA 或放弃双许可

**问题**：04 §7.1 承诺"AGPL + 作者保留商业授权"，§7.3 又选 **DCO** 而非 CLA。DCO 只证明贡献者有权提交，**不授予版权转让或再许可权**——一旦有外部贡献，作者无权单独售卖商业许可。

**最终口径**（二选一）：

| 方案 | 做法 | 适合 |
|---|---|---|
| **A（推荐，简单）** | 放弃双许可。**纯 AGPL-3.0**，变现改为"托管部署 + 商标授权 + 定制服务"，继续用 DCO | 1-3 人、不想管法务 |
| B | 保留双许可，**改 CLA**（贡献者签署版权转让或再许可授权） | 明确要走商业授权路线 |

> 推荐 A。理由：这个项目的护城河是"数据 + 信任"，不是代码授权费。为了一年可能几千块的商业授权去维护 CLA 流程，不划算。

---

## 建议修正（全部采纳）

| # | 问题 | 采纳的修正 |
|---|---|---|
| 1 | 120 源分层无依据 | 改为 **33 个已验证源**：约 22 个可自动（静态）+ 7 个半自动 + 4 个人工。调度按此重排 |
| 2 | 工时对不上（逐项加 2.8h，结论写 4-6h） | 补齐差额说明：差额是**新源准入 + 冲突裁决 + 申诉处理**，单列约 1.5-3 小时/周 |
| 3 | 否决线与路线图不兼容 | **改为"6 个月 200 订阅，12 个月 1000"**（原"6 个月 1000"不可能达成，会自我否决） |
| 4 | 04 与 03 字段名不一致 | **以 03 为准**回写 04：`event_dates[] -> event_start/event_end`、`fee -> fee_cny`、`notice_url -> official_url`、`source_id -> primary_source_id` |
| 5 | 招聘模块没进 03 调度与成本 | **M2 之前不做招聘模块**。若做，纳入 T0 每日 HEAD 探测，单列成本 |
| 6 | 缺 ICP + 公安备案、订阅邮件个保法义务 | 写入 **M1 Definition of Done**：① ICP 备案号 ② 公安联网备案 ③ 订阅邮件双确认 + 一键退订 + 隐私政策 |
| 7 | "0 个 RSS/API"措辞过强 | 改为 **"抽查 16 个源首页，0 个提供 RSS 或公开 API"** |

---

## 字段命名统一表（03 为准，04 回写）

| 04 旧名 | 03 新名 | 类型 |
|---|---|---|
| `event_dates[]` | `event_start` + `event_end` | date |
| `fee` | `fee_cny` | numeric |
| `notice_url` | `official_url` | text |
| `source_id` | `primary_source_id` | uuid |
| `confidence` | `confidence_score` | int 0-100 |
| `review_state` | `review_state` | enum(pending/auto_published/human_approved/rejected) |

---

## 一句话总结

> 红队指出的 **7 条必须修正已全部落到可执行口径**，其中三条改变结论：
> ① **置信度不再决定"发不发"，只决定"标不标待核验"**（M1+M2）；
> ② **自动化只能做到"半自动"**，核心字段永远人工（M2）；
> ③ **成本从 110 元/月降到 80 元/月，源从 120 降到 33**（M4）。
