#!/usr/bin/env node
import { readProgramFiles, readMajors } from "../lib/load.mjs";
import { validateFile } from "../lib/schema.mjs";
import { loadAi, validateAi } from "../lib/ai.mjs";

const C = {
  red: (s) => "\x1b[31m" + s + "\x1b[0m",
  green: (s) => "\x1b[32m" + s + "\x1b[0m",
  yellow: (s) => "\x1b[33m" + s + "\x1b[0m",
  dim: (s) => "\x1b[2m" + s + "\x1b[0m",
  bold: (s) => "\x1b[1m" + s + "\x1b[0m",
};

const files = await readProgramFiles();
const majors = await readMajors();
const channelIds = new Set(majors.channels.map((c) => c.id));

let totalErrors = 0;
let totalWarnings = 0;
let totalPrograms = 0;
let totalEditions = 0;
let published = 0;
let pending = 0;

console.log(C.bold("\nCollege-AM 数据校验\n"));

for (const { data, name } of files) {
  const { errors, warnings, data: parsed } = validateFile(data, name);
  totalErrors += errors.length;
  totalWarnings += warnings.length;

  if (parsed) {
    totalPrograms += parsed.programs.length;
    for (const p of parsed.programs) {
      totalEditions += p.editions.length;
      for (const e of p.editions) {
        if (e.reviewState === "human_approved" || e.reviewState === "auto_published") published++;
        if (e.reviewState === "pending") pending++;
      }
      // 频道引用必须存在
      for (const m of p.majors) {
        if (!channelIds.has(m.id)) {
          errors.push(`${name} › ${p.id}.majors 引用了不存在的频道 "${m.id}"`);
          totalErrors++;
        }
      }
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(C.green("  ✓ ") + name + C.dim(` (${parsed?.programs.length ?? 0} 个条目)`));
  } else {
    if (errors.length) {
      console.log(C.red("  ✗ ") + name);
      for (const e of errors) console.log("      " + C.red("ERROR") + " " + e);
    }
    if (warnings.length) {
      if (!errors.length) console.log(C.yellow("  ! ") + name);
      for (const w of warnings) console.log("      " + C.yellow("WARN ") + " " + w);
    }
  }
}

// 频道覆盖：每个频道至少要有 1 个 core
console.log(C.bold("\n频道覆盖检查\n"));
const coreCount = new Map(majors.channels.map((c) => [c.id, 0]));
const totalCount = new Map(majors.channels.map((c) => [c.id, 0]));
for (const { data } of files) {
  for (const p of data.programs) {
    for (const m of p.majors) {
      if (!totalCount.has(m.id)) continue;
      totalCount.set(m.id, totalCount.get(m.id) + 1);
      if (m.weight === "core") coreCount.set(m.id, coreCount.get(m.id) + 1);
    }
  }
}
for (const c of majors.channels) {
  const core = coreCount.get(c.id);
  const all = totalCount.get(c.id);
  const flag = core === 0 ? C.red("  ✗ 空频道") : all < 3 ? C.yellow("  ! 内容偏少") : C.green("  ✓");
  console.log(flag + ` ${c.name.padEnd(18, " ")} core=${String(core).padEnd(3)} total=${all}`);
}


// AI 板块：109 条外链索引（docs/research/09-ai-ia.md）
console.log(C.bold("\nAI 板块检查\n"));
const ai = await loadAi();
const aiRes = validateAi(ai);
let aiErrors = 0;
for (const e of aiRes.errors) { console.log("      " + C.red("ERROR") + " " + e); aiErrors++; }
for (const w of aiRes.warnings) { console.log("      " + C.yellow("WARN ") + " " + w); }
const st = aiRes.stats;
console.log(
  (aiErrors ? C.red("  ✗ ") : C.green("  ✓ ")) +
  "data/ai.json" + C.dim(" (" + st.groups + " 组 / " + st.sections + " 节 / " + st.items + " 条)")
);
console.log(
  "      需代理 " + st.vpn + " 条（" + (st.vpnRatio * 100).toFixed(1) + "%），第三方整理 " + st.aggregators + " 条；" +
  "免费 " + (st.byCost.free || 0) + " / 部分免费 " + (st.byCost.freemium || 0) + " / 付费 " + (st.byCost.paid || 0)
);
totalErrors += aiErrors;
totalWarnings += aiRes.warnings.length;

console.log(C.bold("\n汇总\n"));
console.log(`  文件      ${files.length}`);
console.log(`  条目      ${totalPrograms}`);
console.log(`  届次      ${totalEditions}`);
console.log(`  已发布    ${C.green(String(published))}`);
console.log(`  待人工    ${C.yellow(String(pending))}`);
console.log(`  AI 条目   ${st.items}` + C.dim(`（${st.groups} 组 / ${st.sections} 节）`));
console.log(`  错误      ${totalErrors ? C.red(String(totalErrors)) : "0"}`);
console.log(`  警告      ${totalWarnings ? C.yellow(String(totalWarnings)) : "0"}`);

if (totalErrors > 0) {
  console.log(C.red("\n校验失败。\n"));
  process.exit(1);
}
console.log(C.green("\n校验通过。\n"));
