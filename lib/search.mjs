/**
 * 全站检索索引（构建期生成，运行时零请求）。
 *
 * 为什么要构建期做：站点是纯静态的，索引必须与页面同版本；
 * 否则搜到的条目可能已经被下架，而用户点进去是 404。
 *
 * 归一化在构建期算好，落进 doc.n / doc.nt / doc.k；
 * 浏览器端只归一化"用户输入的查询词"，规则见 site/assets/quick.js 里的 norm()。
 * 两边必须一致 —— 见 scripts/test.mjs「检索归一化」用例。
 */

const PUNCT = /[\s\u3000·•・\/\\|、,，.。:：;；()（）\[\]【】「」『』<>《》"'“”‘’!！?？_\-—–~～]/g;

/** 归一化：小写 + 去空白 + 去标点。中文搜索不需要分词器，子串匹配即可。 */
export function norm(s) {
  return String(s ?? "")
    // 全角 ASCII（！到 ～）先折成半角：中文输入法下偶尔会打出全角字母
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .replace(PUNCT, "");
}

/** 查询词切成 token（先按空白切，再归一化） */
export function tokens(q) {
  return String(q ?? "")
    .split(/[\s\u3000]+/)
    .map(norm)
    .filter(Boolean);
}

export const DOC_LABEL = { program: "条目", province: "省级窗口", ai: "AI 入口" };

/**
 * @param {object} model
 * @param {Array} model.programs  已带 _published 的条目
 * @param {object} model.provinceData  省级窗口数据
 * @param {Array} model.aiGroups  data/ai.json 的 groups
 */
export function buildDocs({ programs, provinceData, aiGroups }) {
  const docs = [];
  const byId = new Map(programs.map((p) => [p.id, p]));

  // ---- 条目 ----
  for (const p of programs) {
    const pubEds = p.editions.filter((e) => e._published);
    const dates = [];
    for (const e of pubEds) {
      for (const k of e.milestones ?? []) dates.push(k.date + " " + k.label);
      for (const f of ["signupStart", "signupEnd", "eventStart", "eventEnd"]) {
        if (e[f]) dates.push(e[f] + " " + f);
      }
    }
    const kw = [p.shortName, ...(p.aliases ?? []), ...(p.tags ?? [])].filter(Boolean);
    const n = norm([p.name, ...kw, p.organizer, p.summary, ...dates].join(" "));
    docs.push({
      t: "program",
      id: p.id,
      ti: p.name,
      s: [p.organizer, p.kind === "cert" ? "考证" : p.kind === "contest" ? "竞赛" : "招聘"].join(" · "),
      u: "p/" + p.id + ".html",
      n,
      nt: norm(p.name),
      k: norm(kw.join(" ")),
    });
  }

  // ---- 省级窗口（一个省份 × 一场考试 = 一个文档，链到表格里那一行）----
  for (const ed of provinceData?.editions ?? []) {
    const prog = byId.get(ed.programId);
    if (!prog) continue;
    for (const w of ed.windows) {
      const span = w.start + (w.startTime ? " " + w.startTime : "") + " 至 " + w.end + (w.endTime ? " " + w.endTime : "");
      docs.push({
        t: "province",
        id: ed.programId + "-" + w.code,
        ti: w.province + " · " + (prog.shortName ?? prog.name) + " 报名",
        s: span + (w.extra ? " · " + w.extra : ""),
        u: "provinces.html#pv-" + ed.programId + "-" + w.code,
        n: norm([w.province, w.org, prog.name, prog.shortName, "报名 省级 考试院", span, w.extra].join(" ")),
        nt: norm(w.province + (prog.shortName ?? prog.name)),
        k: norm([w.province, prog.name, prog.shortName, "报名 省级"].join(" ")),
      });
    }
  }

  // ---- AI 入口 ----
  for (const g of aiGroups ?? []) {
    for (const s of g.sections ?? []) {
      for (const it of s.items ?? []) {
        const kw = [...(it.tags ?? [])];
        docs.push({
          t: "ai",
          id: it.id,
          ti: it.name,
          s: [it.org, g.title, s.title].join(" · "),
          u: "ai.html#ai-" + it.id,
          n: norm([it.name, it.org, it.desc, it.fit, it.note, ...kw, g.title, s.title].join(" ")),
          nt: norm(it.name),
          k: norm([it.name, it.org, ...kw].join(" ")),
        });
      }
    }
  }

  return docs;
}

/** 纯 ASCII 的锚点 id（中文标签不能直接用进 id，浏览器认但不好复制） */
function slugOf(tag, seen) {
  let s = norm(tag).replace(/[^a-z0-9]/g, "");
  if (!s) s = "t" + (seen.size + 1);
  let out = s;
  let i = 2;
  while (seen.has(out)) out = s + "-" + i++;
  seen.add(out);
  return out;
}

/** 标签 → 条目（"我只想找标了保研加分的"） */
export function buildTagIndex(programs) {
  const map = new Map();
  for (const p of programs) {
    for (const tag of p.tags ?? []) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push({ id: p.id, name: p.shortName ?? p.name, kind: p.kind });
    }
  }
  const seen = new Set();
  return [...map.entries()]
    .map(([tag, items]) => ({ tag, slug: slugOf(tag, seen), items, count: items.length }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh"));
}

/** 与服务端 JSON 无关的纯查询实现，给测试用 */
export function search(docs, query, limit = 25) {
  const toks = tokens(query);
  if (!toks.length) return { tokens: toks, total: 0, hits: [] };
  const hits = [];
  for (const d of docs) {
    let score = 0;
    let ok = true;
    for (const t of toks) {
      if (!d.n.includes(t)) {
        ok = false;
        break;
      }
      score += 1;
      if (d.nt.includes(t)) score += 8;
      else if (d.k.includes(t)) score += 4;
    }
    if (ok) hits.push({ doc: d, score });
  }
  hits.sort((a, b) => b.score - a.score || a.doc.ti.localeCompare(b.doc.ti, "zh"));
  return { tokens: toks, total: hits.length, hits: hits.slice(0, limit) };
}
