/**
 * 轻量校验器：针对本仓库的数据契约手写，不引入任何依赖。
 * 目标不是通用 JSON Schema 引擎，而是给出人能看懂的中文报错。
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

export const KINDS = ["cert", "contest", "job"];
export const ORGANIZER_TYPES = ["official", "academic", "company", "school"];
export const LEVELS = ["international", "national", "provincial", "school"];
export const WEIGHTS = ["core", "recommended", "adjacent"];
export const ROUNDS = ["h1", "h2", "annual", "special"];
export const TIERS = ["L1", "L2", "L3", "L4"];
export const REVIEW_STATES = ["pending", "auto_published", "human_approved", "rejected"];

/** 项目级的硬约束：这些字段永远不允许自动发布（与置信度解耦）。 */
export const MANUAL_ONLY_FIELDS = new Set([
  "signupStart",
  "signupEnd",
  "eventStart",
  "eventEnd",
  "feeCny",
  "feeNote",
]);

function isDate(v) {
  if (!DATE_RE.test(v)) return false;
  const d = new Date(v + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function isDateTime(v) {
  return DATETIME_RE.test(v) && !Number.isNaN(new Date(v).getTime());
}

function isUri(v) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function charLen(s) {
  return [...s].length;
}

/**
 * @param {unknown} file 已解析的 JSON
 * @param {string} filePath 用于报错定位
 * @returns {{errors: string[], warnings: string[], data: any|null}}
 */
export function validateFile(file, filePath) {
  const errors = [];
  const warnings = [];
  const at = (p) => filePath + " › " + p;

  if (file === null || typeof file !== "object" || Array.isArray(file)) {
    return { errors: [at("根节点必须是对象")], warnings, data: null };
  }
  if (typeof file.schemaVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(file.schemaVersion)) {
    errors.push(at("schemaVersion 必须是 MAJOR.MINOR.PATCH，例如 0.1.0"));
  }
  if (!Array.isArray(file.programs) || file.programs.length === 0) {
    errors.push(at("programs 必须是非空数组"));
    return { errors, warnings, data: null };
  }

  const seenProgram = new Set();
  const seenEdition = new Set();

  file.programs.forEach((p, i) => {
    const pp = `programs[${i}]`;
    if (p === null || typeof p !== "object") {
      errors.push(at(pp + " 必须是对象"));
      return;
    }

    // id
    if (typeof p.id !== "string" || !ID_RE.test(p.id)) {
      errors.push(at(pp + ".id 必须是 kebab-case 的 [a-z0-9-]"));
    } else if (seenProgram.has(p.id)) {
      errors.push(at(pp + `.id "${p.id}" 在本文件内重复`));
    } else {
      seenProgram.add(p.id);
    }

    if (!KINDS.includes(p.kind)) errors.push(at(pp + `.kind 必须是 ${KINDS.join(" / ")}`));
    if (typeof p.name !== "string" || charLen(p.name) < 2 || charLen(p.name) > 80) {
      errors.push(at(pp + ".name 必须是 2-80 个字符"));
    }
    if (typeof p.shortName === "string" && charLen(p.shortName) > 40) {
      errors.push(at(pp + ".shortName 最多 40 个字符"));
    }
    if (!Array.isArray(p.aliases) || p.aliases.length > 12) {
      errors.push(at(pp + ".aliases 必须是数组且最多 12 项"));
    } else {
      p.aliases.forEach((a, j) => {
        if (typeof a !== "string" || charLen(a) < 1 || charLen(a) > 30) {
          errors.push(at(`${pp}.aliases[${j}] 必须是 1-30 个字符的字符串`));
        }
      });
    }
    if (typeof p.organizer !== "string" || charLen(p.organizer) > 60) {
      errors.push(at(pp + ".organizer 必须是 ≤60 字符的字符串"));
    }
    if (!ORGANIZER_TYPES.includes(p.organizerType)) {
      errors.push(at(pp + `.organizerType 必须是 ${ORGANIZER_TYPES.join(" / ")}`));
    }
    if (!LEVELS.includes(p.level)) errors.push(at(pp + `.level 必须是 ${LEVELS.join(" / ")}`));
    if (!Array.isArray(p.tags) || p.tags.length === 0) {
      errors.push(at(pp + ".tags 必须是非空数组"));
    }
    if (!Array.isArray(p.majors)) {
      errors.push(at(pp + ".majors 必须是数组"));
    } else if (p.majors.length === 0) {
      errors.push(at(pp + ".majors 不能为空（至少挂一个职业出口频道，否则它不会出现在任何频道页）"));
    } else {
      let hasCore = false;
      p.majors.forEach((m, j) => {
        if (m === null || typeof m !== "object") {
          errors.push(at(`${pp}.majors[${j}] 必须是对象`));
          return;
        }
        if (typeof m.id !== "string" || !ID_RE.test(m.id)) {
          errors.push(at(`${pp}.majors[${j}].id 必须是 kebab-case`));
        }
        if (!WEIGHTS.includes(m.weight)) {
          errors.push(at(`${pp}.majors[${j}].weight 必须是 ${WEIGHTS.join(" / ")}`));
        }
        if (m.weight === "core") hasCore = true;
      });
      if (!hasCore) {
        warnings.push(at(pp + " 没有任何 core 频道关系，它将不会出现在任何频道的「必看」区"));
      }
    }
    if (typeof p.officialUrl !== "string" || !isUri(p.officialUrl)) {
      errors.push(at(pp + ".officialUrl 必须是 http(s) 绝对地址"));
    }
    if (typeof p.summary !== "string" || charLen(p.summary) < 8 || charLen(p.summary) > 120) {
      errors.push(at(pp + ".summary 必须是 8-120 字符的自写摘要（禁止全文转载官方公告）"));
    }

    if (!Array.isArray(p.editions) || p.editions.length === 0) {
      errors.push(at(pp + ".editions 必须是非空数组"));
      return;
    }

    const seenRound = new Set();
    p.editions.forEach((e, k) => {
      const ep = `${pp}.editions[${k}]`;
      if (e === null || typeof e !== "object") {
        errors.push(at(ep + " 必须是对象"));
        return;
      }
      if (typeof e.id !== "string" || !ID_RE.test(e.id)) {
        errors.push(at(ep + ".id 必须是 kebab-case"));
      } else if (seenEdition.has(e.id)) {
        errors.push(at(ep + `.id "${e.id}" 在全库重复（Edition id 必须全局唯一）`));
      } else {
        seenEdition.add(e.id);
      }
      if (!Number.isInteger(e.year) || e.year < 2000 || e.year > 2100) {
        errors.push(at(ep + ".year 必须是 2000-2100 的整数"));
      }
      if (!ROUNDS.includes(e.round)) {
        errors.push(at(ep + `.round 必须是 ${ROUNDS.join(" / ")}（一年两轮用 h1/h2，不要用 main）`));
      } else {
        const key = `${e.year}-${e.round}`;
        if (seenRound.has(key)) {
          errors.push(at(ep + ` 与同一 Program 下的另一条 Edition 冲突：${key}`));
        }
        seenRound.add(key);
      }

      for (const f of ["signupStart", "signupEnd", "eventStart", "eventEnd"]) {
        const v = e[f];
        if (v === undefined) continue;
        if (v === null) continue;
        if (typeof v !== "string" || !isDate(v)) {
          errors.push(at(`${ep}.${f} 必须是 YYYY-MM-DD 或 null（不允许写「预计3月」这类模糊值）`));
        }
      }
      if (e.signupStart && e.signupEnd && e.signupStart > e.signupEnd) {
        errors.push(at(ep + " signupStart 晚于 signupEnd"));
      }
      if (e.eventStart && e.eventEnd && e.eventStart > e.eventEnd) {
        errors.push(at(ep + " eventStart 晚于 eventEnd"));
      }
      if (e.signupEnd && e.eventStart && e.signupEnd > e.eventStart) {
        warnings.push(at(ep + " 报名截止晚于考试/比赛开始，请确认是否跨批次"));
      }

      if (e.feeCny !== undefined && e.feeCny !== null) {
        if (typeof e.feeCny !== "number" || !Number.isFinite(e.feeCny) || e.feeCny < 0 || e.feeCny > 5000) {
          errors.push(at(ep + ".feeCny 必须是 0-5000 的数字或 null（免费写 0，「待定」写 null）"));
        }
      }
      if (e.feeNote !== undefined && e.feeNote !== null && charLen(e.feeNote) > 80) {
        errors.push(at(ep + ".feeNote 最多 80 字符"));
      }
      if (typeof e.sourceUrl !== "string" || !isUri(e.sourceUrl)) {
        errors.push(at(ep + ".sourceUrl 必须是 L1 官方原始页面的 http(s) 地址"));
      }
      if (e.noticeUrl !== undefined && e.noticeUrl !== null && !isUri(e.noticeUrl)) {
        errors.push(at(ep + ".noticeUrl 必须是 http(s) 地址或 null"));
      }
      if (typeof e.fetchedAt !== "string" || !isDateTime(e.fetchedAt)) {
        errors.push(at(ep + ".fetchedAt 必须是带时区的 ISO 8601 时间"));
      }
      if (e.verifiedAt !== undefined && e.verifiedAt !== null && !isDateTime(e.verifiedAt)) {
        errors.push(at(ep + ".verifiedAt 必须是带时区的 ISO 8601 时间或 null"));
      }
      if (!TIERS.includes(e.trustTier)) {
        errors.push(at(ep + `.trustTier 必须是 ${TIERS.join(" / ")}`));
      }
      if (e.confidence !== undefined) {
        if (!Number.isInteger(e.confidence) || e.confidence < 0 || e.confidence > 100) {
          errors.push(at(ep + ".confidence 必须是 0-100 的整数"));
        }
      }
      if (!REVIEW_STATES.includes(e.reviewState)) {
        errors.push(at(ep + `.reviewState 必须是 ${REVIEW_STATES.join(" / ")}`));
      }
      if (e.milestones !== undefined) {
        if (!Array.isArray(e.milestones) || e.milestones.length === 0 || e.milestones.length > 8) {
          errors.push(at(ep + ".milestones 必须是 1-8 项的数组"));
        } else {
          const seenLabel = new Set();
          e.milestones.forEach((m, mi) => {
            const mp = `${ep}.milestones[${mi}]`;
            if (m === null || typeof m !== "object") { errors.push(at(mp + " 必须是对象")); return; }
            if (typeof m.label !== "string" || charLen(m.label) < 2 || charLen(m.label) > 20) {
              errors.push(at(mp + ".label 必须是 2-20 字符"));
            } else if (seenLabel.has(m.label)) {
              errors.push(at(mp + `.label "${m.label}" 在同一届次内重复`));
            } else seenLabel.add(m.label);
            if (typeof m.date !== "string" || !isDate(m.date)) {
              errors.push(at(mp + ".date 必须是 YYYY-MM-DD"));
            }
            if (m.end !== undefined && m.end !== null) {
              if (typeof m.end !== "string" || !isDate(m.end)) errors.push(at(mp + ".end 必须是 YYYY-MM-DD 或 null"));
              else if (m.date && m.end < m.date) errors.push(at(mp + ".end 早于 date"));
            }
            if (m.kind !== undefined && !["signup", "event", "other"].includes(m.kind)) {
              errors.push(at(mp + ".kind 必须是 signup / event / other"));
            }
          });
        }
      }
      if (e.summary !== undefined && e.summary !== null && charLen(e.summary) > 160) {
        errors.push(at(ep + ".summary 最多 160 字符"));
      }
      if (e.notes !== undefined) {
        if (!Array.isArray(e.notes) || e.notes.length > 6) {
          errors.push(at(ep + ".notes 必须是 ≤6 项的数组"));
        }
      }

      // 一致性：rejected 的不该带 verifiedAt；human_approved 必须有 verifiedAt
      if (e.reviewState === "human_approved" && !e.verifiedAt) {
        warnings.push(at(ep + " reviewState=human_approved 但没有 verifiedAt，人工复核时间应留痕"));
      }
      if (e.trustTier === "L4" && e.reviewState !== "rejected" && e.reviewState !== "pending") {
        errors.push(at(ep + " L4（用户投稿）不得直接发布，只能是 pending 或 rejected"));
      }
    });
  });

  return { errors, warnings, data: file };
}

export const __internal = { isDate, isDateTime, isUri, charLen };