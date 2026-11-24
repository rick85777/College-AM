# 06 · AI 岗位栏：渠道全清单、校招时间线与能力分层

> 归属：College-AM 可行性研究 · AI 板块数据支撑  
> 实测日期：2026-11-24（东八区 22:30—23:20）  
> 范围：只做信息整理与核实，**不改 `scripts/build.mjs`、不抓岗位数据、不做推荐**  
> 纪律：每个入口均给出实测状态；查不到的一律标「未核实」，不估算、不补全  
> 实测方法：PowerShell 5.1 `Invoke-WebRequest -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30`，UA Chrome/131，失败重试 3 次。逐条结果见 §4。

---

## 0. 一句话结论

AI 岗位这一栏的价值不在「多几个招聘链接」——多到 60 个也还是导航站。真正稀缺的是**时间**：哪个批次什么时候开、什么时候关、我这个学历能投哪一档。所以 §1 是素材，**§2 才是这一栏的正文**。

---

## 1. 渠道全清单

字段：`名称 | URL | 谁在这招 | 一句话 | tags`。每条 URL 都在 §4 有实测记录。

### 1.1 互联网大厂 AI 岗（15 条）

| 名称 | URL | 谁在这招 | 一句话 | tags |
|---|---|---|---|---|
| 字节跳动 | https://jobs.bytedance.com/campus | 校招 / 暑期实习 | 官方配置里同时列了「面向 2027 届毕业生」与「面向全体在校生」两个项目，见 §2.3 的字段矛盾 | 校招, 大模型 |
| 百度 | https://talent.baidu.com/jobs/campus | 校招（2026.9–2027.8 毕业） | 页面原文「开放技术、产品、政企、销售、综合五大类岗位」；AIDU 计划单独招顶尖 AI 校招生 | 校招, AIDU |
| 腾讯（校招） | https://join.qq.com | 校招 | 校招主站（首屏 HTML 仅 2KB，SPA）；具体岗位要求要去 `careers.tencent.com` 的 JD 页看 | 校招, SPA |
| 腾讯（JD 库） | https://careers.tencent.com | 社招 + 校招 JD | JD 全文公开可检索，学历/年限写在原文里，是核对「本科能不能进」最方便的一手源 | JD, 可检索 |
| 阿里巴巴 | https://talent.alibaba.com/campus | 校招 | 会 301 到 `talent.alibaba.com/`，正常 | 校招 |
| 华为 | https://career.huawei.com/cn/ | 校招 + 社招 | 首页资讯里有 2027 届面试进度，能当时间线的旁证 | 校招 |
| 美团 | https://zhaopin.meituan.com/web/home | 校招 + 社招 | 首次访问可能超时，重试即 200 | 校招 |
| 快手 | https://zhaopin.kuaishou.cn | 校招 + 社招 | 校招入口在站内 | 校招 |
| 小红书 | https://job.xiaohongshu.com | 校招 + 社招 | 同上，首次可能超时 | 校招 |
| 网易（社招） | https://hr.163.com | 社招 | 校招另有独立站 | 社招 |
| 网易（校招） | https://campus.163.com | 校招 | 与 `hr.163.com` 是两个站 | 校招 |
| 滴滴 | https://talent.didiglobal.com/home/ | 校招 + 社招 | 招聘主站是 SPA 壳（首屏纯文本仅「首页」二字），必须浏览器渲染 | 校招, SPA |
| 米哈游 | https://jobs.mihoyo.com | 校招 + 社招 | 独立招聘域，页面标题即「miHoYo 招聘官网」；具体方向需进站筛，本文未核实岗位构成 | 校招, 游戏 |
| 京东 | https://campus.jd.com | 校招 | 2027 届正式批 08-03 起（第三方汇总口径，见 §2.1） | 校招 |
| 哔哩哔哩 | https://jobs.bilibili.com | 校招 + 社招 | 2027 届 08-03 开（第三方汇总口径，见 §2.1） | 校招 |

### 1.2 大模型公司（8 条）

| 名称 | URL | 谁在这招 | 一句话 | tags |
|---|---|---|---|---|
| 月之暗面 Kimi | https://careers.kimi.com | 校招 + 社招 | 独立招聘域 | 大模型 |
| DeepSeek | https://talent.deepseek.com | 校招 + 社招 | 页面是 SPA 壳（首屏 HTML 仅 ~600B），必须浏览器渲染 | 大模型, SPA |
| 智谱 AI | https://www.zhipuai.cn/zh | 校招 + 社招 | 官网 HTML 里有 `join` 入口；`careers.zhipuai.cn` 实测不可用，别引 | 大模型, SPA |
| MiniMax | https://www.minimax.cn/careers | 校招 + 实习 + Top Talent | 规则写得最清楚的一家，见 §2.3 | 大模型, 全年滚动 |
| 百川智能 | https://www.baichuan-ai.com | 校招 + 社招 | 首次访问常超时（重试可 200）；首页 HTML 13KB 里未检出招聘关键字，**招聘入口未核实** | 大模型, SPA |
| 阶跃星辰 | https://www.stepfun.com | 校招 + 社招 | 首页是纯 SPA 壳（HTML 仅 3.3KB），**招聘入口未核实**，需浏览器打开 | 大模型, SPA |
| 零一万物 | https://www.lingyiwanwu.com | 校招 + 社招 | 301 自 `01.ai`；导航栏有「加入我们」 | 大模型 |
| 面壁智能 | https://modelbest.cn | 校招 + 社招 | 导航栏有「加入我们」；首页体积大（~660KB），移动端要留意 | 大模型 |

### 1.3 AI 视觉 / 语音 / 安防（8 条）

| 名称 | URL | 谁在这招 | 一句话 | tags |
|---|---|---|---|---|
| 商汤科技 | https://hr.sensetime.com | 校招 + 社招 | 独立招聘站，页面标题「商汤科技招聘」，分「顶尖人才专项 / 校园招聘 / 社会招聘」三栏 | 视觉, 校招 |
| 旷视科技 | https://www.megvii.com | 校招 + 社招 | 首页 HTML 仅 3.4KB（SPA 壳），未检出招聘关键字，**招聘入口未核实** | 视觉, SPA |
| 科大讯飞 | https://campus.iflytek.com | 校招 | 302 到 `iflytek.zhiye.com`（第三方招聘系统） | 语音, 校招 |
| 第四范式 | https://www.4paradigm.com/about/hr.html | 校招 + 社招 | 直达招聘页，不用站内找 | 决策AI |
| 云从科技 | https://www.cloudwalk.com | 校招 + 社招 | 200，PowerShell 取到完整首页（77KB，标题「云从科技」）；但同一 URL 用另一路抓取曾返回 PHP 报错页（`Undefined offset`），**节点不稳定，收录前需复测** | 视觉, 待复核 |
| 依图科技 | https://www.yitutech.com | 校招 + 社招 | 导航栏「加入依图」为招聘入口 | 视觉 |
| 地平线 | https://www.horizon.auto | 校招 + 社招 | 301 自 `horizon.cc`；首页 HTML（200KB）含 `job` / `hr.` 字样，招聘入口存在 | 芯片, 智驾 |
| 寒武纪 | https://www.cambricon.com | 校招 + 社招 | AI 芯片，页面含「招聘 / 加入我们」入口；岗位偏底层（算子、编译、驱动） | 芯片 |

### 1.4 量化私募的 AI 岗（5 条）

| 名称 | URL | 谁在这招 | 一句话 | tags |
|---|---|---|---|---|
| 幻方量化 High-Flyer | https://www.high-flyer.cn | 校招 + 社招 | 首页 HTML（366KB）含 `job` 字样；媒体普遍称其与 DeepSeek 有关联，**本文未核实这层关系的一手依据** | 量化, AI研究 |
| 九坤投资 | https://www.ubiquant.com/website/home | 校招 + 社招 | 导航栏有「招贤纳士」与「量化竞赛」两个入口，量化竞赛本身也是一条进这行的路径 | 量化, 竞赛 |
| 明汯投资 | https://www.mhfunds.com | 校招 + 社招 | 导航栏有「加入明汯」；校招子域 `join.mhfunds.com` 实测 404，只引主域 | 量化 |
| 灵均投资 | https://www.lingjuninvest.com | 校招 + 社招 | 导航栏「加入我们」为招聘入口 | 量化 |
| Optiver | https://www.optiver.com | 校招 + 社招 | 外资做市商，站点有独立 Careers 区；技术岗偏低延迟系统 | 量化, 外企 |

### 1.5 外企 / 研究院（5 条）

| 名称 | URL | 谁在这招 | 一句话 | tags |
|---|---|---|---|---|
| 微软亚洲研究院 MSRA | https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/ | 研究岗 | 官方页在微软全球站内；`www.msra.cn` 实测连不上，**不要引** | 研究院 |
| 微软（全球） | https://careers.microsoft.com | 校招 + 社招 | 301 到 `/v2/global/en/home.html` | 外企 |
| NVIDIA 中国 | https://www.nvidia.cn/about-nvidia/careers/ | 校招 + 社招 | GPU / 推理框架方向 | 外企, Infra |
| Amazon | https://www.amazon.jobs/zh/ | 校招 + 社招 | 中文界面 | 外企 |
| Intel 中国 | https://www.intel.cn | 校招 + 社招 | 301 到 `/content/www/cn/zh/homepage.html`，招聘在站内 | 外企, 芯片 |

### 1.6 招聘聚合平台（10 条）

| 名称 | URL | 谁在这招 | 一句话 | tags |
|---|---|---|---|---|
| 牛客网 | https://www.nowcoder.com | 全行业 | 校招日程在 `https://www.nowcoder.com/school/calendar`，是少数把「时间」做成产品的地方 | 聚合, 校招日程 |
| 实习僧 | https://www.shixiseng.com | 实习 + 校招 | 站点自述「40万+企业实习、校园招聘岗位信息」 | 聚合, 实习 |
| 应届生求职网 | https://www.yingjiesheng.com | 校招 | 老牌 BBS 式校招信息 | 聚合 |
| 智联校园 | https://xiaoyuan.zhaopin.com | 校招 | 智联的校招子站 | 聚合 |
| BOSS 直聘 | https://www.zhipin.com | 社招 + 校招 | 会 302 到人机验证页 `web/passport/zp/verify.html`，**程序化抓取不可行** | 聚合, 反爬 |
| 拉勾 | https://www.lagou.com | 社招 | 互联网岗为主 | 聚合 |
| 力扣 LeetCode 中国 | https://leetcode.cn | — | 不是招聘站，是算法岗笔试的事实标准，可作能力分层的外链 | 刷题 |
| 国家大学生就业服务平台 | https://www.ncss.cn | 校招（官方） | 页脚「版权所有：教育部学生服务与素质发展中心」，官方校招平台 | 官方, 聚合 |
| 国聘 | https://www.iguopin.com | 校招（国资央企） | 站内关键词「国资央企招聘平台」 | 官方, 国企 |
| 研招网 | https://yz.chsi.com.cn | — | 考研日程官方源（2027 日程表见 §2.2），是「本科 → 研究生」这条路径的入口 | 官方, 深造 |

---

## 2. 校招时间线（这一栏的核心）

**先声明**：本节所有月份都是**经验规律，不是任何机构的官方规定**。官方只会公布「某家公司某批次的开闭时间」，没有全国统一的秋招日历。下面每条都标了来源和可信度，第三方统计与官方原文分开写。

### 2.1 一年五个窗口

| 窗口 | 大致月份 | 谁在招 | 关键特征 | 来源 |
|---|---|---|---|---|
| 秋招提前批 | 7 月 — 8 月 | 大厂技术岗为主 | 岗位少、流程短、竞争相对温和（原文措辞）；「不影响正式批」只在部分公司成立，如字节明写「有两次投递机会」 | 第三方汇总，见下 |
| 秋招正式批 | 8 月 — 10 月 | 全部行业 | 9 月是网申最高峰，一家公司从投递到 offer 常见 1—2 个月 | 同上 |
| 秋招补录 | 11 月 — 次年 1 月 | 没招满的团队 | **没有统一时间**，常只在单位官网或学校就业网发一次、开几天就关 | 同上 |
| 春招 | 2 月 — 4 月 | 补招 + 中小公司 | 3 月最集中；岗位数少于秋招（量级**未核实**） | 同上 |
| 全年滚动 | 全年 | 大模型公司（已验证） | 不按批次 | 官方原文，见 §2.3。外企/研究所是否全年滚动，**未核实** |

**支撑证据（第三方，需按「经验规律」引用）**：

- [idealoffer 2026 秋招时间线](https://www.idealoffer.cn/news/2026-qiuzhao-timeline-bishi-rili-2)（2026-11-20）把秋招拆成提前批 7—8 月、正式批 9—10 月、补录 11—12 月三段，并点名具体日期：腾讯技术研发提前批 7 月 23 日启动、游戏新星计划 7 月 29 日开启、字节 8 月 3 日起开放投递、阿里 8 月 5 日启动网申/内推、小米 8 月 10 日启动至 12 月 31 日；网申窗口表里美团 2026-08-17 起至 10-31、京东 2026-08-03 至 11-30。该页自己声明「凡是官方未公布、仅第三方汇总的日期，都会单独标注「第三方整理，仅供参考」」。
- [prismresume 2027 秋招](https://prismresume.cn/qiuzhao-2027)（页面标注更新 2026-11-08）原文：秋招补录「一般在 11 月下旬到次年 1 月，没有统一时间，常常只在单位官网或学校就业网发一次、开几天就关」；「春招一般 2-4 月集中」。同一页的分行业梯次表：互联网大厂提前批 6-7 月、正式批 8 月上中旬集中官宣（截止 10 月底—12 月）、笔试 8 月下旬—10 月、offer 9-11 月；银行提前批 6-8 月、网申 9 月 3-7 日集中开启、10 月 7-10 日截止；央企/能源电力 9 月中下旬—11 月中旬。这些是该页自制的汇总，属第三方口径。
- [mianlingai 校招时间线统计](https://wangshen.mianlingai.com/guide/2027-campus-recruitment-wangshen-timeline/)（2026-11-13）统计了 **126,030 个校招岗位**的发布时间：7 月 10,643（8%）、8 月 46,849（37%）、9 月 47,078（37%）、10 月 15,598（12%）、11 月截至 12 日 5,862（5%）；峰值周 8/31—9/6 单周 18,930 条。同一页写「2027 届春招预计在 2027 年 2 月至 4 月进行，3 月最为集中」。

**这里有个能直接讲给用户听的结论**：原文写「8 月和 9 月形成两个月的高峰，两个月合计发布 93,927 个校招岗位，占 7 月至 11 月中旬总量的 **75%**」。所谓「错过秋招」，具体就是错过这两个月。注意分母是「7 月至 11 月中旬」，不是全年。

**不确定性**：上述三份都是第三方整理，不是官方日历；它们彼此在「提前批起点」上就不一致（6—7 月 vs 7—8 月），说明连业内对这条线也没有统一说法。**引用时必须带「经验规律」四个字**。官方的、可核验的只有各家自己的公告，例如 [华为校招首页](https://career.huawei.com/cn/)的资讯区在 2026-11-06 发的是「直击华为 2027 届面试现场」——这能证明 11 月华为仍在面试，但证不了任何统一日历。

### 2.2 只有一次机会的人：秋招没上岸就得等春招

秋招（8—11 月）覆盖的是**次年 7 月毕业**的那一届；春招（2—4 月）是**同一届的最后补票窗口**。所以对应届生来说，真正的硬约束是：

- **秋招拿到 offer 的人，会在 11 月—次年 1 月陆续签三方**，春招放出来的岗位是「秋招没招满 + 有人毁约」的余量，总量显著小于秋招（依据：mianlingai 的月度分布里 11 月只剩 5%，而春招没有任何一份第三方统计给出与 8—9 月同量级的数字 → 这一句标**未核实**，只有方向性判断）。
- **考研 / 考公失败的人，只能进春招**。2027 研考日程表由研招网在 2026-09-24 发布（[原文页](https://yz.chsi.com.cn/kyzx/kydt/202609/20260924/2293971536.html)，实测 200），初试在 12 月下旬、成绩与复试在次年 2—4 月——**出分时间与春招窗口重叠**，这是「考研失败即春招」这句经验说法的结构性原因（日程表原始数据以页面为准，本文未逐条抄录日期，标**未核实**）。
- 因此这一栏对用户真正的提醒不是「有哪些公司」，而是「**你手里还剩几个窗口**」。

### 2.3 大厂 vs 大模型公司：一个是批次制，一个是全年滚动

这是两类完全不同的招聘机器，混在一张表里会误导人。

**大厂 = 批次制，有明确届别边界。** 百度校招页原文：「本次招聘面向 2026 年 9 月至 2027 年 8 月毕业的在校生，开放技术、产品、政企、销售、综合五大类岗位」（[talent.baidu.com/jobs/campus](https://talent.baidu.com/jobs/campus)）——**毕业月份被写死在一个 12 个月的区间里**，差一个月就进不去这一批。

字节的例子更能说明这件事有多脆：校招页内嵌配置里同时存在两条互相矛盾的字段——`"project,7194661126919358757"` 写「面向 2027 届毕业生，提供转正机会」，而 `"type,2"` 的「招聘范围」写「2024 年 9 月 - 2025 年 8 月期间毕业的学生」（[jobs.bytedance.com/campus](https://jobs.bytedance.com/campus)，2026-11-24 抓取原文）。后者对应的是 2025 届，明显是没清干净的旧配置。**这条不是用来证明字节的门槛，而是用来证明：连官方页面的结构化字段都会自相矛盾，任何自动抓取都必须保留原文与抓取时间，否则无法判断哪个字段可信。**

**大模型公司 = 全年滚动，届别边界松。** MiniMax 招聘页（[minimax.cn/careers](https://www.minimax.cn/careers)）原文四条并列：「Top Talent 人才计划 全年开放投递，优秀不受毕业时间与学历束缚」「2027 届校园招聘 面向 2027 届毕业生同学，**具体毕业时间不限**」「2028 届实习生招聘 面向 2028 届毕业生，提供转正机会」「日常实习 面向全体在校生」。百度也在同一页写「2027 届暑期实习项目已结束；**日常实习项目全年开放且不限毕业时间**」。

**对产品的含义**：如果把两类公司放进同一个「截止日期」字段里，一定是错的——大模型公司没有截止日期。这一栏的数据模型必须能表达「无截止 / 滚动」这种状态。

### 2.4 实习转正 vs 校招直投

两条路的差别不在难度，在**入口是否对你开着**：

- **实习转正**：先以实习生身份进组，转正评估通过后拿 offer。字节在 2027 届项目说明里直接写「提供转正机会」（[jobs.bytedance.com/campus](https://jobs.bytedance.com/campus)）；MiniMax 的 2028 届实习生招聘也写「提供转正机会」（[minimax.cn/careers](https://www.minimax.cn/careers)）。**这条路对本科生更友好**，因为实习岗的学历门槛普遍低于同组校招岗。
- **校招直投**：直接投校招岗，跟同届所有人竞争同一批 HC。
- **时间上的差别**：实习转正的评估发生在**实习结束前**（通常入职 3 个月左右），比秋招正式批的 offer 发放更早；也就是说走通实习的人，在别人还在等笔试时就已经上岸（**这条是基于招聘流程的推断，不是任何公司的公开承诺，标未核实**）。
- **风险**：实习转正失败不占用秋招名额，但要占用你的暑假——**这是唯一一个「可以两条路都走」的窗口，代价是暑期没有第二个暑假**。

### 2.5 研究生 vs 本科生：算法岗的现实差距，用 JD 说话

不引二手说法，直接统计腾讯公开招聘 API 的 JD。抓取方式：`https://careers.tencent.com/tencentcareer/api/post/Query?keyword=算法&pageIndex=1&pageSize=20` 取列表，再逐条请求 `https://careers.tencent.com/tencentcareer/api/post/ByPostId?postId=<id>` 读 `Requirement` 原文。**「算法」关键词第 1 页 20 条**的学历要求分布：

| 学历要求 | 条数 | 占比 |
|---|---|---|
| 硕士及以上 | 13 | 65% |
| 本科及以上 | 4 | 20% |
| 未写明 | 3 | 15% |

原文样例：[QQ-高级算法工程师](https://careers.tencent.com/jobdesc.html?postId=2044968720287297536)「计算机科学、人工智能、电子工程等相关专业硕士及以上学历」；[金融大模型-算法工程师](https://careers.tencent.com/jobdesc.html?postId=2101507113946886144)「硕士及以上」；[腾讯云 DataBuddy-大模型算法专家](https://careers.tencent.com/jobdesc.html?postId=2114668850799886336)「硕士及以上」。

**但换个关键词，结论完全不同。** 用同样的方法抓 `keyword=推理` 的第 1 页 20 条：

| 学历要求 | 条数 | 占比 |
|---|---|---|
| 本科及以上 | 10 | 50% |
| 硕士及以上 | 2 | 10% |
| 未写明 | 8 | 40% |

同一家公司、同一天、同样读 `Requirement` 原文，**「算法」岗 65% 要硕士，「推理」岗 50% 明写本科即可、只有 10% 要硕士**。原文样例：[多模态推理加速工程师](https://careers.tencent.com/jobdesc.html?postId=2119629462948720640)「计算机、电子、自动化等相关专业本科及以上学历，3 年及以上 GPU 高性能计算、大模型推理加速开发经验」；[混元推理算子开发工程师](https://careers.tencent.com/jobdesc.html?postId=2066810245954580480)「本科及以上学历，计算机科学、电子工程、软件工程等相关专业」；[微信 -WeLM 大模型推理优化工程师](https://careers.tencent.com/jobdesc.html?postId=2020723060671414272)「计算机、软件工程、人工智能等相关专业本科及以上学历」。

**结论**：本科想进 AI，算法研究岗（硕士是硬门槛）不是主战场，**工程/推理部署岗**才是。这一点在 §3 展开。**局限要说清**：两组各 20 条、只覆盖腾讯一家，且「未写明」占 15%—40%，不能外推到全行业。

---

## 3. 能力分层：三类岗看什么、本科能不能进、要什么项目

依据全部来自 §4 实测过的 JD 原文，不引任何「求职攻略」。

### 3.1 算法岗（研究 / 模型）

**看什么**：学历是第一道筛子。腾讯「算法」JD 抽样 20 条里 13 条写「硕士及以上」，只有 4 条写「本科及以上」（详见 §2.5）。写「硕士及以上」的岗位描述里，真正被考察的是**研究产出**——论文、竞赛名次、大模型训练/微调经验。

**本科能不能进**：能，但不是主流路径。可行的三条：①本科 + 顶会/顶赛（ACM、Kaggle 前列、大模型相关开源贡献）；②本科 → 硕士（对应 §2.2 的考研路径）；③本科从工程岗切入再转算法。**不要对本科生承诺「本科也能做算法研究岗」**——按腾讯这份样本，明写本科可投的只占 20%。

**需要什么项目**：JD 原文要求的是「扎实的算法与数据结构基础」+ 具体方向经验（NLP / 多模态 / 推荐）。一个可核验的项目比十门网课有用。

### 3.2 工程岗（推理部署 / Infra）—— 本科生最现实的入口

**看什么**：不看论文，看**你能不能把模型跑快**。JD 原文列得非常具体，几乎是免费的学习路线图：

- [多模态推理加速工程师](https://careers.tencent.com/jobdesc.html?postId=2119629462948720640)（本科及以上）要求：「至少深入掌握 vLLM、TensorRT-LLM、SGLang 中的一种，熟悉 PagedAttention、前缀缓存、连续批处理、投机解码等机制」「熟悉 GPU 硬件基础架构，具备 CUDA 或 Triton 算子开发经验，能使用 Nsight Systems/Compute 做性能分析」。
- [混元推理算子开发工程师](https://careers.tencent.com/jobdesc.html?postId=2066810245954580480)（本科及以上）要求：「精通 C/C++/CUDA」「熟悉大模型推理关键技术，如量化（INT8/INT4）、稀疏化、算子融合、动态批处理」。
- [光子 AI-AI Infra 工程师](https://careers.tencent.com/jobdesc.html?postId=2066702542833893376)（本科及以上）。

**本科能不能进**：**这是三条路里唯一以「本科及以上」为主的一条**。同一天抓的「推理」关键词 20 条 JD 里，10 条明写本科及以上、只有 2 条要求硕士（详见 §2.5）。

**需要什么项目**：不是「我用过 ChatGPT」，是「我做过推理加速」。可操作的最小项目：拿一个 7B 模型，用 vLLM 部署，测吞吐/延迟基线；换 SGLang 再测；写一个 Triton 算子替换某个瓶颈 op；用 Nsight 出一张 profile 图。这四步做完就是一份能对着 JD 逐条对上话的作品集。

**注意**：JD 里同时要求「3 年及以上 GPU 高性能计算经验」——社招岗。校招对年限的要求会松，但**方向必须对**。本科生如果只有「调过 API」的经验，这条走不通。

### 3.3 AI 产品岗

**看什么**：这一条和另外两条不一样——**卡的不是学历，是工作年限**。抽到的 AI 产品岗 JD 里没有一条要求硕士，但都要求「一年以上」。对在校生来说，这意味着 AI 产品岗基本不是校招直投能进的，得先有一段产品/算法实习。

- [AI 产品经理-AI 平台（Agent）方向](https://careers.tencent.com/jobdesc.html?postId=2088450750270324736)原文：「一年以上 AI/Agent 产品经验，有完整落地项目经历；计算机科学或相关技术领域的本科及以上学历」「深度使用 AI 工具，能自己动手验证，有模型品味；有对话/推荐/搜索、知识管理、开放平台/插件/Agent/MCP 生态、AI 效率工具等相关产品经验者优先」。
- [微信输入法-AI 产品经理](https://careers.tencent.com/jobdesc.html?postId=1978467627152072704)原文：「有 C 端 AI 产品经验，熟悉 LLM、Agent、多模态交互、语音交互（ASR）等至少一个方向的产品化落地」「**一年及以上产品工作经验**；曾经有算法工作经验的同学优先」——**这条 JD 全文没有写学历要求**。

**本科能不能进**：学历确实不是门槛（两条 JD 一条明写本科及以上、一条完全没提学历），但**「一年以上经验」是**。这句话对本科生是**好消息也是坏消息**：好消息是不用读研，坏消息是**课程作业不算经验**。现实路径是先做一段 AI 产品实习，再谈校招。

**需要什么项目**：一个真实用户用过的 AI 产品（哪怕只有几十个用户），加上你能说清楚「为什么这么设计、badcase 怎么修、成本多少」。JD 里「有模型品味」「能自己动手验证」这两句，翻译过来就是「你得真的做过」。

### 3.4 一张对照表

| | 算法岗 | 工程 / Infra 岗 | AI 产品岗 |
|---|---|---|---|
| 学历硬门槛 | 硕士居多（13/20） | 本科即可（10/20 明写） | 未设学历门槛，但要求 1 年以上经验 |
| 核心考察 | 研究产出、方向经验 | 能不能把推理跑快 | 有没有落地过的产品 |
| 本科生现实路径 | 顶赛/顶会，或先读研 | **首选入口** | 做一个小产品并真的有人用 |
| 最小可做项目 | 复现一篇论文 + 开源 | vLLM/SGLang 部署 + Triton 算子 | 上线一个 AI 工具，有真实用户 |
| 数据来源 | 腾讯「算法」JD 抽样 20 条 | 腾讯「推理」JD 抽样 20 条 | 腾讯 AI 产品 JD 2 条（逐条读过全文） |

**必须说明的局限**：以上统计只覆盖腾讯一家、每组 20 条 JD，**不能代表全行业**。腾讯的算法岗学历要求可能比创业公司严，也可能比研究院松——本文没有做跨公司对照，标**未核实**。

---

## 4. 实测记录表

方法：PowerShell 5.1 `Invoke-WebRequest -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30`，UA 为 Chrome/131，失败最多重试 3 次（间隔 700ms）。测试时间 2026-11-24 22:30—23:20（东八区）。

| URL | HTTP 状态 | 最终跳转地址 | 内容长度 | 备注 |
|---|---|---|---|---|
| https://jobs.bytedance.com/campus | 200 | https://jobs.bytedance.com/campus | len=924168 |  |
| https://talent.baidu.com/jobs/campus | 200 | https://talent.baidu.com/jobs/campus | len=136529 |  |
| https://join.qq.com | 200 | https://join.qq.com/ | len=1985 |  |
| https://careers.tencent.com | 200 | https://careers.tencent.com/ | len=7977 |  |
| https://talent.alibaba.com/campus | 200 | https://talent.alibaba.com/ | len=7983 | 301 跳转 |
| https://career.huawei.com/cn/ | 200 | https://career.huawei.com/cn/ | len=67939 |  |
| https://zhaopin.meituan.com/web/home | 200 | https://zhaopin.meituan.com/web/home | len=34509 | 首次易超时，重试稳定 |
| https://zhaopin.kuaishou.cn | 200 | https://zhaopin.kuaishou.cn/ | len=2383 |  |
| https://job.xiaohongshu.com | 200 | https://job.xiaohongshu.com/ | len=4046 | 首次易超时 |
| https://hr.163.com | 200 | https://hr.163.com/ | len=6083 |  |
| https://campus.163.com | 200 | https://campus.163.com/ | len=3004 |  |
| https://talent.didiglobal.com/home/ | 200 | https://talent.didiglobal.com/home/ | len=1724 |  |
| https://jobs.mihoyo.com | 200 | https://jobs.mihoyo.com/ | len=1691 |  |
| https://campus.jd.com | 200 | https://campus.jd.com/ | len=31167 |  |
| https://jobs.bilibili.com | 200 | https://jobs.bilibili.com/ | len=4763 |  |
| https://careers.kimi.com | 200 | https://careers.kimi.com/ | len=11623 |  |
| https://talent.deepseek.com | 200 | https://talent.deepseek.com/ | len=588 | SPA 壳，需浏览器渲染 |
| https://www.zhipuai.cn/zh | 200 | https://www.zhipuai.cn/zh | len=823237 |  |
| https://www.minimax.cn/careers | 200 | https://www.minimax.cn/careers | len=95935 |  |
| https://www.baichuan-ai.com | 200 | https://www.baichuan-ai.com/ | len=13787 | 首次易超时 |
| https://www.stepfun.com | 200 | https://www.stepfun.com/ | len=3290 |  |
| https://www.lingyiwanwu.com | 200 | https://www.lingyiwanwu.com/ | len=33957 | 301 自 01.ai |
| https://modelbest.cn | 200 | https://modelbest.cn/ | len=675693 | 体积大 |
| https://hr.sensetime.com | 200 | https://hr.sensetime.com/ | len=12939 |  |
| https://www.megvii.com | 200 | https://www.megvii.com/ | len=3814 |  |
| https://campus.iflytek.com | 200 | https://iflytek.zhiye.com/ | len=35913 | 302 到第三方招聘系统 |
| https://www.4paradigm.com/about/hr.html | 200 | https://www.4paradigm.com/about/hr.html | len=47550 |  |
| https://www.cloudwalk.com | 200 | https://www.cloudwalk.com/ | len=85318 |  |
| https://www.yitutech.com | 200 | https://www.yitutech.com/ | len=65969 |  |
| https://www.horizon.auto | 200 | https://www.horizon.auto/ | len=206933 | 301 自 horizon.cc |
| https://www.cambricon.com | 200 | https://www.cambricon.com/ | len=46226 |  |
| https://www.high-flyer.cn | 200 | https://www.high-flyer.cn/ | len=365804 |  |
| https://www.ubiquant.com/website/home | 200 | https://www.ubiquant.com/website/home | len=70748 |  |
| https://www.mhfunds.com | 200 | https://www.mhfunds.com/ | len=29974 |  |
| https://www.lingjuninvest.com | 200 | https://www.lingjuninvest.com/ | len=51570 |  |
| https://www.optiver.com | 200 | https://www.optiver.com/ | len=289148 |  |
| https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/ | 200 | https://www.microsoft.com/en-us/research/lab/microsoft-research-asia/ | len=281647 | 替代打不开的 msra.cn |
| https://careers.microsoft.com | 200 | https://careers.microsoft.com/v2/global/en/home.html | len=29439 |  |
| https://www.nvidia.cn/about-nvidia/careers/ | 200 | https://www.nvidia.cn/about-nvidia/careers/ | len=396488 |  |
| https://www.amazon.jobs/zh/ | 200 | https://www.amazon.jobs/zh/ | len=29646 |  |
| https://www.intel.cn | 200 | https://www.intel.cn/content/www/cn/zh/homepage.html | len=149737 |  |
| https://www.nowcoder.com | 200 | https://www.nowcoder.com/ | len=265199 |  |
| https://www.nowcoder.com/school/calendar | 200 | https://www.nowcoder.com/school/calendar | len=20931 |  |
| https://www.shixiseng.com | 200 | https://www.shixiseng.com/ | len=633169 |  |
| https://www.yingjiesheng.com | 200 | https://www.yingjiesheng.com/ | len=188745 |  |
| https://xiaoyuan.zhaopin.com | 200 | https://xiaoyuan.zhaopin.com/ | len=808779 |  |
| https://www.zhipin.com | 200 | https://www.zhipin.com/web/passport/zp/verify.html?callbackUrl=... | len=43654 | 跳人机验证页，无法程序化获取 |
| https://www.lagou.com | 200 | https://www.lagou.com/ | len=98478 |  |
| https://leetcode.cn | 200 | https://leetcode.cn/ | len=72367 |  |
| https://www.ncss.cn | 200 | https://www.ncss.cn/ | len=116969 |  |
| https://www.iguopin.com | 200 | https://www.iguopin.com/ | len=1539 | SPA 壳 |
| https://yz.chsi.com.cn | 200 | https://yz.chsi.com.cn/ | len=95846 |  |
| https://www.idealoffer.cn/news/2026-qiuzhao-timeline-bishi-rili-2 | 200 | https://www.idealoffer.cn/news/2026-qiuzhao-timeline-bishi-rili-2 | len=45335 |  |
| https://prismresume.cn/qiuzhao-2027 | 200 | https://prismresume.cn/qiuzhao-2027 | len=384076 |  |
| https://wangshen.mianlingai.com/guide/2027-campus-recruitment-wangshen-timeline/ | 200 | https://wangshen.mianlingai.com/guide/2027-campus-recruitment-wangshen-timeline/ | len=33866 |  |
| https://yz.chsi.com.cn/kyzx/kydt/202609/20260924/2293971536.html | 200 | https://yz.chsi.com.cn/kyzx/kydt/202609/20260924/2293971536.html | len=30788 |  |
| https://www.moonshot.cn/ | 200 | https://www.moonshot.cn/ | len=98447 | build.mjs 现有 |
| https://www.deepseek.com/ | 200 | https://www.deepseek.com/ | len=115941 | build.mjs 现有 |

### 4.1 实测失败未收录

以下链接**不进正文清单**，列在此处备查。

| URL | 结果 | 原因 |
|---|---|---|
| https://www.dajie.com/ | DNS 失败 | 未能解析此远程名称 |
| https://www.jkquant.com/ | 连接失败 | 基础连接已经关闭：发送时发生错误（TLS） |
| https://www.minghongfund.com/ | 连接失败 | 无法连接到远程服务器 |
| https://www.quanttiger.com/ | 证书错误 | 未能为 SSL/TLS 安全通道建立信任关系 |
| https://www.9qcapital.com/ | DNS 失败 | 未能解析此远程名称 |
| https://www.wide-gauge.com/ | DNS 失败 | 未能解析此远程名称 |
| https://www.highflyer.com.cn/ | DNS 失败 | 未能解析此远程名称（幻方用的是 high-flyer.cn） |
| https://www.kuandefund.com/ | DNS 失败 | 未能解析此远程名称 |
| https://www.jiuquandechi.com/ | DNS 失败 | 未能解析此远程名称 |
| https://join.mhfunds.com/ | 404 | 跳 /index 仍 404，明汯校招子域不存在 |
| https://www.msra.cn/ | 连接失败 | 无法连接到远程服务器（已改用微软官网 MSRA 页） |
| https://careers.zhipuai.cn/ | 连接失败 | 无法连接到远程服务器（智谱招聘在 zhipuai.cn 站内） |
| https://www.worldquant.com/zh-hans/ | 403 | 拒绝访问（反爬） |
| https://www.citadel.com/careers/ | 403 | 拒绝访问（反爬） |

**另需记录的一次方法失败**：曾尝试用「`<公司名>.jobs.feishu.cn`」这种域名猜测法批量生成招聘入口（01.ai / stepfun / baichuan / modelbest / zhipu / kimi / minimax / deepseek / sensetime 等 10 个），**全部 404 或 DNS 失败**。这条捷径不成立，本文所有入口均为官网首页实测，不做域名推测。

### 4.2 对现有 build.mjs 的复核

现有 `scripts/build.mjs:716-723` 的 6 条 AI 招聘链接逐条实测（**只读核对，未修改该文件**）：

| 现有链接 | 实测 | 说明 |
|---|---|---|
| https://job.bytedance.com/campus | 200 → https://jobs.bytedance.com/campus | 可用但旧域会 301，建议换成 jobs. |
| https://talent.baidu.com/jobs/campus | 200 | 可用 |
| 腾讯 | 200（join.qq.com / careers.tencent.com） | 可用 |
| https://job.alibaba.com/ | 200 → https://talent.alibaba.com/ | 可用但旧域 301，建议换成 talent. |
| https://www.moonshot.cn/ | 200 | 是公司官网首页，不是招聘页；真实招聘在 https://careers.kimi.com |
| https://www.deepseek.com/ | 200 | 同上；真实招聘在 https://talent.deepseek.com |

**结论**：6 条里 2 条指错（月之暗面、DeepSeek 指的是公司首页而非招聘页），2 条是 301 旧域。这一栏要扩，先修这 4 条。

### 4.3 腾讯 JD 引用端点（正文 §2.5、§3 的证据来源）

正文引用的 JD 原文不来自招聘页 HTML（那是 SPA 壳），而是来自腾讯公开的招聘 JSON API。两者都实测：

| URL | HTTP 状态 | 说明 |
|---|---|---|
| https://careers.tencent.com/tencentcareer/api/post/Query?keyword=算法&pageIndex=1&pageSize=20 | 200，len=11,158 | 列表接口，返回 RecruitPostName / PostId |
| https://careers.tencent.com/tencentcareer/api/post/Query?keyword=推理&pageIndex=1&pageSize=20 | 200，len=24,377 | 同上，「推理」关键词 |
| https://careers.tencent.com/tencentcareer/api/post/ByPostId?postId=2044968720287297536&language=zh-cn | 200，len=2,617 | 详情接口，`Requirement` 字段是完整 JD 原文 |
| https://careers.tencent.com/jobdesc.html?postId=2044968720287297536 | 200，len=2,145 | 面向人的详情页（SPA 壳，浏览器可渲染） |
| https://careers.tencent.com/jobdesc.html?postId=2119629462948720640 | 200 | 多模态推理加速工程师 |
| https://careers.tencent.com/jobdesc.html?postId=2066810245954580480 | 200 | 混元推理算子开发工程师 |
| https://careers.tencent.com/jobdesc.html?postId=2020723060671414272 | 200 | 微信 -WeLM 大模型推理优化工程师 |
| https://careers.tencent.com/jobdesc.html?postId=2066702542833893376 | 200 | 光子 AI-AI Infra 工程师 |
| https://careers.tencent.com/jobdesc.html?postId=2101507113946886144 | 200 | 金融大模型-算法工程师 |
| https://careers.tencent.com/jobdesc.html?postId=2114668850799886336 | 200 | 腾讯云 DataBuddy-大模型算法专家 |
| https://careers.tencent.com/jobdesc.html?postId=2088450750270324736 | 200 | AI 产品经理-AI 平台（Agent）方向 |
| https://careers.tencent.com/jobdesc.html?postId=1978467627152072704 | 200 | 微信输入法-AI 产品经理 |

**为什么用 API 而不是页面**：`jobdesc.html` 首屏只有 2,145 字节，JD 正文由 JS 异步注入，直接抓 HTML 拿不到内容；`ByPostId` 接口返回的是同一份原文。这也是 §5.3「不要抓岗位列表」的一个具体注脚——**能抓，但成本高、结构随时会变，不适合做成聚合站的依赖**。

---

## 5. 这一栏该怎么用（给产品的结论）

### 5.1 建议：把「AI 岗位」从链接列表改成时间轴

按 §2 的证据，这一栏的用户问题不是「有哪些公司」，而是三个时间问题：

1. **哪个窗口还开着**——8—9 月两个月合计发布 93,927 个岗位，占 7 月至 11 月中旬总量的 75%（[mianlingai 统计](https://wangshen.mianlingai.com/guide/2027-campus-recruitment-wangshen-timeline/)），错过就是等春招。
2. **这家公司是批次制还是滚动制**——百度写死「2026 年 9 月至 2027 年 8 月毕业」([原文](https://talent.baidu.com/jobs/campus))，MiniMax 写「具体毕业时间不限」([原文](https://www.minimax.cn/careers))，两种模型不能用同一个截止日期字段。
3. **我这个学历能不能投**——算法岗 65% 要硕士、推理岗 50% 明写本科（§2.5 实测）。

所以建议的数据结构（**只是建议，本文不改 build.mjs**）：

```
{ name, url, who, desc, tags,
  cycle: "batch" | "rolling",        // 批次制 / 全年滚动
  window: "autumn-early" | "autumn" | "spring" | null,
  edu: "bachelor-ok" | "master-required" | "unknown" }
```

`window` 和 `edu` 不是抓来的，是**人工按 JD 原文标注 + 来源链接**。这两个字段恰恰是聚合站做不了、而人工可维护的部分。

### 5.2 立刻要修的四条（只读核对，未改文件）

`scripts/build.mjs:716-723` 现有 6 条里：月之暗面指向 `www.moonshot.cn`（公司首页）、DeepSeek 指向 `www.deepseek.com`（公司首页），**都不是招聘页**；字节用 `job.bytedance.com`（301 到 `jobs.`）、阿里用 `job.alibaba.com`（301 到 `talent.`）。建议改成 `careers.kimi.com`、`talent.deepseek.com`、`jobs.bytedance.com/campus`、`talent.alibaba.com/campus`（四条均实测 200，见 §4）。

### 5.3 不要做的事

- **不要抓岗位列表**。`build.mjs:715` 的 note 已经写了理由：「岗位有效期以天计，任何聚合都会滞后，而滞后的岗位信息比没有更糟」。这份实测支持这个判断：BOSS 直聘直接跳人机验证页（§4），腾讯 JD 是 SPA，抓取成本高、失效快。
- **不要做「投递」**。所有入口都跳官网，这是现有免责声明（`build.mjs:715`）已经定的边界。
- **不要编时间**。第三方日历三家互相打架（§2.1），照抄任何一家都会错。写「经验规律 + 来源 + 不确定性」比写一个精确但错的日期强。

---

## 6. 已知缺口

诚实列一下这份材料没解决的问题：

1. **没有跨公司对照**。学历统计只做了腾讯。字节、阿里、华为的 JD 是否同样分布，**未核实**。
2. **春招量级没有硬数据**。所有第三方都只说「2—4 月」「3 月最集中」，没有一份给出春招岗位数占全年的比例。§2.2 里「春招总量显著小于秋招」只有方向性判断，标**未核实**。
3. **校招时间线无官方源**。这是结构性的：没有任何机构发布全国统一的秋招日历，官方只发布自己公司的批次。本文引的三份第三方材料在提前批起点上就不一致（6—7 月 vs 7—8 月）。
4. **AI 产品岗只逐条读了 2 条 JD**，不足以支撑「AI 产品岗不卡学历」这个结论，只能说「这 2 条都没写硕士要求、但都要求 1 年以上经验」。
5. **未验证岗位真实在招**。本文只验证了「页面能打开」，没有验证「页面上挂的岗位还在招」——这需要登录或投递才能确认，超出本次范围。

---

## 附：本文所有外链的实测状态

见 §4 的三张表（58 条入口 + 14 条失败 + 12 条腾讯 JD/API 端点），全部经 `Invoke-WebRequest` 实测。正文里出现的每一个 `https://` 链接都在其中，没有未实测的链接。腾讯 JD 详情页（`jobdesc.html?postId=...`）为 SPA 壳，首屏 HTML 仅 2,145 字节，**内容必须浏览器渲染**，但 URL 本身实测 200 且可打开，故保留引用；学历原文取自其对应的 JSON API，同上表 API 端点亦为 200。
