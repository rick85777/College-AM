import { readFile } from "node:fs/promises";
import path from "node:path";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function validateProvinceSignup(root = process.cwd()) {
  const file = path.join(root, "data", "province-signup.json");
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw);
  const errors = [];
  const at = (p) => "province-signup.json › " + p;

  if (!Array.isArray(data.editions) || data.editions.length === 0) {
    errors.push(at("editions 必须是非空数组"));
    return { errors, data: null, stats: null };
  }

  const seenEdition = new Set();
  let totalWindows = 0;

  for (const [i, ed] of data.editions.entries()) {
    const p = `editions[${i}]`;
    if (typeof ed.editionId !== "string" || !ed.editionId) errors.push(at(p + ".editionId 必填"));
    else if (seenEdition.has(ed.editionId)) errors.push(at(p + `.editionId "${ed.editionId}" 重复`));
    else seenEdition.add(ed.editionId);

    if (typeof ed.programId !== "string" || !ed.programId) errors.push(at(p + ".programId 必填"));
    if (typeof ed.sourceUrl !== "string" || !/^https?:\/\//.test(ed.sourceUrl)) errors.push(at(p + ".sourceUrl 必须是 http(s) 地址"));
    if (typeof ed.fetchedAt !== "string") errors.push(at(p + ".fetchedAt 必填"));
    if (!["L1", "L2", "L3", "L4"].includes(ed.trustTier)) errors.push(at(p + ".trustTier 必须是 L1-L4"));
    if (!["pending", "auto_published", "human_approved", "rejected"].includes(ed.reviewState)) {
      errors.push(at(p + ".reviewState 非法"));
    }

    if (!Array.isArray(ed.windows) || ed.windows.length === 0) {
      errors.push(at(p + ".windows 必须是非空数组"));
      continue;
    }

    const seenProv = new Set();
    for (const [j, w] of ed.windows.entries()) {
      const wp = `${p}.windows[${j}]`;
      if (typeof w.province !== "string" || !w.province) errors.push(at(wp + ".province 必填"));
      else if (seenProv.has(w.province)) errors.push(at(wp + ` 省份 "${w.province}" 重复`));
      else seenProv.add(w.province);

      if (typeof w.start !== "string" || !DATE_RE.test(w.start)) errors.push(at(wp + ".start 必须是 YYYY-MM-DD"));
      if (typeof w.end !== "string" || !DATE_RE.test(w.end)) errors.push(at(wp + ".end 必须是 YYYY-MM-DD"));
      if (w.start && w.end && w.start > w.end) errors.push(at(wp + " start 晚于 end"));
      if (w.startTime && !TIME_RE.test(w.startTime)) errors.push(at(wp + ".startTime 必须是 HH:MM"));
      if (w.endTime && !/^([01]\d|2[0-4]):[0-5]\d$/.test(w.endTime)) errors.push(at(wp + ".endTime 必须是 HH:MM（允许 24:00）"));
      totalWindows++;
    }
  }

  return { errors, data, stats: { editions: data.editions.length, windows: totalWindows } };
}
