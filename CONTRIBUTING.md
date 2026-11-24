# 贡献指南

感谢你想帮 College-AM。这个项目只有两种贡献方式，都很轻。

## 1. 纠错（最需要）

发现某条日期、费用、主办方与你看到的官方原文不一致：

1. 打开 [Issues](https://github.com/college-am/college-am/issues/new?template=data-error.yml)
2. 填：哪个条目、哪个字段、正确值、**官方链接**（没有官方链接的纠错不会被采纳）
3. 24 小时内核实 → 错误则立刻下架该字段并记录日志

> 我们只接受带官方链接的纠错。这是唯一能挡住"听说今年改成 xx 号"这类传言的机制。

## 2. 加信源 / 加条目

### 信源准入标准（缺一不可）

- [ ] 是 **L1 官方**（主办方/主管部委官网）或 **L2 半官方**（高校教务处/省级考试院）
- [ ] 有稳定的公告列表页（不是零散的单篇文章）
- [ ] `robots.txt` 不禁止抓取（贴出你实际看到的规则）
- [ ] 能取得**发布日期**

不满足的，请说明原因，我们可能仍以 `manual_only` 方式人工维护。

### 提交数据 PR

1. Fork 仓库
2. 在 `data/programs/` 下新建或修改 JSON
3. `node scripts/validate.mjs` 必须通过
4. `node scripts/test.mjs` 必须通过
5. 提交 PR，说明数据来源

**PR 必过三道检查**：schema 校验 + 内部链接可达 + 至少 1 名 maintainer review。

### 数据格式速查

```json
{
  "id": "kebab-case-id",
  "kind": "cert | contest | job",
  "name": "全称",
  "aliases": ["常用简称", "别名"],
  "organizer": "主办方",
  "organizerType": "official | academic | company | school",
  "level": "international | national | provincial | school",
  "tags": ["标签"],
  "majors": [{ "id": "backend", "weight": "core" }],
  "officialUrl": "https://...",
  "summary": "自写摘要，8-120 字，禁止复制公告原文",
  "editions": [{
    "id": "xxx-2026-h1",
    "year": 2026,
    "round": "h1 | h2 | annual | special",
    "milestones": [
      { "label": "笔试", "date": "2026-06-13", "kind": "event" }
    ],
    "noticeUrl": "https://官方公告页",
    "sourceUrl": "https://官方公告页",
    "fetchedAt": "2026-11-24T21:30:00+08:00",
    "trustTier": "L1",
    "reviewState": "pending"
  }]
}
```

**注意**：新提交的 Edition 请用 `"reviewState": "pending"`，不要自己标 `human_approved`——那是 maintainer 复核后才改的。

## 3. 代码

- 零运行时依赖（这是硬约束，方便长期维护）
- Node.js ≥ 20
- 提交前跑 `node scripts/test.mjs`
- 不接受引入框架重写（除非有充分理由）

## 4. 不接受的贡献

- 转载公告全文
- 抓取 robots.txt 明确禁止的站点
- 加入任何形式的付费排名、返佣链接
- 站内投递/简历收集功能

---

## 署名

数据贡献者保留署名权。数据以 CC BY-SA 4.0 发布，代码以 AGPL-3.0 发布。
