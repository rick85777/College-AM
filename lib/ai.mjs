import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const AI_FILE = path.join(ROOT, "data", "ai.json");

export const ACCESS = new Set(["direct", "vpn", "login"]);
export const COST = new Set(["free", "freemium", "paid"]);
export const KIND = new Set(["official", "platform", "aggregator"]);

/** 字符数（按 Unicode 码点，不按 UTF-16 长度） */
export const chars = (s) => [...String(s ?? "")].length;

const DAY = 86400000;
const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

/** YYYY-MM-DD → Date（本地零点）；非法返回 null */
export function parseDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s ?? ""))) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

/**
 * 读取并校验 data/ai.json。
 * 返回 { groups, items, stats, errors, warnings }。
 * errors 非空时调用方应让构建失败。
 */
export async function loadAi(file = AI_FILE) {
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw);
  return validateAi(data);
}

export function validateAi(data) {
  const errors = [];
  const warnings = [];
  const groups = data.groups ?? [];
  const seenIds = new Map();
  const seenUrls = new Map();
  const todayMs = today().getTime();

  if (!groups.length) errors.push("AI 数据：groups 为空");

  let itemCount = 0;
  let vpnCount = 0;

  for (const g of groups) {
    if (!g.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.id)) errors.push(`AI 组 id 非法：${g.id}`);
    if (!g.title) errors.push(`AI 组 ${g.id} 缺 title`);
    if (!Array.isArray(g.sections) || g.sections.length === 0) {
      errors.push(`AI 组 ${g.id} 没有 section`);
      continue;
    }

    let groupItems = 0;
    for (const s of g.sections) {
      if (!s.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id)) errors.push(`AI 节 id 非法：${g.id}/${s.id}`);
      if (!s.title) errors.push(`AI 节 ${s.id} 缺 title`);
      if (!Array.isArray(s.items) || s.items.length === 0) {
        errors.push(`AI 节 ${g.id}/${s.id} 没有条目`);
        continue;
      }
      groupItems += s.items.length;

      for (const it of s.items) {
        itemCount++;
        const where = `${g.id}/${s.id}/${it.id ?? "(无 id)"}`;

        // 必填字段
        for (const k of ["id", "name", "url", "org", "desc", "fit", "access", "verified", "cost"]) {
          if (!it[k]) errors.push(`${where}：缺必填字段 ${k}`);
        }
        if (!it.id) continue;

        // id 唯一
        if (seenIds.has(it.id)) errors.push(`${where}：id 与 ${seenIds.get(it.id)} 重复`);
        else seenIds.set(it.id, where);

        // URL
        if (it.url && !/^https?:\/\//.test(it.url)) errors.push(`${where}：url 必须以 http(s):// 开头`);
        if (it.url) {
          try { new URL(it.url); } catch { errors.push(`${where}：url 不是合法 URL`); }
          if (seenUrls.has(it.url)) warnings.push(`${where}：url 与 ${seenUrls.get(it.url)} 重复`);
          else seenUrls.set(it.url, where);
        }

        // 长度（§2.4 三条硬校验）
        if (it.name && chars(it.name) > 24) warnings.push(`${where}：name 超过 24 字（${chars(it.name)}）`);
        if (it.org && chars(it.org) > 16) warnings.push(`${where}：org 超过 16 字（${chars(it.org)}）`);
        if (it.desc && chars(it.desc) < 10) errors.push(`${where}：desc 少于 10 字（${chars(it.desc)}），没有信息量`);
        if (it.desc && chars(it.desc) > 60) warnings.push(`${where}：desc 超过 60 字（${chars(it.desc)}）`);
        if (it.fit) {
          const n = chars(it.fit);
          if (n < 12) errors.push(`${where}：fit 少于 12 字（${n}），写不出"谁别用"`);
          if (n > 50) errors.push(`${where}：fit 超过 50 字（${n}）`);
        }
        if (it.note && chars(it.note) > 80) warnings.push(`${where}：note 超过 80 字（${chars(it.note)}）`);
        if (Array.isArray(it.tags) && it.tags.length > 3) warnings.push(`${where}：tags 超过 3 个（${it.tags.length}）`);

        // 枚举
        if (it.access && !ACCESS.has(it.access)) errors.push(`${where}：access "${it.access}" 不在 {direct,vpn,login}`);
        if (it.cost && !COST.has(it.cost)) errors.push(`${where}：cost "${it.cost}" 不在 {free,freemium,paid}`);
        if (it.kind && !KIND.has(it.kind)) errors.push(`${where}：kind "${it.kind}" 不在 {official,platform,aggregator}`);

        // verified：格式 + 时效
        const vd = parseDate(it.verified);
        if (it.verified && !vd) {
          errors.push(`${where}：verified 不是合法 YYYY-MM-DD（${it.verified}）`);
        } else if (vd) {
          const age = Math.round((todayMs - vd.getTime()) / DAY);
          if (age < -1) errors.push(`${where}：verified 在未来（${it.verified}）`);
          else if (age > 180) errors.push(`${where}：verified 已过期 ${age} 天（> 180 天，必须复验）`);
          else if (age > 90) warnings.push(`${where}：verified 已 ${age} 天未复验（> 90 天）`);
          it._stale = age > 90;
        }

        if (it.access === "vpn") vpnCount++;
      }
    }

    // 一组里的条目不该超过 8 × 节数（一屏一节的密度上限）
    if (groupItems > 8 * g.sections.length) {
      warnings.push(`AI 组 ${g.id}：${groupItems} 条 / ${g.sections.length} 节，密度偏高（> 8×节数）`);
    }
  }

  // access=vpn 占比 > 25% → 警告
  const vpnRatio = itemCount ? vpnCount / itemCount : 0;
  if (vpnRatio > 0.25) {
    warnings.push(`access=vpn 占比 ${(vpnRatio * 100).toFixed(1)}%（> 25%），对国内用户不友好`);
  }

  const stats = {
    groups: groups.length,
    sections: groups.reduce((n, g) => n + (g.sections?.length ?? 0), 0),
    items: itemCount,
    vpn: vpnCount,
    vpnRatio,
    aggregators: groups.reduce(
      (n, g) => n + (g.sections ?? []).reduce((m, s) => m + (s.items ?? []).filter((i) => i.kind === "aggregator").length, 0),
      0
    ),
    byAccess: countBy(groups, "access"),
    byCost: countBy(groups, "cost"),
  };

  return { groups, items: itemCount, stats, errors, warnings, updatedAt: data.updatedAt };
}

function countBy(groups, key) {
  const out = {};
  for (const g of groups) for (const s of g.sections ?? []) for (const it of s.items ?? []) {
    if (it[key]) out[it[key]] = (out[it[key]] ?? 0) + 1;
  }
  return out;
}

/** 把 6 组 21 节摊平成条目数组（渲染与检查都要用） */
export function allItems(data) {
  const out = [];
  for (const g of data.groups ?? []) for (const s of g.sections ?? []) for (const it of s.items ?? []) out.push(it);
  return out;
}
export const ACCESS_LABEL = { direct: "国内可直连", vpn: "需代理", login: "需登录" };
export const COST_LABEL = { free: "免费", freemium: "部分免费", paid: "付费" };
export const KIND_LABEL = { official: "官方一手", platform: "平台方", aggregator: "第三方整理" };
