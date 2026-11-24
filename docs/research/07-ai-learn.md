# 07 · AI 学习栏：三条能验收的路径 + 中文可直连的全部入口

> 归属：College-AM 可行性研究 · AI 板块数据支撑
> 实测日期：2026-11-24（东八区晚间，分 6 批跑完），全部链接逐条实测，方法见 §7 表头
> 范围：只产出「学什么、按什么顺序、去哪学、怎么算学会」这一栏的素材；**不改 scripts/build.mjs，不写推荐算法，不做课程排名**
> 纪律：**只收录本次实测返回 200 的链接**；失败的一律进 §8，不写好话、不猜它能打开
> 对应 09-ai-ia.md 的 learn（16 条）与 stack（20 条）两组，本文件是这两组的数据源；learn 组的「学习路径」分区直接采用本文 §1 的三条路径，stack 组采用 §3 的工具清单

---

## 0. 这一栏不是「课程推荐」

现有 AI 板块的学习栏只有 6 条：CS229、MIT OCW、动手学深度学习、PyTorch、ModelScope、Coursera。问题不是少，是**它回答不了「我现在该干什么」**。学生对着一排名校课，第一个动作仍然是退回搜索引擎问「零基础怎么学机器学习」。

这一栏要做的事只有一件：**把「学完 XX 课」改写成「能做出 XX」**。三个判断标准，全文都按它们取舍：

| 标准 | 反面 | 本文的做法 |
|---|---|---|
| 有终点 | 「学完 d2l 第 3 章」 | 「在 Titanic 上跑出 ≥0.75 准确率，并能解释为什么不是越高越好」 |
| 有前置 | 把 CS229 推给不会 Python 的人 | 路径按「你现在的起点」分三条，每条只引自己用得上的资源 |
| 有出口 | 学完不知道能投什么 | 每条路径结尾直接对上岗位/比赛：A→助研/实习投递，B→Kaggle 入门赛，C→算法岗实习 |

**一条硬规矩：本栏不排名、不评分、不接返佣。** 资源只按「什么时候用得上」排序，不按「好不好」排序——后者我们既没有评测能力，也没有中立性。

本栏最终交付的东西，一张表看完：

| 交付物 | 数量 | 在哪一节 | 它解决什么 |
|---|---|---|---|
| 学习路径 | 3 条（A/B/C）× 4–5 个阶段 | §1 | 「我现在该干什么、怎么算过关」 |
| 中文资源（区分原创/翻译） | 36 条 | §2.1–2.3 | 「有没有不看英文就能开始的」 |
| 可直连性分档 | 3 档覆盖全部 140 条 | §2.0 | 「这个链接我这儿打不打得开」 |
| 工具链触发条件 | 16 个工具 | §3 | 「这个框架现在该不该学」 |
| 前沿入口 | 12 个 | §4 | 「怎么不落后」 |
| 练手去处 | 35 个 | §5 | 「去哪攒项目写进简历」 |
| 资讯与社区 | 12 个 | §6 | 「每天 5 分钟扫什么」 |
| 实测证据 | 140 条 200 + 27 条失败 | §7–8 | 「凭什么信你」 |

---

## 1. 三条学习路径

三条路径的划分依据是**起点**，不是难度。挑路径的方法只有一句：**能独立写一个读 CSV 求平均分的 Python 脚本吗？** 不能 → A；能，但没训练过模型 → B；训练过且知道过拟合是什么 → C。

时长按「每周 8–10 小时、课内时间之外」估。低于这个投入，三条路径的任何一条都会拖成两年。

### 1.1 路径 A：零基础（非科班、无 Python）→ 能跑通第一个模型

**总时长 12–16 周。终点不是「学完」，是「有一个能跑、能解释、能改的模型」。**

| 阶段 | 时长 | 学什么 | 具体资源 | 验收标准（能做出什么） |
|---|---|---|---|---|
| A1 环境与语法 | 3 周 | 变量/循环/函数/字典、pip、venv、读写文件、报错怎么看 | 廖雪峰 Python 教程（前 6 章）；菜鸟教程当速查；Python-100-Days 前 15 天 | 在自己电脑上建好 venv、装上一个第三方包、写一个读 CSV 求各科平均分的脚本，并能把它跑出结果 |
| A2 数据处理 | 2 周 | NumPy 数组、pandas 读表/筛选/分组、matplotlib 画图 | Kaggle Learn · Python（约 7 小时）；NumPy 官网 Quickstart；Datawhale《动手学数据分析》第 1–3 章 | 拿到一份真实的、有缺失值和脏数据的 CSV，做出缺失率统计、按类别分组聚合，并画出 3 张能看的图 |
| A3 第一个模型 | 3 周 | 训练/测试划分、线性回归与逻辑回归、准确率/混淆矩阵、过拟合是什么 | Kaggle Learn · Intro to Machine Learning（约 3 小时）；scikit-learn 官方 Getting Started；d2l 中文版第 3 章 | 用 sklearn 在 Titanic 上跑到 ≥0.75 准确率，并能说清「为什么把测试集调参调到 0.9 是假的」 |
| A4 跑通神经网络 | 3 周 | 张量、autograd、nn.Module、手写训练循环、保存与加载权重 | PyTorch 官方 60 分钟入门（pytorch.org/tutorials）；d2l 中文版第 5–6 章；《动手学 CV-PyTorch》前 2 章 | 用 PyTorch 手写训练循环（不用高层封装）在 MNIST 上跑到 ≥97%，并完成一次「训练中断→加载权重→继续推理」 |
| A5 换成真实任务 | 2–4 周 | 迁移学习、数据增强、GPU 使用、模型导出 | Kaggle Learn 的 Intermediate ML；百度 AI Studio 免费 GPU；Ultralytics 文档（选做检测） | 把 A4 的模型换成 ResNet18 做 10 类自建图片分类，测试集 ≥85%，并把模型导出成一个能被别的脚本加载的文件 |

**A 路径的两个卡点，提前说：**

- **卡点 1：A2 之后会想跳过 A3 直接学深度学习。** 结果是会抄训练循环但解释不了 loss 曲线。A3 的验收标准就是防这个的闸门。
- **卡点 2：没有 GPU 也能走完 A。** MNIST 这种小图在 CPU 上训练是分钟级的事，具体多快取决于你的机器，但「跑得动」是确定的；A5 换真实图片任务时再用 AI Studio 的免费算力。**不要为了学 A 先买显卡。**

### 1.2 路径 B：会 Python、不懂 ML → 能独立打完一个 Kaggle 入门赛

**总时长 8–12 周。终点是「有排行榜名次、有可复现的 notebook、能讲清自己每一步为什么这么做」。**

| 阶段 | 时长 | 学什么 | 具体资源 | 验收标准（能做出什么） |
|---|---|---|---|---|
| B1 补齐 ML 词汇 | 2 周 | 监督/无监督、特征与标签、偏差方差、交叉验证、评价指标 | Kaggle Learn · Intro to ML + Intermediate ML；scikit-learn 官方 User Guide 的 metrics 与 model_selection 两节 | 拿到任意一个表格数据集，能独立说出「这题该用什么指标、为什么不能用准确率」 |
| B2 sklearn 全流程 | 3 周 | 缺失值/类别编码/标准化、Pipeline、GridSearchCV、特征重要性 | scikit-learn 官方文档（Pipeline、compose、model_selection）；Datawhale《动手学数据分析》第 4–6 章 | 写出一条从原始 CSV 到提交文件的完整 Pipeline（预处理+模型+调参），换一个数据集不改结构也能跑 |
| B3 打一场结构化比赛 | 3 周 | 赛题理解、基线、特征工程、融合、提交格式与次数限制 | Kaggle Competitions 列表里挑 Playground 或 Getting Started 级；Kaggle Code 的公开 notebook 只用来对照，不抄 | 在选定的入门赛上完成 ≥3 次有效提交，最好一次进入前 50%；notebook 能从零重跑到同样分数（±0.005） |
| B4 复盘与迁移 | 2 周 | 误差分析、bad case、为什么输了 | 自己 B3 的提交记录；Kaggle 赛后公开的 solution write-up | 写一份 1 页复盘：哪一步贡献最大、哪一步是无效劳动、下次先做什么 |

**B 路径的一条纪律：不要从「抄高分 notebook」开始。** 抄完能提交，但换一题就废。B2 的验收标准（换数据集不改结构）就是逼你把流程内化成模板。

### 1.3 路径 C：有 ML 基础 → 能读论文、能部署

**总时长 12–16 周。终点是「能复现一篇论文的核心实验，并把它变成一个别人能调用的服务」。**

| 阶段 | 时长 | 学什么 | 具体资源 | 验收标准（能做出什么） |
|---|---|---|---|---|
| C1 读论文的方法 | 3 周 | 三遍读法、图表先行、related work 怎么跳读、复现清单 | arXiv cs.LG/cs.AI 最新列表；HuggingFace Daily Papers 的社区讨论；Papers.cool 的中文摘要；Connected Papers 查引文脉络 | 一周内读完 3 篇同方向论文，产出 1 页对比表：任务/数据/指标/方法差异/我没看懂的地方 |
| C2 从零复现 | 4 周 | 训练循环工程化、混合精度、日志与可复现性、消融实验 | nanoGPT（最小可训 GPT）、micrograd（手写反向传播）、Datawhale《happy-llm》；mlops-zoomcamp 的实验管理部分 | 复现一个 ≥100M 参数或 ≥1 万条数据的训练任务，固定 seed 两次跑出指标差异 <1%，并交一份消融表 |
| C3 推理部署 | 4 周 | 模型量化、批处理、KV cache、OpenAI 兼容 API、显存估算 | vLLM 文档（Quickstart 与 Serving）；Ollama（本地先跑通）；HF Transformers 文档；Streamlit（做界面） | 把一个开源模型用 vLLM 起成 OpenAI 兼容服务，压测出 QPS 与显存占用，并用 Streamlit 做一个能对话的前端 |
| C4 微调 | 3 周 | LoRA/QLoRA、数据构造、SFT 与偏好优化、评测 | HF PEFT 文档、TRL 文档；Datawhale《self-llm》（中文，按显卡型号给配置） | 用自己的 500–2000 条领域数据 LoRA 微调一个 7B 模型，在同一份 50 条测试集上比基座模型提升可量化指标 |
| C5 持续跟进 | 长期 | 怎么不被信息淹没 | AIHOT 日报 + 机器之心/量子位（中文，日均 5 分钟）；HF Papers（每周一次）；arXiv 订阅（只订 1–2 个细分方向） | 建立自己的周更节奏：每周 5 条笔记，一个月后回看能说清「这个月这个方向变了什么」 |

**C 路径最容易自欺的地方是 C1。** 读完摘要就以为读完了论文。C1 的验收标准要求产出对比表和「我没看懂的地方」——后者才是真读过的证据。

---

## 2. 中文资源：先分清「原创」和「翻译」

这一节是全篇最实用的部分，也是最容易掺水的地方。**中文 ML 资源里，很大一部分是把英文内容翻译/搬运过来的**，但页面上常常不写。学生以为在读一手材料，实际上拿到的是二手版本，版本一更新就落后。所以下面每一条都标了**原创 / 翻译 / 官方本地化**。

同时提醒一句：**「中文」不等于「国内能打开」。** 有不少中文内容是托管在 GitHub、HuggingFace 上的，域名照样在墙外。

### 2.0 先看这张表：本文哪些链接要代理、哪些能直连

**这一节要放在最前面，因为它是学生最实际的筛选条件。** 判定口径按「域名归属 + 国内常见网络环境」，不按本次实测结果——本次实测在一台能访问境外的机器上做的，所以 huggingface.co 也返回了 200，这不代表校园网能开。

| 档位 | 判断依据 | 本文涉及的具体域名 | 该怎么做 |
|---|---|---|---|
| **国内直连（无需任何工具）** | .cn 域名或国内公司运营 | modelscope.cn、aistudio.baidu.com、tianchi.aliyun.com、datafountain.cn、heywhale.com、datawhale.cn、icourse163.org、xuetangx.com、paddlepaddle.org.cn、mindspore.cn、gitee.com、openi.pcl.ac.cn、leetcode.cn、oi-wiki.org、csdiy.wiki、runoob.com、liaoxuefeng.com、zh.d2l.ai、pytorch.ac.cn、tensorflow.google.cn、scikit-learn.org.cn、B 站 / 知乎 / 掘金 / CSDN / 开源中国（bilibili.com、zhihu.com、juejin.cn、csdn.net、oschina.net）、jiqizhixin.com、qbitai.com、infoq.cn、aihot.news、hf-mirror.com | 直接用 |
| **能开但要等** | 境外域名，国内多数网络可访问，速度不稳定 | github.com（**本文 140 条里 38 条在这**）、arxiv.org、papers.cool、pytorch.org、scikit-learn.org、numpy.org、ollama.com、docs.vllm.ai、docs.langchain.com、docs.llamaindex.ai、ocw.mit.edu、cs229/cs231n/cs224n 的 stanford.edu、semanticscholar.org、openreview.net、alphaxiv.org、karpathy.ai、streamlit.io、datatalks.club、deeplearning.ai | 能开，但**别在临交作业前才点**；GitHub 建议配镜像或 Gitee |
| **基本要代理** | 国内常见网络下大概率打不开 | huggingface.co（**用 hf-mirror.com 替代**）、kaggle.com（**用 AI Studio / 天池替代**）、colab.research.google.com（**用 Kaggle Code / AI Studio 替代**）、coursera.org | 有替代就先用替代，见上 |

**给这个栏目的直接结论**：如果一张卡片不能标清「要不要代理」，那它对学生就是负价值——点开转圈 30 秒，比没收录更浪费时间。所以卡片上的 `access` 徽标不是装饰，是这一栏的第一道筛选。

**另外注意：GitHub 是本文最大的单一依赖，也是最大的单点风险。** Datawhale 全套、Karpathy 全套、微软课程都在 github.com 上。国内访问 GitHub 时快时慢，**这一栏必须为每个 GitHub 条目准备好至少一条备份路径**（Datawhale 官网 / hf-mirror / Gitee 镜像 / 项目自有域名），否则「收藏夹里一半打不开」会在上线第一周就发生。

### 2.1 Python 与编程基本功（全部中文原创）

| 资源 | 地址 | 性质 | 什么时候用 |
|---|---|---|---|
| 廖雪峰 Python 教程 | https://liaoxuefeng.com/books/python/introduction/index.html | 中文原创 | A1 主线。讲工程习惯（虚拟环境、模块、异常）比讲语法多，正好补非科班最缺的那块 |
| 菜鸟教程 Python3 | https://www.runoob.com/python3/python3-tutorial.html | 中文原创 | **只当速查**。忘了某个字符串方法怎么拼时查，不要顺着目录学 |
| Python-100-Days | https://github.com/jackfrued/Python-100-Days | 中文原创 | A1 的练习来源，按天给任务，适合需要「有人安排今天做什么」的人 |
| Hello 算法 | https://github.com/krahets/hello-algo | 中文原创 | 数据结构入门，动画图解对零基础友好。官网 hello-algo.com 本次 429 限流，用仓库 |
| CS 自学指南 | https://csdiy.wiki/ | 中文原创 | 解决「计算机课该按什么顺序补」。**不要照着全学**，只查你路径上缺的那门 |
| OI Wiki | https://oi-wiki.org/ | 中文原创 | 算法概念速查，比刷题先看这个能省时间 |
| labuladong 算法笔记 | https://labuladong.online/algo/ | 中文原创 | 面试向算法。实测 301 到根域，正常 |
| 力扣中文站 | https://leetcode.cn/ | 中文站 | 面试绕不开。与 ML 无关，但投算法岗一定会考 |

### 2.2 中文教材与课程（原创）

| 资源 | 地址 | 性质 | 什么时候用 |
|---|---|---|---|
| 李沐 B 站空间 | https://space.bilibili.com/1567748478 | 中文原创视频 | 页面标题实测为「跟李沐学AI的个人空间」。d2l 的配套讲解，看不懂书时看对应那节 |
| 李宏毅机器学习笔记（Datawhale 整理） | https://github.com/datawhalechina/leedl-tutorial | 中文原创整理 | 讲课风格比教科书口语化，适合 A3/B1 阶段换一种说法理解同一概念 |
| 南瓜书 | https://github.com/datawhalechina/pumpkin-book | 中文原创 | 读周志华《机器学习》卡在公式推导时的补丁。**不是替代教材**，是推导注释 |
| 神经网络与深度学习（邱锡鹏） | https://github.com/nndl/nndl.github.io | 中文原创教材 | 体系完整的中文教材，适合 B2 之后系统补理论。主域 nndl.github.io 本次超时，用仓库 |
| 统计学习方法代码复现 | https://github.com/fengdu78/lihang-code | 中文原创代码 | 李航书的每章配可运行代码，理论读完立刻验证 |
| 吴恩达 ML 课程中文笔记 | https://github.com/fengdu78/Coursera-ML-AndrewNg-Notes | 中文原创笔记 | 不想看视频时的替代品。注意是**别人整理的笔记**，推导有省略 |
| 动手学数据分析 | https://github.com/datawhalechina/hands-on-data-analysis | 中文原创 | **路径 B 的入口**。比任何 ML 课都该先做，因为比赛 70% 时间在洗数据 |
| 动手学 CV-PyTorch | https://github.com/datawhalechina/dive-into-cv-pytorch | 中文原创 | A5 阶段的 CV 主线，按任务组织而非按模型组织 |
|  Easy-RL | https://github.com/datawhalechina/easy-rl | 中文原创 | 强化学习。**只在确定要做 RL 方向时看**，否则是时间黑洞 |
| MLNLP 社区 | https://github.com/MLNLP-World | 中文社区 | NLP 方向的资源与论文清单汇总，当索引而不是当教程 |
| 中国大学 MOOC | https://www.icourse163.org/ | 中文原创平台 | 想要「有老师、有作业、有证书」的结构时用。质量取决于开课学校，选课前先看开课单位 |
| 中国大学 MOOC 计算机分类 | https://www.icourse163.org/category/computer | 中文原创平台 | 同上，直接进计算机分类 |
| 学堂在线 | https://www.xuetangx.com/ | 中文原创平台 | 清华系课程为主，与 MOOC 互补 |
| 飞桨 PaddlePaddle | https://www.paddlepaddle.org.cn/ | 中文原创文档 | 国产框架里中文资料最全的一支。课程作业要求国产框架时首选 |
| 飞桨教程 | https://www.paddlepaddle.org.cn/tutorials | 中文原创文档 | 同上，直接进教程 |
| 昇思 MindSpore | https://www.mindspore.cn/ | 中文原创文档 | 华为系课程/竞赛指定框架时用 |
| 魔搭 ModelScope 文档 | https://modelscope.cn/docs | 中文原创文档 | **国内下模型最省事的路**，不用代理。A5/C3 阶段必用 |

### 2.3 中文资源里的「翻译/本地化」——必须与原创分开标注

> 这一类不是不能用，而是**要知道自己在读二手材料**：版本会落后于英文原版，术语译法可能与论文不一致。看的时候以英文原文为准。

| 资源 | 地址 | 性质 | 什么时候用 |
|---|---|---|---|
| 动手学深度学习（中文版） | https://zh.d2l.ai/ | 社区翻译，作者团队维护 | **A4/B2 的主教材**。虽是译版，但由 d2l 团队维护、章节与代码和英文版一一对应，更新较及时，可信度高于一般的第三方译本 |
| d2l 中文版旧站（第二版） | https://zh-v2.d2l.ai/ | 同上，旧版本快照 | 引用章节号时注意：与 zh.d2l.ai 编号不完全一致，站内混用会导致「第 5 章」指的不是同一节 |
| d2l 中文版源码 | https://github.com/d2l-ai/d2l-zh | 同上 | 想本地跑 notebook、或书里代码跑不通时对照 |
| 花书中文版（exacity） | https://github.com/exacity/deeplearningbook-chinese | 第三方翻译 | 只当参考手册查概念。**公式以英文原书为准**，中文版有个别错译 |
| 花书中文版（ApacheCN） | https://github.com/apachecn/apachecn-dl-zh | 第三方翻译 | 与上一条是同一本书的两个译本，**择一即可，别对读** |
| ApacheCN | https://github.com/apachecn | 翻译组织 | 大量中文翻译项目的入口。质量参差，按项目看 |
| LLM Cookbook | https://github.com/datawhalechina/llm-cookbook | 翻译+整理 | 吴恩达大模型短课的中文版笔记与代码。C 阶段想快速过一遍 LLM 应用层时用 |
| scikit-learn 中文文档 | https://scikit-learn.org.cn/ | 社区翻译 | 英文文档读不动时的辅助。**版本常落后于官方**，参数以官方为准 |
| PyTorch 中文站 | https://pytorch.ac.cn/ | 官方本地化 | 中文入门材料。API 细节仍要看英文 docs |
| PyTorch 中文教程 | https://pytorch.ac.cn/tutorials/ | 官方本地化 | 同上。实测会被重写到带中文的路径，能打开但地址不干净，建议从首页进 |
| TensorFlow 中文站 | https://tensorflow.google.cn/ | 官方本地化 | 课程要求 TF 时用。跳转后带 ?hl=zh-cn，正常 |

---

## 3. 官方文档与工具链：什么时候会真的打开它

这一节不写「XX 是什么」，只写**你会在哪一步被迫打开它**。工具链的介绍网上到处都是，稀缺的是「现在该不该学它」。

| 工具 | 什么时候会用到它（触发条件） | 官方入口 |
|---|---|---|
| PyTorch | A4 开始手写训练循环时。**只要你要改模型内部，就绕不开它**；只调 API 的话 sklearn 就够 | https://pytorch.org/ ｜ 教程 https://pytorch.org/tutorials/ ｜ API https://pytorch.org/docs/stable/index.html |
| Transformers | 第一次想「不训练、直接用一个预训练模型」时。加载权重、tokenizer、pipeline 三件事都在这 | https://huggingface.co/docs/transformers/index |
| Datasets | 数据不是 CSV 而是 parquet/音频/图片目录，或者要流式加载不能全放内存时 | https://huggingface.co/docs/datasets/index |
| PEFT | 显存只够跑推理、但任务要求微调时。LoRA/QLoRA 是唯一现实解 | https://huggingface.co/docs/peft/index |
| TRL | 要做 SFT/DPO 而不是自己写训练循环时。省掉一大半样板代码 | https://huggingface.co/docs/trl/index |
| vLLM | 模型能跑通但「一次只能服务一个人」时。要并发、要高吞吐就上它 | https://docs.vllm.ai/ ｜ 仓库 https://github.com/vllm-project/vllm |
| Ollama | 想在本机 5 分钟内跑起一个模型、先看看效果时。**探索期用它，上线别用它** | https://ollama.com/ ｜ 模型库 https://ollama.com/library |
| LangChain | 要把「模型调用 + 检索 + 工具 + 多轮状态」串起来时。**单次调用别用**，会平白多一层抽象 | https://docs.langchain.com/ |
| LlamaIndex | 任务核心是「在自己的文档上检索问答」时。RAG 场景比 LangChain 更直接 | https://docs.llamaindex.ai/ |
| ModelScope | 国内网络下不了 HF 模型时的第一选择；国产模型（Qwen、GLM 等）的首发地 | https://www.modelscope.cn/models ｜ 创空间 https://modelscope.cn/studios |
| Ultralytics（YOLO） | 做目标检测、且不想从论文复现开始时。一条命令训完 | https://docs.ultralytics.com/ |
| OpenMMLab | 要做检测/分割/姿态，且需要 SOTA 配置与预训练权重时。文档在仓库里，官网 openmmlab.com 本次 SSL 失败 | https://github.com/open-mmlab |
| scikit-learn | **B 路径全程的主力**。表格数据上，它比深度学习更可能赢 | https://scikit-learn.org/ |
| NumPy | 任何时候要手算矩阵、或看不懂别人代码里的广播时 | https://numpy.org/ |
| Streamlit | 模型跑通了，要给非程序员看效果时。几行代码换一个网页 | https://streamlit.io/ |
| 镜像站 hf-mirror | huggingface.co 打不开、但脚本里写死了 HF 地址时的环境变量替换方案 | https://hf-mirror.com/ |

**一句话取舍**：A 阶段只需要 sklearn + PyTorch；B 阶段只需要 sklearn + pandas；C 阶段才轮到 Transformers / PEFT / vLLM。**提前装一堆框架是新手最常见的无效劳动。**

---

## 4. 论文与前沿：12 个入口，按场景挑

| 入口 | 地址 | 适合什么场景 | 不适合什么 |
|---|---|---|---|
| arXiv cs.LG | https://arxiv.org/list/cs.LG/recent | 想第一时间看方法本身；已有明确研究方向，只需要「今天这方向新增了什么」 | 新手。没有筛选能力时，每天几百篇等于没看 |
| arXiv cs.AI | https://arxiv.org/list/cs.AI/recent | 看跨方向的整体动向、找选题 | 同上；且 cs.AI 比 cs.LG 更杂，噪声更大 |
| arXiv cs.CL | https://arxiv.org/list/cs.CL/recent | 做 NLP/LLM 方向时的主战场 | 非 NLP 方向的人，信息密度太低 |
| HuggingFace Daily Papers | https://huggingface.co/papers | **绝大多数人的默认入口**。每天由社区投票筛出一批高关注论文，省掉从几百篇里挑的功夫 | 想追一个很窄的方向时，会漏 |
| HF 热门论文榜 | https://huggingface.co/papers/trending | 想知道「这个月在热什么」，判断方向值不值得进 | 判断一篇论文质量。热度 ≠ 质量 |
| Papers with Code | https://paperswithcode.com/ | 找「这篇论文有没有开源实现」 | **注意：本站已并入 HuggingFace**，实测 301 到 huggingface.co/papers/trending，直接收藏 HF 即可 |
| Papers.cool | https://papers.cool/ | 中文界面 + AI 摘要，英文读不动时的过渡 | 替代原文。摘要有偏差，结论要回原文核 |
| alphaXiv | https://www.alphaxiv.org/ | 在 arXiv 页面上直接看别人的提问与讨论，判断这篇有没有坑 | 当权威解读。评论区水平参差 |
| Connected Papers | https://www.connectedpapers.com/ | 拿到一篇论文，想看它的上下游与同族工作 | 追最新进展，它的数据有延迟 |
| Semantic Scholar | https://www.semanticscholar.org/ | 查引用数、判断影响力、找综述 | 追当天新论文 |
| OpenReview | https://openreview.net/ | 看会议公开评审意见——**判断一篇论文靠不靠谱，评审意见比摘要有用** | 找教程 |
| ML-Papers-Explained | https://github.com/dair-ai/ML-Papers-Explained | 读经典老论文时找通俗解释 | 追新论文 |

**还差一类入口：中文资讯。** 上面 12 个全是英文的「论文入口」，而大多数人的真实需求是「这个月 AI 圈发生了什么」。这一类放在 **§6**：AIHOT（日报形态，一天一页）、机器之心、量子位。三者的区别是——**AIHOT 用来每天扫一遍不漏事，机器之心用来查产业动态，量子位用来看产品落地**；都不适合替代读论文。

**给大学生的现实建议**：本科阶段不需要「追前沿」。**先用 HF Daily Papers 每周看一次，把 C1 的三遍读法练熟，比订阅十个 arXiv 分类有用。** 真正的信息焦虑来自「订了但没读」，不是「订得不够」。

---

## 5. 找项目与找练手：从「学完」到「有东西可写进简历」

| 去处 | 地址 | 适合谁 | 具体怎么用 |
|---|---|---|---|
| Kaggle Learn | https://www.kaggle.com/learn | A2–B1 | 短课 + 即时练习，一门 3–7 小时。**先做 Python 与 Intro to ML 两门**，别全刷 |
| Kaggle Learn · Python | https://www.kaggle.com/learn/python | A1–A2 | 语法到 pandas 的过渡，比看教程快 |
| Kaggle Learn · Intro to ML | https://www.kaggle.com/learn/intro-to-machine-learning | A3 / B1 | 决策树与模型验证的第一课 |
| Kaggle Competitions | https://www.kaggle.com/competitions | B3 | **挑 Playground 或 Getting Started 级**。Featured 赛不要碰，那是给有卡的人打的 |
| Kaggle Code | https://www.kaggle.com/code | B2–B3 | 免费 GPU + 现成环境。**只用来对照思路，不抄提交** |
| 天池 | https://tianchi.aliyun.com/ | B3 / C | 国内赛，中文赛题、中文论坛，报名门槛低 |
| 天池竞赛列表 | https://tianchi.aliyun.com/competition/gameList/activeList | B3 | 实测 301 到 /competition/，直接进列表 |
| DataFountain | https://www.datafountain.cn/ | B3 | 另一个国内赛平台，政企赛题多，适合攒项目经历 |
| 百度 AI Studio | https://aistudio.baidu.com/ | A5 / B3 | **国内免费 GPU 最现实的一条路**，不需要信用卡 |
| AI Studio 竞赛 | https://aistudio.baidu.com/competition | B3 | 常规赛+训练营，入门赛比 Kaggle 好上手 |
| AI Studio 课程 | https://aistudio.baidu.com/course | A2–B2 | 中文课程，配套可运行环境 |
| 和鲸社区 | https://www.heywhale.com/ | B2–B3 | 国内数据科学社区，数据集与项目模板多。实测 301 到 /home |
| Datawhale 官网 | https://www.datawhale.cn/ | 全阶段 | **组队学习**是它最有价值的形态：有截止日期、有人催、有作业 |
| Datawhale GitHub | https://github.com/datawhalechina | 全阶段 | 所有开源教程的总入口，按专题分仓库 |
| Datawhale 组队学习 | https://github.com/datawhalechina/team-learning | A–C | 按专题组织的学习计划，跟着走比自己定计划靠谱 |
| self-llm | https://github.com/datawhalechina/self-llm | C3–C4 | 按显卡型号给部署/微调配置的中文实操指南，**C 阶段最省时间的一份** |
| happy-llm | https://github.com/datawhalechina/happy-llm | C2 | 从零训练一个大模型，配合 nanoGPT 看 |
| tiny-universe | https://github.com/datawhalechina/tiny-universe | C2 | 手搓大模型各组件，适合想搞清内部结构的人 |
| 微软 ML-For-Beginners | https://github.com/microsoft/ML-For-Beginners | A3–B2 | 12 周课程，英文但结构清晰，适合当 B 路径的替代主线 |
| 微软 AI-For-Beginners | https://github.com/microsoft/AI-For-Beginners | A4–B2 | 同上，偏 AI 通识与神经网络 |
| 微软 Generative AI for Beginners | https://github.com/microsoft/generative-ai-for-beginners | C 阶段入门 | LLM 应用层的系统课，21 课，配代码 |
| 微软 AI Agents for Beginners | https://github.com/microsoft/ai-agents-for-beginners | C 阶段进阶 | Agent 方向的入门，做毕设选题时可参考 |
| Hands-On ML 配套代码 | https://github.com/ageron/handson-ml3 | B2 | 书里的 notebook 全在这，比抄书快 |
| MLOps Zoomcamp | https://github.com/DataTalksClub/mlops-zoomcamp | C3 | 部署与工程化的系统课，**想投工程岗而不是算法岗时看这个** |
| Karpathy zero-to-hero | https://karpathy.ai/zero-to-hero.html | C2 | 从反向传播手写到 GPT，视频+代码，**最值得完整跟一遍的一门** |
| nanoGPT | https://github.com/karpathy/nanoGPT | C2 | 最小可训 GPT，300 行。复现首选 |
| micrograd | https://github.com/karpathy/micrograd | C2 前置 | 100 行手写反向传播，看完就不再怕 autograd |
| llm.c | https://github.com/karpathy/llm.c | C2 进阶 | C 语言实现 GPT 训练，想搞懂性能时看 |
| OpenMMLab | https://github.com/open-mmlab | B3 / C | CV 方向的工具箱与预训练权重，打检测类比赛直接套 |
| 启智 OpenI | https://openi.pcl.ac.cn/ | A5 / B3 | 国产算力与开源社区，AI Studio 之外的另一条免费算力路 |
| MIT OCW | https://ocw.mit.edu/ | 补充 | 想补数学/编程基础课时用，**不要当 ML 主线**，它不是按中国学生进度设计的 |
| CS229 | https://cs229.stanford.edu/ | C1 补理论 | 数学推导完整。**没有线代与概率基础不要碰**——它默认你已经会，不会停下来补 |
| CS231n | https://cs231n.stanford.edu/ | C1 · CV | CV 方向的经典课，作业质量高。**不同年份版本差异不小，认准一版跟完**，别在版本间反复横跳 |
| CS224N | https://web.stanford.edu/class/cs224n/ | C1 · NLP | NLP 方向的经典课，配 PyTorch 作业 |
| Gitee | https://gitee.com/ | 备用 | GitHub 拉不动时的国内镜像与国产项目 |

---

## 6. 中文资讯与社区

| 入口 | 地址 | 性质 | 怎么用 |
|---|---|---|---|
| AIHOT | https://aihot.news/ | 中文 AI 资讯 | 一天一页，扫标题即可，5 分钟 |
| AIHOT 日报 | https://aihot.news/daily | 中文 AI 资讯 | 按日归档，补看某天发生了什么 |
| 机器之心 | https://www.jiqizhixin.com/ | 中文媒体 | 国内 AI 产业动态最全的一支，偏新闻不偏教程 |
| 量子位 | https://www.qbitai.com/ | 中文媒体 | 与机器之心互补，偏产品与落地 |
| InfoQ 中国 | https://www.infoq.cn/ | 中文技术媒体 | 工程实践与架构，部署相关的内容比前两家多 |
| 掘金 | https://juejin.cn/ | 中文社区 | 工程实践偏多，搜「部署」「踩坑」类内容好用 |
| CSDN | https://blog.csdn.net/ | 中文社区 | **质量参差，只在搜具体报错时用**，别当学习资料 |
| 知乎 | https://www.zhihu.com/ | 中文社区 | 未登录会 302 到登录页，属正常。搜「XX 值得学吗」这类判断题时有价值 |
| 知乎专栏 | https://zhuanlan.zhihu.com/ | 中文社区 | 专栏根域，具体文章地址常 403，建议站内搜 |
| 开源中国 | https://www.oschina.net/ | 中文社区 | 开源项目动态，找国产替代方案时看 |
| B 站 | https://www.bilibili.com/ | 中文视频 | 主站可开；**具体视频页本次实测超时/易失效，改用站内搜索页** |
| B 站搜索「李沐 机器学习」 | https://search.bilibili.com/all?keyword=%E6%9D%8E%E6%B2%90%20%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0 | 中文视频 | 用搜索页代替固定视频地址，避免「收藏的课失效了」 |

---

## 7. 实测记录表

> 方法：Windows PowerShell 5.1，
> `Invoke-WebRequest -Uri <URL> -TimeoutSec 20 -UseBasicParsing -MaximumRedirection 5 -Headers @{User-Agent=Mozilla/5.0 ... Chrome/131}`，
> 超时重试 1 次（间隔 2 秒）后仍失败才判失败。**不使用 node fetch**（本机对部分站点直接 fetch failed，会误判）。
> 状态码为最后一次尝试的结果；「最终跳转」只在与输入地址不同时列出，同 URL 记「—」。
> §7 共 140 条实测 200 的地址；其中 127 条进了正文，13 条列在 7.8 作备用。§8 另列 27 条实测未通过的地址。全部 URL 均逐一实测，无一条凭印象补写。

### 7.1 Python 与算法基础（8 条，全部 200）

| URL | 状态 | 最终跳转 | 备注 |
|---|---|---|---|
| https://liaoxuefeng.com/books/python/introduction/index.html | 200 | — | — |
| https://www.runoob.com/python3/python3-tutorial.html | 200 | — | — |
| https://github.com/jackfrued/Python-100-Days | 200 | — | — |
| https://github.com/krahets/hello-algo | 200 | — | 官网 hello-algo.com 429，仓库正常 |
| https://csdiy.wiki/ | 200 | — | — |
| https://oi-wiki.org/ | 200 | — | — |
| https://labuladong.online/algo/ | 200 | https://labuladong.online/ | 301 到根域 |
| https://leetcode.cn/ | 200 | — | — |

### 7.2 中文教材与课程（20 条，全部 200）

| URL | 状态 | 最终跳转 | 备注 |
|---|---|---|---|
| https://space.bilibili.com/1567748478 | 200 | — | 标题「跟李沐学AI的个人空间」 |
| https://github.com/datawhalechina/leedl-tutorial | 200 | — | — |
| https://github.com/datawhalechina/pumpkin-book | 200 | — | — |
| https://github.com/nndl/nndl.github.io | 200 | — | 主域 nndl.github.io 超时，仓库可用 |
| https://github.com/fengdu78/lihang-code | 200 | — | — |
| https://github.com/fengdu78/Coursera-ML-AndrewNg-Notes | 200 | — | — |
| https://github.com/datawhalechina/hands-on-data-analysis | 200 | — | — |
| https://github.com/datawhalechina/dive-into-cv-pytorch | 200 | — | — |
| https://github.com/datawhalechina/easy-rl | 200 | — | — |
| https://github.com/MLNLP-World | 200 | — | — |
| https://www.icourse163.org/ | 200 | — | — |
| https://www.icourse163.org/category/computer | 200 | — | — |
| https://www.xuetangx.com/ | 200 | — | — |
| https://www.paddlepaddle.org.cn/ | 200 | — | — |
| https://www.paddlepaddle.org.cn/tutorials | 200 | — | — |
| https://www.mindspore.cn/ | 200 | — | — |
| https://modelscope.cn/docs | 200 | — | — |
| https://www.modelscope.cn/ | 200 | https://www.modelscope.cn/home | 301 到 /home |
| https://www.modelscope.cn/models | 200 | — | — |
| https://modelscope.cn/studios | 200 | — | — |

### 7.3 翻译与官方本地化（11 条，全部 200）

| URL | 状态 | 最终跳转 | 备注 |
|---|---|---|---|
| https://zh.d2l.ai/ | 200 | — | — |
| https://zh-v2.d2l.ai/ | 200 | — | 第二版旧站 |
| https://github.com/d2l-ai/d2l-zh | 200 | — | — |
| https://github.com/exacity/deeplearningbook-chinese | 200 | — | — |
| https://github.com/apachecn/apachecn-dl-zh | 200 | — | — |
| https://github.com/apachecn | 200 | — | — |
| https://github.com/datawhalechina/llm-cookbook | 200 | — | — |
| https://scikit-learn.org.cn/ | 200 | — | — |
| https://pytorch.ac.cn/ | 200 | — | — |
| https://pytorch.ac.cn/tutorials/ | 200 | 带中文路径的重写地址 | 能开但地址不干净 |
| https://tensorflow.google.cn/ | 200 | https://tensorflow.google.cn/?hl=zh-cn | 正常 |

### 7.4 官方文档与工具链（35 条，全部 200）

| URL | 状态 | 最终跳转 | 备注 |
|---|---|---|---|
| https://pytorch.org/ | 200 | — | — |
| https://pytorch.org/tutorials/ | 200 | https://docs.pytorch.org/tutorials/ | 301 |
| https://pytorch.org/docs/stable/index.html | 200 | https://docs.pytorch.org/docs/stable/index.html | 301 |
| https://huggingface.co/ | 200 | — | — |
| https://huggingface.co/docs/transformers/index | 200 | — | 中文页 /zh/index 已 404 |
| https://huggingface.co/docs/datasets/index | 200 | — | — |
| https://huggingface.co/docs/peft/index | 200 | — | — |
| https://huggingface.co/docs/trl/index | 200 | — | — |
| https://huggingface.co/learn | 200 | — | 中文版章节页本次超时 |
| https://hf-mirror.com/ | 200 | 站内相对跳转 | 日志编码异常，按同域处理 |
| https://docs.vllm.ai/ | 200 | https://docs.vllm.ai/en/latest/ | 301 |
| https://docs.vllm.ai/en/latest/ | 200 | — | — |
| https://github.com/vllm-project/vllm | 200 | — | — |
| https://ollama.com/ | 200 | — | — |
| https://ollama.com/library | 200 | — | — |
| https://github.com/ollama/ollama | 200 | — | — |
| https://docs.langchain.com/ | 200 | — | 旧域 python.langchain.com 308 |
| https://github.com/langchain-ai/langchain | 200 | — | — |
| https://docs.llamaindex.ai/ | 200 | https://developers.llamaindex.ai/python/framework/ | 301 |
| https://github.com/run-llama/llama_index | 200 | — | — |
| https://docs.ultralytics.com/ | 200 | — | — |
| https://github.com/open-mmlab | 200 | — | 官网 openmmlab.com SSL 失败 |
| https://github.com/PaddlePaddle/PaddleNLP | 200 | — | — |
| https://github.com/huggingface/course | 200 | — | HF 课程仓库 |
| https://scikit-learn.org/ | 200 | — | — |
| https://numpy.org/ | 200 | — | — |
| https://jax.readthedocs.io/ | 200 | https://docs.jax.dev/en/latest/ | 301 |
| https://streamlit.io/ | 200 | — | — |
| https://github.com/karpathy/nanoGPT | 200 | — | — |
| https://github.com/karpathy/micrograd | 200 | — | — |
| https://github.com/karpathy/llm.c | 200 | — | — |
| https://karpathy.ai/zero-to-hero.html | 200 | — | — |
| https://github.com/ageron/handson-ml3 | 200 | — | — |
| https://github.com/DataTalksClub/mlops-zoomcamp | 200 | — | — |
| https://github.com/microsoft/ai-agents-for-beginners | 200 | — | — |

### 7.5 练手与竞赛（29 条，全部 200）

| URL | 状态 | 最终跳转 | 备注 |
|---|---|---|---|
| https://www.kaggle.com/ | 200 | — | — |
| https://www.kaggle.com/learn | 200 | — | — |
| https://www.kaggle.com/learn/python | 200 | — | — |
| https://www.kaggle.com/learn/intro-to-machine-learning | 200 | — | — |
| https://www.kaggle.com/competitions | 200 | — | — |
| https://www.kaggle.com/code | 200 | 前端路由串 | 200 但跳转串是 SPA 噪声，不影响 |
| https://tianchi.aliyun.com/ | 200 | — | — |
| https://tianchi.aliyun.com/competition/gameList/activeList | 200 | https://tianchi.aliyun.com/competition/ | 301 |
| https://www.datafountain.cn/ | 200 | — | — |
| https://aistudio.baidu.com/ | 200 | — | — |
| https://aistudio.baidu.com/competition | 200 | — | — |
| https://aistudio.baidu.com/course | 200 | — | — |
| https://www.heywhale.com/ | 200 | https://www.heywhale.com/home | 301 |
| https://www.datawhale.cn/ | 200 | — | — |
| https://github.com/datawhalechina | 200 | — | — |
| https://github.com/datawhalechina/team-learning | 200 | — | — |
| https://github.com/datawhalechina/self-llm | 200 | — | — |
| https://github.com/datawhalechina/happy-llm | 200 | — | — |
| https://github.com/datawhalechina/tiny-universe | 200 | — | — |
| https://github.com/microsoft/ML-For-Beginners | 200 | — | — |
| https://github.com/microsoft/AI-For-Beginners | 200 | — | — |
| https://github.com/microsoft/generative-ai-for-beginners | 200 | — | — |
| https://ocw.mit.edu/ | 200 | — | — |
| https://cs229.stanford.edu/ | 200 | — | — |
| https://cs231n.stanford.edu/ | 200 | — | — |
| https://web.stanford.edu/class/cs224n/ | 200 | — | — |
| https://gitee.com/ | 200 | — | — |
| https://openi.pcl.ac.cn/ | 200 | — | — |
| https://www.deeplearning.ai/ | 200 | — | 主站 200，short-courses 页 308，见 §8 |

### 7.6 论文与前沿（12 条，全部 200）

| URL | 状态 | 最终跳转 | 备注 |
|---|---|---|---|
| https://arxiv.org/list/cs.LG/recent | 200 | — | — |
| https://arxiv.org/list/cs.AI/recent | 200 | — | — |
| https://arxiv.org/list/cs.CL/recent | 200 | — | — |
| https://huggingface.co/papers | 200 | — | — |
| https://huggingface.co/papers/trending | 200 | — | — |
| https://paperswithcode.com/ | 200 | https://huggingface.co/papers/trending | **已并入 HF** |
| https://papers.cool/ | 200 | — | — |
| https://www.alphaxiv.org/ | 200 | — | — |
| https://www.connectedpapers.com/ | 200 | — | — |
| https://www.semanticscholar.org/ | 200 | — | — |
| https://openreview.net/ | 200 | — | — |
| https://github.com/dair-ai/ML-Papers-Explained | 200 | — | — |

### 7.7 中文资讯与社区（12 条，全部 200）

| URL | 状态 | 最终跳转 | 备注 |
|---|---|---|---|
| https://aihot.news/ | 200 | — | — |
| https://aihot.news/daily | 200 | — | — |
| https://www.jiqizhixin.com/ | 200 | — | — |
| https://www.qbitai.com/ | 200 | — | — |
| https://www.infoq.cn/ | 200 | — | — |
| https://juejin.cn/ | 200 | — | — |
| https://blog.csdn.net/ | 200 | — | — |
| https://www.zhihu.com/ | 200 | https://www.zhihu.com/signin?next=%2F | 未登录跳登录页，正常 |
| https://zhuanlan.zhihu.com/ | 200 | — | 具体文章地址常 403 |
| https://www.oschina.net/ | 200 | — | — |
| https://www.bilibili.com/ | 200 | — | 具体视频页超时 |
| https://search.bilibili.com/all?keyword=%E6%9D%8E%E6%B2%90%20%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0 | 200 | — | — |

### 7.8 实测通过但未采用（备用）

> 这些地址实测 200，但按本栏的取舍没有进正文。列出来是为了两件事：证明测试覆盖到了它们、以及以后需要时可以补进去而不用重测。

| URL | 状态 | 最终跳转 | 未采用的原因 |
|---|---|---|---|
| https://www.coursera.org/ | 200 | — | **主体是付费课程**，按「不收付费课程」的纪律不收录；且短课页 §8 里 308 未通过 |
| https://d2l.ai/ | 200 | — | 英文原版。正文只给中文版，避免同一本书出现两次 |
| https://pytorch.ac.cn/docs/ | 200 | https://docs.pytorch.ac.cn/docs/ | 中文 API 文档，但深度不如英文 docs，作为 pytorch.ac.cn 的下级页面即可 |
| https://arxiv.org/ | 200 | — | 首页信息密度低，正文直接给 cs.LG/cs.AI/cs.CL 三个分类页 |
| https://www.modelscope.cn/learn | 200 | https://www.modelscope.cn/spotlight | 跳转到「魔搭 Spotlight」，与课程页定位不同，暂不混入 |
| https://www.modelscope.cn/mcp | 200 | 站内跳转（编码异常） | MCP 广场，面向 Agent 开发者，MVP 阶段用不上 |
| https://aihot.news/about | 200 | — | 关于页，只有方法论说明，不是学习入口 |
| https://datatalks.club/ | 200 | — | 社区主站。正文已直接给它的 mlops-zoomcamp 仓库，更具体 |
| https://developer.aliyun.com/ | 200 | — | 阿里云开发者社区，内容偏产品文档，教学质量不稳定 |
| https://cloud.tencent.com/developer | 200 | — | 腾讯云开发者社区，同上 |
| https://developer.huaweicloud.com/ | 200 | — | 华为云开发者，同上 |
| https://space.bilibili.com/3493141381371632 | 200 | — | 该 UID 的空间标题实测为空（页面需 JS 渲染），**无法确认是谁**，不收录 |
| https://www.datawhale.cn/home | 200 | 站内跳转（编码异常） | 与 www.datawhale.cn 同页，重复 |

### 7.9 总计

| 分组 | 条数 | 结果 |
|---|---|---|
| 7.1 Python 与算法基础 | 8 | 8 × 200 |
| 7.2 中文教材与课程（原创） | 20 | 20 × 200 |
| 7.3 翻译与官方本地化 | 11 | 11 × 200 |
| 7.4 官方文档与工具链 | 35 | 35 × 200 |
| 7.5 练手与竞赛 | 29 | 29 × 200 |
| 7.6 论文与前沿 | 12 | 12 × 200 |
| 7.7 中文资讯与社区 | 12 | 12 × 200 |
| 7.8 实测通过但未采用（备用） | 13 | 13 × 200，正文未推荐，仅备查 |
| **合计** | **140** | **140 条实测 200** |

---

## 8. 实测失败，未收录

**这一节比上一节更重要。** 一个资源栏的可信度，取决于它敢不敢写「这个打不开」。以下 **27 条实测未通过**（判据：超时重试 1 次后仍非 200，或返回 200 但被劫持到代理页），理由与替代方案逐条写清；另外补记 1 条「状态 200 但站点已并入他处」（paperswithcode），合计 28 行。后续若网络环境变化，需重新实测再决定是否补进来。

| 分类 | 条数 | 说明 |
|---|---|---|
| 限流（429/403） | 4 | 站点活着，但对脚本 UA 或高频访问拒绝。**不是死链** |
| 域名迁移（308/404） | 3 | 换域名或路径变了，需改地址 |
| 真正不可达（超时/连接中断/DNS/SSL） | 19 | 本次环境下一分钟内打不开 |
| 被劫持 | 1 | 返回 200，但落到 1.1.1.3 的代理提醒页，按失败计 |
| **小计** | **27** | 与 §7 的 140 条相加 = 167 条去重地址 |

| URL | 实测结果 | 处理与替代 |
|---|---|---|
| https://huggingface.co/learn/nlp-course/zh-CN/chapter1/1 | FAIL（操作超时） | HF 课程的中文版章节页不稳定。**替代**：用 https://huggingface.co/learn 总入口，或 https://github.com/huggingface/course 仓库 |
| https://huggingface.co/docs/transformers/zh/index | 404 | **Transformers 官方中文文档地址已失效**。这是一个高频误收录项，很多导航站还在引用。**替代**：英文文档 + 社区中文资料 |
| https://huggingface.co/papers/date/2025-01-01 | 429（限流） | 按日期翻页的地址会限流。**替代**：https://huggingface.co/papers 首页 |
| https://paperswithcode.com/ | 200 但 301 到 HF | 不算失败，但**原站已死**，收藏旧地址会多一跳，正文改收 HF |
| https://python.langchain.com/ | 308 | 旧域名。**替代**：https://docs.langchain.com/ |
| https://www.deeplearning.ai/short-courses/ | 308 | 跳转后未跟到最终页。**替代**：主站 https://www.deeplearning.ai/ |
| https://nndl.github.io/ | FAIL（超时） | 教材主站超时。**替代**：https://github.com/nndl/nndl.github.io |
| https://www.hello-algo.com/ | 429（限流） | 官网限流，仓库正常。**替代**：https://github.com/krahets/hello-algo |
| https://kexue.fm/ | 403 | 科学空间（苏剑林博客），**中文原创高质量 ML 博客**，但服务端对非浏览器 UA 返回 403。用浏览器直接访问可看，**脚本/爬虫取不到**，本栏按「无法实测 200」不收录 |
| https://datawhale.club/ | FAIL（DNS 解析失败） | 域名已失效。**替代**：https://www.datawhale.cn/ |
| https://openmmlab.com/ | FAIL（SSL 失败） | 主站证书问题。**替代**：https://github.com/open-mmlab |
| https://www.gradio.app/ | FAIL（超时） | Gradio 官网。**替代**：直接看 https://streamlit.io/ 做 demo，或在 HF Spaces 上用 |
| https://www.fast.ai/ | FAIL（连接中断） | fast.ai 课程站。**替代**：路径 B 用 Kaggle Learn，路径 C 用 Karpathy |
| https://fastapi.tiangolo.com/ | FAIL（超时） | FastAPI 文档。做模型服务时常用，但本次不可达，**不收**；vLLM 自带的 OpenAI 兼容服务已够用 |
| https://pandas.pydata.org/ | FAIL（超时） | pandas 官方文档。**替代**：Kaggle Learn · Python 里的 pandas 章节 |
| https://colab.research.google.com/ | FAIL（超时） | Google Colab。**替代**：https://www.kaggle.com/code 或 https://aistudio.baidu.com/ |
| https://scholar.google.com/ | FAIL（超时） | 谷歌学术。**替代**：https://www.semanticscholar.org/ |
| https://tianchi.aliyun.com/notebook-ai/ | FAIL（超时） | 天池 Notebook。**替代**：Kaggle Code / AI Studio |
| https://www.bilibili.com/video/BV1if4y147hS | FAIL（超时） | **单个视频页不可靠**。这正是正文统一改用「B 站搜索页」的原因 |
| https://github.com/datawhalechina/easy-llm | FAIL（连接关闭） | 该仓库访问异常。**替代**：https://github.com/datawhalechina/happy-llm |
| https://www.llamaindex.ai/ | FAIL（超时） | 官网超时。**替代**：文档 https://docs.llamaindex.ai/ 正常 |
| https://www.msra.cn/ | FAIL（超时） | 微软亚洲研究院中文站 |
| https://www.zhihu.com/column/c_1314447925665992704 | 403 | 具体专栏地址 403。**替代**：https://zhuanlan.zhihu.com/ 根域 + 站内搜 |
| https://www.arxiv-sanity.com/ | FAIL（被劫持） | 实测跳转到 1.1.1.3 的代理提醒页，**不是正常 200**，按失败处理。**替代**：https://www.alphaxiv.org/ |
| https://madewithml.com/ | FAIL（超时） | MLOps 课程站，本次不可达 |
| https://github.com/karpathy | FAIL（超时） | Karpathy 的 GitHub 主页超时；但**具体仓库**（nanoGPT / micrograd / llm.c）全部 200，正文改收具体仓库，不收组织页 |
| https://the-turing-way.netlify.app/ | FAIL（超时） | 开源科研协作指南，与 AI 学习主线关系弱，本次也不可达，不收 |
| https://speech.ee.ntu.edu.tw/~hylee/ml/2023-spring.php | FAIL（连接中断） | 李宏毅课程 2023 春季班页面。**替代**：Datawhale 整理的中文笔记 https://github.com/datawhalechina/leedl-tutorial |

**失败率说明**：本轮共测 **167 条去重地址**（140 条 200 收录 + 27 条失败），**失败率 16.2%**。其中限流 4 条、域名迁移 3 条、被劫持 1 条、真正不可达 19 条。所有 200 的条目在 §7 逐条留证。

**这个数字本身是这一栏存在的理由**：一个学生手动收藏 20 个链接，一年后大约有 3 个打不开，而他不知道是哪 3 个。

---

## 9. 这一栏怎么维护（写给人看，也写给脚本看）

### 9.1 字段规范（对接 09-ai-ia.md 的卡片结构）

每条资源落成卡片时需要 9 个必填字段，本文的表格已经覆盖了其中 6 个，转换规则如下：

| 字段 | 从本文哪里取 | 硬约束 |
|---|---|---|
| `name` | 表格「资源」列 | ≤24 字 |
| `url` | 表格「地址」列 | 必须是 §7 里出现过的 200 地址，**不得手写新 URL** |
| `desc` | 表格「什么时候用 / 怎么用」列压缩 | 10–60 字，只写是什么 |
| `fit` | 同上，取「什么时候用」那半句 | 12–50 字，必须写出「什么时候别用」 |
| `access` | 见 §9.2 | direct / direct-slow / vpn |
| `verified` | 统一填 2026-11-24 | 过期即失效，见 §9.3 |
| `cost` | 本栏收录的全部免费（含免费额度），付费课程已按纪律排除 | free / freemium |
| `kind` | 第三方整理（Datawhale 等）标 aggregator，官方文档标 official | — |
| `tags` | 见各表「性质」列 | ≤3 个 |

### 9.2 访问标注：照 §2.0 的三档打标

判定口径与取值见 **§2.0**（三档：国内直连 / 能开但要等 / 基本要代理），这里只说落到字段上怎么填：

| `access` 取值 | 对应 §2.0 的档位 | 判断依据 |
|---|---|---|
| `direct` | 国内直连 | .cn 域名，或国内公司运营（modelScope、AI Studio、天池、Datawhale、慕课、B 站、知乎、AIHOT…） |
| `direct-slow` | 能开但要等 | 境外域名但国内多数网络可达（**github.com 全部落这一档**、arxiv、pytorch.org、stanford.edu） |
| `vpn` | 基本要代理 | huggingface.co、kaggle.com、colab、coursera、alphaxiv、connectedpapers |

**注意 `direct-slow` 是本栏新增的一档，不要合并进 `direct`。** 理由：把 github.com 标成「国内直连」，学生按 `direct` 筛选出来的结果里会有 38 条他不一定打得开的；这批条目恰恰是全篇质量最高的，标错反而毁掉这批内容的口碑。**宁可在 UI 上多一个橙色徽标，也不要让「国内直连」这个承诺失真。**

### 9.3 失效处理：把「验证日期」变成会过期的字段

1. **每条必须有 `verified`**，格式 YYYY-MM-DD。本文全部为 2026-11-24。
2. **超 90 天未复验** → 卡片显示灰字「待复验」，不隐藏（隐藏等于假装它还在）。
3. **超 180 天未复验** → 构建失败，强制有人去看。
4. **复验只需一次 HEAD/GET**，脚本化，不需要人工逐条点。复验失败的直接移入「暂时打不开」列表，附替代地址——**绝不静默删除**，因为用户收藏过它。

### 9.4 三条不做

| 不做 | 为什么 |
|---|---|
| **不做课程排名、不打分** | 没有评测能力，也没有中立性。一旦打分就等于给某家做背书 |
| **不收付费课程、不接返佣** | 学生是价格最敏感的群体。收一条返佣，整栏的可信度就归零，且无法修复 |
| **不做「AI 推荐学什么」** | 推荐需要行为数据，而我们连用户画像都没有。做出来只会是「按点击率排序」，即谁标题党谁靠前 |

---

## 10. 与现有 6 条的差异（给自己人看的验收）

| 现有 6 条 | 新栏怎么处理 |
|---|---|
| CS229 | 保留，但**从「主线」降为「C1 补理论」**，并加限制：「没有线代与概率基础不要碰」 |
| MIT OCW | 保留，降为「补基础课」 |
| 动手学深度学习 | 拆分：zh.d2l.ai（主教材）+ zh-v2（旧版）+ github 仓库（跑代码），三条各有用途 |
| PyTorch | 拆成 官网 / 教程 / API 三条，并补 pytorch.ac.cn 中文站 |
| ModelScope | 拆成 文档 / 模型库 / 创空间 三条 |
| Coursera | **移除**。付费课程占比高，且 short-courses 页 308 未通过实测 |

**净变化：6 条 → 127 条正文资源（另有 13 条备查）+ 27 条明确标注打不开的记录 + 3 条路径的阶段表。** 但真正让这一栏不一样的不是数量，是每条路径最后一列的「能做出什么」。