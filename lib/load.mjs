import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
export const DATA_DIR = path.join(ROOT, "data");
export const PROGRAMS_DIR = path.join(DATA_DIR, "programs");

/** 读取 data/programs/*.json，返回 [{ file, data }] */
export async function readProgramFiles() {
  const names = (await readdir(PROGRAMS_DIR)).filter((f) => f.endsWith(".json")).sort();
  const out = [];
  for (const name of names) {
    const file = path.join(PROGRAMS_DIR, name);
    const raw = await readFile(file, "utf8");
    out.push({ file, name, raw, data: JSON.parse(raw) });
  }
  return out;
}

export async function readMajors() {
  return JSON.parse(await readFile(path.join(DATA_DIR, "majors.json"), "utf8"));
}

/** 摊平成 [{ program, edition }] */
export function flatten(files) {
  const all = [];
  for (const { data, name } of files) {
    for (const p of data.programs) {
      for (const e of p.editions) {
        all.push({ program: p, edition: e, file: name });
      }
    }
  }
  return all;
}

export const PUBLISHED_STATES = new Set(["auto_published", "human_approved"]);

export function isPublished(edition) {
  return PUBLISHED_STATES.has(edition.reviewState);
}

/**
 * 统一取「关键节点」。
 * 优先用 milestones（推荐：一个届次可以有多个节点，如口试/笔试/报名开始）；
 * 没有 milestones 时回退到 signupStart/signupEnd/eventStart/eventEnd 四个扁平字段。
 */
export function keyDates(edition) {
  const out = [];

  if (Array.isArray(edition.milestones) && edition.milestones.length) {
    for (const m of edition.milestones) {
      out.push({
        date: m.date,
        end: m.end ?? null,
        kind: m.kind === "signup" ? "signup" : m.kind === "event" ? "event" : "other",
        label: m.label,
        fromMilestone: true,
      });
    }
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }

  if (edition.signupStart) out.push({ date: edition.signupStart, kind: "signup", label: "报名开始" });
  if (edition.signupEnd) out.push({ date: edition.signupEnd, kind: "signup", label: "报名截止" });
  if (edition.eventStart) out.push({ date: edition.eventStart, kind: "event", label: "开考 / 开始" });
  if (edition.eventEnd && edition.eventEnd !== edition.eventStart) {
    out.push({ date: edition.eventEnd, kind: "event", label: "结束" });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** 相对今天的天数（本地时区，只比较日期部分） */
export function daysUntil(dateStr, today = new Date()) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - base) / 86400000);
}
